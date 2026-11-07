# zekenaulty.github.io

React/Vite single-page resume site (MUI) with multi-profile views, animated intro, matrix overlay, and private OpenAI-powered resume tooling, plus opt-in public OpenAI chat and the existing private Gemini writing tools.

## What's here
- Multi-profile resume data (Code Monkey + employer-facing variants) with job summaries, bullets, and job-level skills chips.
- Background underlay using `assets/backgrounds/new-bg-0028.png`, optional matrix overlay toggle (auto-disabled on mobile/reduced-motion), fade-in loader for the backdrop, and animated intro text (per-character spin-in via anime.js).
- Sections: intro, profile selector, summary, experience, and skills.
- Optional OpenAI chat drawer with a sticky top-right toggle (auto-opens on first visit) plus build scripts for resume chat data and export stubs.
- Resume download links (HTML/PDF/DOCX/TXT) surfaced in the UI; dev server can serve built exports from `dist/resume`.

## Run & Build
- Install deps: `npm install`
- Dev server: `npm run dev` (serves `/resume/*` from `dist/resume` if exports exist)
- Production build: `npm run build` (prebuild generates resume chat data)
- Preview: `npm run preview`
- Full build + exports: `npm run build:all`
- Deploy to GitHub Pages: `npm run deploy` (runs build:all, publishes `dist/` to `gh-pages`)

## Search indexing
- `public/robots.txt` allows all crawlers and points to `https://zekenaulty.github.io/sitemap.xml`.
- `public/sitemap.xml` is generated during builds from the homepage plus published resume profiles only.
- `vite.config.js` injects crawlable resume content, canonical metadata, JSON-LD, and optional Google Search Console verification into the built homepage.
- To verify a Search Console URL-prefix property by HTML file, place Google's verification file in `public/` so it deploys at the site root.
- To verify by meta tag, set `GOOGLE_SITE_VERIFICATION` or `VITE_GOOGLE_SITE_VERIFICATION` in `.env.local` before building. Do not commit the meta tag token.

## Private tailored resumes (OpenAI first)
- Local Node tool for Zeke and an assistant: `npm run --silent resume:tool` accepts one JSON request on stdin and returns one JSON result. See [the complete interface and examples](docs/private-resume-tool.md).
- The default provider is OpenAI Responses, model `gpt-6.1-sol`, reasoning `high`. Credentials stay in the local process, never in the browser or model prompt. An existing `OPENAI_API_KEY` must be available before live generation; credential setup is a separate secure step.
- Select one local JD, preview the exact input hash and provider, generate a validated draft, then explicitly export it. Files stay under ignored `private/resume-profiles/` and `private/resume-exports/`. No network-accessible endpoint is added.
- This first version tailors **selection of existing text and bullet/skill ordering**, not free-form prose or job chronology. Selected jobs stay in the canonical newest-first career order, even if the model ranks them differently. Generation, validation and export report included and omitted roles for review. The model returns only canonical references; local code rejects invented sources, cross-role bullets/skills, extra fields, changed drafts and changed source data. Employment titles, employers, locations, dates and role summaries remain canonical. Source validation is not independent verification of the source claims; review every resume before sharing.
- Existing human CLI: `npm run generate:tailored-profiles -- "Company Role.md"`. Filenames select files within `private/job-descriptions/`. Use `--all` to explicitly select all JDs. No arguments shows help; existing drafts are skipped, never overwritten. Select a new `id` through the JSON interface for a revision.
- Optional compatibility: add `--provider gemini` to use the existing Gemini credential with the same source-selection contract. There is no automatic provider fallback. Old free-form generated overlays remain untouched.
- Focused offline verification: `npm run check:resume-tool` uses a mocked transport and disposable synthetic JD. It needs no credentials and makes no provider requests.
- Private resume generation remains local and is not exposed through public chat. The writing loop still uses Gemini. Optional public chat requires the separately hardened OpenAI Worker; this source change does not deploy or enable it. Controlled evidence-backed prose rewriting remains separate future work.


## Draft privacy and recovery
- Job-targeted drafts are local files, not public resume profiles. `private/` and the legacy `src/data/resume/profiles/generated/` contents are ignored; `.gitignore` is not an access-control system.
- Public Node builds and the browser load base profiles only. A `published: true` flag in a generated draft does not promote it. Publishing requires an explicit reviewed copy into `src/data/resume/profiles/`.
- The development server blocks direct requests for private files and legacy generated drafts. Keep the server local; the public site is built from `dist/` only.
- The 12 legacy tracked drafts were untracked, not purged from Git history. Existing clones, old commits, pull-request diffs, and external copies may still contain them. This change does not remove search results or rewrite history.
- Preserve a private backup before merging cleanup into a working checkout. If Git removes the tracked copies on checkout or merge, recover their exact original bytes from the retained revision:

  ```sh
  node scripts/recover-resume-drafts.js --ref 2c65685d110b228f92be293632e41c38d4715449
  ```

  Recovery writes to ignored `private/recovered-generated-profiles/`, verifies each file, records SHA-256 checksums, and refuses to overwrite differing local files. It does not publish or change history. Other revisions can be selected with `--ref`.
