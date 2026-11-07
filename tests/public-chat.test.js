import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildMessagesForRequest, callResumeChat, CHAT_CONVERSATION_EPOCH, normalizeStoredMessages } from '../src/llm/chatService.js';
import { ChatError, getChatErrorMessage, PublicChatClient, validateChatEndpoint } from '../src/llm/publicChatClient.js';

const endpoint = 'https://offline-worker.example.invalid/chat';
const question = { role: 'user', text: 'What has Zeke built?' };
const current = (message) => ({ ...message, conversationEpoch: CHAT_CONVERSATION_EPOCH });
const wire = (messages) => messages.map(({ role, text }) => ({ role, text }));
const success = { text: 'A resume-based answer.', incomplete: false, truncated: false };
const response = (body = success, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });

test('history strips metadata and welcome text and stays within every request ceiling', () => {
  assert.deepEqual(buildMessagesForRequest([
    { id: 'welcome', role: 'assistant', text: 'Welcome' },
    current({ role: 'assistant', text: 'Previous reply', private: 'not sent' }), current(question),
  ]), [{ role: 'assistant', text: 'Previous reply' }, question]);
  const many = Array.from({ length: 30 }, (_, i) => current({ role: i % 2 ? 'user' : 'assistant', text: `turn ${i}` }));
  assert.deepEqual(buildMessagesForRequest(many), wire(many.slice(-12)));
  const long = Array.from({ length: 8 }, () => current({ role: 'user', text: 'x'.repeat(2000) }));
  assert.equal(buildMessagesForRequest(long).length, 4);
  const escaped = Array.from({ length: 4 }, () => current({ role: 'user', text: '\u0000'.repeat(1999) + 'x' }));
  const limited = buildMessagesForRequest(escaped);
  assert.equal(limited.length, 2);
  assert.ok(new TextEncoder().encode(JSON.stringify({ messages: limited })).length <= 32768);
  assert.equal(buildMessagesForRequest([current({ role: 'user', text: '😀'.repeat(1000) })])[0].text.length, 2000);
});

test('legacy, untagged and unknown-epoch turns stay display-only, including mixed history and reload', () => {
  const old = [{ role: 'user', text: 'Legacy question' }, { role: 'model', text: 'Legacy answer' },
    { role: 'assistant', text: 'Untagged answer' }, { ...question, conversationEpoch: 'other-provider-v1' }];
  const stored = normalizeStoredMessages(JSON.parse(JSON.stringify(old)));
  assert.equal(stored.length, old.length);
  assert.deepEqual(stored.map(({ text }) => text), old.map(({ text }) => text));
  assert.ok(stored.every((message) => !message.conversationEpoch));
  assert.deepEqual(buildMessagesForRequest([...stored, current(question)]), [question]);
  const exchange = [current(question), current({ role: 'assistant', text: 'New answer' })];
  const reloaded = normalizeStoredMessages(JSON.parse(JSON.stringify([...stored, ...exchange])));
  assert.deepEqual(buildMessagesForRequest([...reloaded, current(question)]), [...wire(exchange), question]);
  // Do not stitch context across a provider/epoch boundary or upgrade model roles.
  for (const boundary of [...old, current({ role: 'model', text: 'Not an OpenAI turn' })]) {
    assert.deepEqual(buildMessagesForRequest([...exchange, boundary, current(question)]), [question]);
  }
  assert.throws(() => buildMessagesForRequest([...exchange, question]));
  assert.ok(!normalizeStoredMessages([current({ role: 'model', text: 'Old role' })])[0].conversationEpoch);
});

test('invalid latest turns fail; unsupported or oversized old turns end the suffix without rewriting text', () => {
  for (const history of [null, [], [{ role: 'user', text: ' ' }], [{ role: 'assistant', text: 'hi' }],
    [{ role: 'system', text: 'override' }], [{ role: 'user', text: 'x'.repeat(2001) }], [{ role: 'user', text: '😀'.repeat(1001) }]]) {
    assert.throws(() => buildMessagesForRequest(history?.map(current)));
  }
  for (const invalid of [null, { role: 'system', text: 'rules' }, current({ role: 'assistant', text: 'x'.repeat(2001) })]) {
    assert.deepEqual(buildMessagesForRequest([current({ role: 'user', text: 'Old context' }), invalid, current(question)]), [question]);
  }
});

