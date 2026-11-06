import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('public Node registry never loads generated drafts, including published:true', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-privacy-registry-'));
  try {
    fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}');
    fs.copyFileSync(path.join(ROOT, 'src/data/resume/profiles/profileData.node.js'), path.join(root, 'registry.js'));
    fs.mkdirSync(path.join(root, 'generated'));
    fs.writeFileSync(path.join(root, 'code-monkey.json'), JSON.stringify({ id: 'code-monkey', published: true }));
    fs.writeFileSync(path.join(root, 'generated/leak.json'), JSON.stringify({ id: 'private-draft', published: true }));
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', "import { ProfileRegistry } from './registry.js'; console.log(JSON.stringify(ProfileRegistry));"], { cwd: root }).toString();
    const registry = JSON.parse(output);
    assert.deepEqual(registry.all.map((profile) => profile.id), ['code-monkey']);
    assert.equal(registry.byId['private-draft'], undefined);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('draft and recovery paths are ignored while the placeholder is tracked', () => {
  for (const file of [
    'src/data/resume/profiles/generated/new-draft.json',
    'private/resume-profiles/new-draft.json',
    'private/recovered-generated-profiles/old-draft.json',
    'private/resume-exports/new-draft/resume.pdf',
  ]) {
    const ignored = execFileSync('git', ['check-ignore', '--no-index', file], { cwd: ROOT }).toString().trim();
    assert.equal(ignored, file);
  }
  assert.equal(execFileSync('git', ['ls-files', 'src/data/resume/profiles/generated/.gitkeep'], { cwd: ROOT }).toString().trim(), 'src/data/resume/profiles/generated/.gitkeep');
});

test('recovery preserves exact bytes and refuses to overwrite a changed local draft', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-privacy-recovery-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.copyFileSync(path.join(ROOT, 'scripts/recover-resume-drafts.js'), path.join(root, 'scripts/recover-resume-drafts.mjs'));
    const source = path.join(root, 'src/data/resume/profiles/generated');
    fs.mkdirSync(source, { recursive: true });
    const bytes = Buffer.from('{\n  "id": "old-draft", "published": false\n}\n');
    fs.writeFileSync(path.join(source, 'old-draft.json'), bytes);
    const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
    git('init'); git('add', '.');
    git('-c', 'user.name=Privacy Test', '-c', 'user.email=privacy@example.invalid', 'commit', '-m', 'fixture');
    const run = () => execFileSync(process.execPath, ['scripts/recover-resume-drafts.mjs', '--ref', 'HEAD'], { cwd: root, stdio: 'pipe' });
    run(); run();
    const recovered = path.join(root, 'private/recovered-generated-profiles/old-draft.json');
    assert.deepEqual(fs.readFileSync(recovered), bytes);
    fs.writeFileSync(recovered, 'my local edits');
    assert.throws(run, /Refusing to overwrite/);
    assert.equal(fs.readFileSync(recovered, 'utf8'), 'my local edits');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
