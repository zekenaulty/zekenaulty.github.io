# zekenaulty.github.io

React/Vite single-page resume site (MUI) with multi-profile views, animated intro, matrix overlay, and optional Gemini-powered chat/export tooling.

## What's here
- Multi-profile resume data (Code Monkey + employer-facing variants) with job summaries, bullets, and job-level skills chips.
- Background underlay using `assets/backgrounds/new-bg-0028.png`, optional matrix overlay toggle (auto-disabled on mobile/reduced-motion), fade-in loader for the backdrop, and animated intro text (per-character spin-in via anime.js).
- Sections: intro, profile selector, summary, experience, and skills.
- Gemini chat drawer with a sticky top-right toggle (auto-opens on first visit) plus build scripts for resume chat data and export stubs.
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

## Tailored profiles (LLM-assisted)
- Generate job-specific overlays from private JDs: `npm run generate:tailored-profiles` (reads `private/job-descriptions/*.md|txt`, writes to `src/data/resume/profiles/generated/`).
- Requires `GEMINI_API_KEY` (env) and uses `src/llm/system/tailored-profile-generator-prompt.md` plus canonical resume data built by `build-resume-chat-data.js`.
- Use `--all` to regenerate everything, or pass specific filenames in `private/job-descriptions/`.

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
- Gemini client: `src/llm/geminiHttpClient.js`; UI: `src/components/ChatDrawer.jsx`, `ChatToggleButton.jsx`.
- Preferred: use a Cloudflare Worker proxy to hide the Gemini key. Set `VITE_GEMINI_PROXY_URL` in `.env.local`. If you must call Gemini directly in local dev, set `VITE_GEMINI_API_KEY` in `.env.local`. Do not ship builds with a real key—omit `.env.local` for production; the app will default to the proxy URL.
- Resume chat payload is generated at build (`scripts/build-resume-chat-data.js`).

## Exports (stubbed)
- `scripts/build-resume-exports.js` targets HTML/TXT/DOCX/PDF outputs; hooked into `build:all`. Adjust as needed for your local toolchain.
- `ResumeDownloadLinks.jsx` surfaces download links in the UI (reads from `/resume/{slug}` paths).

## Notes
- Background image paths use `import.meta.env.BASE_URL` for GitHub Pages compatibility.
- Animated intro is full viewport; main content starts below. Matrix toggle lives in the header bar.
- `vite.config.js` injects a build-time static homepage fallback plus JSON-LD so crawlers and non-JavaScript readers can see the default resume content without server-side rendering.
