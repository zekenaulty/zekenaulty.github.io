import { ResumeToolError, requireValue } from './resume-selection.js';

export const DEFAULT_MODEL = 'gpt-6.1-sol';
export const DEFAULT_REASONING = 'high';
export const DEFAULT_MAX_OUTPUT_TOKENS = 12000;

export function providerConfig({ provider = 'openai', model, reasoning = DEFAULT_REASONING, maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS } = {}) {
  requireValue(['openai', 'gemini'].includes(provider), 'INVALID_CONFIG', 'Provider must be openai or gemini.');
  model ??= provider === 'openai' ? DEFAULT_MODEL : 'gemini-3-flash-preview';
  requireValue(typeof model === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(model), 'INVALID_CONFIG', 'Invalid model identifier.');
  requireValue(['low', 'medium', 'high', 'xhigh', 'max'].includes(reasoning), 'INVALID_CONFIG', 'Unsupported reasoning effort.');
  requireValue(Number.isSafeInteger(maxOutputTokens) && maxOutputTokens >= 1024 && maxOutputTokens <= 16000,
    'INVALID_CONFIG', 'maxOutputTokens must be an integer from 1024 through 16000.');
  return { provider, model, reasoning: provider === 'openai' ? reasoning : null, maxOutputTokens };
}

export function buildProviderRequest(config, { instructions, input, schema }) {
  if (config.provider === 'openai') {
    return {
      url: 'https://api.openai.com/v1/responses',
      body: {
        model: config.model,
        reasoning: { effort: config.reasoning },
        store: false,
        max_output_tokens: config.maxOutputTokens,
        instructions,
        input: [{ role: 'user', content: [{ type: 'input_text', text: JSON.stringify(input) }] }],
        text: { format: { type: 'json_schema', name: 'resume_source_selection', strict: true, schema } },
      },
    };
  }
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,
    body: {
      system_instruction: { parts: [{ text: instructions }] },
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
      generationConfig: { responseMimeType: 'application/json', responseJsonSchema: schema, maxOutputTokens: config.maxOutputTokens },
    },
  };
}

function parseSelection(text) {
  requireValue(typeof text === 'string' && text.length > 0, 'INVALID_RESPONSE', 'Provider returned no selection.');
  try { return JSON.parse(text); } catch { throw new ResumeToolError('INVALID_RESPONSE', 'Provider returned invalid JSON. No draft was saved.'); }
}
const tokens = (value) => Number.isSafeInteger(value) && value >= 0 ? value : null;

export async function requestSelection(config, payload, { apiKey, fetchImpl = globalThis.fetch } = {}) {
  requireValue(typeof apiKey === 'string' && apiKey.trim().length > 0, 'MISSING_CREDENTIAL',
    `${config.provider === 'openai' ? 'OPENAI_API_KEY' : 'GEMINI_API_KEY'} is not available to this local process. No request was sent.`);
  const { url, body } = buildProviderRequest(config, payload);
  let response;
  try {
    response = await fetchImpl(url, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(120000),
      headers: {
        'Content-Type': 'application/json',
        ...(config.provider === 'openai' ? { Authorization: `Bearer ${apiKey.trim()}` } : { 'x-goog-api-key': apiKey.trim() }),
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Network errors can contain request data. Never log raw errors or automatically repeat a possibly billed request.
    throw new ResumeToolError('NETWORK_ERROR', 'Provider request failed or timed out. Its billing outcome may be uncertain; no automatic retry was made.');
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new ResumeToolError('PROVIDER_ERROR', `Provider returned HTTP ${response.status}. No automatic retry was made.`);
  }
  let data;
  try { data = await response.json(); } catch {
    throw new ResumeToolError('INVALID_RESPONSE', 'Provider returned unreadable JSON. No draft was saved.');
  }
  if (config.provider === 'openai') {
    const content = (Array.isArray(data.output) ? data.output : [])
      .filter((item) => item.type === 'message').flatMap((item) => item.content ?? []);
    requireValue(!content.some((item) => item.type === 'refusal'), 'PROVIDER_REFUSAL', 'Provider declined the request. No draft was saved.');
    requireValue(data.status === 'completed', 'INCOMPLETE_RESPONSE', 'Provider did not complete the response. No draft was saved.');
    const texts = content.filter((item) => item.type === 'output_text');
    requireValue(texts.length === 1, 'INVALID_RESPONSE', 'Expected one structured selection. No draft was saved.');
    return { selection: parseSelection(texts[0].text), usage: {
      inputTokens: tokens(data.usage?.input_tokens), outputTokens: tokens(data.usage?.output_tokens),
      reasoningTokens: tokens(data.usage?.output_tokens_details?.reasoning_tokens),
    } };
  }
  const candidate = data.candidates?.[0];
  requireValue(!data.promptFeedback?.blockReason && candidate?.finishReason === 'STOP',
    'INCOMPLETE_RESPONSE', 'Gemini blocked or did not complete the response. No draft was saved.');
  const text = (candidate.content?.parts ?? []).filter((part) => !part.thought).map((part) => part.text ?? '').join('');
  return { selection: parseSelection(text), usage: {
    inputTokens: tokens(data.usageMetadata?.promptTokenCount), outputTokens: tokens(data.usageMetadata?.candidatesTokenCount),
    reasoningTokens: tokens(data.usageMetadata?.thoughtsTokenCount),
  } };
}
