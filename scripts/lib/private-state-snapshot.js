// Local filesystem primitives only: no provider, credential, shell, or network imports.
// Real-state copies require explicit authorization for inputs and destination.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const categories = ['job-descriptions', 'resume-profiles', 'resume-exports'];
const MAX_FILES = 1000;
const MAX_ENTRIES = 2000;
const MAX_BYTES = 64 * 1024 * 1024;
const MAX_MANIFEST = 1024 * 1024;
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fail = () => { throw new Error('Private snapshot validation failed; no automatic retry.'); };
const requireValue = (value) => { if (!value) fail(); };
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));

function safePath(input, kind = 'directory') {
  const full = path.resolve(input);
  const parts = full.slice(path.parse(full).root.length).split(path.sep).filter(Boolean);
  let current = path.parse(full).root;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    requireValue(!stat.isSymbolicLink() && (index === parts.length - 1 && kind === 'file' ? stat.isFile() : stat.isDirectory()));
  }
  return full;
}

function readBounded(file, limit) {
  safePath(file, 'file');
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    requireValue(stat.isFile() && stat.size <= limit);
    // Bound the read itself even if a same-user writer grows the file.
    const bytes = Buffer.alloc(stat.size + 1);
    let used = 0;
    while (used < bytes.length) {
      const count = fs.readSync(fd, bytes, used, bytes.length - used, null);
      if (!count) break;
      used += count;
    }
    requireValue(used === stat.size);
    return bytes.subarray(0, used);
  } finally { fs.closeSync(fd); }
}

function validMember(member) {
  if (typeof member !== 'string' || member.length > 400 || /[\\\x00-\x1f\x7f]/.test(member)) return false;
  const parts = member.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || part.startsWith('.'))) return false;
  if (parts[0] === 'job-descriptions') return parts.length === 2 && /\.(md|txt)$/i.test(parts[1]);
  if (parts[0] === 'resume-profiles') return parts.length === 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(parts[1]);
  return parts[0] === 'resume-exports' && parts.length === 3 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parts[1]) && ['index.html', 'resume.txt', 'resume.docx', 'resume.pdf'].includes(parts[2]);
}

function collect(root) {
  safePath(root);
  const files = [];
  let entries = 0;
  const walk = (dir, relative) => {
    safePath(dir);
    const handle = fs.opendirSync(dir);
    try {
      let entry;
      while ((entry = handle.readSync())) {
        requireValue(++entries <= MAX_ENTRIES);
      const member = `${relative}/${entry.name}`;
      if (entry.isDirectory()) {
        requireValue(relative === 'resume-exports' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name));
        walk(path.join(dir, entry.name), member);
      } else {
        requireValue(entry.isFile() && validMember(member));
        files.push(member);
        requireValue(files.length <= MAX_FILES);
      }
      }
    } finally { handle.closeSync(); }
  };
  for (const category of categories) {
    const dir = path.join(root, category);
    if (fs.lstatSync(dir, { throwIfNoEntry: false })) walk(dir, category);
  }
  return files.sort();
}

function reserve(destination) {
  const full = path.resolve(destination);
  safePath(path.dirname(full));
  // Exclusive creation: an existing destination, even empty, is never replaced.
  fs.mkdirSync(full, { mode: 0o700 });
  return full;
}

function writeMembers(root, files) {
  for (const { member, bytes } of files) {
    const file = path.join(root, member);
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    safePath(path.dirname(file));
    fs.writeFileSync(file, bytes, { flag: 'wx', mode: 0o600 });
  }
}

function publishMarker(root, name, bytes) {
  const temporary = path.join(root, `${name}.incomplete`);
  fs.writeFileSync(temporary, bytes, { flag: 'wx', mode: 0o600 });
  // Atomic, exclusive publication only after the complete write/close succeeds.
  fs.linkSync(temporary, path.join(root, name));
  fs.unlinkSync(temporary);
}

export function snapshotPrivateState({ sourceRoot, destination, sourceRevision, sourceHash }) {
  requireValue(/^[a-f0-9]{40}$/.test(sourceRevision) && /^[a-f0-9]{64}$/.test(sourceHash));
  const names = collect(sourceRoot);
  let total = 0;
  const files = names.map((member) => {
    const bytes = readBounded(path.join(sourceRoot, member), MAX_BYTES - total);
    total += bytes.length;
    requireValue(total <= MAX_BYTES);
    return { member, bytes };
  });
  const manifest = { version: 1, sourceRevision, sourceHash, files: files.map(({ member, bytes }) => ({ member, bytes: bytes.length, sha256: sha(bytes) })) };
  const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
  requireValue(manifestBytes.length <= MAX_MANIFEST);
  const output = reserve(destination);
  // Failure leaves an incomplete new directory. Never erase or overwrite it on retry.
  writeMembers(path.join(output, 'files'), files);
  if (!files.length) fs.mkdirSync(path.join(output, 'files'), { mode: 0o700 });
  publishMarker(output, 'manifest.json', manifestBytes);
  return { fileCount: files.length, bytes: total, manifestHash: sha(manifestBytes) };
}

export function restorePrivateState({ snapshotRoot, destination, expectedManifestHash, expectedSourceRevision, expectedSourceHash }) {
  requireValue(/^[a-f0-9]{64}$/.test(expectedManifestHash) && /^[a-f0-9]{40}$/.test(expectedSourceRevision) && /^[a-f0-9]{64}$/.test(expectedSourceHash));
  safePath(snapshotRoot);
  const manifestBytes = readBounded(path.join(snapshotRoot, 'manifest.json'), MAX_MANIFEST);
  requireValue(sha(manifestBytes) === expectedManifestHash);
  let manifest;
  try { manifest = JSON.parse(manifestBytes); } catch { fail(); }
  requireValue(exact(manifest, ['version', 'sourceRevision', 'sourceHash', 'files']) && manifest.version === 1);
  requireValue(manifest.sourceRevision === expectedSourceRevision && manifest.sourceHash === expectedSourceHash);
  requireValue(Array.isArray(manifest.files) && manifest.files.length <= MAX_FILES);
  const seen = new Set();
  let total = 0;
  const files = manifest.files.map((entry) => {
    requireValue(exact(entry, ['member', 'bytes', 'sha256']) && validMember(entry.member) && !seen.has(entry.member));
    seen.add(entry.member);
    requireValue(Number.isSafeInteger(entry.bytes) && entry.bytes >= 0 && entry.bytes <= MAX_BYTES - total && /^[a-f0-9]{64}$/.test(entry.sha256));
    const bytes = readBounded(path.join(snapshotRoot, 'files', entry.member), entry.bytes);
    requireValue(bytes.length === entry.bytes && sha(bytes) === entry.sha256);
    total += bytes.length;
    return { member: entry.member, bytes };
  });
  const actual = collect(path.join(snapshotRoot, 'files'));
  requireValue(JSON.stringify(actual) === JSON.stringify([...seen].sort()));
  // Validate every byte and source binding before creating any destination.
  const output = reserve(destination);
  writeMembers(output, files);
  const receipt = { version: 1, manifestHash: expectedManifestHash, sourceRevision: expectedSourceRevision, sourceHash: expectedSourceHash, fileCount: files.length, bytes: total, requiresHumanReview: true };
  publishMarker(output, '.restore-complete.json', JSON.stringify(receipt, null, 2) + '\n');
  return receipt;
}
