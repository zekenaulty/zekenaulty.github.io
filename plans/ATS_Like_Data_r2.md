Below is a **data spec** for the Multi-Variant Resume & Profile System, designed for:

* A JS-only, fully client-side React site (GitHub Pages).
* Use by both humans and AI agents.
* High structure, strong meta, and clear extension points.

Code and JSON blocks are **examples**, not templates. They are safe to copy and adapt, but should not be treated as the only valid shape.

---

# Data Spec: Multi-Variant Resume & Profile System

## 0. Meta

* **Initiative:** Multi-Variant Resume & Profile System
* **Primary Subject:** Zeke / Zythis
* **Scope:**

  * Canonical resume data (jobs, skills, long-form About).
  * Profile overlays (Code Monkey + 4 employer-facing roles).
  * About variants tied to profiles.
  * Role-aware rendering for the public site and external profiles (PDF, LinkedIn).
* **Consumers:**

  * React UI components (fully client-side).
  * AI agents assisting with resume/profile editing and generation.

---

## 1. Canonical Resume Data

Canonical data is the **single source of truth**. All profiles are views on this data.

### 1.1 Canonical Experience Objects

Location: `src/sections/resume/data/*.json` and `full.json` (already present).

Each job is a canonical experience object. The only required structural change is a stable ID.

**Example canonical job (EXAMPLE ONLY):**

```jsonc
{
  "id": "storable", // STABLE, HUMAN-MEANINGFUL ID
  "title": "Software Engineer II",
  "company": "Storable",
  "location": "Remote",
  "remote": true,
  "dates": {
    "start": "2021-03-01",
    "end": "2022-11-30"
  },
  "description": [
    "Developed and maintained .NET WinForms and web applications for self-storage insurance products.",
    "Built backend services in .NET Core with Hangfire and PostgreSQL to support insurance auto-protect features.",
    "Established patterns for unit testing WinForms and contributed to domain-driven design initiatives."
  ]
}
```

**Canonical guarantees:**

* Every experience object MUST have:

  * `id: string` (stable; referenced by overlays).
  * `title: string` (historical title).
  * `company: string`.
  * `dates.start`, `dates.end`: ISO-8601-ish strings.
  * `description: string[]` neutral, factual bullets.
* Optional but recommended:

  * `location: string`.
  * `remote: boolean`.

The set of canonical IDs is a small, explicit vocabulary (EXAMPLE):

```ts
type ExperienceId =
  | "litton-avondale"
  | "hancock-whitney"
  | "rainmaker"
  | "pk-promotions"
  | "not-rocket-science"
  | "solid-earth"
  | "rural-sourcing"
  | "prestage-farms"
  | "iadvantage"
  | "storable";
```

AI agents should only introduce new IDs with a clear naming convention and a human-visible explanation.

### 1.2 Canonical Skills

Location: `src/sections/resume/data/skills.json`.

Each skill is a canonical, reusable object.

**Example canonical skill (EXAMPLE ONLY):**

```jsonc
{
  "name": "C#",
  "description": "Development of backend services, desktop applications, and fullstack solutions using C# and .NET.",
  "categories": ["backend", "desktop", "fullstack"]
}
```

Canonical guarantees:

* `name: string` – used as the key in profile overlays.
* `description: string` – brief, factual.
* `categories?: string[]` – optional tags (backend, UI, architecture, testing, etc.).

---

## 2. Profile Overlays (Role Views)

Profiles are **overlays** that:

* Reorder canonical jobs.
* Optionally override titles and bullets per job.
* Reorder and prioritize skills.
* Attach a profile-specific headline and About key.

There are five core profiles:

* `profileZ` → Code Monkey (character / default)
* `profileBackend` → Senior .NET Backend / Modernization
* `profileDesktop` → Senior WinForms / Desktop .NET Developer
* `profileFullstack` → Senior Fullstack .NET Developer
* `profileArchitect` → .NET Solution Architect / Technical Architect

### 2.1 File Layout for Profiles

Location: `src/sections/resume/data/profiles/`

**Example layout (EXAMPLE ONLY):**

```text
src/sections/resume/data/profiles/
  code-monkey.json
  backend-modernization.json
  desktop-winforms.json
  fullstack-dotnet.json
  solution-architect.json
  index.js
```

Each `*.json` file defines one profile overlay.

### 2.2 Profile Overlay Schema

Each profile overlay file uses the same schema.

**Profile overlay schema (EXAMPLE ONLY):**

