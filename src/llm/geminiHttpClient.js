/**
 * Lightweight Gemini HTTP client for browser environments (fetch only).
 *
 * Requirements this client satisfies:
 * - Single, explicit place to set the API key (constructor).
 * - Pure HTTP/fetch with headers:
 *     - "x-goog-api-key: $GEMINI_API_KEY"
 *     - "Content-Type: application/json"
 * - Supports:
 *     1) Single prompt + system_instruction:
 *        {
 *          "system_instruction": { "parts": [{ "text": "..." }] },
 *          "contents": [ { "parts": [{ "text": "..." }] } ]
 *        }
 *     2) Chat-style history with roles (user/model) + current user message,
 *        using the same system_instruction shape.
 */

/**
 * @typedef {Object} GeminiTextPart
 * @property {string} text
 */

/**
 * @typedef {Object} GeminiContentNoRole
 * @property {GeminiTextPart[]} parts
 */

/**
 * @typedef {Object} GeminiContentWithRole
 * @property {'user'|'model'} role
 * @property {GeminiTextPart[]} parts
 */

/**
 * @typedef {Object} GeminiChatTurn
 * @property {'user'|'model'} role
 * @property {string} text
 */

export class GeminiHttpClient {
  #apiKey;
  #model;
  #baseUrl;

