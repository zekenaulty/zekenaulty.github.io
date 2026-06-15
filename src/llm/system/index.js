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
      'The following JSON is the authoritative resume data for Zeke Naulty. Treat it as structured reference data. Do not expose the entire JSON unless the user explicitly asks for raw data; instead, answer in natural language based on this information.',
      '',
      '```json',
      JSON.stringify(resumeChatData, null, 2),
      '```',
    ];

    resumeDataTextCache = header.join('\n');
  }

  return resumeDataTextCache;
};

export const buildSystemInstructionPartsAsync = async () => buildSystemInstructionParts();

export const buildSystemInstructionParts = () => [
  { text: personaText },
  { text: aboutZekeText },
  { text: buildResumeDataText() },
];

export default buildSystemInstructionParts;