```jsonc
{
  "id": "backend-modernization",       // PROFILE ID
  "label": "Senior .NET Backend / Modernization",
  "kind": "employer-facing",           // "employer-facing" | "character"

  "headline": "Senior .NET Backend Engineer – Legacy to Modern Cloud Backends",

  // Key into About variants (see Section 3)
  "aboutKey": "about-backend-modernization",

  // 1) Experience ordering: list of ExperienceId
  "experienceOrder": [
    "storable",
    "iadvantage",
    "rural-sourcing",
    "solid-earth",
    "prestage-farms",
    "not-rocket-science"
  ],

  // 2) Per-experience overrides (by ExperienceId)
  "experienceOverrides": {
    "storable": {
      "title": "Senior .NET Backend Engineer",
      "emphasisTags": ["backend", "modernization", "insurance"],

      // Optional replacement bullets for this profile.
      // If omitted, canonical description[] is used.
      "description": [
        "EXAMPLE: Focused on .NET Core services and background processing for self-storage insurance automation.",
        "EXAMPLE: Implemented robust Hangfire-based scheduling and tightened telemetry for production reliability."
      ]
    },

    "solid-earth": {
      "title": "Senior .NET Developer / MLS Platform Modernization"
      // No description: use canonical bullets.
    }
  },

  // 3) Skills priorities: names must exist in skills.json
  "skillsPrimary": [
    "C#",
    ".NET Core",
    "ASP.Net WebAPI",
    "Entity Framework",
    "SQL Server",
    "PostgreSQL",
    "Azure DevOps"
  ],

  "skillsSecondary": [
    "WinForms",
    "AngularJS",
    "REST APIs",
    "Unit Testing",
    "Domain-driven design"
  ],

  // Optional: arbitrary tags for agents, not for UI rendering
  "tags": ["backend", "modernization", "migration", "cloud"]
}
```

**Code Monkey profile (EXAMPLE ONLY):**

```jsonc
{
  "id": "code-monkey",
  "label": "Code Monkey (Default)",
  "kind": "character",

  "headline": "High-End Code Monkey Who Fixes Broken Systems",
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
        "EXAMPLE: Dropped into a WinForms + .NET Core hybrid and made the backend behave like a grown-up service.",
        "EXAMPLE: Taught a legacy-heavy team how to ship changes without fear by introducing practical unit testing."
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
    "Debugging"
  ],

  "tags": ["character", "authentic", "irreverent"]
}
```

**Profile invariants:**

* `id` is unique across profiles and stable.
* `experienceOrder` can be a subset or full set of canonical IDs; jobs not listed can be omitted from that profile’s UI.
* `experienceOverrides`:

  * If `description` provided, it replaces canonical bullets for that profile.
  * If not provided, canonical `description` is used directly.
* `skillsPrimary` and `skillsSecondary` are ordered lists that control front-of-page visibility; they do not modify canonical skills data.

---

## 3. About / Summary Variants

About variants provide **short-form narrative** for each mode, separate from the long narrative About already in `aboutMe.json`.

### 3.1 About Variants File

Location: `src/sections/resume/data/aboutVariants.json`

**Schema (EXAMPLE ONLY):**

```jsonc
{
  "master": {
    "id": "about-master",
    "label": "Master About (Neutral)",
    "paragraphs": [
      "EXAMPLE: Neutral, professional multi-paragraph overview.",
      "EXAMPLE: Focus on systems thinking, modernization, and ethics."
    ]
  },

  "about-code-monkey": {
    "id": "about-code-monkey",
    "label": "Code Monkey About",
    "paragraphs": [
      "EXAMPLE: Blunt, character-driven About written in your natural voice."
    ]
  },

  "about-backend-modernization": {
    "id": "about-backend-modernization",
    "label": "Backend / Modernization About",
    "paragraphs": [
      "EXAMPLE: Backend-focused summary emphasizing services, migrations, and performance."
    ]
  },

  "about-desktop-winforms": {
    "id": "about-desktop-winforms",
    "label": "Desktop / WinForms About",
    "paragraphs": [
      "EXAMPLE: Thick-client, LOB-flow, and desktop modernization emphasis."
    ]
  },

  "about-fullstack-dotnet": {
    "id": "about-fullstack-dotnet",
    "label": "Fullstack .NET About",
    "paragraphs": [
      "EXAMPLE: End-to-end ownership across UI, API, and data."
    ]
  },

  "about-solution-architect": {
    "id": "about-solution-architect",
    "label": "Solution Architect About",
    "paragraphs": [
      "EXAMPLE: Patterns, roadmaps, mentoring, and modernization strategy."
    ]
  }
}
```

**Link to profiles:**

* Each profile overlay’s `aboutKey` must match one key in this file.
* For the personal site:

  * Default view uses `about-code-monkey`.
* For employer-facing PDFs/LinkedIn:

  * Use the chosen profile’s `headline` + its `aboutKey` paragraphs.

---

## 4. Aggregation & Access Layer

To keep React components and agents from dealing with multiple file locations directly, a small JS module acts as the access layer.

### 4.1 `src/sections/resume/data/profiles/index.js`

**Example (EXAMPLE ONLY):**

```js
import backendModernization from "./backend-modernization.json";
import desktopWinforms from "./desktop-winforms.json";
import fullstackDotnet from "./fullstack-dotnet.json";
import solutionArchitect from "./solution-architect.json";
import codeMonkey from "./code-monkey.json";

export const ProfileRegistry = {
  all: [
    backendModernization,
    desktopWinforms,
    fullstackDotnet,
    solutionArchitect,
    codeMonkey
  ],
  byId: {
    [backendModernization.id]: backendModernization,
    [desktopWinforms.id]: desktopWinforms,
    [fullstackDotnet.id]: fullstackDotnet,
    [solutionArchitect.id]: solutionArchitect,
    [codeMonkey.id]: codeMonkey
  },
  defaultProfileId: "code-monkey"
};
```

