
# Multi-Variant Resume & Profile System – Implementation Spec

## 0. Design Principles (Concrete, Not Fluff)

1. **Single canonical truth**

   * Resume facts stay in the existing `src/sections/resume/data/*.json` files and `full.json`.
   * Variants NEVER fork the data; they only:

     * Choose ordering.
     * Select / drop bullets.
     * Rephrase bullets.
     * Shift titles/headlines and About.

2. **Small, named overlays – not one mega-file**

   * Each role/view gets its own overlay file with a semantic name:

     * `backend-modernization`
     * `desktop-winforms`
     * `fullstack-dotnet`
     * `solution-architect`
     * `code-monkey`
   * A thin index aggregates them for the UI and for AI tools.

3. **Explicit IDs for jobs, not positional or year-based hacks**

   * We add a stable `id` to each canonical experience and use that everywhere:

     * `litton-avondale`
     * `hancock-whitney`
     * `rainmaker`
     * `pk-promotions`
     * `not-rocket-science`
     * `solid-earth`
     * `rural-sourcing`
     * `prestage-farms`
     * `iadvantage`
     * `storable`

4. **About + headline variants live next to role overlays**

   * Master About, Code Monkey About, and per-role About text are treated as data, not scattered prose.

5. **Agent-friendly**

   * Clear file boundaries.
   * Clear schema with comments.
   * Examples are explicitly labeled and can be cloned programmatically.

---

## 1. Canonical Data Model (Using What You Already Have)

### 1.1 Existing canonical structures

Current files (already in repo):

* `src/sections/resume/data/1999-2000.json`
* `src/sections/resume/data/2000.json`
* `src/sections/resume/data/2001.json`
* `src/sections/resume/data/2001-2002.json`
* `src/sections/resume/data/2004-2005.json`
* `src/sections/resume/data/2005.json`
* `src/sections/resume/data/2007-2011.json`
* `src/sections/resume/data/2013-2016.json`
* `src/sections/resume/data/2016.json`
* `src/sections/resume/data/2017-2021.json`
* `src/sections/resume/data/2022.json`
* `src/sections/resume/data/aboutMe.json` (long narrative) 
* `src/sections/resume/data/full.json` (combined “about” + “experience”) 
* `src/sections/resume/data/skills.json` (skills + descriptions) 
* `src/sections/resume/data/index.js` exposes `ResumeData` with `skills` + `experience` array of year files. 

### 1.2 Minimal canonical change: add job IDs

We do **not** introduce a brand-new canonical structure. We add a single field:

* `id: string` on each top-level job object in:

  * All year-chunked JSON files.
  * The experiences array inside `full.json`.

Example change (EXAMPLE, NOT TEMPLATE):

```jsonc
// EXAMPLE – 2013-2016.json after adding ID
{
  "id": "rural-sourcing", // STABLE, SEMANTIC ID
  "title": "Senior Software Developer",
  "company": "Rural Sourcing, Inc.",
  "location": "Augusta, Georgia Area",
  "dates": {
    "start": "2013-08-01",
    "end": "2016-02-29"
  },
  "description": [
    "Provided mentoring, team management, project management in relation to the Microsoft stack (Windows Development, Web Development, Database Development).",
    "Performed recruiting and interviewing tasks."
  ]
}
```

**Why this is worth it:**

* Overlays can reference `rural-sourcing` instead of guessing based on index or file name.
* You can change year chunking later without touching overlays.

### 1.3 Canonical entity set

IDs for your core roles (EXAMPLE ID set – adjust names as you prefer):

* `litton-avondale`      → 1999–2000 Engineering Application Developer
* `hancock-whitney`      → Hancock Bank
* `rainmaker`            → Rainmaker Advertising & Design
* `pk-promotions`        → PK Promotions
* `not-rocket-science`   → Not Rocket Science
* `solid-earth`          → Solid Earth Inc.
* `rural-sourcing`       → Rural Sourcing, Inc.
* `prestage-farms`       → Prestage Farms
* `iadvantage`           → iAdvantage Software, Inc.
* `storable`             → Storable

