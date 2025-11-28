import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { resumeData } from '../src/data/resume/resumeData.node.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const projects = require('../src/data/projects/projects.json');

const OUTPUT_PATH = path.resolve(__dirname, '..', 'src', 'llm', 'resumeChatData.json');

const SOURCE_FILES = [
  'src/data/resume/experience/*',
  'src/data/resume/skills.json',
  'src/data/resume/aboutVariants.json',
  'src/data/resume/profiles/*.json',
  'src/data/projects/projects.json',
];

const clone = (value) => JSON.parse(JSON.stringify(value));

function flattenExperience(list) {
  return (list || []).map((item) => ({
    ...item,
    id: item.id,
  }));
}

export function buildResumeChatData() {
  const payload = {
    subject: 'Zeke Naulty',
    version: 1,
    resume: {
      experience: flattenExperience(resumeData.experience),
      skills: clone(resumeData.skills),
      profiles: clone(resumeData.profiles),
      aboutVariants: clone(resumeData.aboutVariants),
    },
    projects: {
      items: clone(projects),
    },
    meta: {
      sourceFiles: SOURCE_FILES,
      lastBuild: new Date().toISOString(),
    },
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf8');

  return OUTPUT_PATH;
}

async function main() {
  const outputPath = buildResumeChatData();
  console.log(`Wrote resume chat data to ${outputPath}`);
}

if (process.argv[1] === __filename) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
