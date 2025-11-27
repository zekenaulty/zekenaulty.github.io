import { useMemo } from 'react';
import { resumeData } from '../data/resume/index.js';

const DEFAULT_PROFILE_ID = resumeData.profiles.defaultProfileId;

const mapExperience = (profile, experienceById, defaultOrder) =>
  (profile.experienceOrder ?? defaultOrder).reduce((list, id) => {
    const base = experienceById[id];
    if (!base) return list;

    const override = profile.experienceOverrides?.[id];
    if (!override) return [...list, base];

    const merged = {
      ...base,
      ...override,
      description: override.description ?? base.description,
      summary: override.summary ?? base.summary,
      skillsUsed: override.skillsUsed ?? base.skillsUsed,
    };

    return [...list, merged];
  }, []);

export function useProfileView(profileId = DEFAULT_PROFILE_ID) {
  return useMemo(() => {
    const profile =
      resumeData.profiles.byId[profileId] ?? resumeData.profiles.byId[DEFAULT_PROFILE_ID];

    const experiences = mapExperience(
      profile,
      resumeData.experienceById,
      resumeData.experience.map((item) => item.id),
    );
    const about =
      (profile.aboutKey && resumeData.aboutVariants[profile.aboutKey]) ||
      resumeData.aboutVariants.master;

    return {
      profile,
      headline: profile.headline,
      about,
      experiences,
      skills: resumeData.skills,
      skillsPrimary: profile.skillsPrimary ?? [],
      skillsSecondary: profile.skillsSecondary ?? [],
    };
  }, [profileId]);
}
