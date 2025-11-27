# Initiative Plan: Multi-Variant Resume & Profile System

## 0. Meta

- **Initiative Name:** Multi-Variant Resume & Profile System
- **Primary Subject:** Zeke / Zythis
- **Scope:** Resume data, public website, and About/summary content across resumes and LinkedIn-like profiles for Zeke.
- **Time Horizon:** Iterative; can be executed in small focused passes.

---

## 1. Problem Statement

Current situation:

- A single, honest, narrative resume and a client-side GitHub Pages site exist for Zeke.
- Zeke’s real-world history fits multiple adjacent roles:
  - Senior .NET Backend / Modernization
  - Senior WinForms / Desktop .NET Developer
  - Senior Fullstack .NET Developer
  - .NET Solution Architect / Technical Architect (Modernization)
- Zeke strongly prefers to describe actual identity and behavior, not just chase titles.

Job market and ATS reality:

- Employers name roles differently and weight keywords differently, even when underlying work is similar.
- A single generic resume undersells Zeke and may fail keyword filters.
- Maintaining many completely separate resumes is unmanageable and error-prone.

Identity dimension:

- One mode should be explicitly “Zeke”:  
  an irreverent, self-aware “Code Monkey” view that shows character, not only optimization.

**Core tension:**  
Express one underlying career through multiple employer-aligned views plus one authentic “Code Monkey” view, without:

- Fragmenting identity, or
- Producing throwaway ATS bait that Zeke does not respect.

---

## 2. Desired End State (Vision)

At the end of this initiative, the following state exists:

1. **Canonical Career Data**

   - A single structured data source describes:
     - Experiences (with stable IDs, dates, companies, responsibilities).
     - Skills (with descriptions).
   - Canonical data acts as the truth; all views are projections or overlays.

2. **Five Role-Targeted Profiles (Including “Code Monkey”)**

   ### 2.1 Employer-Facing Profiles

   Each profile functions as a first-class, ATS-tuned view:

   - **Profile A:** Senior .NET Backend / Modernization  
   - **Profile B:** Senior WinForms / Desktop .NET Developer  
   - **Profile C:** Senior Fullstack .NET Developer  
   - **Profile D:** .NET Solution Architect / Technical Architect (Modernization)  

   Each employer-facing profile contains:

   - A distinct headline/title.
   - Profile-specific About/Summary paragraphs.
   - An ordered and tuned experience list (reweighting the same canonical facts).
   - Profile-specific skill ordering and emphasis.

   ### 2.2 Character / Default Profile

   - **Profile Z (“Code Monkey”):**
     - Explicitly not ATS-optimized.
     - Uses “Code Monkey” as an honest, self-deprecating characterization.
     - Expresses:
       - Systems brain, puzzle focus, refactor instincts, and legacy-wrangling tendencies.
       - Discomfort with corporate theater and empty buzzwords.
       - Real history, communicated in Zeke’s natural tone.

   “Code Monkey” functions as:

   - Default display on the personal site (for human readers).
   - Baseline identity from which employer-facing profiles are derived.
   - Explicit “this is the real developer behind the variants” view.

3. **Website Role Switcher**

   - The GitHub Pages site exposes a role selector (dropdown or tabs) in the resume section.
   - Switching the active profile:
     - Updates headline and summary.
     - Reorders and rephrases experience bullets as defined per profile.
     - Reorders/prioritizes skills according to the active profile.
   - All behavior runs fully client-side, sourced from canonical resume data plus profile overlays.
   - Default active profile on page load is **Code Monkey (Profile Z)**.

4. **Aligned About System**

   - A **Master About** exists, expressing core identity in neutral terms:
     - Systems thinking.
     - Legacy → modernizer.
     - Self-taught, long-arc .NET engineer.
     - Ethics and refactoring mindset.
   - Profile-specific About variants exist that:
     - Preserve core story and values.
     - Emphasize different facets (backend, desktop, fullstack, architect).
   - A **Code Monkey About** exists that:
     - Uses natural, irreverent voice.
     - Frames Zeke as a “high-end code monkey with strong opinions.”
   - A simple mapping exists from context to About variant:
     - Website default: Code Monkey About.
     - Website per-role: profile-specific About.
     - Resumes and LinkedIn: selected employer-facing About.

