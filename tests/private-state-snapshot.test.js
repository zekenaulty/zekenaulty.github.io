import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { snapshotPrivateState, restorePrivateState } from '../scripts/lib/private-state-snapshot.js';

const revision = '0'.repeat(40);
const sourceHash = '1'.repeat(64);
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'private-state-test-'));
  const source = path.join(root, 'source');
  const members = ['job-descriptions/Synthetic Job.md', 'resume-profiles/synthetic.json', ...['index.html', 'resume.txt', 'resume.docx', 'resume.pdf'].map((name) => `resume-exports/synthetic/${name}`)];
  for (const member of members) {
    fs.mkdirSync(path.dirname(path.join(source, member)), { recursive: true });
    fs.writeFileSync(path.join(source, member), Buffer.from(`SYNTHETIC STORAGE FIXTURE ONLY: ${member}\n`));
  }
  const bundle = path.join(root, 'bundle');
  const destination = path.join(root, 'restored');
  const snapshot = () => snapshotPrivateState({ sourceRoot: source, destination: bundle, sourceRevision: revision, sourceHash });
  const restore = (manifestHash, fields = {}) => restorePrivateState({ snapshotRoot: bundle, destination, expectedManifestHash: manifestHash, expectedSourceRevision: revision, expectedSourceHash: sourceHash, ...fields });
  return { root, source, members, bundle, destination, snapshot, restore, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
};

test('synthetic private state round-trips byte-identically with provenance and no overwrite', () => {
  const f = fixture();
  try {
    const saved = f.snapshot();
    assert.equal(saved.fileCount, 6);
    const restored = f.restore(saved.manifestHash);
    assert.equal(restored.fileCount, 6);
    assert.equal(restored.requiresHumanReview, true);
    for (const member of f.members) assert.deepEqual(fs.readFileSync(path.join(f.source, member)), fs.readFileSync(path.join(f.destination, member)));
    assert.throws(f.snapshot, /EEXIST/);
    assert.throws(() => f.restore(saved.manifestHash), /EEXIST/);
    if (process.platform !== 'win32') {
      assert.equal(fs.statSync(f.destination).mode & 0o777, 0o700);
      assert.equal(fs.statSync(path.join(f.destination, f.members[0])).mode & 0o777, 0o600);
    }
  } finally { f.cleanup(); }
});

test('tampered bytes, wrong receipt/source and incomplete snapshot fail before restore writes', () => {
  for (const mode of ['bytes', 'hash', 'revision', 'source', 'incomplete']) {
    const f = fixture();
    try {
      const saved = f.snapshot();
      let hash = saved.manifestHash;
      const fields = {};
      if (mode === 'bytes') fs.appendFileSync(path.join(f.bundle, 'files', f.members[0]), 'changed');
      if (mode === 'hash') hash = 'f'.repeat(64);
      if (mode === 'revision') fields.expectedSourceRevision = '2'.repeat(40);
      if (mode === 'source') fields.expectedSourceHash = '2'.repeat(64);
      if (mode === 'incomplete') fs.unlinkSync(path.join(f.bundle, 'manifest.json'));
      assert.throws(() => f.restore(hash, fields));
      assert.equal(fs.existsSync(f.destination), false);
    } finally { f.cleanup(); }
  }
});

test('malicious manifest members and duplicates are rejected even with a matching receipt hash', () => {
  for (const mode of ['traversal', 'absolute', 'duplicate', 'oversize']) {
    const f = fixture();
    try {
      f.snapshot();
      const file = path.join(f.bundle, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(file));
      if (mode === 'traversal') manifest.files[0].member = '../outside';
      if (mode === 'absolute') manifest.files[0].member = '/outside';
      if (mode === 'duplicate') manifest.files.push(manifest.files[0]);
      if (mode === 'oversize') manifest.files[0].bytes = 100 * 1024 * 1024;
      const bytes = Buffer.from(JSON.stringify(manifest)); fs.writeFileSync(file, bytes);
      assert.throws(() => f.restore(digest(bytes)));
      assert.equal(fs.existsSync(f.destination), false);
    } finally { f.cleanup(); }
  }
});

test('source leaf/ancestor links and active lock files fail before backup writes', () => {
  for (const mode of ['leaf', 'parent', 'lock']) {
    const f = fixture();
    try {
      const external = path.join(f.root, 'untouched'); fs.mkdirSync(external);
      fs.writeFileSync(path.join(external, 'sentinel.md'), 'SYNTHETIC PRIVATE SENTINEL');
      if (mode === 'leaf') { fs.unlinkSync(path.join(f.source, f.members[0])); fs.symlinkSync(path.join(external, 'sentinel.md'), path.join(f.source, f.members[0])); }
      if (mode === 'parent') { fs.renameSync(path.join(f.source, 'job-descriptions'), path.join(f.root, 'saved')); fs.symlinkSync(external, path.join(f.source, 'job-descriptions')); }
      if (mode === 'lock') fs.writeFileSync(path.join(f.source, 'resume-profiles/.synthetic.lock'), '');
      const sentinelStat = fs.statSync(path.join(external, 'sentinel.md'));
      const originalRead = fs.readSync;
      let sentinelReads = 0;
      fs.readSync = function (fd, ...args) {
        const stat = fs.fstatSync(fd);
        if (stat.ino === sentinelStat.ino && stat.dev === sentinelStat.dev) { sentinelReads++; throw new Error('Sentinel read attempted'); }
        return originalRead.call(this, fd, ...args);
      };
      try { assert.throws(f.snapshot); } finally { fs.readSync = originalRead; }
      assert.equal(sentinelReads, 0);
      assert.equal(fs.existsSync(f.bundle), false);
      assert.equal(fs.readFileSync(path.join(external, 'sentinel.md'), 'utf8'), 'SYNTHETIC PRIVATE SENTINEL');
    } finally { f.cleanup(); }
  }
});

