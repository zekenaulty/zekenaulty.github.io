const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

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

function buildSkillsBuckets(skillsCatalog, profile) {
  const skillNames = skillsCatalog.map((entry) => entry?.name ?? entry).filter(Boolean);
  const skillsPrimary = profile.skillsPrimary ?? [];
  const skillsSecondary = profile.skillsSecondary ?? [];
  const focus = new Set([...skillsPrimary, ...skillsSecondary].filter(Boolean));
  const skillsOther = skillNames.filter((name) => !focus.has(name));

  return {
    buckets: {
      core: skillsPrimary,
      supporting: skillsSecondary,
      other: skillsOther,
    },
    primary: skillsPrimary,
    secondary: skillsSecondary,
  };
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

function deriveProjects(profile, projects) {
  const projectsById = projects.reduce((map, project) => {
    map.set(project.id ?? project.name, project);
    return map;
  }, new Map());

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

export function buildProfileView(resumeData, projects, profileSlug) {
  const profile =
    resumeData.profiles.byId[profileSlug] ?? resumeData.profiles.byId[resumeData.profiles.defaultProfileId];

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

  const skillsInfo = buildSkillsBuckets(resumeData.skills, profile);
  const projectsView = deriveProjects(profile, projects);

  return {
    profileSlug: profile.id,
    profileLabel: profile.label,
    profileKind: profile.kind,
    headline: profile.headline,
    about,
    summary: about?.paragraphs ?? [],
    experience: experiences,
    experiences,
    skills: resumeData.skills,
    skillsBuckets: skillsInfo.buckets,
    skillsByCategory: skillsInfo.buckets,
    skillsPrimary: skillsInfo.primary,
    skillsSecondary: skillsInfo.secondary,
    skillsCatalog: resumeData.skills,
    projects: projectsView,
    profile,
  };
}
