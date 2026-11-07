// Offline integration only. Pass a local checkout's Worker entrypoint, not a URL.
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PublicChatClient } from '../src/llm/publicChatClient.js';
import { callResumeChat, CHAT_CONVERSATION_EPOCH } from '../src/llm/chatService.js';

const filename = process.argv[2];
if (!filename || /^[a-z]+:\/\//i.test(filename)) {
  console.error('Usage: node scripts/check-public-chat-worker.js /path/to/worker/src/index.js');
  process.exit(2);
}
const current = (message) => ({ ...message, conversationEpoch: CHAT_CONVERSATION_EPOCH });
const originalFetch = globalThis.fetch;
let providerCalls = 0;
let providerText = 'A mocked resume answer.';
let providerStatus = 'completed';
const env = {
  PUBLIC_CHAT_ENABLED: 'true', OPENAI_API_KEY: { get: async () => 'fixture-only-not-a-key' },
  PUBLIC_RESUME_CONTEXT: 'Example public software engineering experience.',
  CHAT_CLIENT_LIMITER: { limit: async () => ({ success: true }) },
  CHAT_AGGREGATE_LIMITER: { limit: async () => ({ success: true }) },
};
globalThis.fetch = async (url, options) => {
  providerCalls++;
  assert.equal(url, 'https://api.openai.com/v1/responses');
  assert.equal(options.headers.Authorization, 'Bearer fixture-only-not-a-key');
  assert.ok(!options.body.includes('fixture-only-not-a-key'));
  const payload = JSON.parse(options.body);
  assert.equal(payload.store, false);
  assert.equal(payload.input.at(-1).role, 'user');
  assert.ok(!options.body.includes('Legacy reply'));
  assert.ok(!options.body.includes('conversationEpoch'));
  return new Response(JSON.stringify({ status: providerStatus, output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: providerText }] }] }));
};
try {
  const { default: worker } = await import(pathToFileURL(path.resolve(filename)).href);
  const clientFor = (settings) => new PublicChatClient({ endpoint: 'https://offline.example.invalid/chat', fetchImpl: (url, options) => worker.fetch(new Request(url, {
    ...options, headers: { ...options.headers, Origin: 'https://zekenaulty.github.io', 'CF-Connecting-IP': '192.0.2.1' },
  }), settings) });
  const client = clientFor(env);
  const messages = [{ role: 'model', text: 'Legacy reply' }, current({ role: 'user', text: 'What experience is listed?' })];
  assert.deepEqual(await callResumeChat({ client, messages }), { text: providerText, incomplete: false, truncated: false, contextOmitted: true });
  providerText = 'x'.repeat(2100); providerStatus = 'incomplete';
  const partial = await callResumeChat({ client, messages });
  assert.equal(partial.text.length, 2000);
  assert.equal(partial.incomplete, true); assert.equal(partial.truncated, true);
  providerText = 'Answer'; providerStatus = 'completed';
  await callResumeChat({ client, messages: Array.from({ length: 4 }, () => current({ role: 'user', text: '\u0000'.repeat(1999) + 'x' })) });
  await callResumeChat({ client, messages: Array.from({ length: 16 }, () => current({ role: 'user', text: '😀'.repeat(1000) })) });
  const callsBeforeErrors = providerCalls;
  for (const [settings, code] of [
    [{ ...env, PUBLIC_CHAT_ENABLED: 'false' }, 'chat_disabled'],
    [{ ...env, PUBLIC_RESUME_CONTEXT: '' }, 'unavailable'],
    [{ ...env, CHAT_CLIENT_LIMITER: { limit: async () => ({ success: false }) } }, 'rate_limited'],
    [{ ...env, CHAT_AGGREGATE_LIMITER: { limit: async () => ({ success: false }) } }, 'rate_limited'],
    [{ ...env, OPENAI_API_KEY: { get: async () => { throw Error('fixture-private-detail'); } } }, 'unavailable'],
  ]) await assert.rejects(callResumeChat({ client: clientFor(settings), messages }), { code });
  assert.equal(providerCalls, callsBeforeErrors);
  const preflight = await worker.fetch(new Request('https://offline.example.invalid/chat', { method: 'OPTIONS', headers: {
    Origin: 'https://zekenaulty.github.io', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type',
  } }), {});
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://zekenaulty.github.io');
  console.log(`PASS: 10 frontend/Worker scenarios; ${providerCalls} mocked provider calls; zero network requests.`);
} finally { globalThis.fetch = originalFetch; }