AI agents can be instructed: “Never invent IDs; only use from the canonical list or ask for a new one.”

---

## 2. Profile Variants – File Layout

We implement Workstream B using **one small overlay file per profile**, plus a thin index.

### 2.1 Directory structure

```text
src/
  sections/
    resume/
      data/
        // existing canonical files stay as-is
        1999-2000.json
        ...
        2022.json
        skills.json
        full.json
        aboutMe.json
        index.js

        profiles/
          backend-modernization.json
          desktop-winforms.json
          fullstack-dotnet.json
          solution-architect.json
          code-monkey.json

          index.js
```

* `profiles/*.json` are overlays.
* `profiles/index.js` is a registry for the UI and agents.

No A/B/C/D filenames. Each file name is descriptive.

---

## 3. Profile Overlay Schema

Each `profiles/*.json` file uses the same shape.

### 3.1 Schema (single profile overlay)

```jsonc
// EXAMPLE – overlay schema, not a real profile
{
  "id": "backend-modernization",             // stable profile ID
  "label": "Senior .NET Backend / Modernization",
  "kind": "employer-facing",                 // "employer-facing" | "character"

  "headline": "Senior .NET Engineer – Legacy to Modern Cloud Backends",

  // which About variant to use (see section 4)
  "aboutKey": "about-backend-modernization",

  // 1) Experience ordering
  "experienceOrder": [
    "storable",
    "iadvantage",
    "rural-sourcing",
    "solid-earth",
    "prestage-farms"
  ],

  // 2) Experience field overrides keyed by job id
  "experienceOverrides": {
    "storable": {
      "title": "Senior .NET Backend Engineer",
      "emphasisTags": ["backend", "modernization", "cloud"],

      // If bullets present, they replace canonical description for this profile.
      // If omitted, canonical bullets are used as-is.
      "description": [
        "EXAMPLE bullet: Focused on .NET Core services and background processing for insurance automation."
      ]
    },

    "solid-earth": {
      // Only override the title; bullets fall back to canonical
      "title": "Senior .NET Developer / MLS Platform Modernization"
    }
  },

  // 3) Skills priorities (by skill name from skills.json)
  "skillsPrimary": [
    "C#",
    ".NET Core",
    "Entity Framework",
    "SQL Server",
    "PostgreSQL",
    "Azure DevOps",
    "Domain-Driven Design"
  ],

  "skillsSecondary": [
    "WinForms",
    "AngularJS",
    "REST APIs",
    "Hangfire"
  ],

  // optional: profile-specific tags (meta for agents)
  "tags": [
    "modernization",
    "backend",
    "migration",
    "enterprise"
  ]
}
```

Key points:

* Overlay never deletes canonical jobs; it only controls what is rendered and in what order.
* `experienceOverrides` can:

  * Override `title`.
  * Override `description` (full replace).
  * Add optional `emphasisTags` to assist AI agents with keyword tuning.

### 3.2 Code Monkey profile schema

`code-monkey.json` uses the same schema with `kind = "character"` and a different About key.

```jsonc
// EXAMPLE – structure only; content is placeholder
{
  "id": "code-monkey",
  "label": "Code Monkey (Default)",
  "kind": "character",

  "headline": "High-End Code Monkey Who Likes Fixing Broken Systems",
  "aboutKey": "about-code-monkey",

  "experienceOrder": [
    "storable",
    "iadvantage",
    "solid-earth",
    "rural-sourcing",
    "prestage-farms",
    "not-rocket-science",
    "litton-avondale"
  ],

  "experienceOverrides": {
    "storable": {
      "title": "Code Monkey, Insurance Backend Edition",
      "description": [
        "EXAMPLE bullet: Dropped into a WinForms + .NET Core hybrid and made the backend behave like a grown-up service.",
        "EXAMPLE bullet: Taught the team how to stop treating unit tests like optional decoration."
      ]
    }
  },

  "skillsPrimary": [
    "C#",
    ".NET Core",
    "WinForms",
    "Refactoring",
    "Legacy Modernization"
  ],
  "skillsSecondary": [
    "Azure DevOps",
    "SQL Server",
    "PostgreSQL",
    "Debugging Weird Shit"
  ],

  "tags": [
    "character",
    "authentic",
    "irreverent"
  ]
}
```

