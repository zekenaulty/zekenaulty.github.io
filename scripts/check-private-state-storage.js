// Provider-independent synthetic storage proof. No credential or network imports.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { snapshotPrivateState, restorePrivateState } from './lib/private-state-snapshot.js';

if (process.argv.length !== 2) {
  console.error('Usage: node scripts/check-private-state-storage.js (synthetic fixtures only)');
  process.exitCode = 1;
} else {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'private-storage-proof-'));
  const source = path.join(work, 'source');
  const snapshot = path.join(work, 'snapshot');
  const restored = path.join(work, 'restored');
  const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const report = { version: 1, mode: 'synthetic-storage-only', ok: false, providerCalls: 0, stages: [], durabilityVerified: false, actualPrivateCorpusRestored: false };
  try {
    const sourceRevision = '0'.repeat(40); // Deliberately synthetic, not a repository revision.
    const sourceHash = digest('synthetic storage fixture catalog');
    const members = ['job-descriptions/Synthetic Role.md', 'resume-profiles/synthetic.json', ...['index.html', 'resume.txt', 'resume.docx', 'resume.pdf'].map((name) => `resume-exports/synthetic/${name}`)];
    for (const member of members) {
      const file = path.join(source, member);
      fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
      fs.writeFileSync(file, `SYNTHETIC STORAGE BYTES ONLY: ${member}\n`, { mode: 0o600 });
    }
    report.moduleHash = digest(fs.readFileSync(new URL('./lib/private-state-snapshot.js', import.meta.url)));
    const saved = snapshotPrivateState({ sourceRoot: source, destination: snapshot, sourceRevision, sourceHash });
    report.stages.push({ name: 'snapshot', ok: true, ...saved });
    const request = { snapshotRoot: snapshot, destination: restored, expectedManifestHash: saved.manifestHash, expectedSourceRevision: sourceRevision, expectedSourceHash: sourceHash };
    const receipt = restorePrivateState(request);
    report.stages.push({ name: 'restore', ok: true, ...receipt });
    const hashes = members.map((member) => {
      const before = fs.readFileSync(path.join(source, member));
      const after = fs.readFileSync(path.join(restored, member));
      assert.deepEqual(before, after);
      return { member, sha256: digest(after) };
    });
    report.stages.push({ name: 'byte-identity', ok: true, files: hashes });
    assert.throws(() => restorePrivateState(request), /EEXIST/);
    report.stages.push({ name: 'no-overwrite', ok: true });
    fs.appendFileSync(path.join(snapshot, 'files', members[0]), 'synthetic corruption');
    const rejected = path.join(work, 'rejected');
    assert.throws(() => restorePrivateState({ ...request, destination: rejected }));
    assert.equal(fs.existsSync(rejected), false);
    report.stages.push({ name: 'corruption-rejected-before-writes', ok: true });
    // Leave the retained snapshot valid, with the original independently recorded receipt.
    fs.writeFileSync(path.join(snapshot, 'files', members[0]), fs.readFileSync(path.join(source, members[0])));
    report.ok = true;
  } catch {
    report.ok = false;
    report.failure = 'Synthetic storage proof failed; review code and permissions. No real private data was selected.';
  }
  const evidencePath = path.join(work, 'evidence.json');
  try { fs.writeFileSync(evidencePath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); }
  catch { report.ok = false; report.failure = 'Unable to retain synthetic proof evidence.'; }
  console.log(JSON.stringify({ ...report, evidencePath }, null, 2));
  if (!report.ok) process.exitCode = 1;
}
