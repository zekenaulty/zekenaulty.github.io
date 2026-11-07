# Private resume tool, protocol version 1

This is a local Node CLI and importable service, not a website endpoint or hosted assistant tool registration. Zeke and an assistant with authorized access to the same checkout can use the same commands. Nothing here starts a server, publishes a resume, submits an application, or changes the live site.

## What this increment does

OpenAI ranks and selects existing canonical headlines, summary paragraphs, role bullets and skill names for one selected job. The renderer assembles the selected text verbatim. Selected jobs remain in the canonical newest-first chronological career order, regardless of the model's ranking. Bullets within a job and skill lists may be ordered by relevance. Employment titles, employers, dates, locations and role summaries remain canonical. Every role bullet and skill must belong to that role. Extra output fields and unsupported references fail locally even if the provider claims success.

The default is `gpt-6.1-sol` with `reasoning.effort: high`. The [official model page](https://developers.openai.com/api/docs/models/gpt-6.1-sol) documents both. The [Responses structured-output contract](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) uses `text.format`, `type: json_schema`, `strict: true`, and closed object schemas. Verified against official documentation on 2026-11-07. Account-specific availability has not been live-tested.

Selection-only output is a safe starting point, not the final high-quality tailoring workflow. It cannot shorten or rewrite a long canonical paragraph or bullet. A later, separately reviewed step can add controlled prose rewriting, claim-to-source evidence and human approval. Merely attaching model-generated citations would not establish that a rewritten claim is true.

Canonical data itself is user-maintained, not independently fact-checked. Review accuracy, chronological continuity, formatting, omissions and missing contact details before sharing any export. Old manually edited overlays remain supported by the existing `export:private` command, which checks shape and references but **does not** establish the stronger source-selection provenance used here.

## Local setup and credential boundary

Use the existing project dependency installation and a supported Node runtime for Vite 7 (Node 20.19+ or 22.12+; verification used Node 24). Job descriptions belong in ignored `private/job-descriptions/` as UTF-8 `.md` or `.txt` files.

The OpenAI runner reads an existing `OPENAI_API_KEY` from the process, then `.env.local`, then `.env`, without overriding values already present. It reads credentials only for `generate`. Setup/reuse of a secret must be handled through the authorized secure environment workflow, never pasted into JSON requests, chat, source files, or frontend variables. This code neither provisions nor saves keys. No key was transferred or used during implementation.

Never use `VITE_OPENAI_API_KEY`: Vite-prefixed credentials are client-visible. The tool uses a fixed HTTPS provider endpoint and refuses redirects. It does not support arbitrary `OPENAI_BASE_URL` destinations. Gemini is opt-in and reads `GEMINI_API_KEY`; it never silently substitutes for OpenAI.

## JSON interface

Run from the repo root:

```sh
printf '%s\n' '{"version":1,"action":"list_jobs"}' | npm run --silent resume:tool
```

Or spawn `node scripts/resume-tool.js` directly. Send exactly one JSON object on stdin (maximum 16,000 bytes). Stdout contains exactly one JSON response, not progress text. Success exits zero:

```json
{"version":1,"ok":true,"action":"list_jobs","result":{"jobs":[]}}
```

Failure exits nonzero and returns `{ "version": 1, "ok": false, "error": { "code": "…", "message": "…" } }`. Errors do not include provider response bodies, raw network errors, prompts, or credential values. There are no automatic retries.

Actions:

- `list_jobs`: returns filename/suggested-ID pairs, without job contents. It does not create directories.
- `inspect_job`: requires `job`, a single filename such as `Company Role.md`. Returns the selected file's text, SHA-256 and byte size. It does not call a provider.
- `prepare`: requires `job`; accepts optional `id`, `provider`, `model`, `reasoning`, `maxOutputTokens`. Returns the exact `inputHash`, canonical `sourceHash`, selected provider/model, data-sharing description, input byte size, and intended private draft path. It does not read credentials, create output directories or send data.
- `generate`: uses the same inputs as `prepare`, plus `allowNetwork: true` and `expectedInputHash` from that preview. Sends the selected JD and canonical material to that provider once. Hash mismatches fail before transmission. Returns the saved draft path, content `draftHash`, usage counts when reported, and a review summary with included/omitted role IDs and bullet counts.
- `validate`: requires `id`. Reassembles the source selection and checks the saved profile against it and the current canonical source hash. Returns the current `draftHash` and review summary. It does not call a provider. A changed canonical source invalidates the draft even when unrelated to its selected text; regenerate or review it separately.
- `export`: requires `id` and `expectedDraftHash` returned by `generate` or `validate`. Revalidates the selected profile and writes HTML, TXT, DOCX and PDF. Returns explicit local paths for all four artifacts and the review summary. No provider call or site build occurs.

Unknown actions, request fields and malformed paths fail. `job` accepts a filename only, not absolute paths, traversal or symlinks. A custom `id` is lowercase letters/numbers with hyphen-separated words, at most 120 characters. It lets you make a revision without overwriting the original.

Example request sequence (reuse the actual returned hashes, not these markers):

```json
{"version":1,"action":"prepare","job":"Company Role.md","id":"company-role-v1"}
```

After reviewing the job, provider and data sharing:

```json
{"version":1,"action":"generate","job":"Company Role.md","id":"company-role-v1","allowNetwork":true,"expectedInputHash":"<inputHash from prepare>"}
```

Then:

```json
{"version":1,"action":"export","id":"company-role-v1","expectedDraftHash":"<draftHash from generate or validate>"}
```

An assistant must still have the user's authorization for the provider/data and any paid calls. `allowNetwork` is an explicit local API flag, not a replacement for that authorization. A source hash is an integrity check, not an authentication credential or a digital signature.

For an existing Node caller, import `resumeService` from `scripts/resume-tool.js` and call `await resumeService.execute(request)`. Tests may instantiate `createResumeService` with an isolated root, canonical data, fake credential callback and mocked fetch. No mock-response or secret-injection option exists in the public JSON protocol.

## Provider and cost controls

OpenAI defaults: model `gpt-6.1-sol`, reasoning `high`, `maxOutputTokens: 12000`, `store: false`, no tools, one request, 120-second timeout. An optional explicit output cap must be 1024–16000 tokens. Reasoning tokens consume the output budget. Output limits can result in an incomplete response; that fails without saving a draft or automatically spending again.

The selected JD is limited to 48,000 bytes; the complete serialized provider request is limited to 160,000 bytes. These are byte limits, not exact token or monetary estimates. The model page listed $2 per million input tokens and $10 per million output tokens when checked; prices may change. At the 12,000 output-token cap, that output component is at most $0.12 at the listed rate, plus input charges. This is not a total spending cap or a guarantee of account access. No paid validation call was made.

`store: false` opts out of response storage; it does not promise zero provider retention. Review the provider's applicable data policies before transmitting private job descriptions. Raw responses and JD text are not saved with generated profiles; profiles contain the selected source references, canonical/input hashes, job filename/hash, configuration and numeric usage.

An HTTP error, network timeout, refusal, incomplete response, malformed JSON, or invalid selection fails closed. A network failure's billing outcome can be uncertain. Inspect what happened before manually retrying. There is no provider fallback, resume retry loop or silent switch to a cheaper model. Stable canonical input precedes the variable job text, making the request prefix reusable when provider prompt caching is available; actual cache savings are not assumed. Validation and all four exports reuse one saved draft without another model call.

Gemini compatibility uses `provider: "gemini"` (default model `gemini-3-flash-preview`) with JSON-schema output and the same local source validation. OpenAI reasoning settings are not mapped to Gemini. Provider support and quality require a separately authorized live check.

## Existing command-line workflow

```sh
npm run generate:tailored-profiles -- "Company Role.md"
npm run generate:tailored-profiles -- --provider gemini "Company Role.md"
npm run generate:tailored-profiles -- --all
```

Calling the human CLI with filenames or `--all` intentionally sends those jobs to the configured provider. No arguments shows help, rather than transmitting all local files. `--all` skips existing outputs instead of regenerating them. For a new revision, use a new `id` through the JSON interface. Never put credentials in command-line arguments.

CLI flags include `--provider`, `--model`, `--reasoning`, and `--max-output-tokens`. Process configuration can supply `RESUME_PROVIDER`, `OPENAI_MODEL`, `OPENAI_REASONING_EFFORT`, or the existing `GEMINI_MODEL`. The JSON interface uses its own explicit request/default configuration rather than these process overrides, so preparation hashes remain predictable. Model IDs supplied explicitly must support the documented schema and reasoning parameters; unsupported models fail without fallback.

## Private artifacts and limits

- Drafts are created exclusively under `private/resume-profiles/<id>.json`; exports under `private/resume-exports/<id>/`. New directories/files request owner-only filesystem permissions. Existing permissions are not silently changed. This is not protection from other code running as the same OS user.
- Draft writes are atomic and never replace a path. A local lock prevents concurrent generation of the same ID. A crashed process may leave a lock requiring manual review/removal; removing it is not part of automatic retries.
- Private directory and selected-file symlinks are rejected. The tool assumes a trusted local checkout, not hostile concurrent filesystem mutation by another process.
- Generated drafts are ignored by Git and excluded from the public registry and site build by PR #1's privacy protections. `.gitignore` and `noindex` are not authentication. Do not copy private artifacts into `public/` or `dist/`.
- No browser endpoint, proxy, authentication system, key migration or Cloudflare changes are included. Public chat and writing remain on their existing Gemini paths. A later hosted workflow needs separately approved authentication, server-side secrets, authorization, quotas/rate limits, private storage and deployment review.

## Verification

```sh
npm run check:resume-tool
npm run check:resume
node --test tests/privacy.test.js
npm run build:all
```

The new check is one focused offline integration script covering mock provider wire format, exact source validation, failed/refused/truncated requests, no retries, no credential leakage, input/source/draft hashes, chronological jobs with tailored bullet order, explicit omitted-role review, private exports, traversal/symlinks and no-overwrite. It does not test live model availability, paid usage, model selection quality, a browser-authenticated workflow or production deployment.
