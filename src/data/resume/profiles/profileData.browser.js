const baseProfiles = import.meta.glob('./*.json', {
  eager: true,
  import: 'default',
});

const generatedProfiles = import.meta.glob('./generated/*.json', {
  eager: true,
  import: 'default',
});

const allModules = {
  ...baseProfiles,
  ...generatedProfiles,
};

const allProfiles = Object.values(allModules)
  .map((mod) => mod?.default ?? mod)
  .filter((profile) => profile && profile.id);

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
