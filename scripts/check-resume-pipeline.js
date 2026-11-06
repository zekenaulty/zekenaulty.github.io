// Focused offline smoke check. No model requests, credentials, or real draft changes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { resumeData, getProfileView } from '../src/data/resume/resumeData.node.js';
import { buildProfileView } from '../src/data/resume/viewBuilder.js';
import { validateTailoredProfile } from '../src/data/resume/profileValidation.js';
import { renderHtmlResume, renderTextResume } from './resumeTemplates.js';
import { exportPrivateResume } from './export-private-resume.js';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-check-'));
const profile = {
  id: `pipeline-check-${path.basename(tempDir).toLowerCase()}`,
  label: 'Offline smoke fixture', kind: 'employer-facing', published: false,
  headline: 'Fixture headline', summary: ['Unique tailored summary for the offline fixture.'],
  experienceOrder: ['storable'], experienceOverrides: {},
  skillsPrimary: ['C#'], skillsSecondary: [],
};
const dataFor = (p) => ({ ...resumeData, profiles: { ...resumeData.profiles, byId: { [p.id]: p } } });
const rejects = (changes, pattern) => {
  const invalid = { ...profile, ...changes };
  assert.match(validateTailoredProfile(invalid, resumeData).join(' '), pattern);
};
let outputDir;
try {
  // JSON persistence -> selected view -> rendered output, without any generic-summary fallback.
  const input = path.join(tempDir, 'profile.json');
  fs.writeFileSync(input, JSON.stringify(profile));
  const saved = JSON.parse(fs.readFileSync(input, 'utf8'));
  assert.deepEqual(validateTailoredProfile(saved, resumeData), []);
  const view = buildProfileView(dataFor(saved), saved.id);
  assert.deepEqual(view.summary, saved.summary);
  assert.deepEqual(view.about.paragraphs, saved.summary);
  assert.ok(renderTextResume(view).includes(saved.summary[0]));
  assert.ok(renderHtmlResume(view).includes(saved.summary[0]));

  rejects({ summary: undefined, aboutKey: 'made-up-about' }, /Unknown "aboutKey"/);
  rejects({ summary: [] }, /non-empty array/);
  rejects({ experienceOrder: ['cognition'] }, /Unknown experience ID/);
  rejects({ experienceOverrides: { cognition: {} } }, /Unknown experience ID/);
  rejects({ experienceOverrides: { storable: { dates: { end: null }, title: 'Invented title' } } }, /cannot be overridden/);
  rejects({ experienceOverrides: [] }, /must be an object/);
  rejects({ experienceOverrides: { storable: { description: 'not an array' } } }, /must be an array/);
  rejects({ experienceOrder: ['storable', 'storable'] }, /must not repeat/);
  rejects({ skillsPrimary: [42] }, /non-empty strings/);
  const badReference = { ...profile, experienceOrder: ['cognition'] };
  assert.throws(() => buildProfileView(dataFor(badReference), badReference.id), /Unknown experience ID/);

  const altered = { ...profile, experienceOverrides: { storable: { title: 'Wrong', dates: { end: null } } } };
  const protectedJob = buildProfileView(dataFor(altered), altered.id).experience[0];
  assert.equal(protectedJob.title, resumeData.experienceById.storable.title);
  assert.deepEqual(protectedJob.dates, resumeData.experienceById.storable.dates);
  for (const published of resumeData.profiles.visible) assert.ok(getProfileView(published.id).summary.length);

  // First-of-month date strings must not shift to the previous month west of UTC.
  const dateScript = `import { getProfileView } from './src/data/resume/resumeData.node.js';
    console.log(getProfileView('code-monkey').experience.find(e => e.id === 'storable').dateRangeText);`;
  for (const TZ of ['UTC', 'America/Los_Angeles', 'Pacific/Auckland']) {
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', dateScript], {
      cwd: new URL('..', import.meta.url), env: { ...process.env, TZ }, encoding: 'utf8',
    });
    assert.equal(result.trim(), 'Feb 2021 - Dec 2022');
  }

  outputDir = await exportPrivateResume(input);
  assert.ok(outputDir.includes(`${path.sep}private${path.sep}resume-exports${path.sep}`));
  assert.deepEqual(fs.readdirSync(outputDir).sort(), ['index.html', 'resume.docx', 'resume.pdf', 'resume.txt']);
  const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
  assert.ok(html.includes(profile.summary[0]));
  assert.ok(html.includes('noindex, nofollow, noarchive'));
  assert.ok(!html.includes('rel="canonical"'));
  assert.ok(html.includes('href="./resume.pdf"'));
  assert.ok(!html.includes('href="/resume/'));
  assert.equal(fs.readFileSync(path.join(outputDir, 'resume.pdf')).subarray(0, 5).toString(), '%PDF-');
  assert.equal(fs.readFileSync(path.join(outputDir, 'resume.docx')).subarray(0, 2).toString(), 'PK');
  const textBefore = fs.readFileSync(path.join(outputDir, 'resume.txt'), 'utf8');
  await assert.rejects(exportPrivateResume(input), /already exists/);
  assert.equal(fs.readFileSync(path.join(outputDir, 'resume.txt'), 'utf8'), textBefore);
  await assert.rejects(exportPrivateResume(), /Select one JSON file/);
  console.log('PASS: summary persistence, strict references, canonical facts, timezone dates, and private four-format export.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
  if (outputDir) fs.rmSync(outputDir, { recursive: true, force: true });
}
