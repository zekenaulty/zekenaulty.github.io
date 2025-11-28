import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const backendModernization = require('./backend-modernization.json');
const desktopWinforms = require('./desktop-winforms.json');
const fullstackDotnet = require('./fullstack-dotnet.json');
const solutionArchitect = require('./solution-architect.json');
const codeMonkey = require('./code-monkey.json');

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
