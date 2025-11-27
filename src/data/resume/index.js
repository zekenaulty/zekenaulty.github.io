import aboutVariants from './aboutVariants.json';
import skills from './skills.json';

import computerSpecialist from './experience/computer-specialist.json';
import littonAvondale from './experience/litton-avondale.json';
import hancockWhitney from './experience/hancock-whitney.json';
import rainmaker from './experience/rainmaker.json';
import pkPromotions from './experience/pk-promotions.json';
import notRocketScience from './experience/not-rocket-science.json';
import solidEarth from './experience/solid-earth.json';
import ruralSourcing from './experience/rural-sourcing.json';
import prestageFarms from './experience/prestage-farms.json';
import iadvantage from './experience/iadvantage.json';
import storable from './experience/storable.json';

import { ProfileRegistry } from './profiles/index.js';

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
  skills,
  profiles: ProfileRegistry,
  aboutVariants,
};

export default resumeData;