---

## 4. About / Summary Variants

We align Workstream D with a single About registry.

### 4.1 About variants file

We re-use `aboutMe.json` as the canonical long narrative and add a separate structured variant file:

```text
src/sections/resume/data/aboutVariants.json
```

Schema:

```jsonc
// EXAMPLE – schema; content is illustrative
{
  "master": {
    "id": "about-master",
    "label": "Master About (Neutral)",
    "paragraphs": [
      "EXAMPLE: Neutral summary paragraph 1.",
      "EXAMPLE: Neutral summary paragraph 2."
    ]
  },

  "code-monkey": {
    "id": "about-code-monkey",
    "label": "Code Monkey About",
    "paragraphs": [
      "EXAMPLE: Blunt, irreverent intro written in your natural voice."
    ]
  },

  "backend-modernization": {
    "id": "about-backend-modernization",
    "label": "Backend / Modernization About",
    "paragraphs": [
      "EXAMPLE: Backend + modernization focused intro."
    ]
  },

  "desktop-winforms": {
    "id": "about-desktop-winforms",
    "label": "Desktop / WinForms About",
    "paragraphs": [
      "EXAMPLE: Thick client and LOB app emphasis."
    ]
  },

  "fullstack-dotnet": {
    "id": "about-fullstack-dotnet",
    "label": "Fullstack .NET About",
    "paragraphs": [
      "EXAMPLE: End-to-end delivery emphasis."
    ]
  },

  "solution-architect": {
    "id": "about-solution-architect",
    "label": "Solution Architect About",
    "paragraphs": [
      "EXAMPLE: patterns, roadmaps, mentoring, modernization strategy."
    ]
  }
}
```

Connection to profiles:

* Each profile overlay has `aboutKey` that maps into one of these keys.
* Website:

  * Personal site default: `code-monkey` About.
  * Per-role view: About from that profile’s `aboutKey`.
* LinkedIn / PDF:

  * Select a single employer-facing profile and use its `headline` + `aboutKey` for those surfaces.

---

## 5. Profile Registry for UI & Agents

### 5.1 `profiles/index.js`

A small JS module that:

* Imports all JSON overlays.
* Exposes them as a dictionary keyed by profile ID.
* Marks default UI profile.

```js
// src/sections/resume/data/profiles/index.js
import backendModernization from './backend-modernization.json';
import desktopWinforms from './desktop-winforms.json';
import fullstackDotnet from './fullstack-dotnet.json';
import solutionArchitect from './solution-architect.json';
import codeMonkey from './code-monkey.json';

export const ProfileRegistry = {
  byId: {
    [backendModernization.id]: backendModernization,
    [desktopWinforms.id]: desktopWinforms,
    [fullstackDotnet.id]: fullstackDotnet,
    [solutionArchitect.id]: solutionArchitect,
    [codeMonkey.id]: codeMonkey
  },
  all: [
    backendModernization,
    desktopWinforms,
    fullstackDotnet,
    solutionArchitect,
    codeMonkey
  ],
  defaultProfileId: 'code-monkey'
};
```

* This keeps variants modular: adding/removing a profile is a 1-file change plus `index` wiring.
* Agents can use `ProfileRegistry.byId` to locate overlays.

---

## 6. Website Integration – Resume Switching

This section is about wiring into your existing `ResumeData` exports and resume section modules.

### 6.1 Existing `ResumeData`

`src/sections/resume/data/index.js` currently:

```js
export const ResumeData = {
    // about: $about.default,
    skills: $skills.default,
    experience: [
        $1999.default,
        $2000.default,
        ...
        $2022.default,
    ]
};
```

We extend `ResumeData` to also expose:

* `profiles` (from `ProfileRegistry`).
* `full` (optional: import from `full.json` if you want a canonical combined array).

