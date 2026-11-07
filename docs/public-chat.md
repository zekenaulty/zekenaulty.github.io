# Public resume chat client

This is the frontend half of the bounded OpenAI public-chat migration in [gemini-proxy PR #1](https://github.com/zekenaulty/gemini-proxy/pull/1). It is separate from the local private resume tool. It does not deploy a Worker, enable public chat, configure credentials, make paid calls or publish resume content.

## Endpoint and request

Set `VITE_CHAT_PROXY_URL` only after reviewing the intended Worker destination. It must be a full HTTPS URL ending exactly in `/chat`, with no query, fragment or credentials. Missing/malformed configuration disables sends while leaving the resume pages and downloads usable. This public URL is not a secret. Vite settings require a rebuild. There is no implicit production endpoint, direct provider path, browser key or automatic fallback.

The browser sends `POST /chat` with `Content-Type: application/json` and only `{ "messages": [{ "role": "user", "text": "What experience is listed?" }] }`. It sends a contiguous recent suffix of at most 12 messages, 2,000 JavaScript string characters each, 8,000 total and 32 KiB after JSON encoding. The last role is `user`; all other roles are `user` or `assistant`. The welcome message and UI metadata are excluded. Older transcript text remains visible locally. Oversized/unsupported old turns stop the transmitted suffix rather than being rewritten. The response is labeled when older context was omitted.

Instructions, curated public facts, credentials, model settings and limits belong to the Worker. No private resume generation, job-description upload or raw provider payload belongs on this route. Browser limits are UX and bandwidth controls, not a security boundary; the Worker independently validates and throttles.

## Responses and recovery

Success is `{ "text": "Answer", "incomplete": false, "truncated": false }`, with nonblank text of at most 2,000 characters and both boolean flags required. A partial/shortened answer receives a visible per-message notice, preserved on reload. No automatic retry or continuation occurs.

Errors use the Worker's `{ "error": { "code": "...", "message": "..." } }` shape. The client displays fixed public-safe messages rather than server/provider details. It handles disabled/unavailable service, malformed requests, timeouts and rate limits. A 429 disables resending for the numeric `Retry-After` interval, defaulting to 60 seconds and capped at 3,600. There is one fetch per submission, a 90-second timeout, no redirects, no credential cookies, no referrer and no provider fallback. A failed submission keeps the editable draft without persisting the failed turn as later context. Closing/reopening the drawer does not send another request. Unmounting aborts the in-flight request; aborting is not proof a provider call was unbilled.

## Privacy and preserved behavior

The existing drawer, first-visit opening, local history, older-message pagination and Markdown display remain. Legacy Gemini `model` messages normalize to `assistant`, while malformed records are skipped. Storage restrictions fall back to memory. History uses the existing `chat-history-v1` local-storage key and is not encrypted. On a new submission, the bounded recent suffix, potentially including legacy history, is sent through the configured Worker to OpenAI. The UI explains this and asks visitors not to share private information. Merely opening the drawer does not send history.

Raw HTML is not enabled. Model-authored Markdown images become inert text instead of making third-party requests. Links open on a visitor click with `noopener noreferrer`. Verify important facts against the public resume.

The public chat-data generator remains for existing build/export workflows, but its entire JSON output and browser-built system instructions are no longer imported into the chat bundle. Public resume/project content, private resume tooling and the separate writing loop are unchanged.

## Coordinated rollout, not performed by this change

The legacy Gemini client and hardened Worker are incompatible. The legacy client posts `contents` and `system_instruction` to a root URL; this client posts only `messages` to `/chat`. Do not add a permissive compatibility route or silent Gemini fallback.

1. Refresh the site/Worker branches and preserve newer user edits before applying or publishing. This change is based on site PR #2 head `661babb44c9c8c81f17b09ae5985a3baa8bc5f81`; it does not change private operator tooling or project content.
2. Review the hardened Worker, its approved public-only context, the existing key's server-only binding, and both mandatory limiters. Keep `PUBLIC_CHAT_ENABLED` false until all separately approved setup and rollout gates are satisfied. Follow the Worker repository's current operator guide. Frontend code must contain no store/account identifiers or secret material.
3. Choose an approved coordinated deployment or maintenance window. A new Worker rejects cached legacy clients. This frontend remains unavailable without explicit valid configuration and a ready Worker. A separate reviewed endpoint can simplify sequencing, but does not justify leaving the unrestricted legacy proxy active indefinitely.
4. After authorized Worker configuration/deployment, rebuild this site with its reviewed full `/chat` URL. Verify allowed-origin/preflight behavior and disabled/error/rate-limit states. Local mocked tests do not establish actual CORS, live secret permissions, model access or provider quality. Live success testing is a separate paid-call decision. Do not production-allow localhost just to simplify development.
5. Roll back paid access by disabling the Worker or removing the frontend setting and rebuilding. Preserve static resume access. Never restore a browser key or route silently to the old proxy.

HTTP endpoints are accepted only in Vite development and only for localhost/loopback. Use a local mocked service, not live production secrets or a paid endpoint.

## Verification

- `npm run check:public-chat`: transport and real-component hook/handler tests, using the existing Vite compiler and mocked responses. Covers byte/character/message limits, old history, endpoint restrictions, safe errors, timeout/abort, no retries, duplicate submit, close/reopen, cooldown, partial/omitted-context labels, failed drafts, denied storage and inert images.
- `npm run check:public-chat:worker -- /path/to/worker/src/index.js`: ten offline scenarios through both real modules, with mocked provider transport, dummy Secrets Store lookup and limiter bindings. No credentials or network requests are used.
- Existing checks remain required: `npm run check:resume-tool`, `npm run check:resume`, `node --test tests/privacy.test.js`, and `npm run build:all`.

Hook tests are not browser layout/CORS tests. A headless Chromium check was attempted in the preparation environment but could not launch because local process sockets were restricted. Visual browser QA remains outstanding; do not report it as passed.
