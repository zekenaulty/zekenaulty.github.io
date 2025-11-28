import { useMemo } from 'react';
import { DEFAULT_PROFILE_ID, getProfileView } from '../data/resume/index.js';

export function useProfileView(profileId = DEFAULT_PROFILE_ID) {
  return useMemo(() => getProfileView(profileId), [profileId]);
}
