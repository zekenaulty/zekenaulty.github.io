import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resumeData } from '../src/data/resume/resumeData.node.js';
import { buildProfileView } from '../src/data/resume/viewBuilder.js';
import { validateTailoredProfile } from '../src/data/resume/profileValidation.js';
import { renderHtmlResume, renderTextResume, renderDocxResume, renderPdfResume } from './resumeTemplates.js';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');

export async function exportPrivateResume(profilePath) {
  if (!profilePath) throw new Error('Select one JSON file with --profile <path>.');
  const profile = JSON.parse(fs.readFileSync(path.resolve(profilePath), 'utf8'));
  const errors = validateTailoredProfile(profile, resumeData, { requireSummary: false });
  if (errors.length) throw new Error(`Cannot export selected profile: ${errors.join(' ')}`);

  const view = buildProfileView({
    ...resumeData,
    profiles: { ...resumeData.profiles, byId: { [profile.id]: profile } },
  }, profile.id);

  // This is a local artifact, never a public site route. Keep it out of dist/ and public/.
  const privateRoot = path.join(root, 'private');
  const exportRoot = path.join(privateRoot, 'resume-exports');
  for (const dir of [privateRoot, exportRoot]) {
    if (fs.existsSync(dir) && fs.lstatSync(dir).isSymbolicLink()) {
      throw new Error(`Private output directory must not be a symlink: ${dir}`);
    }
    fs.mkdirSync(dir, { recursive: true });
  }
  const outputDir = path.join(exportRoot, profile.id);
  if (fs.existsSync(outputDir)) {
    throw new Error(`Export already exists: ${outputDir}. Keep or move it before exporting again; it will not be overwritten.`);
  }

  // Finish rendering before creating the final directory, so rendering failures leave no partial export.
  const outputs = {
    'index.html': renderHtmlResume(view, { privatePreview: true }),
    'resume.txt': renderTextResume(view),
    'resume.docx': await renderDocxResume(view),
    'resume.pdf': await renderPdfResume(view),
  };
  fs.mkdirSync(outputDir);
  try {
    for (const [name, contents] of Object.entries(outputs)) {
      fs.writeFileSync(path.join(outputDir, name), contents, { flag: 'wx' });
    }
  } catch (error) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    throw error;
  }
  return outputDir;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: npm run export:private -- --profile private/resume-profiles/company-role.json');
    console.log('Writes local HTML/TXT/DOCX/PDF under private/resume-exports/<id>. Does not publish or call a model.');
    return;
  }
  if (args.length !== 2 || args[0] !== '--profile' || args[1].startsWith('--')) {
    throw new Error('Select exactly one JSON file: npm run export:private -- --profile <path>');
  }
  const outputDir = await exportPrivateResume(args[1]);
  console.log(`Private export: ${outputDir}`);
  console.log('Open index.html locally to preview. Review every claim before sharing. Nothing was published.');
}

if (process.argv[1] === filename) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