5. **Repeatable Update Process**

   - When a new role, skill, or story appears:
     - Canonical data is updated first.
     - Overlays in relevant profiles are adjusted as needed.
   - Profiles behave as generated views rather than independent, drifting documents.

---

## 3. Goals

### 3.1 Primary Goals

1. **Market Fit Without Self-Betrayal**

   - Employer-facing profiles reflect real work and are expressed in employer-native titles.
   - Application-ready profiles exist for:
     - Modernization-heavy .NET roles.
     - WinForms/desktop roles.
     - Fullstack .NET roles.
     - Architect / technical lead roles.
   - Code Monkey profile remains an anchor for authenticity and character.

2. **Single Source of Truth**

   - Experiences and skills exist in a single canonical store.
   - Role profiles only overlay, reorder, and selectively rephrase canonical content.

3. **Clear Role Modes**

   - Each profile represents a deliberate mode:
     - Senior Backend Modernization.
     - Desktop/WinForms.
     - Fullstack.
     - Architect.
     - Code Monkey.
   - Context determines which mode is used; confusion between modes is minimized.

4. **Assistant-Friendly Plan Document**

   - This file acts as:
     - A stable specification for the initiative.
     - A prompt anchor for code assistants (e.g., Codex).
     - A control panel to maintain coherence in scope and intent.

### 3.2 Secondary Goals

1. **Minimal Identity Fragmentation**

   - All profiles share the same ethical core and technical throughline.
   - Differences between profiles are limited to emphasis, vocabulary, and tone.
   - Code Monkey profile explicitly demonstrates that optimized variants are views on a single identity.

2. **Ease of Maintenance**

   - New role variants (for example, cloud-heavy architect) can be added by copying and adapting existing overlays.
   - Canonical data remains authoritative and minimal; overlays remain lightweight.

---

## 4. Non-Goals

- No attempt to build a generic resume platform for other individuals.
- No attempt to optimize for every ATS vendor’s quirks.
- No plan to rewrite the entire portfolio or create new work samples.
- No inclusion of full job search or outreach strategy.
- No conversion of “Code Monkey” into ATS theater; that profile remains human-focused.

---

## 5. Workstreams

### 5.1 Workstream A – Canonical Resume Data

**Objective:**  
Normalize Zeke’s career history and skills into a single structured data model.

**High-level modeling decisions:**

- **Experiences:**
  - Each job receives a stable ID (for example, `"storable"`, `"iadvantage"`, `"prestage"`).
  - Each job object contains:
    - Company, historical title, location, remote flag.
    - Dates (start and end).
    - Base description bullets (neutral, factual, non-profile-specific).

- **Skills:**
  - Each skill object contains:
    - Name.
    - Short description.
    - Optional category tags (backend, UI, architecture, testing, etc.).

**Definition of Done (Workstream A):**

- [ ] Every major job in Zeke’s history appears as one structured experience object with a stable ID.
- [ ] Each experience object contains:
  - [ ] Historical title as actually used.
  - [ ] At least 3–5 neutral, factual bullets.
- [ ] Skills list is normalized and de-duplicated.
- [ ] Canonical data resides in one location (for example, a `resumeData` module or JSON group) and serves as the only truth source.

---

### 5.2 Workstream B – Role Profiles (Overlays, Including “Code Monkey”)

**Objective:**  
Define five profiles as structured overlays on top of canonical data.

**Profiles:**

1. `profileZ`: Code Monkey (default / character profile)  
2. `profileA`: Senior .NET Backend / Modernization  
3. `profileB`: Senior WinForms / Desktop .NET Developer  
4. `profileC`: Senior Fullstack .NET Developer  
5. `profileD`: .NET Solution Architect / Technical Architect (Modernization)

**For each profile, define:**

- Profile ID (for example, `profileA`).
- Title/headline string:
  - Employer-native for `profileA`–`profileD`.
  - Character-driven but comprehensible for `profileZ` (“Code Monkey”).
- Profile-specific summary/About (2–4 sentences).
- Experience ordering:
  - An ordered list of experience IDs that best sells that profile.
- Optional experience overrides:
  - Role-tuned title (for example, “Senior .NET Backend Engineer” instead of “Software Engineer II”) where defensible.
  - Role-specific bullet sets derived from canonical facts.
- Skill priorities:
  - A list of skill names that should surface first in the profile view.

