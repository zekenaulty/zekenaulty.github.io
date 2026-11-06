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
- Generate job-specific overlays from private JDs: `npm run generate:tailored-profiles` (reads `private/job-descriptions/*.md|txt`, writes to ignored `private/resume-profiles/`). Generation is local tooling, not a public website endpoint.
- Requires `GEMINI_API_KEY` (env) and uses `src/llm/system/tailored-profile-generator-prompt.md` plus canonical resume data built by `build-resume-chat-data.js`. Generation sends the selected JD and canonical data to Gemini; only run it when that data sharing is intended.
- Use `--all` to regenerate everything, or pass specific filenames in `private/job-descriptions/`. The JD filename determines the output ID, so missing-only mode checks the same file it writes.
- Each new overlay saves its actual tailored `summary` paragraphs. An optional `aboutKey` must already exist; unknown about keys or experience IDs fail validation instead of falling back or dropping roles. Invalid runs exit nonzero.
- Only experience `summary`, `description`, and `skillsUsed` can be tailored. Employment titles, companies, locations, and dates always come from canonical experience data. Review all generated narrative for factual accuracy; schema checks cannot verify claims.
- Existing drafts are not automatically repaired or regenerated. For an older draft, make a private reviewed copy, add real summary paragraphs (or reuse a valid about key), correct unknown IDs, and remove factual override fields before exporting.
- Offline/manual use: write an overlay matching the prompt's JSON schema under `private/resume-profiles/`, then use the private export command below. This needs no model key and lets an assistant use the same rendering pipeline.


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
- Gemini client: `src/llm/geminiHttpClient.js`; UI: `src/components/ChatDrawer.jsx`, `ChatToggleButton.jsx`.
- Preferred: use a Cloudflare Worker proxy to hide the Gemini key. Set `VITE_GEMINI_PROXY_URL` in `.env.local`. If you must call Gemini directly in local dev, set `VITE_GEMINI_API_KEY` in `.env.local`. Do not ship builds with a real key—omit `.env.local` for production; the app will default to the proxy URL.
- Resume chat payload is generated at build (`scripts/build-resume-chat-data.js`).

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
