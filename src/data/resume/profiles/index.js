const isNode = typeof process !== 'undefined' && !!process.versions?.node;

async function loadJson(modulePath) {
  if (isNode) {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    return require(modulePath);
  }
  const mod = await import(modulePath);
  return mod.default ?? mod;
}

const backendModernization = await loadJson('./backend-modernization.json');
const desktopWinforms = await loadJson('./desktop-winforms.json');
const fullstackDotnet = await loadJson('./fullstack-dotnet.json');
const solutionArchitect = await loadJson('./solution-architect.json');
const codeMonkey = await loadJson('./code-monkey.json');

export const ProfileRegistry = {
    all: [
        backendModernization,
        desktopWinforms,
        fullstackDotnet,
        solutionArchitect,
        codeMonkey
    ],
    byId: {
        [backendModernization.id]: backendModernization,
        [desktopWinforms.id]: desktopWinforms,
        [fullstackDotnet.id]: fullstackDotnet,
        [solutionArchitect.id]: solutionArchitect,
        [codeMonkey.id]: codeMonkey
    },
    defaultProfileId: codeMonkey.id
};
