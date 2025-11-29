# zekenaulty.github.io

React/Vite single-page resume site (MUI) with multi-profile views, animated intro, matrix overlay, curated projects, and optional Gemini-powered chat/export tooling.

## What's here
- Multi-profile resume data (Code Monkey + employer-facing variants) with job summaries, bullets, and job-level skills chips.
- Background underlay using `assets/backgrounds/new-bg-0028.png`, optional matrix overlay toggle (auto-disabled on mobile/reduced-motion), fade-in loader for the backdrop, and animated intro text (per-character spin-in via anime.js).
- Sections: intro, profile selector, summary, experience, skills, projects.
- Gemini chat drawer with a sticky top-right toggle (auto-opens on first visit) plus build scripts for resume chat data and export stubs.
- Resume download links (HTML/PDF/DOCX/TXT) surfaced in the UI; dev server can serve built exports from `dist/resume`.

## Run & Build
- Install deps: `npm install`
- Dev server: `npm run dev` (serves `/resume/*` from `dist/resume` if exports exist)
- Production build: `npm run build` (prebuild generates resume chat data)
- Preview: `npm run preview`
- Full build + exports: `npm run build:all`
- Deploy to GitHub Pages: `npm run deploy` (runs build:all, publishes `dist/` to `gh-pages`)

## Tailored profiles (LLM-assisted)
- Generate job-specific overlays from private JDs: `npm run generate:tailored-profiles` (reads `private/job-descriptions/*.md|txt`, writes to `src/data/resume/profiles/generated/`).
- Requires `GEMINI_API_KEY` (env) and uses `src/llm/system/tailored-profile-generator-prompt.md` plus canonical resume data built by `build-resume-chat-data.js`.
- Use `--all` to regenerate everything, or pass specific filenames in `private/job-descriptions/`.

## Data layout
- Resume: `src/data/resume/`
  - `experience/*.json` (canonical roles with `summary`, `description`, `skillsUsed`)
  - `aboutVariants.json`, `profiles/*.json`, aggregator `index.js`
- Projects: `src/data/projects/projects.json`

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
- Curated projects are public-only; see `projects.json` for the current set.
