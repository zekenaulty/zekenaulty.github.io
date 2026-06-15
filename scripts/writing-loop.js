import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SEED_PATH = path.join(ROOT_DIR, 'src', 'data', 'writing', 'writingSeed.json');
const PRIVATE_ROOT = path.join(ROOT_DIR, 'private', 'writing');
const RUNS_ROOT = path.join(PRIVATE_ROOT, 'runs');
const STATE_PATH = path.join(PRIVATE_ROOT, 'state.json');
const LATEST_RUN_PATH = path.join(PRIVATE_ROOT, 'latest-run.json');
const ABOUT_ZEKE_PATH = path.join(ROOT_DIR, 'src', 'llm', 'system', 'aboutZeke.json');

dotenv.config({ path: path.join(ROOT_DIR, '.env.local') });
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

function loadSeed() {
  return readJson(SEED_PATH, {});
}

function parseArgs(argv) {
  const args = { _: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith('--')) {
      args._.push(arg);
      continue;
    }

    const raw = arg.slice(2);
    const equalsIndex = raw.indexOf('=');

    if (equalsIndex !== -1) {
      args[raw.slice(0, equalsIndex)] = raw.slice(equalsIndex + 1);
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[raw] = next;
      i += 1;
    } else {
      args[raw] = true;
    }
  }

  return args;
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function dateKeyFromArgs(args) {
  return typeof args.date === 'string' && args.date.trim() ? args.date.trim() : todayKey();
}

function slugify(value, fallback = 'item') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}

function relativeToRoot(filePath) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
}

