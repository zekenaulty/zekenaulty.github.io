import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const run = (file, args = [], input) => spawnSync(process.execPath, [file, ...args], { cwd: root, env: { PATH: '/usr/bin:/bin' }, encoding: 'utf8', input });

test('preflight is read-only and does not claim credential or private-state readiness', () => {
  const result = run('scripts/resume-operator.js', ['preflight']);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, true);
  assert.match(report.credentials, /not inspected/);
  assert.match(report.persistence, /not verified/);
});

test('retained service proof can be independently checked from its manifest', () => {
  const result = run('scripts/resume-operator.js', ['smoke']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const report = JSON.parse(result.stdout);
  const dir = path.dirname(report.evidencePath);
  // This directory was created by this invocation, never an existing user workspace.
  try {
    const saved = JSON.parse(fs.readFileSync(report.evidencePath, 'utf8'));
    assert.equal(saved.ok, true);
    assert.equal(saved.mockCalls, 1);
    assert.equal(saved.liveProviderCalls, 0);
    for (const name of ['list_jobs', 'prepare', 'generate', 'validate', 'export', 'tamper-rejection', 'no-overwrite-draft', 'no-overwrite-export']) {
      assert.ok(saved.stages.some((stage) => stage.name === name && stage.ok));
    }
    for (const file of saved.stages.find((stage) => stage.name === 'export').files) {
      assert.ok(!path.isAbsolute(file.file) && !file.file.includes('..'));
      const bytes = fs.readFileSync(path.join(dir, file.file));
      assert.equal(bytes.length, file.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
    }
    if (process.platform !== 'win32') assert.equal(fs.statSync(dir).mode & 0o777, 0o700);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('operator rejects live mode; actual JSON CLI rejects malformed actions without network', () => {
  assert.equal(run('scripts/resume-operator.js', ['live']).status, 1);
  const result = run('scripts/resume-tool.js', [], '{"version":1,"action":"not-real"}');
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).error.code, 'INVALID_ACTION');
  assert.equal(result.stderr, '');
});

test('evidence-write failure cannot report success and restores the fetch guard', async () => {
  const { smoke } = await import('../scripts/resume-operator.js');
  const originalWrite = fs.writeFileSync;
  const originalFetch = globalThis.fetch;
  let failed = false;
  fs.writeFileSync = function (file, ...args) {
    if (!failed && typeof file === 'string' && file.endsWith('/evidence.json')) {
      failed = true;
      const error = new Error('Synthetic write failure'); error.code = 'ENOSPC'; throw error;
    }
    return originalWrite.call(this, file, ...args);
  };
  let report;
  try {
    report = await smoke();
    assert.equal(report.ok, false);
    assert.equal(report.failureCategory, 'ENOSPC');
    assert.equal(globalThis.fetch, originalFetch);
    assert.equal(JSON.parse(fs.readFileSync(report.evidencePath)).ok, false);
  } finally {
    fs.writeFileSync = originalWrite;
    if (report) fs.rmSync(path.dirname(report.evidencePath), { recursive: true, force: true });
  }
});
