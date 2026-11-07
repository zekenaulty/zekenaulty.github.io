import { MAX_MESSAGE_CHARS } from './chatService.js';

const UNAVAILABLE = 'Chat is temporarily unavailable. You can still browse and download Zeke’s resume.';

export class ChatError extends Error {
  constructor(code, message, retryAfterSeconds = 0) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function getChatErrorMessage(error) {
  return error instanceof ChatError ? error.message : UNAVAILABLE;
}

export function validateChatEndpoint(value, { allowLocalhost = false } = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new ChatError('not_configured', UNAVAILABLE);
  let url;
  try { url = new URL(value.trim()); } catch { throw new ChatError('not_configured', UNAVAILABLE); }
  const localHttp = allowLocalhost && url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((!localHttp && url.protocol !== 'https:') || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/chat' || ['api.openai.com', 'generativelanguage.googleapis.com'].includes(url.hostname)) {
    throw new ChatError('not_configured', UNAVAILABLE);
  }
  return url.href;
}

function errorForStatus(status, body, retryAfter) {
  if (status === 429) {
    const seconds = /^\d{1,4}$/.test(retryAfter || '') ? Math.min(3600, Math.max(1, Number(retryAfter))) : 60;
    return new ChatError('rate_limited', 'Chat is busy. Please wait a moment before sending again.', seconds);
  }
  if (status === 503 && body?.error?.code === 'chat_disabled') return new ChatError('chat_disabled', UNAVAILABLE);
  if (status === 408 || status === 504) return new ChatError('timeout', 'The reply took too long. You can try sending your question again.');
  if ([400, 413, 415].includes(status)) return new ChatError('invalid_request', 'That question could not be sent. Try a shorter question.');
  return new ChatError('unavailable', UNAVAILABLE);
}

// The browser speaks only the public Worker contract. No provider SDK, keys,
// model options, instructions, raw provider responses or automatic retries.
export class PublicChatClient {
  constructor({ endpoint, allowLocalhost = false, fetchImpl = globalThis.fetch, timeoutMs = 90000 }) {
    this.endpoint = validateChatEndpoint(endpoint, { allowLocalhost });
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async chat({ messages, signal }) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(abort, this.timeoutMs);
    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer',
        redirect: 'error', cache: 'no-store', signal: controller.signal,
        body: JSON.stringify({ messages }),
      });
      let data;
      try { data = await response.json(); } catch { /* Never expose raw bodies. */ }
      if (controller.signal.aborted) throw new ChatError('timeout', 'The reply took too long. You can try sending your question again.');
      if (!response.ok) throw errorForStatus(response.status, data, response.headers.get('Retry-After'));
      if (!data || typeof data.text !== 'string' || !data.text.trim() || data.text.length > MAX_MESSAGE_CHARS ||
          typeof data.incomplete !== 'boolean' || typeof data.truncated !== 'boolean') {
        throw new ChatError('invalid_response', UNAVAILABLE);
      }
      return { text: data.text, incomplete: data.incomplete, truncated: data.truncated };
    } catch (error) {
      if (error instanceof ChatError) throw error;
      if (controller.signal.aborted) throw new ChatError('timeout', 'The reply took too long. You can try sending your question again.');
      throw new ChatError('network', 'Chat could not connect. Check your connection or try again later.');
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
    }
  }
}
