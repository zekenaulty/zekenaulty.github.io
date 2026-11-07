import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'src/data/resume/profiles/generated/';
const PRIVATE_ROOT = path.join(ROOT, 'private');
const DESTINATION = path.join(PRIVATE_ROOT, 'recovered-generated-profiles');
const git = (...args) => execFileSync('git', args, { cwd: ROOT });

function checkRecoveryDirectories(create = false) {
  for (const directory of [PRIVATE_ROOT, DESTINATION]) {
    let stat = fs.lstatSync(directory, { throwIfNoEntry: false });
    if (!stat && create) {
      fs.mkdirSync(directory); // Check each parent before creating the next component.
      stat = fs.lstatSync(directory);
    }
    if (!stat || stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error(`Recovery directory must be a real directory, not a symlink: ${directory}`);
    }
  }
  const expected = path.join(fs.realpathSync(ROOT), 'private', 'recovered-generated-profiles');
  if (fs.realpathSync(DESTINATION) !== expected) {
    throw new Error('Recovery destination must remain inside this repository’s private directory.');
  }
}

function readExistingFile(filename) {
  checkRecoveryDirectories();
  const stat = fs.lstatSync(filename, { throwIfNoEntry: false });
  if (!stat) return null;
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`Recovery output must be a regular file, not a symlink: ${filename}`);
  }
  // Do not follow a leaf replaced with a symlink between lstat and open.
  const fd = fs.openSync(filename, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    if (!fs.fstatSync(fd).isFile()) throw new Error(`Recovery output is not a regular file: ${filename}`);
    return fs.readFileSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

function validateExistingFile(filename, bytes) {
  const existing = readExistingFile(filename);
  if (existing !== null && !existing.equals(bytes)) {
    throw new Error(`Refusing to overwrite a different local file: ${filename}`);
  }
  return existing;
}

// A deliberate, local recovery step. Never rewrites history, publishes, or
// overwrites a different local draft. The destination remains gitignored.
export function recoverDrafts(ref) {
  if (!ref || ref.startsWith('-')) throw new Error('Provide --ref <commit-or-branch>.');
  const commit = git('rev-parse', '--verify', `${ref}^{commit}`).toString().trim();
  const files = git('ls-tree', '-r', '--name-only', '-z', commit, '--', SOURCE)
    .toString().split('\0').filter((file) => file.endsWith('.json'));
  if (!files.length) throw new Error(`No generated JSON drafts found at ${commit}.`);

  const drafts = files.map((source) => {
    if (!source.startsWith(SOURCE) || path.dirname(source) !== SOURCE.slice(0, -1)) {
      throw new Error(`Unexpected draft path: ${source}`);
    }
    const bytes = git('show', `${commit}:${source}`);
    const destination = path.join(DESTINATION, path.basename(source));
    return { source, destination, bytes };
  });

  const manifest = {
    sourceCommit: commit,
    files: drafts.map((draft) => ({
      source: draft.source,
      destination: path.relative(ROOT, draft.destination),
      bytes: draft.bytes.length,
      sha256: createHash('sha256').update(draft.bytes).digest('hex'),
    })),
  };
  const manifestPath = path.join(DESTINATION, `recovery-${commit}.json`);
  const outputs = [...drafts, {
    destination: manifestPath,
    bytes: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`),
  }];

  // Check parents, every draft, and the manifest before copying any historical bytes.
  checkRecoveryDirectories(true);
  for (const output of outputs) validateExistingFile(output.destination, output.bytes);
  for (const output of outputs) {
    if (validateExistingFile(output.destination, output.bytes) === null) {
      const fd = fs.openSync(output.destination,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
      try {
        fs.writeFileSync(fd, output.bytes);
      } finally {
        fs.closeSync(fd);
      }
    }
    const recovered = readExistingFile(output.destination);
    if (!recovered?.equals(output.bytes)) throw new Error(`Verification failed: ${output.destination}`);
  }
  return { count: drafts.length, destination: DESTINATION, manifestPath };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--ref') throw new Error('Usage: node scripts/recover-resume-drafts.js --ref <commit-or-branch>');
    const result = recoverDrafts(args[1]);
    console.log(`Recovered and byte-verified ${result.count} drafts into ${result.destination}.`);
    console.log(`Checksum manifest: ${result.manifestPath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
