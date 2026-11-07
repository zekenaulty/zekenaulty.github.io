// Compile the real component and exercise its hooks/handlers without browser,
// network or extra packages. This is state-flow coverage, not visual/CORS QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import { transformWithEsbuild } from 'vite';
import * as service from '../src/llm/chatService.js';
import * as transport from '../src/llm/publicChatClient.js';

async function harness({ endpoint = 'https://offline-worker.example.invalid/chat', fetchImpl, stored, storageThrows = false } = {}) {
  const slots = [], effects = [], timers = new Map();
  let cursor = 0;
  const storage = new Map(stored ? [['chat-history-v1', JSON.stringify(stored)]] : []);
  const changed = (old, deps) => !old || !deps || deps.some((value, i) => value !== old[i]);
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
    useMemo(fn, deps) {
      const index = cursor++;
      if (changed(slots[index]?.deps, deps)) slots[index] = { deps, value: fn() };
      return slots[index].value;
    },
    useEffect(fn, deps) {
      const index = cursor++;
      if (changed(slots[index]?.deps, deps)) effects.push(() => { slots[index]?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; });
    },
  };
  const jsx = (type, props) => ({ type, props: props || {} });
  const compiled = await transformWithEsbuild(fs.readFileSync(new URL('../src/components/ChatDrawer.jsx', import.meta.url), 'utf8'), 'ChatDrawer.jsx', {
    loader: 'jsx', format: 'cjs', jsx: 'automatic',
    define: { 'import.meta.env.VITE_CHAT_PROXY_URL': JSON.stringify(endpoint), 'import.meta.env.DEV': 'false' },
  });
  const context = {
    module: { exports: {} }, Date, Math, AbortController,
    setTimeout: (fn, ms) => { const id = Symbol(); timers.set(id, { fn, ms }); return id; },
    clearTimeout: (id) => timers.delete(id),
    window: { localStorage: {
      getItem: (key) => { if (storageThrows) throw Error('blocked'); return storage.get(key) ?? null; },
      setItem: (key, value) => { if (storageThrows) throw Error('blocked'); storage.set(key, value); },
    } },
    require: (name) => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === '@mui/material') return new Proxy({}, { get: (_, key) => key });
      if (name.endsWith('chatService.js')) return service;
      if (name.endsWith('publicChatClient.js')) return { ...transport, PublicChatClient: class extends transport.PublicChatClient {
        constructor(options) { super({ ...options, fetchImpl }); }
      }};
      return { __esModule: true, default: name };
    },
  };
  vm.runInNewContext(compiled.code, context);
  let tree;
  const render = (isOpen = true) => {
    cursor = 0;
    tree = context.module.exports.default({ isOpen, onClose: () => {} });
    while (effects.length) effects.shift()();
    return tree;
  };
  const nodes = () => {
    const result = [];
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(visit); return; }
      result.push(node); visit(node.props?.children);
    };
    visit(tree); return result;
  };
  const find = (type) => nodes().find((node) => node.type === type);
  const text = () => {
    const chunks = [];
    const visit = (node) => {
      if (typeof node === 'string' || typeof node === 'number') chunks.push(String(node));
      else if (Array.isArray(node)) node.forEach(visit);
      else if (node?.props) visit(node.props.children);
    };
    visit(tree); return chunks.join(' ');
  };
  render(); render();
  return { render, nodes, find, text, storage, timers,
    input: (value) => { find('TextField').props.onChange({ target: { value } }); render(); },
    submit: () => nodes().find((node) => node.props.component === 'form').props.onSubmit({ preventDefault() {} }),
    unmount: () => slots.forEach((slot) => slot?.cleanup?.()),
  };
}
const success = (extra = {}) => new Response(JSON.stringify({ text: 'Mock answer', incomplete: false, truncated: false, ...extra }));

test('missing or malformed endpoint disables send without network or internal setup details', async () => {
  for (const endpoint of ['', 'https://name:PRIVATE@example.invalid/chat']) {
    let calls = 0;
    const ui = await harness({ endpoint, fetchImpl: async () => { calls++; return success(); } });
    ui.input('A question');
    assert.equal(ui.find('Button').props.disabled, true);
    await ui.submit();
    assert.equal(calls, 0);
    assert.match(ui.text(), /temporarily unavailable/);
    assert.doesNotMatch(ui.text(), /PRIVATE|VITE_|API key/);
    ui.unmount();
  }
});

