import { buildSystemInstructionPartsAsync } from './system/index.js';

export const buildContentsFromMessages = (messages = []) =>
  (messages || [])
    .filter(
      (msg) =>
        msg &&
        (msg.role === 'user' || msg.role === 'model') &&
        typeof msg.text === 'string' &&
        msg.text.trim()
    )
    .map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

export async function callResumeChat({ client, messages }) {
  if (!client) {
    throw new Error('Gemini client is required to call resume chat.');
  }

  const contents = buildContentsFromMessages(messages);

  if (!contents.length) {
    throw new Error('At least one message is required to build chat contents.');
  }

  const payload = {
    system_instruction: {
      parts: await buildSystemInstructionPartsAsync(),
    },
    contents,
  };

  const response = await client.generateContent(payload);
  const text = client.extractTextFromResponse(response);

  return {
    text: text ?? '',
    response,
  };
}
