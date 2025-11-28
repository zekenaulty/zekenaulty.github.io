import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { buildResumeChatData } from './build-resume-chat-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');

// Load environment variables (prefers .env.local, then .env)
dotenv.config({ path: path.join(ROOT_DIR, '.env.local') });
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const PRIVATE_JD_PATH = path.join(ROOT_DIR, 'private', 'job-descriptions');
const OUTPUT_DIR = path.join(
  ROOT_DIR,
  'src',
  'data',
  'resume',
  'profiles',
  'generated',
);
const SYSTEM_PROMPT_PATH = path.join(
  ROOT_DIR,
  'src',
  'llm',
  'system',
  'tailored-profile-generator-prompt.md',
);

// Environment / model configuration
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'models/gemini-2.5-flash').trim();
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1000;
const argv = process.argv.slice(2);
const runMode = argv.includes('--all') ? 'all' : 'missing'; // default missing
const explicitFiles = argv.filter((arg) => !arg.startsWith('-'));

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required.');
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Gemini generateContent with a system prompt, user prompt, and canonical JSON.
 */
async function callGemini({ systemPrompt, userPrompt, canonicalJson }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent`;

  const body = {
    system_instruction: {
      role: 'system',
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: userPrompt },
          {
            text: canonicalJson,
          },
        ],
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-goog-api-key': GEMINI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const candidates = json.candidates || [];
  const parts = candidates[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || '').join('').trim();

  return text;
}

/**
 * Extract JSON from a raw LLM response. Handles optional code fences.
 */
function extractJsonFromText(text) {
  if (!text) return null;

  // Try fenced JSON
  const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Try any {...} block
  const braceMatch = text.match(/{[\s\S]*}/);
  if (braceMatch) {
    return braceMatch[0].trim();
  }

  return null;
}

/**
 * Generate a deterministic slug from a JD file name.
 * Example: "Proactive Global - Software Developer II.md" -> "proactive-global-software-developer-ii"
 */
function slugFromFileName(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizeSlug(raw, fallback) {
  const cleaned = (raw || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const tokens = cleaned.split('-').filter(Boolean);
  const filtered = tokens.filter((t) => t !== 'generated' && t !== 'ats');
  const finalTokens = filtered.length ? filtered : tokens;
  const candidate = finalTokens.join('-');

  if (candidate) return candidate;
  if (fallback) return sanitizeSlug(fallback);
  return 'profile-overlay';
}

function sanitizeLabel(text) {
  if (!text) return '';
  return text.replace(/\(?\bATS\b\)?/gi, '').replace(/\s{2,}/g, ' ').trim();
}

function validateProfile(profile) {
  const errors = [];

  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    errors.push('Profile must be an object.');
    return errors;
  }

  const stringFields = ['id', 'label', 'headline', 'aboutKey', 'kind'];
  stringFields.forEach((field) => {
    if (!profile[field] || typeof profile[field] !== 'string') {
      errors.push(`"${field}" must be a non-empty string.`);
    }
  });

  if (profile.published !== false) {
    errors.push('"published" must be false for generated profiles.');
  }

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (profile.id && !slugPattern.test(profile.id)) {
    errors.push(`"id" must be slug-like (lowercase, hyphen separated). Got "${profile.id}".`);
  }

  const arrayFields = ['skillsPrimary', 'skillsSecondary'];
  arrayFields.forEach((field) => {
    if (!Array.isArray(profile[field])) {
      errors.push(`"${field}" must be an array (can be empty).`);
    }
  });

  if (profile.experienceOrder && !Array.isArray(profile.experienceOrder)) {
    errors.push('"experienceOrder" must be an array when provided.');
  }

  if (profile.experienceOverrides && typeof profile.experienceOverrides !== 'object') {
    errors.push('"experienceOverrides" must be an object when provided.');
  }

  return errors;
}

/**
 * Main per-file generation pipeline.
 */
async function generateTailoredProfileForFile({
  jdPath,
  systemPrompt,
  canonicalData,
}) {
  const jdText = fs.readFileSync(jdPath, 'utf-8');
  const slugBase = slugFromFileName(jdPath);

  const userPrompt = [
    `Job description file: ${path.basename(jdPath)}`,
    '',
    'Job Description:',
    jdText,
    '',
    'Using the canonical resume data provided, generate a single profile overlay JSON for Zeke Naulty that is tailored specifically to this job.',
    'Do not invent new experience. Only rephrase and reorder existing facts.',
    `Use "${slugBase}" as the base for id/label naming where appropriate.`,
    '',
    'Remember: output only raw JSON. No Markdown, no code fences.',
  ].join('\n');

  const canonicalJson = JSON.stringify(canonicalData, null, 2);

  const rawResponse = await callGemini({
    systemPrompt,
    userPrompt,
    canonicalJson,
  });

  const jsonText = extractJsonFromText(rawResponse);

  if (!jsonText) {
    throw new Error(`Failed to extract JSON from Gemini response for ${jdPath}`);
  }

  let profile;
  try {
    profile = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(
      `Invalid JSON from Gemini for ${jdPath}: ${err.message}\nResponse:\n${jsonText}`,
    );
  }

  // Normalize / enforce schema fields
  const finalSlug = sanitizeSlug(profile.id, slugBase);

  profile.id = finalSlug;
  profile.published = false;
  profile.kind = profile.kind || 'employer-facing';
  profile.label = sanitizeLabel(profile.label || profile.headline || 'Tailored Profile');
  profile.headline = sanitizeLabel(profile.headline || profile.label || 'Tailored Profile');
  profile.skillsPrimary = Array.isArray(profile.skillsPrimary) ? profile.skillsPrimary : [];
  profile.skillsSecondary = Array.isArray(profile.skillsSecondary) ? profile.skillsSecondary : [];

  const validationErrors = validateProfile(profile);
  if (validationErrors.length) {
    throw new Error(`Validation failed: ${validationErrors.join(' ')}`);
  }

  const outputFileName = `${finalSlug}.json`;
  const outputPath = path.join(OUTPUT_DIR, outputFileName);

  return { profile, outputPath };
}

async function generateWithRetries(args) {
  let attempt = 1;
  while (attempt <= MAX_ATTEMPTS) {
    try {
      const result = await generateTailoredProfileForFile(args);
      return result;
    } catch (err) {
      const message = err?.message || err;
      if (attempt >= MAX_ATTEMPTS) {
        throw new Error(`Failed after ${MAX_ATTEMPTS} attempts: ${message}`);
      }
      console.warn(
        `Attempt ${attempt} failed for ${path.basename(args.jdPath)}: ${message}. Retrying...`,
      );
      attempt += 1;
      await delay(RETRY_DELAY_MS);
    }
  }
}

/**
 * Entry point:
 *  - Build canonical resume data (using existing script).
 *  - Load system prompt.
 *  - Iterate over JD files and generate overlays.
 */
async function main() {
  if (!fs.existsSync(PRIVATE_JD_PATH)) {
    console.log(
      `No private job descriptions directory found at ${PRIVATE_JD_PATH}. Nothing to do.`,
    );
    return;
  }

  const resolvedExplicit = explicitFiles.map((f) =>
    path.isAbsolute(f) ? f : path.join(PRIVATE_JD_PATH, f),
  );

  const discovered = fs
    .readdirSync(PRIVATE_JD_PATH)
    .filter((f) => f.endsWith('.md') || f.endsWith('.txt'))
    .map((f) => path.join(PRIVATE_JD_PATH, f));

  const jdFiles = resolvedExplicit.length
    ? resolvedExplicit.filter((p) => fs.existsSync(p))
    : discovered;

  if (jdFiles.length === 0) {
    console.log('No job description files found. Nothing to do.');
    return;
  }

  const systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf-8');

  // Reuse your existing canonical data builder so the ATS generator always sees fresh data.
  const canonicalPath = buildResumeChatData();
  const canonicalData = JSON.parse(fs.readFileSync(canonicalPath, 'utf-8'));

  for (const jdPath of jdFiles) {
    const expectedSlug = sanitizeSlug(slugFromFileName(jdPath));
    const expectedOutput = path.join(OUTPUT_DIR, `${expectedSlug}.json`);

    if (runMode === 'missing' && fs.existsSync(expectedOutput)) {
      console.log(`Skipping ${path.basename(jdPath)} (missing-only mode; output exists).`);
      continue;
    }

    try {
      const { profile, outputPath } = await generateWithRetries({
        jdPath,
        systemPrompt,
        canonicalData,
      });
      fs.writeFileSync(outputPath, JSON.stringify(profile, null, 2), 'utf-8');
      console.log(`Generated tailored profile: ${outputPath}`);
    } catch (err) {
      console.error(
        `Error generating profile for ${jdPath}: ${err.stack || err.message}`,
      );
    }
  }

  console.log('Tailored profile generation complete.');
}

// Node 18+ supports top-level await, but we keep it explicit here.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
