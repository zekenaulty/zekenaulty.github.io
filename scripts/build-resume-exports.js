import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProfileView, resumeData } from '../src/data/resume/resumeData.node.js';
import {
  renderDocxResume,
  renderHtmlResume,
  renderPdfResume,
  renderTextResume,
} from './resumeTemplates.js';
import { buildResumeChatData } from './build-resume-chat-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROFILE_SLUGS = resumeData.profiles.all.map((profile) => profile.id);

async function main() {
  buildResumeChatData();

  const distRoot = path.resolve(__dirname, '..', 'dist');

  if (!fs.existsSync(distRoot)) {
    throw new Error('dist/ does not exist. Run `npm run build` first.');
  }

  for (const slug of PROFILE_SLUGS) {
    const view = getProfileView(slug);
    const profileDir = path.join(distRoot, 'resume', slug);
    fs.mkdirSync(profileDir, { recursive: true });

    const html = renderHtmlResume(view);
    fs.writeFileSync(path.join(profileDir, 'index.html'), html, 'utf8');

    const txt = renderTextResume(view);
    fs.writeFileSync(path.join(profileDir, `resume-${slug}.txt`), txt, 'utf8');

    const docxBuffer = await renderDocxResume(view);
    fs.writeFileSync(path.join(profileDir, `resume-${slug}.docx`), docxBuffer);

    const pdfBuffer = await renderPdfResume(view);
    fs.writeFileSync(path.join(profileDir, `resume-${slug}.pdf`), pdfBuffer);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