  /**
   * @param {Object} params
   * @param {string} params.apiKey  - Gemini API key (required).
   * @param {string} [params.model='gemini-2.5-flash'] - Default model name.
   * @param {string} [params.baseUrl='https://generativelanguage.googleapis.com/v1beta/models']
   *        Base URL without trailing slash.
   */
  constructor({
    apiKey,
    model = 'gemini-2.5-flash',
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models',
  }) {
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      throw new Error('GeminiHttpClient requires a non-empty apiKey.');
    }
    this.#apiKey = apiKey.trim();
    this.#model = model;
    this.#baseUrl = baseUrl.replace(/\/+$/, ''); // strip trailing slash if present
  }

  /**
   * Builds the generateContent URL for the configured model.
   * Example:
   *   https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
   * @returns {string}
   * @private
   */
  #buildGenerateUrl() {
    const modelPath = this.#model.startsWith('models/')
      ? this.#model
      : `models/${this.#model}`;
    return `${this.#baseUrl}/${modelPath}:generateContent`;
  }

  /**
   * Common fetch wrapper for POSTing JSON to generateContent.
   * Uses:
   *   - x-goog-api-key: <apiKey>
   *   - Content-Type: application/json
   *
   * @param {object} body
   * @returns {Promise<any>}
   * @private
   */
  async #postGenerate(body) {
    const url = this.#buildGenerateUrl();

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-goog-api-key': this.#apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error('GeminiHttpClient network error:', err);
      throw new Error(`Gemini API network error: ${err?.message || String(err)}`);
    }

    let json;
    try {
      json = await response.json();
    } catch (parseErr) {
      if (!response.ok) {
        throw new Error(
          `Gemini API error ${response.status}: ` +
            (response.statusText || 'Non-JSON error body')
        );
      }
      throw new Error('Gemini API returned a non-JSON response.');
    }

    if (!response.ok) {
      const msg =
        (json && json.error && json.error.message) ||
        JSON.stringify(json);
      throw new Error(`Gemini API error ${response.status}: ${msg}`);
    }

    return json;
  }

  /**
   * Builds a system_instruction object from one or more system messages.
   *
   * Target JSON shape (no "role", matches your curl example):
   * "system_instruction": {
   *   "parts": [
   *     { "text": "You are a cat. Your name is Neko." },
   *     { "text": "Another instruction." }
   *   ]
   * }
   *
   * @param {string|string[]|null|undefined} systemMessages
   * @returns {{ parts: GeminiTextPart[] }|undefined}
   * @private
   */
  #buildSystemInstruction(systemMessages) {
    if (!systemMessages) return undefined;

    if (typeof systemMessages === 'string') {
      return {
        parts: [{ text: systemMessages }],
      };
    }

    if (Array.isArray(systemMessages)) {
      if (systemMessages.length === 0) return undefined;
      return {
        parts: systemMessages.map((msg) => ({ text: String(msg) })),
      };
    }

    throw new Error('systemMessages must be a string or string[].');
  }

  /**
   * Extracts concatenated text from a GenerateContentResponse.
   * Looks at: candidates[0].content.parts[].text
   *
   * @param {any} response
   * @returns {string|null}
   * @private
   */
  #extractText(response) {
    const parts =
      response?.candidates?.[0]?.content?.parts ?? [];

    const texts = parts
      .map((p) => p && typeof p.text === 'string' ? p.text : null)
      .filter((t) => t !== null);

    if (!texts.length) return null;
    return texts.join('');
  }

  /**
   * USE CASE 1:
   * Single-turn request with system_instruction and a user prompt,
   * matching this structure:
   *
   * {
   *   "system_instruction": {
   *     "parts": [{ "text": "You are a cat. Your name is Neko." }]
   *   },
   *   "contents": [
   *     {
   *       "parts": [{ "text": "Hello there" }]
   *     }
   *   ]
   * }
   *
   * @param {Object} params
   * @param {string|string[]} [params.systemMessages]  - One or multiple system instructions.
   * @param {string} params.prompt                     - The user input text ("Hello there").
   * @returns {Promise<string>}                        - The generated text.
   */
  async generateSingle({ systemMessages, prompt }) {
    if (typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('generateSingle requires a non-empty string prompt.');
    }

    const system_instruction = this.#buildSystemInstruction(systemMessages);

    /** @type {{ system_instruction?: GeminiContentNoRole, contents: GeminiContentNoRole[] }} */
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    if (system_instruction) {
      body.system_instruction = system_instruction;
    }

    const response = await this.#postGenerate(body);
    const text = this.#extractText(response);

    if (text === null) {
      throw new Error('No text content found in Gemini API response (generateSingle).');
    }

    return text;
  }

  /**
   * USE CASE 2:
   * Chat-style request with history + current user message,
   * plus optional system_instruction.
   *
   * Target structure (system_instruction added by this client):
   *
   * {
   *   "system_instruction": {
   *     "parts": [{ "text": "You are a cat. Your name is Neko." }]
   *   },
   *   "contents": [
   *     {
   *       "role": "user",
   *       "parts": [{ "text": "Hello" }]
   *     },
   *     {
   *       "role": "model",
   *       "parts": [{ "text": "Great to meet you. What would you like to know?" }]
   *     },
   *     {
   *       "role": "user",
   *       "parts": [{ "text": "I have two dogs in my house. How many paws are in my house?" }]
   *     }
   *   ]
   * }
   *
   * @param {Object} params
   * @param {string|string[]} [params.systemMessages] - Optional system instructions.
   * @param {GeminiChatTurn[]} params.history         - Conversation history turns (role + text).
   * @param {string} params.userMessage               - Current user message text.
   * @returns {Promise<string>}                       - The generated text.
   */
  async generateChat({ systemMessages, history, userMessage }) {
    if (!Array.isArray(history)) {
      throw new Error('generateChat requires history to be an array of { role, text }.');
    }
    if (typeof userMessage !== 'string' || !userMessage.trim()) {
      throw new Error('generateChat requires a non-empty userMessage string.');
    }

    const system_instruction = this.#buildSystemInstruction(systemMessages);

    /** @type {GeminiContentWithRole[]} */
    const contents = [];

    // Map history -> { role, parts: [{ text }] }
    for (const turn of history) {
      if (!turn || typeof turn.text !== 'string' || !turn.text.trim()) {
        continue;
      }
      if (turn.role !== 'user' && turn.role !== 'model') {
        throw new Error('Each history turn must have role "user" or "model".');
      }
      contents.push({
        role: turn.role,
        parts: [{ text: turn.text }],
      });
    }

    // Append current user turn
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    if (!contents.length) {
      throw new Error('generateChat constructed an empty contents array.');
    }

    /** @type {{ system_instruction?: GeminiContentNoRole, contents: GeminiContentWithRole[] }} */
    const body = { contents };

    if (system_instruction) {
      body.system_instruction = system_instruction;
    }

    const response = await this.#postGenerate(body);
    const text = this.#extractText(response);

    if (text === null) {
      throw new Error('No text content found in Gemini API response (generateChat).');
    }

    return text;
  }
}
