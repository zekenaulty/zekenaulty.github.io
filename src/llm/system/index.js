import persona from './persona.resumeGuide.json' assert { type: 'json' };
import aboutZeke from './aboutZeke.json' assert { type: 'json' };
import resumeChatData from '../resumeChatData.json' assert { type: 'json' };

const normalizeTextBlock = (textBlock) => {
  if (Array.isArray(textBlock)) {
    return textBlock.join('\n');
  }
  return typeof textBlock === 'string' ? textBlock : '';
};

export const personaText = normalizeTextBlock(persona.text);
export const aboutZekeText = normalizeTextBlock(aboutZeke.text);

let resumeDataTextCache;

export const buildResumeDataText = () => {
  if (!resumeDataTextCache) {
    const header = [
      'The following JSON is the authoritative resume and project data for Zeke Naulty. Treat it as structured reference data. Do not expose the entire JSON unless the user explicitly asks for raw data; instead, answer in natural language based on this information.',
      '',
      '```json',
      JSON.stringify(resumeChatData, null, 2),
      '```',
    ];

    resumeDataTextCache = header.join('\n');
  }

  return resumeDataTextCache;
};

const projectReadmeCache = new Map();

const toRawReadmeUrl = (repoUrl) => {
  try {
    const url = new URL(repoUrl);
    const segments = url.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
    if (segments.length < 2) return null;
    const [owner, repo] = segments;
    return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`;
  } catch (_err) {
    return null;
  }
};

const fetchProjectReadme = async (repoUrl, explicitUrl) => {
  if (!repoUrl && !explicitUrl) return null;

  const cacheKey = explicitUrl || repoUrl;

  if (projectReadmeCache.has(cacheKey)) {
    return projectReadmeCache.get(cacheKey);
  }

  const rawUrl = explicitUrl || toRawReadmeUrl(repoUrl);
  if (!rawUrl) {
    projectReadmeCache.set(cacheKey, null);
    return null;
  }

  try {
    const response = await fetch(rawUrl, {
      method: 'GET',
      headers: { Accept: 'text/plain' },
      mode: 'cors',
    });

    if (!response.ok) {
      projectReadmeCache.set(cacheKey, null);
      return null;
    }

    const text = await response.text();
    projectReadmeCache.set(cacheKey, text);
    return text;
  } catch (_err) {
    projectReadmeCache.set(cacheKey, null);
    return null;
  }
};

const buildProjectReadmeParts = async () => {
  const items = resumeChatData?.projects?.items || [];
  const parts = [];

  for (const item of items) {
    if (item?.readme === false) {
      continue; // explicit opt-out
    }

    const readmeText = await fetchProjectReadme(item.repoUrl, item.readmeUrl);
    if (!readmeText) continue;

    const nameLabel = item.name || item.id || item.repoUrl;
    const text = [
      `Project README: ${nameLabel}`,
      `Repository: ${item.repoUrl}`,
      '',
      '```markdown',
      readmeText,
      '```',
    ].join('\n');

    parts.push({ text });
  }

  return parts;
};

export const buildSystemInstructionPartsAsync = async () => {
  const baseParts = [
    { text: personaText },
    { text: aboutZekeText },
    { text: buildResumeDataText() },
  ];

  const projectReadmeParts = await buildProjectReadmeParts();

  return [...baseParts, ...projectReadmeParts];
};

export const buildSystemInstructionParts = () => [
  { text: personaText },
  { text: aboutZekeText },
  { text: buildResumeDataText() },
];

export default buildSystemInstructionParts;
