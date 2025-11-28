import { createRequire } from 'module';
import projects from '../projects/index.js';
import { ProfileRegistry } from './profiles/index.js';

const require = createRequire(import.meta.url);

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
const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

const skillNames = skillsCatalog
  .map((entry) => entry?.name ?? entry)
  .filter(Boolean);

const projectsById = projects.reduce((map, project) => {
  map.set(project.id ?? project.name, project);
  return map;
}, new Map());

function formatDate(isoString) {
  if (!isoString) return '';

  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return typeof isoString === 'string' ? isoString : '';
  }

  return monthYearFormatter.format(parsed);
}

function mergeExperience(base, override) {
  if (!override) return base;

  return {
    ...base,
    ...override,
    description: override.description ?? base.description,
    summary: override.summary ?? base.summary,
    skillsUsed: override.skillsUsed ?? base.skillsUsed,
    dates: override.dates ?? base.dates,
  };
}

function normalizeExperience(entry) {
  const start = formatDate(entry?.dates?.start);
  const end = formatDate(entry?.dates?.end);
  const dateRangeText = [start, end || 'Present'].filter(Boolean).join(' - ');

  return {
    ...entry,
    dates: entry?.dates ?? {},
    start,
    end,
    dateRangeText,
    bullets: entry.description ?? [],
  };
}

function deriveOtherSkills(primary = [], secondary = []) {
  const focus = new Set([...primary, ...secondary].filter(Boolean));
  return skillNames.filter((name) => !focus.has(name));
}

function normalizeProject(project) {
  const tags = project.techTags ?? project.tags ?? [];
  const description = project.description ?? project.shortDescription ?? '';

  return {
    id: project.id ?? project.name,
    name: project.name ?? project.id,
    url: project.url ?? project.repoUrl ?? '',
    repoUrl: project.repoUrl ?? project.url ?? '',
    shortDescription: project.shortDescription ?? description,
    description,
    tags,
    techTags: tags,
  };
}

function deriveProjects(profile) {
  if (Array.isArray(profile.projectIds) && profile.projectIds.length > 0) {
    return profile.projectIds
      .map((id) => projectsById.get(id))
      .filter(Boolean)
      .map(normalizeProject);
  }

  const tagSet = new Set(profile.tags ?? []);
  if (tagSet.size) {
    const tagged = projects
      .filter((project) => (project.tags ?? project.techTags ?? []).some((tag) => tagSet.has(tag)))
      .map(normalizeProject);

    if (tagged.length) {
      return tagged;
    }
  }

  return projects.map(normalizeProject);
}

export function getProfileView(profileSlug = DEFAULT_PROFILE_ID) {
  const profile =
    resumeData.profiles.byId[profileSlug] ?? resumeData.profiles.byId[DEFAULT_PROFILE_ID];

  const experiences = (profile.experienceOrder ?? resumeData.experience.map((item) => item.id))
    .map((id) => {
      const base = resumeData.experienceById[id];
      if (!base) return null;

      const merged = mergeExperience(base, profile.experienceOverrides?.[id]);
      return normalizeExperience(merged);
    })
    .filter(Boolean);

  const about =
    (profile.aboutKey && resumeData.aboutVariants[profile.aboutKey]) ||
    resumeData.aboutVariants.master;

  const skillsPrimary = profile.skillsPrimary ?? [];
  const skillsSecondary = profile.skillsSecondary ?? [];
  const skillsOther = deriveOtherSkills(skillsPrimary, skillsSecondary);
  const skillsBuckets = {
    core: skillsPrimary,
    supporting: skillsSecondary,
    other: skillsOther,
  };

  const projectsView = deriveProjects(profile);

  return {
    profileSlug: profile.id,
    profileLabel: profile.label,
    profileKind: profile.kind,
    headline: profile.headline,
    about,
    summary: about?.paragraphs ?? [],
    experience: experiences,
    experiences,
    skills: skillsCatalog,
    skillsBuckets,
    skillsByCategory: skillsBuckets,
    skillsPrimary,
    skillsSecondary,
    skillsCatalog,
    projects: projectsView,
    profile,
  };
}

export default resumeData;