- Run the privacy regression checks with `node --test tests/privacy.test.js`.

## Writing loop (private drafts)
- Seed data lives in `src/data/writing/writingSeed.json`; daily run outputs live under ignored `private/writing/`.
- Initialize local writing state: `npm run writing:init`
- Fetch public signals and write a daily brief: `npm run writing:signals`
- Test without network calls: `npm run writing:test`
- Run with custom flags: `npm run writing:run -- -- --offline --count 2`
- Create draft prompts/scaffolds from the latest signals: `node ./scripts/writing-loop.js draft --count 1`
- Generate prose with Gemini: `node ./scripts/writing-loop.js draft --generate --count 1` (requires `GEMINI_API_KEY`)
- Default draft length is `standard`: 1600-2400 words, 4-7 sections, with a counterargument/tradeoff. Use `--length short` for 700-1200 word notes or `--length deep` for 2800-4500 word pinned-topic pieces.
- Example deep draft: `node ./scripts/writing-loop.js draft --length deep --count 1`
- Pin a long-running topic: `node ./scripts/writing-loop.js pin --title "An AI harness is not a prompt" --lane agent-architecture --thesis "A prompt asks for behavior; a harness owns trust, validation, and recovery."`
- Nothing in this loop publishes to the public site yet; drafts require an explicit future publish step.

## Data layout
- Resume: `src/data/resume/`
  - `experience/*.json` (canonical roles with `summary`, `description`, `skillsUsed`)
  - `aboutVariants.json`, `profiles/*.json`, aggregator `index.js`
## UI bits
- Background & matrix: `src/components/BackgroundLayer.jsx` (+ `MatrixCanvas.jsx`), intro animation: `HomeIntroSection.jsx`.
- Profile switching: `ProfileDropdown.jsx`; sections under `components/`.
- Theme: blue/gray palette; no green accents; transparent containers so the underlay is visible.
- Chat UI: `ChatDrawer.jsx` and `ChatToggleButton.jsx` (sticky/pulsing toggle).

## Chat (optional)
- Browser transport: `src/llm/publicChatClient.js`; UI: `src/components/ChatDrawer.jsx`, `ChatToggleButton.jsx`.
- Disabled unless `VITE_CHAT_PROXY_URL` is explicitly set to a reviewed HTTPS Worker URL ending exactly in `/chat`. There is no default live endpoint, provider fallback or browser API key. Never set `VITE_OPENAI_API_KEY` or `VITE_GEMINI_API_KEY`.
- The browser sends only bounded user/assistant messages. Public facts, instructions, credentials, model settings and abuse limits belong to the Worker. The generated resume chat JSON is no longer imported or sent by the browser client.
- Offline checks: `npm run check:public-chat`. To test a local checkout of the matching Worker without network: `npm run check:public-chat:worker -- /path/to/worker/src/index.js`.
- See [the contract, privacy notes and migration sequence](docs/public-chat.md). No live binding, deployment, key setup or paid calls are included.

## Exports
- Public exports: `npm run build:all` builds HTML/TXT/DOCX/PDF for published profiles only under `dist/resume/`. `ResumeDownloadLinks.jsx` surfaces their `/resume/{slug}` links. `build:job` still builds only public exports; it does not publish or export private drafts.
- Private preview/export: `npm run export:private -- --profile private/resume-profiles/company-role.json` selects exactly one unpublished JSON file and writes all four formats under ignored `private/resume-exports/<id>/`. It does not build the site, call a model, load credentials, or publish anything.
- Open that directory's `index.html` locally for a preview; its download links are relative. It has no public canonical URL and includes `noindex`, which is defense in depth, not access control. Never copy private exports into `public/` or `dist/` or deploy them.
- Existing export directories are never overwritten. Keep or move a previous export before running the same ID again. Unknown references or fact-changing overrides fail before any export is written.
- Contact information is not added: the current canonical resume data has no verified standalone contact block. Review the documents and add approved contact details privately before sending an application.
- Focused offline smoke check: `npm run check:resume` verifies summary persistence, reference validation, canonical facts, timezone-independent dates, and private export behavior using a disposable fixture. No real drafts are changed.

## Notes
- Background image paths use `import.meta.env.BASE_URL` for GitHub Pages compatibility.
- Animated intro is full viewport; main content starts below. Matrix toggle lives in the header bar.
- `vite.config.js` injects a build-time static homepage fallback plus JSON-LD so crawlers and non-JavaScript readers can see the default resume content without server-side rendering.
