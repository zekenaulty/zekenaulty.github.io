// Offline operator diagnostics. Never import dotenv configuration or inspect credentials.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fileHash = (file) => hash(fs.readFileSync(file));
const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', env: { PATH: '/usr/bin:/bin' } }).trim();

export async function preflight() {
  const checks = [];
  const [major, minor] = process.versions.node.split('.').map(Number);
  checks.push({ name: 'node', ok: major === 20 ? minor >= 19 : major === 22 ? minor >= 12 : major > 22, version: process.versions.node });
  for (const dependency of ['dotenv', 'docx', 'pdfkit']) {
    try { require.resolve(dependency); checks.push({ name: dependency, ok: true }); }
    catch { checks.push({ name: dependency, ok: false, remedy: 'Run npm ci from the locked checkout.' }); }
  }
  let sourceHash;
  try {
    const { resumeData } = await import('../src/data/resume/resumeData.node.js');
    const { buildSourceCatalog, digest } = await import('./lib/resume-selection.js');
    sourceHash = digest(buildSourceCatalog(resumeData));
    checks.push({ name: 'canonical-source', ok: true });
  } catch { checks.push({ name: 'canonical-source', ok: false }); }
  return { version: 1, mode: 'preflight', ok: checks.every((check) => check.ok), checks, sourceHash,
    credentials: 'not inspected; existing secure provisioning does not prove runtime injection or provider access',
    privateState: 'not inspected; Git does not reproduce ignored inputs, drafts or exports',
    persistence: 'not verified; directory existence is not a durability guarantee',
    liveGeneration: 'not tested; explicit provider/data-sharing and cost authorization required' };
}