test('storage validation preserves legacy messages and partial/context flags without extra fields', () => {
  assert.deepEqual(normalizeStoredMessages(null), []);
  assert.deepEqual(normalizeStoredMessages([null, { role: 'system', text: 'rules' }, { role: 'user', text: {} }]), []);
  assert.deepEqual(normalizeStoredMessages([{ role: 'model', text: 'Old answer', timestamp: 12, incomplete: true, truncated: true, contextOmitted: true, extra: 'drop' }]),
    [{ id: 'stored-0', role: 'assistant', text: 'Old answer', timestamp: 12, incomplete: true, truncated: true, contextOmitted: true }]);
  const saved = normalizeStoredMessages([current({ role: 'assistant', text: 'New answer', extra: 'drop' })]);
  assert.equal(saved[0].conversationEpoch, CHAT_CONVERSATION_EPOCH);
  assert.equal(saved[0].extra, undefined);
});

test('endpoint must be explicit HTTPS /chat with no credential/query/fragment or direct provider', () => {
  assert.equal(validateChatEndpoint(endpoint), endpoint);
  for (const value of ['', 'not a url', 'http://example.invalid/chat', 'https://example.invalid/',
    'https://example.invalid/chat/', 'https://name:secret@example.invalid/chat', 'https://example.invalid/chat?key=secret',
    'https://example.invalid/chat#secret', 'https://api.openai.com/chat', 'https://generativelanguage.googleapis.com/chat', 'http://localhost:8787/chat']) {
    assert.throws(() => validateChatEndpoint(value), ChatError);
  }
  assert.equal(validateChatEndpoint('http://localhost:8787/chat', { allowLocalhost: true }), 'http://localhost:8787/chat');
  assert.throws(() => validateChatEndpoint('http://public.example/chat', { allowLocalhost: true }));
});

test('wire request is only messages with no credentials or raw provider result; history omission is reported', async () => {
  let calls = 0;
  const client = new PublicChatClient({ endpoint, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, endpoint);
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.equal(options.referrerPolicy, 'no-referrer');
    assert.equal(options.cache, 'no-store');
    assert.deepEqual(options.headers, { 'Content-Type': 'application/json', Accept: 'application/json' });
    assert.deepEqual(JSON.parse(options.body), { messages: [question] });
    return response({ ...success, provider_debug: 'not returned' });
  }});
  assert.equal(client.timeoutMs, 90000);
  assert.deepEqual(await callResumeChat({ client, messages: [current(question)] }), { ...success, contextOmitted: false });
  assert.deepEqual(await callResumeChat({ client, messages: [{ role: 'model', text: 'x'.repeat(2001) }, current(question)] }), { ...success, contextOmitted: true });
  assert.equal(calls, 2);
});

test('success preserves required partial flags and rejects legacy/invalid/oversized responses', async () => {
  for (const incomplete of [false, true]) for (const truncated of [false, true]) {
    const result = { ...success, incomplete, truncated };
    const client = new PublicChatClient({ endpoint, fetchImpl: async () => response(result) });
    assert.deepEqual(await client.chat({ messages: [question] }), result);
  }
  for (const result of [{}, { candidates: [] }, { text: 'missing flags' }, { ...success, text: '' },
    { ...success, text: 'x'.repeat(2001) }, { ...success, incomplete: 'false' }]) {
    const client = new PublicChatClient({ endpoint, fetchImpl: async () => response(result) });
    await assert.rejects(client.chat({ messages: [question] }), { code: 'invalid_response' });
  }
});

