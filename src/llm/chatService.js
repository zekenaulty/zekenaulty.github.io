// Only turns created under this provider contract may become outbound context.
// Legacy/untagged records remain local display history, including after reload.
export const CHAT_CONVERSATION_EPOCH = 'openai-public-chat-v1';
export const isCurrentChatMessage = (message) => message?.conversationEpoch === CHAT_CONVERSATION_EPOCH &&
  ['user', 'assistant'].includes(message.role);

export const MAX_CHAT_MESSAGES = 12;
export const MAX_MESSAGE_CHARS = 2000;
export const MAX_TOTAL_CHARS = 8000;
export const MAX_REQUEST_BYTES = 32 * 1024;

// Preserve the visible transcript, but send only a bounded current-epoch suffix.
// Instructions and public resume facts are owned by the Worker, not the browser.
export function buildMessagesForRequest(messages = []) {
  if (!Array.isArray(messages)) throw new Error('Invalid chat history.');
  const history = messages.filter((message) => message?.id !== 'welcome');
  const latest = history.at(-1);
  if (!isCurrentChatMessage(latest) || latest?.role !== 'user' || typeof latest.text !== 'string' || !latest.text.trim()) {
    throw new Error('Enter a question before sending.');
  }
  if (latest.text.length > MAX_MESSAGE_CHARS) {
    throw new Error(`Please keep your question to ${MAX_MESSAGE_CHARS} characters.`);
  }
  const result = [];
  let total = 0;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const message = history[index];
    const role = message?.role;
    // Untagged/legacy turns are a provider boundary, never implicit consent.
    // Do not skip across a bad/oversized turn and stitch unrelated context.
    if (!isCurrentChatMessage(message) || typeof message.text !== 'string' ||
        !message.text.trim() || message.text.length > MAX_MESSAGE_CHARS ||
        result.length === MAX_CHAT_MESSAGES || total + message.text.length > MAX_TOTAL_CHARS) break;
    const candidate = [{ role, text: message.text }, ...result];
    // JSON escaping can exceed the byte cap even under the character limits.
    if (new TextEncoder().encode(JSON.stringify({ messages: candidate })).byteLength > MAX_REQUEST_BYTES) break;
    result.unshift({ role, text: message.text });
    total += message.text.length;
  }
  return result;
}

export async function callResumeChat({ client, messages, signal }) {
  const recent = buildMessagesForRequest(messages);
  const reply = await client.chat({ messages: recent, signal });
  return { ...reply, contextOmitted: messages.filter((message) => message?.id !== 'welcome').length > recent.length };
}

// Preserve existing Gemini history for display, without upgrading it to outbound context.
export function normalizeStoredMessages(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((message, index) => {
    const role = message?.role === 'model' ? 'assistant' : message?.role;
    if (!['user', 'assistant'].includes(role) || typeof message.text !== 'string' || !message.text.trim()) return [];
    return [{
      id: message.id === 'welcome' ? 'welcome' : `stored-${index}`,
      role, text: message.text,
      ...(isCurrentChatMessage(message) ? { conversationEpoch: CHAT_CONVERSATION_EPOCH } : {}),
      timestamp: Number.isFinite(message.timestamp) ? message.timestamp : 0,
      incomplete: message.incomplete === true,
      truncated: message.truncated === true,
      contextOmitted: message.contextOmitted === true,
    }];
  });
}