test('repeated submit and close/reopen while pending make one request and retain partial reply flags', async () => {
  let finish, calls = 0;
  const ui = await harness({ fetchImpl: () => { calls++; return new Promise((resolve) => { finish = resolve; }); } });
  ui.input('A question');
  const pending = ui.submit();
  const duplicate = ui.submit();
  ui.render(false); ui.render(true);
  assert.equal(calls, 1);
  assert.equal(ui.find('TextField').props.disabled, true);
  assert.equal(ui.find('TextField').props.value, 'A question');
  finish(success({ incomplete: true, truncated: true }));
  await Promise.all([pending, duplicate]); ui.render();
  assert.equal(ui.find('TextField').props.value, '');
  assert.match(ui.text(), /partial or shortened/);
  const saved = JSON.parse(ui.storage.get('chat-history-v1'));
  assert.equal(saved.length, 3);
  assert.equal(saved.at(-1).incomplete, true);
  assert.equal(saved.at(-1).truncated, true);
  ui.unmount();
});

test('rate limit preserves editable draft, rolls back failed turn, blocks resend, and never retries itself', async () => {
  let calls = 0;
  const ui = await harness({ fetchImpl: async () => {
    calls++;
    return calls === 1 ? new Response(JSON.stringify({ error: { code: 'rate_limited', message: 'PRIVATE_DETAIL' } }), { status: 429, headers: { 'Retry-After': '60' } }) : success();
  }});
  ui.input('A question'); await ui.submit(); ui.render();
  assert.equal(ui.find('TextField').props.value, 'A question');
  assert.equal(ui.find('TextField').props.disabled, false);
  assert.equal(ui.find('Button').props.disabled, true);
  assert.equal(JSON.parse(ui.storage.get('chat-history-v1')).length, 1);
  assert.doesNotMatch(ui.text(), /PRIVATE_DETAIL/);
  await ui.submit(); assert.equal(calls, 1);
  for (const timer of ui.timers.values()) { assert.ok(timer.ms <= 60000); timer.fn(); }
  ui.render(); assert.equal(calls, 1);
  assert.equal(ui.find('Button').props.disabled, false);
  await ui.submit(); ui.render();
  assert.equal(calls, 2);
  assert.equal(JSON.parse(ui.storage.get('chat-history-v1')).length, 3);
  ui.unmount();
});

test('legacy long history is retained, malformed entries skipped and omitted context disclosed', async () => {
  let body;
  const stored = [...Array.from({ length: 150 }, (_, i) => ({ role: i % 2 ? 'model' : 'user', text: `old ${i}` })), null, { role: 'system', text: 'Bad role' }];
  const ui = await harness({ stored, fetchImpl: async (_url, options) => { body = JSON.parse(options.body); return success(); } });
  assert.match(ui.text(), /old 149/);
  assert.doesNotMatch(ui.text(), /Bad role/);
  ui.input('A follow-up'); await ui.submit(); ui.render();
  assert.equal(body.messages.length, 12);
  assert.ok(body.messages.every((message) => ['user', 'assistant'].includes(message.role)));
  assert.match(ui.text(), /Only recent messages were included/);
  assert.equal(JSON.parse(ui.storage.get('chat-history-v1')).length, 152);
  ui.unmount();
});

test('blocked browser storage supports in-memory replies and oversized drafts never send', async () => {
  let calls = 0;
  const ui = await harness({ storageThrows: true, fetchImpl: async () => { calls++; return success(); } });
  ui.input('x'.repeat(2001)); await ui.submit(); ui.render();
  assert.equal(calls, 0);
  assert.match(ui.text(), /2000 characters/);
  ui.input('A question'); await ui.submit(); ui.render();
  assert.match(ui.text(), /Mock answer/);
  assert.equal(calls, 1);
  ui.unmount();
});

test('unmount aborts without committing an answer and Markdown images are inert', async () => {
  let signal;
  const ui = await harness({ fetchImpl: (_url, options) => {
    signal = options.signal;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(Error('aborted')), { once: true }));
  }});
  const markdown = ui.nodes().find((node) => node.type === 'react-markdown');
  const image = markdown.props.components.img({ src: 'https://tracker.invalid/private', alt: 'Image' });
  assert.equal(image.type, 'span');
  assert.equal(image.props.src, undefined);
  ui.input('A question'); const pending = ui.submit(); ui.unmount(); await pending;
  assert.equal(signal.aborted, true);
  assert.equal(JSON.parse(ui.storage.get('chat-history-v1')).length, 1);
});
