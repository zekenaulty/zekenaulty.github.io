import projects from '../projects/index.js';
import ProfileRegistry from './profiles/profileData.browser.js';
import aboutVariants from './aboutVariants.json' assert { type: 'json' };
import skillsCatalog from './skills.json' assert { type: 'json' };

import computerSpecialist from './experience/computer-specialist.json' assert { type: 'json' };
import littonAvondale from './experience/litton-avondale.json' assert { type: 'json' };
import hancockWhitney from './experience/hancock-whitney.json' assert { type: 'json' };
import rainmaker from './experience/rainmaker.json' assert { type: 'json' };
import pkPromotions from './experience/pk-promotions.json' assert { type: 'json' };
import notRocketScience from './experience/not-rocket-science.json' assert { type: 'json' };
import solidEarth from './experience/solid-earth.json' assert { type: 'json' };
import ruralSourcing from './experience/rural-sourcing.json' assert { type: 'json' };
import prestageFarms from './experience/prestage-farms.json' assert { type: 'json' };
import iadvantage from './experience/iadvantage.json' assert { type: 'json' };
import storable from './experience/storable.json' assert { type: 'json' };

import { buildProfileView } from './viewBuilder.js';

const experience = [
  storable,
  iadvantage,
  prestageFarms,
  ruralSourcing,
  solidEarth,
  notRocketScience,
  pkPromotions,
  rainmaker,
  hancockWhitney,
  littonAvondale,
  computerSpecialist,
];

const experienceById = experience.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const resumeData = {
  experience,
  experienceById,
  skills: skillsCatalog,
  profiles: ProfileRegistry,
  aboutVariants,
};

export const DEFAULT_PROFILE_ID = ProfileRegistry.defaultProfileId;

export function getProfileView(profileSlug = DEFAULT_PROFILE_ID) {
  return buildProfileView(resumeData, projects, profileSlug);
}

export default resumeData;