export async function smoke() {
  // The only transport used below is injected. A default fetch call is a hard failure.
  const originalFetch = globalThis.fetch;
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-operator-offline-'));
  fs.chmodSync(work, 0o700);
  globalThis.fetch = () => { throw new Error('Unexpected outbound request'); };
  const report = { version: 1, mode: 'offline-synthetic', ok: false, stages: [], mockCalls: 0, liveProviderCalls: 0,
    limitations: ['Mock proves local execution, not model availability or quality.', 'Synthetic exports use the existing renderer public identity heading; they are not application documents.', 'Temporary workspace persistence and backup are not verified.'] };
  const record = (name, evidence = {}) => report.stages.push({ name, ok: true, ...evidence });
  const writeReport = () => fs.writeFileSync(path.join(work, 'evidence.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  try {
    report.commit = git('rev-parse', 'HEAD');
    report.sourceFiles = Object.fromEntries(git('ls-files', 'scripts', 'src/data/resume').split('\n').filter(Boolean).map((file) => [file, fileHash(path.join(root, file))]));
    report.sourceTreeHash = hash(JSON.stringify(report.sourceFiles));
    report.operatorHash = fileHash(fileURLToPath(import.meta.url));
    report.lockfileHash = fileHash(path.join(root, 'package-lock.json'));
    const { createResumeService } = await import('./lib/private-resume-service.js');
    const role = { id: 'fixture-role', title: 'SYNTHETIC TEST ROLE', company: 'SYNTHETIC TEST COMPANY', location: 'Test fixture', dates: {}, summary: 'Synthetic export test only.', description: ['Synthetic deterministic bullet.'], skillsUsed: ['Fixture skill'] };
    const resume = { experience: [role], experienceById: { [role.id]: role }, skills: ['Fixture skill'], profiles: { visible: [{ id: 'fixture', headline: 'SYNTHETIC OFFLINE TEST' }], byId: {}, defaultProfileId: 'fixture' }, aboutVariants: { fixture: { paragraphs: ['Synthetic test material, not career facts.'] } } };
    const selection = { headlineRef: 'headline/fixture', summaryRefs: ['about/fixture/0'], experiences: [{ id: role.id, bulletRefs: ['role/fixture-role/bullet/0'], skillRefs: ['role/fixture-role/skill/0'] }], skillsPrimaryRefs: ['role/fixture-role/skill/0'], skillsSecondaryRefs: [] };
    const dummy = 'offline-test-only';
    const service = createResumeService({ root: work, resume, credentials: () => dummy, fetchImpl: async (url, options) => {
      report.mockCalls++;
      assert.equal(url, 'https://api.openai.com/v1/responses');
      assert.equal(options.headers.Authorization, `Bearer ${dummy}`);
      assert.equal(options.redirect, 'error');
      assert.equal(JSON.parse(options.body).store, false);
      assert.ok(!options.body.includes(dummy));
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(selection) }] }] }));
    } });
    const confined = (file) => {
      const relative = path.relative(work, fs.realpathSync(file));
      assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Artifact must remain inside fixture workspace');
      assert.ok(!fs.lstatSync(file).isSymbolicLink(), 'Artifact must not be a symlink');
      return file;
    };
    const execute = async (action, fields = {}) => (await service.execute({ version: 1, action, ...fields })).result;
    const reject = async (name, operation, code) => {
      const before = report.mockCalls;
      await assert.rejects(operation, (error) => code ? error.code === code : /already exists/.test(error.message));
      assert.equal(report.mockCalls, before);
      record(name, { rejected: code ?? 'existing-export', additionalCalls: 0 });
    };
    assert.deepEqual((await execute('list_jobs')).jobs, []);
    record('empty-checkout', { jobs: 0 });
    await reject('missing-job', () => execute('prepare', { job: 'fixture.md' }), 'NOT_FOUND');
    fs.mkdirSync(path.join(work, 'private/job-descriptions'), { recursive: true, mode: 0o700 });
    fs.writeFileSync(path.join(work, 'private/job-descriptions/fixture.md'), 'Synthetic fixture: select one test role.', { mode: 0o600 });
    assert.equal((await execute('list_jobs')).jobs.length, 1);
    record('list_jobs', { jobs: 1 });
    const input = { job: 'fixture.md', id: 'offline-proof', maxOutputTokens: 1024 };
    const prepared = await execute('prepare', input);
    assert.equal(report.mockCalls, 0);
    record('prepare', { sourceHash: prepared.sourceHash, inputHash: prepared.inputHash });
    await reject('approval-gate', () => execute('generate', input), 'NETWORK_NOT_APPROVED');
    await reject('stale-input', () => execute('generate', { ...input, allowNetwork: true, expectedInputHash: 'stale' }), 'INPUT_CHANGED');
    const request = { ...input, allowNetwork: true, expectedInputHash: prepared.inputHash };
    const generated = await execute('generate', request);
    assert.equal(report.mockCalls, 1);
    record('generate', { draftHash: generated.draftHash, transport: 'deterministic mock' });
    await reject('no-overwrite-draft', () => execute('generate', request), 'ALREADY_EXISTS');
    const validated = await execute('validate', { id: input.id });
    assert.equal(validated.draftHash, generated.draftHash);
    record('validate', { draftHash: validated.draftHash });
    confined(generated.draftPath);
    const draft = fs.readFileSync(generated.draftPath);
    const tampered = JSON.parse(draft); tampered.summary = ['Unsupported change'];
    fs.writeFileSync(generated.draftPath, JSON.stringify(tampered));
    await reject('tamper-rejection', () => execute('validate', { id: input.id }), 'DRAFT_CHANGED');
    fs.writeFileSync(generated.draftPath, draft);
    const exportRequest = { id: input.id, expectedDraftHash: validated.draftHash };
    await reject('stale-export', () => execute('export', { ...exportRequest, expectedDraftHash: 'stale' }), 'DRAFT_CHANGED');
    const exported = await execute('export', exportRequest);
    confined(exported.outputDir);
    assert.equal(exported.files.length, 4);
    exported.files.forEach(confined);
    const files = exported.files.map((file) => ({ file: path.relative(work, file), bytes: fs.statSync(file).size, sha256: fileHash(file) }));
    assert.ok(files.every((file) => file.bytes > 0));
    assert.equal(fs.readFileSync(path.join(exported.outputDir, 'resume.pdf')).subarray(0, 5).toString(), '%PDF-');
    assert.equal(fs.readFileSync(path.join(exported.outputDir, 'resume.docx')).subarray(0, 2).toString(), 'PK');
    assert.match(fs.readFileSync(path.join(exported.outputDir, 'index.html'), 'utf8'), /noindex, nofollow, noarchive/);
    record('export', { files });
    await reject('no-overwrite-export', () => execute('export', exportRequest));
    assert.equal(report.mockCalls, 1);
    report.ok = true;
    writeReport();
    return { ...report, evidencePath: path.join(work, 'evidence.json') };
  } catch (error) {
    report.ok = false;
    report.failureCategory = ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND', 'ENOENT', 'EACCES', 'ENOSPC', 'ERR_ASSERTION'].includes(error.code) ? error.code : 'OFFLINE_CHECK_FAILED';
    report.lastCompletedStage = report.stages.at(-1)?.name ?? 'initialization';
    report.failure = 'Offline proof failed; no live generation was attempted. Inspect the implementation and rerun in a new fixture workspace.';
    writeReport();
    return { ...report, evidencePath: path.join(work, 'evidence.json') };
  } finally { globalThis.fetch = originalFetch; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2];
  if (process.argv.length !== 3 || !['preflight', 'smoke'].includes(command)) {
    console.log(JSON.stringify({ ok: false, usage: 'node scripts/resume-operator.js preflight|smoke', note: 'No live mode. Smoke retains a new synthetic temporary workspace.' }));
    process.exitCode = 1;
  } else {
    const result = await (command === 'preflight' ? preflight() : smoke());
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  }
}
