import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadProfilesFromDir(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const fullPath = path.join(dir, file);
      const text = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(text);
    })
    .filter((profile) => profile && profile.id);
}

const baseDir = __dirname;
const generatedDir = path.join(__dirname, 'generated');

const allProfiles = [
  ...loadProfilesFromDir(baseDir),
  ...loadProfilesFromDir(generatedDir),
];

allProfiles.sort((a, b) => a.id.localeCompare(b.id));

const byId = Object.fromEntries(allProfiles.map((profile) => [profile.id, profile]));
const visible = allProfiles.filter((profile) => profile.published !== false);
const defaultProfileId =
  visible.find((profile) => profile.id === 'code-monkey')?.id ??
  visible[0]?.id ??
  allProfiles[0]?.id;

export function getAllProfiles() {
  return allProfiles;
}

export const ProfileRegistry = {
  byId,
  all: allProfiles,
  visible,
  defaultProfileId,
};

export default ProfileRegistry;