**Additional constraints for Code Monkey (Profile Z):**

- Code Monkey profile must:
  - [ ] Provide an authentic, characterful representation of Zeke as a developer.
  - [ ] Explicitly reference patterns such as:
        puzzle orientation, refactoring, enjoyment of legacy messes, and skepticism toward corporate theater.
  - [ ] Use more conversational and blunt language, while remaining accurate.
- Code Monkey profile must not:
  - [ ] Downplay competence to the point of distortion.
  - [ ] Attempt ATS-style keyword stuffing.

**Definition of Done (Workstream B):**

For each of the five profiles:

- [ ] A concise title string is defined.
- [ ] A profile-specific summary/About is written that:
  - [ ] Uses relevant role-specific keywords for employer-facing profiles.
  - [ ] Uses Zeke’s authentic voice for Code Monkey.
- [ ] An explicit experience ordering exists.
- [ ] Required experience overrides are defined:
  - [ ] Titles updated where truthful and helpful.
  - [ ] Bullets rephrased for emphasis, not altered in substance.
- [ ] A prioritized skill list exists that aligns with profile focus.

Global:

- [ ] All profile configurations reside in a single profile-variants data structure.
- [ ] No profile configuration requires fabricating or misrepresenting historical facts.

---

### 5.3 Workstream C – Website Resume Switching

**Objective:**  
Expose role profiles on Zeke’s GitHub Pages resume section without duplicating content.

**High-level behavior:**

- A role selector (dropdown or tab component) appears at the top of the resume section.
- When the active profile changes:
  - Headline and summary text update.
  - Experience list re-renders according to profile ordering and overrides.
  - Skills list re-renders according to profile skill priorities.
- Implementation operates entirely client-side, using the existing component and DOM abstraction.
- Default profile on initial page load is `profileZ` (Code Monkey).

**Definition of Done (Workstream C):**

- [ ] Role selector UI exists and functions on the resume page.
- [ ] Default selection is Code Monkey (`profileZ`).
- [ ] Switching profiles updates:
  - [ ] Headline text.
  - [ ] Summary/About text.
  - [ ] Experience cards (order and bullet content).
  - [ ] Skills layout and ordering.
- [ ] Logic reads from:
  - [ ] Canonical resume data.
  - [ ] Profile variants overlay (including Code Monkey).
- [ ] No large resume blocks are duplicated in the UI layer.
- [ ] Site continues to run fully static and client-side on GitHub Pages.

---

### 5.4 Workstream D – About System (Resume, LinkedIn, and Site)

**Objective:**  
Align the About narrative across multiple surfaces while respecting core identity and Code Monkey tone.

**Surfaces:**

1. **Master About (Neutral)**

   - Describes Zeke in neutral, professional terms:
     - Systems thinker.
     - Legacy-to-modernization specialist.
     - Self-taught, long-tenure .NET engineer.
     - Emphasis on maintainability, refactoring, and ethics.

2. **Code Monkey About (Character Default)**

   - Uses the Code Monkey concept to:
     - Describe a high-end “code monkey” who enjoys puzzles and refactoring.
     - Admit enjoyment of being dropped into messy systems and making them sane.
     - Express stances on power, responsibility, and technical ethics in natural language.

3. **Per-Profile About Variants (Employer-Facing)**

   - Derived from Master About; each variant shifts emphasis:
     - Backend/modernization profile: refactoring, services, data, performance.
     - WinForms/desktop profile: thick-client LOB apps, UX flows, desktop modernization.
     - Fullstack profile: end-to-end ownership across UI, APIs, and data.
     - Architect profile: solution design, patterns, roadmaps, mentoring, modernization strategy.

4. **LinkedIn / Public Profile Strategy**

   - One employer-facing profile is designated as the active LinkedIn persona at a time.
   - Headline and LinkedIn About text derive from the chosen profile.
   - Local copies of:
     - Code Monkey About.
     - Four employer-facing Abouts.
     are maintained and easily swappable for LinkedIn, PDFs, and job portals.

**Definition of Done (Workstream D):**

- [ ] Master About text exists and feels stable and accurate.
- [ ] Code Monkey About text exists and:
  - [ ] Reflects Zeke’s natural tone and humor.
  - [ ] Demonstrates competence and values clearly.
- [ ] Four employer-facing About variants exist and:
  - [ ] Read as the same person emphasizing different dimensions.
