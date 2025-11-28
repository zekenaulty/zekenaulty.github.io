# zekenaulty.github.io

React/Vite single-page resume site (MUI) with multi-profile views, animated intro, matrix overlay, curated projects, and optional Gemini-powered chat/export tooling.

## What’s here
- Multi-profile resume data (Code Monkey + employer-facing variants) with job summaries, bullets, and job-level skills chips.
- Background underlay using `assets/backgrounds/new-bg-0028.png`, optional matrix overlay toggle, and animated intro text (per-character spin-in via anime.js).
- Sections: intro, profile selector, summary, experience, skills, projects.
- Gemini chat drawer (optional) plus build scripts for resume chat data and export stubs.

## Run & Build
- Install deps: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build` (prebuild generates resume chat data)
- Preview: `npm run preview`
- Full build + exports: `npm run build:all`
- Deploy to GitHub Pages: `npm run deploy` (runs build:all, publishes `dist/` to `gh-pages`)

## Data layout
- Resume: `src/data/resume/`
  - `experience/*.json` (canonical roles with `summary`, `description`, `skillsUsed`)
  - `aboutVariants.json`, `profiles/*.json`, aggregator `index.js`
- Projects: `src/data/projects/projects.json`

## UI bits
- Background & matrix: `src/components/BackgroundLayer.jsx` (+ `MatrixCanvas.jsx`), intro animation: `HomeIntroSection.jsx`.
- Profile switching: `ProfileDropdown.jsx`; sections under `components/`.
- Theme: blue/gray palette; no green accents; transparent containers so the underlay is visible.

## Chat (optional)
- Gemini client: `src/llm/geminiHttpClient.js`; UI: `src/components/ChatDrawer.jsx`, `ChatToggleButton.jsx`.
- Set `GEMINI_API_KEY` (and model if desired) in `ChatDrawer.jsx` to enable replies. Without a key, chat stays disabled.
- Resume chat payload is generated at build (`scripts/build-resume-chat-data.js`).

## Exports (stubbed)
- `scripts/build-resume-exports.js` targets HTML/TXT/DOCX/PDF outputs; hooked into `build:all`. Adjust as needed for your local toolchain.

## Notes
- Background image paths use `import.meta.env.BASE_URL` for GitHub Pages compatibility.
- Animated intro is full viewport; main content starts below. Matrix toggle lives in the header bar.
- Curated projects are public-only; see `projects.json` for the current set.
