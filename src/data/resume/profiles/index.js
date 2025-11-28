const isNode = typeof window === 'undefined';
const loaderModule = isNode
  ? await import('./profileData.node.js')
  : await import('./profileData.browser.js');

const allProfiles = loaderModule.getAllProfiles ? loaderModule.getAllProfiles() : [];
const byId = Object.fromEntries(allProfiles.map((profile) => [profile.id, profile]));
const visible = allProfiles.filter((profile) => profile.published !== false);
const defaultProfileId =
  visible.find((profile) => profile.id === 'code-monkey')?.id ??
  visible[0]?.id ??
  allProfiles[0]?.id;

export const ProfileRegistry = {
  byId,
  all: allProfiles,
  visible,
  defaultProfileId,
};

export default ProfileRegistry;