### 4.2 Extending `ResumeData`

Location: `src/sections/resume/data/index.js`

**Example (EXAMPLE ONLY):**

```js
import * as $1999 from "./1999-2000.json";
import * as $2000 from "./2000.json";
import * as $2001 from "./2001.json";
import * as $2004 from "./2004-2005.json";
import * as $2007 from "./2007-2011.json";
import * as $2013 from "./2013-2016.json";
import * as $2017 from "./2017-2021.json";
import * as $2022 from "./2022.json";
import * as $skills from "./skills.json";
import full from "./full.json";
import aboutVariants from "./aboutVariants.json";
import { ProfileRegistry } from "./profiles";

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
  full,
  profiles: ProfileRegistry,
  aboutVariants
};
```

Consumers (UI or agents) then have:

* `ResumeData.experience` → canonical chunked jobs.
* `ResumeData.skills` → canonical skills.
* `ResumeData.profiles` → overlays and default profile.
* `ResumeData.aboutVariants` → About text keyed by `aboutKey`.

---

## 5. Role-Aware Rendering Contract (for UI & Agents)

This is the semantic contract: given a profile ID, how to construct the rendered view.

### 5.1 Inputs

* `ResumeData` (as defined above).
* `profileId: string` (e.g., `"code-monkey"`, `"backend-modernization"`).

### 5.2 Derived View (Conceptual)

**Derived view fields:**

* `headline: string` – from `profile.headline`.
* `aboutParagraphs: string[]` – from `aboutVariants[profile.aboutKey].paragraphs`.
* `experiences: ExperienceView[]` – canonical jobs adjusted by overlay.
* `skillsPrimary: Skill[]` – canonical skills filtered & ordered by `profile.skillsPrimary`.
* `skillsSecondary: Skill[]` – canonical skills filtered & ordered by `profile.skillsSecondary`.
* `skillsOther: Skill[]` – remaining canonical skills.

`ExperienceView`:

* Same shape as canonical experience objects, but with:

  * `title` possibly overridden.
  * `description` possibly replaced.

### 5.3 Example derivation logic (EXAMPLE ONLY)

This is not required in the spec, but documents the expected transformation for agents and React components.

```ts
function deriveProfileView(ResumeData, profileId: string) {
  const profile = ResumeData.profiles.byId[profileId];
  const about = ResumeData.aboutVariants[profile.aboutKey];

  // Build experience map
  const experienceById = new Map<string, any>();
  for (const chunk of ResumeData.experience) {
    const list = Array.isArray(chunk) ? chunk : [chunk];
    for (const job of list) {
      experienceById.set(job.id, job);
    }
  }

  const orderedExperiences: any[] = [];
  for (const expId of profile.experienceOrder) {
    const base = experienceById.get(expId);
    if (!base) continue;

    const override = profile.experienceOverrides?.[expId];
    if (!override) {
      orderedExperiences.push(base);
      continue;
    }

    const merged = { ...base };

    if (override.title) merged.title = override.title;
    if (override.description) merged.description = override.description;

    orderedExperiences.push(merged);
  }

  const allSkills = ResumeData.skills || [];
  const primaryNames = new Set(profile.skillsPrimary || []);
  const secondaryNames = new Set(profile.skillsSecondary || []);

  const skillsPrimary: any[] = [];
  const skillsSecondary: any[] = [];
  const skillsOther: any[] = [];

  for (const skill of allSkills) {
    if (primaryNames.has(skill.name)) skillsPrimary.push(skill);
    else if (secondaryNames.has(skill.name)) skillsSecondary.push(skill);
    else skillsOther.push(skill);
  }

  return {
    profile,
    headline: profile.headline,
    aboutParagraphs: about?.paragraphs ?? [],
    experiences: orderedExperiences,
    skillsPrimary,
    skillsSecondary,
    skillsOther
  };
}
```

---

## 6. Extension Points

Explicit places where new data or behavior can be safely added:

1. **New job:**

   * Add a canonical experience object with a new `id` into the appropriate year JSON and `full.json`.
   * Optionally add that `id` to relevant `experienceOrder` arrays and `experienceOverrides` in profile overlays.

2. **New profile:**

   * Create `src/sections/resume/data/profiles/<new-profile>.json` following the overlay schema.
   * Add it into `profiles/index.js` registry.
   * Optionally add a dedicated About entry in `aboutVariants.json` and reference via `aboutKey`.

3. **New About variant:**

   * Add a new entry to `aboutVariants.json`.
   * Point one or more profile overlays’ `aboutKey` at it.

4. **New skill:**

   * Add to `skills.json`.
   * Reference in `skillsPrimary` / `skillsSecondary` as needed.

---

This spec defines the data structures and contracts necessary to fulfill the initiative plan: canonical truth, multiple employer-facing views, a Code Monkey character view, and a consistent About system wired into a client-side resume switcher, with clear surfaces for AI agents to operate on without corrupting canonical history.