- [ ] A simple strategy exists:
  - [ ] Mapping from active job search focus → selected employer-facing profile → LinkedIn headline/About choice.
- [ ] All About texts are stored in the same profile-variants structure used for resumes and website rendering.

---

### 5.5 Workstream E – Sanity Checks & Calibration

**Objective:**  
Ensure profiles are practically useful and not merely aesthetic variations.

**Checks:**

- **Keyword sanity for employer-facing profiles (A–D):**
  - For each employer-facing profile, compare profile content with a small set of real job postings for that role type.
  - Ensure key terms appear in headline, summary, and recent experience bullets.
- **Character sanity for Code Monkey (Profile Z):**
  - Read Code Monkey profile view:
    - Confirm that the view feels like a recognizable, honest depiction of Zeke.
    - Confirm that the view is presentable to a hiring manager aligned with similar values.
- **Consistency sanity across profiles:**
  - Read all five profiles sequentially:
    - Confirm that all profiles clearly refer to the same developer.
    - Confirm that differences are intentional shifts in emphasis.
- **Maintenance sanity:**
  - Perform a small mock update:
    - For example, add a hypothetical new role to canonical data.
    - Validate that the update process into overlays is straightforward.

**Definition of Done (Workstream E):**

- [ ] Each employer-facing profile passes a keyword sanity check against live job postings.
- [ ] Code Monkey profile passes a tone and authenticity review.
- [ ] A consistency pass across profiles confirms a single coherent identity.
- [ ] A simple, repeatable procedure exists for:
  - [ ] Adding a new job.
  - [ ] Updating overlays in at least one profile (including Code Monkey).
- [ ] Confidence exists in using:
  - [ ] Code Monkey on the personal site.
  - [ ] At least one employer-facing profile in LinkedIn and resume PDFs.

---

## 6. Risks / Constraints

- **Risk: Overfitting to ATS noise**
  - Mitigation: Employer-facing profiles stay grounded in real work and avoid extreme keyword stuffing.

- **Risk: Identity fragmentation**
  - Mitigation:
    - Master About and Code Monkey About act as identity anchors.
    - All overlays draw from a single canonical data model.

- **Risk: Maintenance fatigue**
  - Mitigation:
    - Single-source-of-truth enforced.
    - Overlays explicitly documented and kept minimal.
    - Code Monkey profile used to preserve motivation and authenticity.

---

## 7. Open Questions / Items for Further Refinement

- [ ] Precise naming of employer-facing profiles (for example, whether “Modernization” appears in all relevant titles).
- [ ] Final tone calibration for Code Monkey label (strong sarcasm vs softer self-deprecation).
- [ ] Decision on how strongly to surface cloud-related skills (for example, Azure, Azure DevOps) in architect profiles.
- [ ] Balance between legacy technologies (for example, WebForms) and more modern stack emphasis.

---

## 8. Immediate Next Actions

1. **Canonical Data Construction**

   - [ ] List all significant jobs with provisional IDs.
   - [ ] Create a neutral experience object for each job.
   - [ ] Populate canonical skill list with deduplicated entries.

2. **Profile ID and Skeleton Setup**

   - [ ] Define IDs for five profiles: `profileZ`, `profileA`, `profileB`, `profileC`, `profileD`.
   - [ ] Create an initial profile-variants data file with empty or placeholder fields.

3. **First Profile Authoring**

   - Recommended first candidates:
     - `profileZ` (Code Monkey) for identity anchoring, or
     - `profileA` (Senior .NET Backend / Modernization) for broad job-market utility.
   - [ ] Draft title/headline.
   - [ ] Draft About/summary.
   - [ ] Define experience ordering.
   - [ ] Draft overridden bullets for top two or three anchor roles.

4. **Website Role Selector Skeleton**

   - [ ] Add a static role selector UI element in the resume section.
   - [ ] Wire basic selection state without rendering logic.
   - [ ] Ensure default visible option corresponds to Code Monkey profile.

5. **About Variants Data Structure**

   - [ ] Extend profile-variants data to include:
     - Master About text.
     - Code Monkey About text.
     - Employer-facing About variants.
   - [ ] Author Master About and Code Monkey About as initial entries.

Subsequent iterations can then fill out the remaining profiles, refine bullets, and complete full website integration.