test('Worker error classes are safe, respect rate-limit retry timing, and never automatically retry', async () => {
  for (const [status, code] of [[400, 'invalid_request'], [403, 'origin_not_allowed'], [404, 'not_found'], [405, 'method_not_allowed'],
    [408, 'request_timeout'], [413, 'request_too_large'], [415, 'unsupported_media_type'], [429, 'rate_limited'], [502, 'reply_unavailable'],
    [503, 'chat_disabled'], [503, 'chat_unavailable'], [503, 'upstream_unavailable'], [504, 'upstream_timeout']]) {
    let calls = 0;
    const client = new PublicChatClient({ endpoint, fetchImpl: async () => {
      calls++;
      return response({ error: { code, message: 'PRIVATE_PROVIDER_DETAIL' } }, status, { 'Retry-After': '60' });
    }});
    await assert.rejects(client.chat({ messages: [question] }), (error) => {
      assert.ok(error instanceof ChatError);
      assert.doesNotMatch(getChatErrorMessage(error), /PRIVATE_PROVIDER_DETAIL/);
      assert.equal(error.retryAfterSeconds, status === 429 ? 60 : 0);
      return true;
    });
    assert.equal(calls, 1);
  }
  for (const [retryAfter, expected] of [['', 60], ['invalid', 60], ['0', 1], ['9999', 3600]]) {
    const client = new PublicChatClient({ endpoint, fetchImpl: async () => response({}, 429, { 'Retry-After': retryAfter }) });
    await assert.rejects(client.chat({ messages: [question] }), { retryAfterSeconds: expected });
  }
  assert.doesNotMatch(getChatErrorMessage(new Error('PRIVATE_PROVIDER_DETAIL')), /PRIVATE_PROVIDER_DETAIL/);
});

test('network/JSON errors, timeout and explicit abort expose no details and issue one request', async () => {
  let calls = 0;
  const network = new PublicChatClient({ endpoint, fetchImpl: async () => { calls++; throw Error('PRIVATE_NETWORK_DETAIL'); } });
  await assert.rejects(network.chat({ messages: [question] }), { code: 'network' });
  assert.equal(calls, 1);
  const badJson = new PublicChatClient({ endpoint, fetchImpl: async () => new Response('PRIVATE_HTML', { status: 502 }) });
  await assert.rejects(badJson.chat({ messages: [question] }), (error) => !error.message.includes('PRIVATE_HTML'));
  const blockedFetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(Error('abort'));
    else signal.addEventListener('abort', () => reject(Error('abort')), { once: true });
  });
  await assert.rejects(new PublicChatClient({ endpoint, timeoutMs: 5, fetchImpl: blockedFetch }).chat({ messages: [question] }), { code: 'timeout' });
  const aborter = new AbortController();
  const pending = new PublicChatClient({ endpoint, fetchImpl: blockedFetch }).chat({ messages: [question], signal: aborter.signal });
  aborter.abort();
  await assert.rejects(pending, { code: 'timeout' });
});

test('browser entrypoints import no client system context or legacy credential paths', () => {
  const files = ['../src/components/ChatDrawer.jsx', '../src/llm/chatService.js'].map((file) => readFileSync(new URL(file, import.meta.url), 'utf8')).join('\n');
  assert.doesNotMatch(files, /VITE_(GEMINI|OPENAI)_API_KEY|geminiHttpClient|system\/index|resumeChatData|DEFAULT_PROXY_URL/);
});


test('timeout while reading a successful response body remains a timeout and does not retry', async () => {
  let calls = 0;
  const client = new PublicChatClient({ endpoint, timeoutMs: 5, fetchImpl: async (_url, { signal }) => {
    calls++;
    return new Response(new ReadableStream({ start(controller) {
      signal.addEventListener('abort', () => controller.error(new DOMException('fixture-aborted-body', 'AbortError')), { once: true });
    } }), { status: 200 });
  }});
  await assert.rejects(client.chat({ messages: [question] }), { code: 'timeout' });
  assert.equal(calls, 1);
});