function decodeXml(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function stripHtml(value) {
  return decodeXml(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureState() {
  const seed = loadSeed();
  const now = new Date().toISOString();
  const existing = readJson(STATE_PATH, null);

  const baseState = {
    version: seed.version ?? 1,
    createdAt: now,
    updatedAt: now,
    lanes: seed.lanes ?? [],
    styleRules: seed.styleRules ?? [],
    styleExamples: seed.styleExamples ?? [],
    pinnedTopics: seed.pinnedTopics ?? [],
    dismissedSignalUrls: [],
  };

  const state = existing
    ? {
        ...baseState,
        ...existing,
        lanes: existing.lanes?.length ? existing.lanes : baseState.lanes,
        styleRules: existing.styleRules?.length ? existing.styleRules : baseState.styleRules,
        styleExamples: existing.styleExamples?.length
          ? existing.styleExamples
          : baseState.styleExamples,
        pinnedTopics: existing.pinnedTopics?.length
          ? existing.pinnedTopics
          : baseState.pinnedTopics,
        dismissedSignalUrls: existing.dismissedSignalUrls ?? [],
        updatedAt: now,
      }
    : baseState;

  fs.mkdirSync(RUNS_ROOT, { recursive: true });
  writeJson(STATE_PATH, state);
  return state;
}

function getRunDir(dateKey) {
  return path.join(RUNS_ROOT, dateKey);
}

function readLatestRun() {
  return readJson(LATEST_RUN_PATH, null);
}

function saveLatestRun(run) {
  writeJson(LATEST_RUN_PATH, run);
}

function getLane(seedOrState, laneId) {
  return (seedOrState.lanes ?? []).find((lane) => lane.id === laneId) ?? null;
}

function normalizeSignal(signal) {
  return {
    sourceId: signal.sourceId ?? 'unknown',
    sourceName: signal.sourceName ?? signal.sourceId ?? 'Unknown source',
    lane: signal.lane ?? 'agent-architecture',
    title: stripHtml(signal.title ?? 'Untitled signal'),
    url: signal.url ?? '',
    summary: stripHtml(signal.summary ?? ''),
    publishedAt: signal.publishedAt ?? null,
    author: signal.author ?? null,
    sourceScore: signal.sourceScore ?? null,
    score: Math.round(signal.score ?? 0),
  };
}

function signalKey(signal) {
  return (signal.url || `${signal.sourceId}:${signal.title}`).toLowerCase();
}

function scoreSignal(signal, lane) {
  const title = `${signal.title ?? ''} ${signal.summary ?? ''}`.toLowerCase();
  const terms = [
    ...(lane?.queries ?? []),
    ...(lane?.recurringAngles ?? []),
    lane?.thesis ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 4);

  const uniqueTerms = [...new Set(terms)];
  const termScore = uniqueTerms.reduce(
    (score, term) => score + (title.includes(term) ? 3 : 0),
    0,
  );
  const sourceScore = Number(signal.sourceScore ?? 0);
  return Math.min(100, Math.round(20 + termScore + Math.log10(sourceScore + 10) * 8));
}

async function fetchWithTimeout(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? 15000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'zekenaulty-writing-loop/0.1',
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 240)}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchHnSearch(source) {
  const limit = source.limit ?? 8;
  const days = source.days ?? 21;
  const createdAfter = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
  const url = new URL('https://hn.algolia.com/api/v1/search');
  url.searchParams.set('query', source.query);
  url.searchParams.set('tags', 'story');
  url.searchParams.set('hitsPerPage', String(limit));
  url.searchParams.set('numericFilters', `created_at_i>${createdAfter}`);

  const json = await (await fetchWithTimeout(url.toString())).json();
  return (json.hits ?? []).map((hit) =>
    normalizeSignal({
      sourceId: source.id,
      sourceName: source.name,
      lane: source.lane,
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      summary: `${hit.points ?? 0} points, ${hit.num_comments ?? 0} comments`,
      publishedAt: hit.created_at,
      author: hit.author,
      sourceScore: (hit.points ?? 0) + (hit.num_comments ?? 0),
    }),
  );
}

async function fetchStackExchangeSearch(source) {
  const limit = source.limit ?? 6;
  const url = new URL('https://api.stackexchange.com/2.3/search/advanced');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('sort', 'activity');
  url.searchParams.set('site', source.site ?? 'stackoverflow');
  url.searchParams.set('q', source.query);
  url.searchParams.set('pagesize', String(limit));
  url.searchParams.set('filter', 'default');

  const json = await (await fetchWithTimeout(url.toString())).json();
  return (json.items ?? []).map((item) =>
    normalizeSignal({
      sourceId: source.id,
      sourceName: source.name,
      lane: source.lane,
      title: item.title,
      url: item.link,
      summary: `${item.score ?? 0} score, ${item.answer_count ?? 0} answers`,
      publishedAt: item.last_activity_date
        ? new Date(item.last_activity_date * 1000).toISOString()
        : null,
      author: item.owner?.display_name,
      sourceScore: Math.max(0, item.score ?? 0) + (item.answer_count ?? 0),
    }),
  );
}

function extractXmlTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? decodeXml(match[1]).trim() : '';
}

function extractAtomLink(block) {
  const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (hrefMatch) return decodeXml(hrefMatch[1]).trim();
  return extractXmlTag(block, 'link');
}

function parseFeedItems(text, source) {
  const itemBlocks = text.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  const entryBlocks = text.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  const blocks = itemBlocks.length ? itemBlocks : entryBlocks;

  return blocks.slice(0, source.limit ?? 8).map((block) =>
    normalizeSignal({
      sourceId: source.id,
      sourceName: source.name,
      lane: source.lane,
      title: extractXmlTag(block, 'title'),
      url: extractAtomLink(block),
      summary:
        extractXmlTag(block, 'description') ||
        extractXmlTag(block, 'summary') ||
        extractXmlTag(block, 'content'),
      publishedAt:
        extractXmlTag(block, 'pubDate') ||
        extractXmlTag(block, 'published') ||
        extractXmlTag(block, 'updated') ||
        null,
      sourceScore: 1,
    }),
  );
}

async function fetchFeed(source) {
  const text = await (await fetchWithTimeout(source.url)).text();
  return parseFeedItems(text, source);
}

async function fetchSignals({ offline = false, lane = null, limit = null } = {}) {
  const seed = loadSeed();
  const state = ensureState();
  const maxSignals = toInt(limit, seed.dailyDefaults?.signalLimit ?? 30);

  if (offline) {
    const sample = (seed.sampleSignals ?? [])
      .filter((signal) => !lane || signal.lane === lane)
      .map(normalizeSignal);
    return {
      signals: sample.slice(0, maxSignals),
      sourceResults: [{ sourceId: 'sample', ok: true, count: sample.length }],
      state,
    };
  }

  const enabledSources = (seed.signalSources ?? [])
    .filter((source) => source.enabled !== false)
    .filter((source) => !lane || source.lane === lane);

  const sourceResults = [];
  const allSignals = [];

  for (const source of enabledSources) {
    try {
      let signals = [];
      if (source.type === 'hn-search') {
        signals = await fetchHnSearch(source);
      } else if (source.type === 'stackexchange-search') {
        signals = await fetchStackExchangeSearch(source);
      } else if (source.type === 'rss' || source.type === 'atom') {
        signals = await fetchFeed(source);
      } else {
        throw new Error(`Unsupported signal source type: ${source.type}`);
      }

      for (const signal of signals) {
        const laneInfo = getLane(state, signal.lane);
        allSignals.push({
          ...signal,
          score: scoreSignal(signal, laneInfo),
        });
      }
      sourceResults.push({ sourceId: source.id, ok: true, count: signals.length });
    } catch (err) {
      sourceResults.push({
        sourceId: source.id,
        ok: false,
        error: err?.message || String(err),
      });
    }
  }

  const dismissed = new Set(state.dismissedSignalUrls ?? []);
  const deduped = [];
  const seen = new Set();

  for (const signal of allSignals) {
    const key = signalKey(signal);
    if (seen.has(key) || dismissed.has(signal.url)) continue;
    seen.add(key);
    deduped.push(signal);
  }

  deduped.sort((a, b) => b.score - a.score || String(b.publishedAt).localeCompare(String(a.publishedAt)));

  return {
    signals: deduped.slice(0, maxSignals),
    sourceResults,
    state,
  };
}

function formatSignal(signal, index) {
  const score = String(signal.score).padStart(2, ' ');
  const date = signal.publishedAt ? String(signal.publishedAt).slice(0, 10) : 'undated';
  return `${index + 1}. [${score}] ${signal.title} (${signal.sourceName}, ${date})\n   ${signal.url}`;
}

function buildBrief({ dateKey, signals, sourceResults, state }) {
  const activeTopics = (state.pinnedTopics ?? [])
    .filter((topic) => topic.status !== 'archived')
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  const lines = [
    `# Writing Brief - ${dateKey}`,
    '',
    '## Source Health',
    ...sourceResults.map((result) =>
      result.ok
        ? `- ${result.sourceId}: ${result.count} items`
        : `- ${result.sourceId}: ERROR - ${result.error}`,
    ),
    '',
    '## Top Signals',
    ...(signals.length
      ? signals.map(formatSignal)
      : ['No signals found. Use `--offline` to exercise the loop with sample signals.']),
    '',
    '## Pinned Topics',
    ...(activeTopics.length
      ? activeTopics.map((topic) => `- ${topic.title} (${topic.lane}, priority ${topic.priority ?? 0})`)
      : ['No active pinned topics.']),
    '',
    '## Candidate Angles',
  ];

  const topByLane = new Map();
  for (const signal of signals) {
    if (!topByLane.has(signal.lane)) topByLane.set(signal.lane, signal);
  }

  for (const topic of activeTopics.slice(0, 8)) {
    const signal = topByLane.get(topic.lane);
    lines.push(
      `- ${topic.title}: ${topic.thesis}${signal ? ` Tie it to "${signal.title}".` : ''}`,
    );
  }

  if (!activeTopics.length) {
    for (const signal of signals.slice(0, 8)) {
      const lane = getLane(state, signal.lane);
      lines.push(`- ${lane?.label ?? signal.lane}: use "${signal.title}" to test the lane thesis.`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function buildWriterSystemPrompt(state) {
  const about = readJson(ABOUT_ZEKE_PATH, { text: [] });
  const aboutText = (about.text ?? [])
    .filter(Boolean)
    .slice(0, 12)
    .join('\n');

  return [
    'You are a private drafting assistant for Zeke Naulty.',
    'Write in a direct, analytical, systems-oriented voice.',
    'The goal is to draft legitimate work-related essays that show judgment, taste, and practical engineering experience.',
    'Do not write SEO slop. Do not mention reputation management, search suppression, or unrelated personal news.',
    'Do not invent experience, credentials, employers, or claims.',
    'Use concrete systems language: boundaries, contracts, state, failure modes, feedback loops, tests, operational risk, and human responsibility.',
    '',
    'About Zeke:',
    aboutText,
    '',
    'Style rules:',
    ...(state.styleRules ?? []).map((rule) => `- ${rule}`),
  ].join('\n');
}

function buildFewShotSection(state) {
  return (state.styleExamples ?? [])
    .map(
      (example) => [
        `Example: ${example.title}`,
        `Why it works: ${example.whyItWorks}`,
        `Text: ${example.text}`,
      ].join('\n'),
    )
    .join('\n\n');
}

function selectDraftInputs({ state, signals, lane, index }) {
  const activeTopics = (state.pinnedTopics ?? [])
    .filter((topic) => topic.status !== 'archived')
    .filter((topic) => !lane || topic.lane === lane)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  const topic = activeTopics[index % Math.max(1, activeTopics.length)] ?? null;
  const targetLane = lane ?? topic?.lane ?? signals[index]?.lane ?? 'agent-architecture';
  const laneInfo = getLane(state, targetLane) ?? { id: targetLane, label: targetLane };
  const laneSignals = signals.filter((signal) => signal.lane === targetLane).slice(0, 5);
  const selectedSignals = laneSignals.length ? laneSignals : signals.slice(0, 5);

  return { topic, laneInfo, signals: selectedSignals };
}

function frontMatterValue(value) {
  return String(value ?? '').replace(/"/g, '\\"');
}

function buildDraftPrompt({ state, topic, laneInfo, signals }) {
  const fewShot = buildFewShotSection(state);
  const signalLines = signals.length
    ? signals
        .map(
          (signal, index) =>
            `${index + 1}. ${signal.title}\n   URL: ${signal.url}\n   Summary: ${signal.summary}`,
        )
        .join('\n')
    : 'No external signals selected. Draft from the pinned topic and lane thesis.';

  return [
    buildWriterSystemPrompt(state),
    '',
    'Few-shot voice examples:',
    fewShot,
    '',
    'Article lane:',
    `${laneInfo.label}: ${laneInfo.thesis ?? ''}`,
    '',
    'Pinned topic:',
    topic
      ? [
          `Title: ${topic.title}`,
          `Thesis: ${topic.thesis}`,
          `Open questions: ${(topic.openQuestions ?? []).join('; ')}`,
          `Recurring angles: ${(topic.recurringAngles ?? []).join('; ')}`,
        ].join('\n')
      : 'No pinned topic selected.',
    '',
    'Signals to consider:',
    signalLines,
    '',
    'Write one article draft in Markdown with YAML front matter.',
    'Front matter fields: title, slug, lane, status, summary, sourceUrls.',
    'Status must be "draft".',
    'Target length: 900-1400 words.',
    'Structure: strong thesis, concrete example, failure mode, practical boundary, closing claim.',
    'Use links only for the provided signal URLs. Do not pretend to have read sources beyond the signal summaries.',
  ].join('\n');
}

function buildDraftStub({ title, slug, laneInfo, topic, signals, promptPath }) {
  const sourceUrls = signals.map((signal) => `  - "${signal.url}"`).join('\n') || '  []';
  const signalBullets = signals.length
    ? signals.map((signal) => `- ${signal.title}: ${signal.url}`).join('\n')
    : '- No signals selected.';

  return [
    '---',
    `title: "${frontMatterValue(title)}"`,
    `slug: "${slug}"`,
    `lane: "${laneInfo.id}"`,
    'status: "draft"',
    `summary: "${frontMatterValue(topic?.thesis ?? laneInfo.thesis ?? '')}"`,
    'sourceUrls:',
    sourceUrls,
    '---',
    '',
    `# ${title}`,
    '',
    '> Draft scaffold only. Run with `--generate` and `GEMINI_API_KEY` to ask the model for prose.',
    `> Prompt: ${relativeToRoot(promptPath)}`,
    '',
    '## Working Thesis',
    '',
    topic?.thesis ?? laneInfo.thesis ?? 'Define the claim before drafting.',
    '',
    '## Signals',
    '',
    signalBullets,
    '',
    '## Outline',
    '',
    '1. State the practical claim in plain language.',
    '2. Ground it in a messy system or workflow.',
    '3. Explain the failure mode that hype usually skips.',
    '4. Name the boundary, contract, test, or human judgment that makes the system usable.',
    '5. Close with the consequence for builders.',
    '',
  ].join('\n');
}

async function callGeminiDraft(prompt) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for --generate.');
  }

  const model = (process.env.GEMINI_MODEL || 'models/gemini-3-flash-preview').trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`;
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    timeoutMs: 60000,
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const json = await response.json();
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((part) => part.text ?? '').join('').trim();
  if (!text) throw new Error('Gemini returned no draft text.');
  return text;
}

async function commandInit() {
  const state = ensureState();
  console.log(`Initialized writing state at ${relativeToRoot(STATE_PATH)}`);
  console.log(`Active lanes: ${(state.lanes ?? []).map((lane) => lane.id).join(', ')}`);
}

async function commandTopics(args) {
  const state = ensureState();
  const lane = args.lane ?? null;
  const topics = (state.pinnedTopics ?? [])
    .filter((topic) => !lane || topic.lane === lane)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const topic of topics) {
    console.log(`${topic.id} [${topic.lane}] priority=${topic.priority ?? 0} status=${topic.status}`);
    console.log(`  ${topic.title}`);
    console.log(`  ${topic.thesis}`);
  }
}

async function commandPin(args) {
  const state = ensureState();
  const title = String(args.title ?? '').trim();
  const lane = String(args.lane ?? '').trim();

  if (!title || !lane) {
    throw new Error('pin requires --title and --lane.');
  }

  const id = String(args.id ?? slugify(title)).trim();
  const existingIndex = (state.pinnedTopics ?? []).findIndex((topic) => topic.id === id);
  const topic = {
    id,
    lane,
    title,
    thesis: String(args.thesis ?? '').trim() || title,
    openQuestions: args.question ? [String(args.question)] : [],
    recurringAngles: args.angle ? [String(args.angle)] : [],
    sourceUrls: args.url ? [String(args.url)] : [],
    priority: toInt(args.priority, 50),
    status: String(args.status ?? 'active'),
    lastTouchedAt: new Date().toISOString(),
  };

  if (existingIndex === -1) {
    state.pinnedTopics = [...(state.pinnedTopics ?? []), topic];
  } else {
    state.pinnedTopics[existingIndex] = {
      ...state.pinnedTopics[existingIndex],
      ...topic,
      openQuestions: [
        ...(state.pinnedTopics[existingIndex].openQuestions ?? []),
        ...topic.openQuestions,
      ],
      recurringAngles: [
        ...(state.pinnedTopics[existingIndex].recurringAngles ?? []),
        ...topic.recurringAngles,
      ],
      sourceUrls: [...(state.pinnedTopics[existingIndex].sourceUrls ?? []), ...topic.sourceUrls],
    };
  }

  state.updatedAt = new Date().toISOString();
  writeJson(STATE_PATH, state);
  console.log(`Pinned topic ${id} in lane ${lane}.`);
}

async function commandSignals(args) {
  const dateKey = dateKeyFromArgs(args);
  const runDir = getRunDir(dateKey);
  const { signals, sourceResults, state } = await fetchSignals({
    offline: Boolean(args.offline),
    lane: args.lane ?? null,
    limit: args.limit,
  });
  const brief = buildBrief({ dateKey, signals, sourceResults, state });

  const signalsPath = path.join(runDir, 'signals.json');
  const briefPath = path.join(runDir, 'brief.md');
  writeJson(signalsPath, { date: dateKey, sourceResults, signals });
  writeText(briefPath, brief);
  saveLatestRun({ date: dateKey, runDir, signalsPath, briefPath });

  console.log(`Wrote ${signals.length} signals to ${relativeToRoot(signalsPath)}`);
  console.log(`Wrote brief to ${relativeToRoot(briefPath)}`);
  return { dateKey, runDir, signals, state };
}

async function commandDraft(args) {
  const seed = loadSeed();
  const state = ensureState();
  const count = Math.min(
    Math.max(1, toInt(args.count, seed.dailyDefaults?.count ?? 1)),
    seed.dailyDefaults?.maxCount ?? 5,
  );
  const dateKey = dateKeyFromArgs(args);
  const runDir = getRunDir(dateKey);
  const latestRun = readLatestRun();
  const signalsPath =
    args.signals ??
    (latestRun?.date === dateKey ? latestRun.signalsPath : path.join(runDir, 'signals.json'));
  const signalPayload = readJson(signalsPath, null);
  const signals = (signalPayload?.signals?.length ? signalPayload.signals : seed.sampleSignals ?? [])
    .map(normalizeSignal)
    .filter((signal) => !args.lane || signal.lane === args.lane);

  const outputs = [];
  for (let i = 0; i < count; i += 1) {
    const input = selectDraftInputs({
      state,
      signals,
      lane: args.lane ?? null,
      index: i,
    });
    const title =
      input.topic?.title ??
      `${input.laneInfo.label}: ${input.signals[0]?.title ?? 'working draft'}`;
    const slug = slugify(`${dateKey}-${title}`);
    const prompt = buildDraftPrompt({
      state,
      topic: input.topic,
      laneInfo: input.laneInfo,
      signals: input.signals,
    });
    const promptPath = path.join(runDir, 'prompts', `${String(i + 1).padStart(2, '0')}-${slug}.md`);
    const draftPath = path.join(runDir, 'drafts', `${String(i + 1).padStart(2, '0')}-${slug}.md`);
    writeText(promptPath, prompt);

    const draft = args.generate
      ? await callGeminiDraft(prompt)
      : buildDraftStub({
          title,
          slug,
          laneInfo: input.laneInfo,
          topic: input.topic,
          signals: input.signals,
          promptPath,
        });

    writeText(draftPath, draft);
    outputs.push({ promptPath, draftPath });
  }

  for (const output of outputs) {
    console.log(`Wrote prompt to ${relativeToRoot(output.promptPath)}`);
    console.log(`Wrote draft to ${relativeToRoot(output.draftPath)}`);
  }

  return outputs;
}

async function commandRun(args) {
  await commandSignals(args);
  await commandDraft(args);
}

function printHelp() {
  console.log(`Writing loop CLI

Commands:
  init                         Create private/writing state.
  topics [--lane id]           List active pinned topics.
  pin --title T --lane L        Add or update a pinned topic.
  signals [--offline]          Fetch public signals and write a daily brief.
  draft [--count N]            Create draft prompts and local draft scaffolds.
  draft --generate             Generate draft prose with GEMINI_API_KEY.
  run [--count N]              Fetch signals and create drafts.

Useful flags:
  --date YYYY-MM-DD            Use a specific run date.
  --lane lane-id               Limit to one writing lane.
  --limit N                    Cap gathered signals.
  --offline                    Use sample signals instead of network fetches.
`);
}

async function main() {
  const [command = 'help', ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  if (command === 'init') return commandInit(args);
  if (command === 'topics') return commandTopics(args);
  if (command === 'pin') return commandPin(args);
  if (command === 'signals' || command === 'brief') return commandSignals(args);
  if (command === 'draft') return commandDraft(args);
  if (command === 'run') return commandRun(args);
  if (command === 'help' || command === '--help' || command === '-h') return printHelp();

  throw new Error(`Unknown writing command: ${command}`);
}

main().catch((err) => {
  console.error(err?.stack || err?.message || err);
  process.exit(1);
});
