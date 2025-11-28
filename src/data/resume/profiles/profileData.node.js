import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profiles = fs
  .readdirSync(__dirname)
  .filter((file) => file.endsWith('.json'))
  .map((file) => require(`./${file}`))
  .filter((profile) => profile && profile.id)
  .sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));

const byId = Object.fromEntries(profiles.map((profile) => [profile.id, profile]));
const defaultProfileId = byId['code-monkey'] ? 'code-monkey' : profiles[0]?.id;

export const ProfileRegistry = {
  all: profiles,
  byId,
  defaultProfileId,
};

export default ProfileRegistry;
