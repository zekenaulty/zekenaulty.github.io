import { createRequire } from 'module';
import { buildProfileView } from './viewBuilder.js';
import ProfileRegistry from './profiles/profileData.node.js';

const require = createRequire(import.meta.url);

const projects = require('../projects/projects.json');
const aboutVariants = require('./aboutVariants.json');
const skillsCatalog = require('./skills.json');

const computerSpecialist = require('./experience/computer-specialist.json');
const littonAvondale = require('./experience/litton-avondale.json');
const hancockWhitney = require('./experience/hancock-whitney.json');
const rainmaker = require('./experience/rainmaker.json');
const pkPromotions = require('./experience/pk-promotions.json');
const notRocketScience = require('./experience/not-rocket-science.json');
const solidEarth = require('./experience/solid-earth.json');
const ruralSourcing = require('./experience/rural-sourcing.json');
const prestageFarms = require('./experience/prestage-farms.json');
const iadvantage = require('./experience/iadvantage.json');
const storable = require('./experience/storable.json');

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
