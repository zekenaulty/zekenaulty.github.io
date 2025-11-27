import backendModernization from './backend-modernization.json';
import desktopWinforms from './desktop-winforms.json';
import fullstackDotnet from './fullstack-dotnet.json';
import solutionArchitect from './solution-architect.json';
import codeMonkey from './code-monkey.json';

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
