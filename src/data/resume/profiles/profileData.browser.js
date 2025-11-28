const profileModules = import.meta.glob('./*.json', { eager: true, import: 'default' });

const profiles = Object.values(profileModules)
  .map((mod) => mod?.default ?? mod)
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