test('snapshot links and destination parent links fail without touching target', () => {
  for (const mode of ['leaf', 'parent', 'destination']) {
    const f = fixture();
    try {
      const saved = f.snapshot();
      const outside = path.join(f.root, 'outside'); fs.mkdirSync(outside);
      if (mode === 'leaf') { const file = path.join(f.bundle, 'files', f.members[0]); fs.renameSync(file, path.join(outside, 'sentinel')); fs.symlinkSync(path.join(outside, 'sentinel'), file); }
      if (mode === 'parent') { fs.renameSync(path.join(f.bundle, 'files'), path.join(outside, 'saved')); fs.symlinkSync(path.join(outside, 'saved'), path.join(f.bundle, 'files')); }
      let fields = {};
      if (mode === 'destination') { fs.symlinkSync(outside, path.join(f.root, 'link')); fields = { destination: path.join(f.root, 'link/restored') }; }
      assert.throws(() => f.restore(saved.manifestHash, fields));
      assert.equal(fs.existsSync(f.destination), false);
      assert.equal(fs.existsSync(path.join(outside, 'restored')), false);
    } finally { f.cleanup(); }
  }
});

test('failed writes leave incomplete destinations without completion markers and never reuse them', () => {
  for (const operation of ['snapshot', 'restore']) {
    const f = fixture();
    const originalWrite = fs.writeFileSync;
    try {
      const saved = operation === 'restore' ? f.snapshot() : null;
      let writes = 0;
      fs.writeFileSync = function (...args) {
        if (++writes === 2) throw new Error('Synthetic disk failure');
        return originalWrite.apply(this, args);
      };
      try { assert.throws(() => operation === 'snapshot' ? f.snapshot() : f.restore(saved.manifestHash), /Synthetic disk failure/); }
      finally { fs.writeFileSync = originalWrite; }
      const output = operation === 'snapshot' ? f.bundle : f.destination;
      const marker = operation === 'snapshot' ? 'manifest.json' : '.restore-complete.json';
      assert.equal(fs.existsSync(output), true);
      assert.equal(fs.existsSync(path.join(output, marker)), false);
      assert.throws(() => operation === 'snapshot' ? f.snapshot() : f.restore(saved.manifestHash), /EEXIST/);
    } finally { fs.writeFileSync = originalWrite; f.cleanup(); }
  }
});

test('empty selected state remains explicitly empty; extra selected files and oversize inputs fail', () => {
  const f = fixture();
  try {
    fs.rmSync(f.source, { recursive: true }); fs.mkdirSync(f.source);
    const saved = f.snapshot();
    assert.equal(saved.fileCount, 0);
    assert.equal(f.restore(saved.manifestHash).fileCount, 0);
  } finally { f.cleanup(); }
  for (const mode of ['extra', 'large']) {
    const x = fixture();
    try {
      if (mode === 'extra') fs.writeFileSync(path.join(x.source, 'resume-profiles/unexpected.txt'), 'synthetic');
      else fs.truncateSync(path.join(x.source, x.members[0]), 64 * 1024 * 1024 + 1);
      assert.throws(x.snapshot);
      assert.equal(fs.existsSync(x.bundle), false);
    } finally { x.cleanup(); }
  }
});

test('partial completion-marker writes never publish a completed marker', () => {
  for (const operation of ['snapshot', 'restore']) {
    const f = fixture();
    const originalWrite = fs.writeFileSync;
    try {
      const saved = operation === 'restore' ? f.snapshot() : null;
      fs.writeFileSync = function (file, bytes, options) {
        if (typeof file === 'string' && file.endsWith('.incomplete')) {
          originalWrite.call(this, file, Buffer.from(bytes).subarray(0, 12), options);
          throw new Error('Synthetic partial marker failure');
        }
        return originalWrite.call(this, file, bytes, options);
      };
      try { assert.throws(() => operation === 'snapshot' ? f.snapshot() : f.restore(saved.manifestHash), /partial marker failure/); }
      finally { fs.writeFileSync = originalWrite; }
      const output = operation === 'snapshot' ? f.bundle : f.destination;
      const marker = operation === 'snapshot' ? 'manifest.json' : '.restore-complete.json';
      assert.equal(fs.existsSync(path.join(output, marker)), false);
      assert.equal(fs.existsSync(path.join(output, marker + '.incomplete')), true);
    } finally { fs.writeFileSync = originalWrite; f.cleanup(); }
  }
});

test('empty export directories count toward the incremental enumeration budget', () => {
  const f = fixture();
  try {
    for (let i = 0; i < 2001; i++) fs.mkdirSync(path.join(f.source, 'resume-exports', `empty-${i}`));
    assert.throws(f.snapshot);
    assert.equal(fs.existsSync(f.bundle), false);
  } finally { f.cleanup(); }
});
