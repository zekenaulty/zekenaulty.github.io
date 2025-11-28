import backendModernization from './backend-modernization.json' assert { type: 'json' };
import desktopWinforms from './desktop-winforms.json' assert { type: 'json' };
import fullstackDotnet from './fullstack-dotnet.json' assert { type: 'json' };
import solutionArchitect from './solution-architect.json' assert { type: 'json' };
import codeMonkey from './code-monkey.json' assert { type: 'json' };

export const ProfileRegistry = {
  all: [backendModernization, desktopWinforms, fullstackDotnet, solutionArchitect, codeMonkey],
  byId: {
    [backendModernization.id]: backendModernization,
    [desktopWinforms.id]: desktopWinforms,
    [fullstackDotnet.id]: fullstackDotnet,
    [solutionArchitect.id]: solutionArchitect,
    [codeMonkey.id]: codeMonkey,
  },
  defaultProfileId: codeMonkey.id,
};

export default ProfileRegistry;
