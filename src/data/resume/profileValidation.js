const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isTextArray = (value) => Array.isArray(value) && value.every(isText);
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

// Shared by generation, private export, and the browser/node view builder.
export function validateProfileReferences(profile, resumeData) {
  if (!isObject(profile)) return ['Profile must be an object.'];
  const errors = [];
  const experienceIds = new Set(resumeData.experience.map((item) => item.id));

  if (profile.summary !== undefined && (!isTextArray(profile.summary) || !profile.summary.length)) {
    errors.push('"summary" must be a non-empty array of non-empty paragraphs.');
  }
  if (profile.aboutKey !== undefined &&
      (!isText(profile.aboutKey) || !owns(resumeData.aboutVariants, profile.aboutKey))) {
    errors.push(`Unknown "aboutKey": ${JSON.stringify(profile.aboutKey)}. Use an existing key or omit it and supply summary paragraphs.`);
  }

  if (profile.experienceOrder !== undefined) {
    if (!isTextArray(profile.experienceOrder)) {
      errors.push('"experienceOrder" must be an array of experience IDs.');
    } else {
      for (const id of profile.experienceOrder) {
        if (!experienceIds.has(id)) errors.push(`Unknown experience ID in "experienceOrder": "${id}".`);
      }
      if (new Set(profile.experienceOrder).size !== profile.experienceOrder.length) {
        errors.push('"experienceOrder" must not repeat experience IDs.');
      }
    }
  }

  if (profile.experienceOverrides !== undefined) {
    if (!isObject(profile.experienceOverrides)) {
      errors.push('"experienceOverrides" must be an object.');
    } else {
      for (const [id, override] of Object.entries(profile.experienceOverrides)) {
        if (!experienceIds.has(id)) errors.push(`Unknown experience ID in "experienceOverrides": "${id}".`);
        if (!isObject(override)) {
          errors.push(`Override for "${id}" must be an object.`);
          continue;
        }
        if (isTextArray(profile.experienceOrder) && !profile.experienceOrder.includes(id)) {
          errors.push(`Override for "${id}" is not included in "experienceOrder".`);
        }
        for (const field of ['description', 'skillsUsed']) {
          if (override[field] !== undefined && !isTextArray(override[field])) {
            errors.push(`"${id}.${field}" must be an array of non-empty strings.`);
          }
        }
        if (override.summary !== undefined && !isText(override.summary)) {
          errors.push(`"${id}.summary" must be a non-empty string.`);
        }
      }
    }
  }
  return errors;
}

export function validateTailoredProfile(profile, resumeData, { requireSummary = true } = {}) {
  const errors = validateProfileReferences(profile, resumeData);
  if (!isObject(profile)) return errors;

  for (const field of ['id', 'label', 'headline']) {
    if (!isText(profile[field])) errors.push(`"${field}" must be a non-empty string.`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profile.id ?? '')) {
    errors.push('"id" must be lowercase and hyphen separated.');
  }
  if (profile.kind !== 'employer-facing') errors.push('"kind" must be "employer-facing".');
  if (profile.published !== false) errors.push('"published" must be false for a private tailored profile.');
  if (requireSummary && profile.summary === undefined) {
    errors.push('"summary" is required. Save the actual tailored paragraphs, not a new aboutKey.');
  } else if (profile.summary === undefined && !profile.aboutKey) {
    errors.push('Provide summary paragraphs or an existing aboutKey.');
  }
  for (const field of ['skillsPrimary', 'skillsSecondary']) {
    if (!isTextArray(profile[field])) errors.push(`"${field}" must be an array of non-empty strings (can be empty).`);
  }
  if (Array.isArray(profile.experienceOrder) && !profile.experienceOrder.length) {
    errors.push('"experienceOrder" must include at least one experience ID.');
  }

  if (isObject(profile.experienceOverrides)) {
    const allowedFields = new Set(['description', 'summary', 'skillsUsed']);
    for (const [id, override] of Object.entries(profile.experienceOverrides)) {
      if (!isObject(override)) continue;
      for (const field of Object.keys(override)) {
        if (!allowedFields.has(field)) {
          errors.push(`"${id}.${field}" cannot be overridden. Use canonical employment facts; tailor only description, summary, and skillsUsed.`);
        }
      }
    }
  }
  return errors;
}
