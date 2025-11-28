const isNode = typeof window === 'undefined';

let registryModule;

if (isNode) {
  registryModule = await import('./profileData.node.js');
} else {
  registryModule = await import('./profileData.browser.js');
}

export const ProfileRegistry = registryModule.ProfileRegistry;
export default ProfileRegistry;