EXAMPLE:

```js
// src/sections/resume/data/index.js
import * as $1999 from './1999-2000.json';
...
import * as $2022 from './2022.json';
import * as $skills from './skills.json';
import { ProfileRegistry } from './profiles/index.js';
import full from './full.json';          // EXAMPLE: if you choose to use it
import aboutVariants from './aboutVariants.json';

export const ResumeData = {
    skills: $skills.default,
    experience: [
        $1999.default,
        $2000.default,
        $2001.default,
        $2004.default,
        $2007.default,
        $2013.default,
        $2017.default,
        $2022.default
    ],
    full: full,                         // optional, but useful for agents
    profiles: ProfileRegistry,
    aboutVariants: aboutVariants
};
```

### 6.2 Selector behavior (resume section)

At the UI level (your existing `resume` section JS):

* Maintain a `selectedProfileId` state (default from `ProfileRegistry.defaultProfileId`).
* On profile change:

  1. Lookup overlay: `const profile = ResumeData.profiles.byId[selectedProfileId];`

  2. Build experience list:

     * Start from canonical experience list with IDs.
     * Sort/filter by `profile.experienceOrder`.
     * Apply `experienceOverrides[experience.id]` if present.

  3. Build skills list:

     * Use `profile.skillsPrimary` as the leading group.
     * Append remaining skills from canonical `skills.json` in any secondary order.

  4. About:

     * Resolve `aboutKey` → `ResumeData.aboutVariants[aboutKey].paragraphs`.

**All** of that logic happens client-side; the site stays static, as required.

---

## 7. Agent Usage Notes (How an AI Should Work With This)

This initiative is for an AI agent to operate safely on your resume system without trashing your canonical data.

1. **Golden rule:**

   * Never edit canonical job facts (`1999-2000.json`, `2000.json`, etc.) other than:

     * Adding/updating `id`.
     * Correcting factual or grammatical errors when asked.

2. **Where to create new role views:**

   * To create a new profile:

     * Copy one of the existing overlays in `src/sections/resume/data/profiles/`.
     * Change:

       * `id`, `label`, `kind`.
       * `headline`.
       * `aboutKey`.
       * `experienceOrder`.
       * `experienceOverrides`.
       * `skillsPrimary`/`skillsSecondary`.
     * Wire it into `profiles/index.js`.

3. **How to update About variants:**

   * Update `aboutVariants.json` entries:

     * `master` should remain the neutral anchor.
     * Per-profile entries must read as the same human.

4. **Where examples live vs real data:**

   * Any content inside comments labeled `EXAMPLE` in this spec is:

     * Guidance only.
     * Not to be copied verbatim into your resume unless explicitly requested.

5. **Maintenance flow (for AI + human):**

   * When a new job is added:

     1. Add new canonical job JSON + `id`.
     2. Add it to `full.json` if you want that view.
     3. Update `experienceOrder` in each relevant profile overlay.
     4. Optionally add `experienceOverrides` for that job per profile.

---

## 8. Mapping Back to the Plan

* **Workstream A (Canonical Data):**

  * Achieved primarily by adding `id` fields and optionally aligning `full.json` with those IDs.

* **Workstream B (Role Profiles):**

  * Implemented via `profiles/*.json` overlays + `ProfileRegistry`.

* **Workstream C (Website Switching):**

  * Implemented via:

    * `ResumeData.profiles` and `ResumeData.aboutVariants`.
    * UI role selector that re-renders based on the current profile overlay.

* **Workstream D (About System):**

  * Implemented via `aboutVariants.json` + `aboutKey` in each overlay.

* **Workstream E (Sanity Checks):**

  * Can be scripted or performed by an AI agent:

    * Compare overlay keywords against real job postings.
    * Validate consistency across `master` vs per-profile Abouts.
    * Exercise the update flow by adding a mock job and adjusting overlays.

---

If you want, next pass I can:

* Fill in **real** content for one profile overlay (e.g., `backend-modernization`) and one About variant set, following this schema, so you can drop it into the repo and see it live.
