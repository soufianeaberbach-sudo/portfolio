# Portfolio Roadmap

**Project:** Soufiane Aberbach Portfolio  
**Document type:** Operating roadmap  
**Status:** Approved working roadmap  
**Scope:** Portfolio experience  
**Creative reference:** `docs/portfolio/CREATIVE-DIRECTION.md`

---

## 1. Purpose

This file is the operating map for the Portfolio.

`CREATIVE-DIRECTION.md` answers:

> What are we trying to create, why does it matter, and what should the Portfolio feel like?

This file answers:

> Where are we now, what is approved, what is experimental, what comes next, and how do we work?

It should remain concise, current and operational.

---

## 2. Current Project State

### Stable main

Current stable `main` SHA:

`d51cda278909a160c5f489af91ed051052ffc48f`

This is the stable project baseline until a new Portfolio direction is both visually and technically approved.

It is not considered the final Portfolio design.

### Creative direction

The approved creative north star is:

`docs/portfolio/CREATIVE-DIRECTION.md`

Documentation branch:

`docs/portfolio-creative-direction`

Current documentation commit:

`ee16c65`

### Latest experimental design branch

Branch:

`codex/portfolio-cutting-table-redesign`

Latest experimental commit:

`3de2642ccd65f67d07f8365200e08f73e96694d4`

Status:

**EXPERIMENTAL — NOT VISUALLY APPROVED**

This commit must not be treated as the approved design simply because it is the latest implementation or because tests passed.

The old “cutting-table” concept is not part of the current approved creative direction.

---

## 3. Approval Model

No Portfolio experiment becomes the baseline automatically.

The required sequence is:

**Visual concept → Browser result → Screenshots → Human review → Visual approval → Engineering QA → Baseline / Merge**

Passing build, tests, accessibility checks or Playwright checks does not by itself prove that the design is successful.

Likewise, a strong screenshot is not production-ready until engineering QA is complete.

Creative approval and engineering approval are separate gates.

---

## 4. Source of Truth

**GitHub is the project source of truth.**

Do not rely on a design or implementation that exists only in a local Desktop workspace.

Any meaningful candidate should be identifiable through:

- branch
- commit SHA
- diff
- reviewable browser result and/or screenshots

Every new agent task should start from an explicitly identified base commit or branch.

---

## 5. Current Phase

# CURRENT PHASE: REFERENCE HARVEST

We are not currently in a new coding phase.

The immediate objective is to gather and analyse strong visual and interaction references before asking an agent to invent another design from a blank prompt.

The first research target is:

**Portfolio Opening + discovery of the four Portfolio worlds**

---

## 6. Reference Harvest

Research may draw from:

- Behance
- Awwwards
- Codrops
- developer portfolios
- fashion websites
- editorial websites
- luxury digital experiences
- interactive web projects
- film / title-sequence thinking
- technical and documentation interfaces

The goal is not to find websites that look exactly like this Portfolio.

The goal is to find strong solutions to specific design problems, including:

- powerful openings
- typography / image relationships
- cinematic scroll
- chapter discovery
- unexpected portfolio navigation
- image-to-project transitions
- presentation of large bodies of work
- document interaction
- visualising transformation
- surprising but usable interactions

---

## 7. How References Are Used

A reference is not selected because “the whole website is beautiful.”

For each useful reference, identify the exact idea worth learning from.

Examples:

**Reference A**  
Use: image entrance.

**Reference B**  
Use: typography / image tension.

**Reference C**  
Use: chapter navigation.

**Reference D**  
Use: pacing between scenes.

**Reference E**  
Use: turning technical content into a visual experience.

The next step is synthesis:

**Study → isolate → combine → adapt → create**

Do not copy one complete reference.

---

## 8. Portfolio Phases

| Phase | Status | Purpose |
|---|---|---|
| Creative Direction | ✅ Complete | Establish the north star |
| Documentation Structure | 🟡 Current | Organise durable project references |
| Reference Harvest | ⏭ Next active work | Build the inspiration and interaction vocabulary |
| Opening / First Impression | ⬜ | Design the first scene |
| Portfolio Worlds | ⬜ | Discover Womenswear / Menswear / Tech Packs / Pattern Development |
| Womenswear & Menswear Discovery | ⬜ | Build the work-discovery experience |
| Garment Viewer Integration | ⬜ | Improve entry and continuity around the existing Viewer |
| Evidence / Look → Inspect | ⬜ | Reveal technical depth progressively |
| Tech Packs | ⬜ | Build the documentation experience |
| Pattern Development | ⬜ | Build the strongest transformation experience |
| Ending / Conversion | ⬜ | Close with confidence and a clear next action |
| Full Integration | ⬜ | Unify scenes and transitions |
| Engineering QA | ⬜ | Responsive, accessibility, performance, reduced motion, tests |
| Final Approval | ⬜ | Final design and product review |
| Merge / Deploy | ⬜ | Only after approval |

---

## 9. Working Method for Each Creative Phase

Every major design phase follows the same sequence.

### 1. Research
Define the problem and gather relevant references.

### 2. Concept
Define what the visitor should feel, understand or discover.

Do not start with CSS.

### 3. Visual Pass
The agent implements only the current scene or problem.

Do not redesign the entire Portfolio in the same task.

### 4. Review
After the visual pass is complete:

- run one focused checklist
- review the browser result
- capture only the screenshots needed for the decision
- compare the result against the creative direction
- perform one focused refinement pass where necessary

### 5. Human Approval
The design is reviewed before deeper engineering work.

If the direction is wrong, reject or redirect it early.

Do not spend hours polishing a concept that will not be used.

### 6. Engineering
Only after visual approval:

- responsive refinement
- accessibility
- reduced motion
- performance
- tests
- cleanup
- Git review

---

## 10. Agent Prompting Rule

Future task prompts should remain short.

Agents should first read:

`docs/portfolio/CREATIVE-DIRECTION.md`

and:

`docs/portfolio/ROADMAP.md`

The task prompt should then describe only the current problem.

Example:

> We are working on the Portfolio Opening phase. Read the Creative Direction and Roadmap first. Use the approved references attached to this task. Design only the Opening. Do not continue into later Portfolio phases.

Do not paste the complete Creative Direction into every prompt.

Do not combine design, backend, global QA and unrelated work in one task.

---

## 11. Creative Freedom

During a creative task, the agent may explore:

- composition
- layout
- motion
- crop
- typography placement
- interaction
- technical implementation
- scroll choreography
- scene structure
- responsive interpretation

The agent may propose a stronger solution than one previously discussed.

Creative freedom does not include:

- inventing content
- changing factual claims
- fabricating evidence
- breaking proven core functions without reason
- redesigning areas outside the current task scope
- declaring its own work visually approved

The agent proposes and implements.

Human review approves or rejects.

---

## 12. Protected Core: Garment Viewer

The existing Garment Viewer is a **protected core system**.

It is not permanently frozen, but it should not be rebuilt casually for visual consistency.

Existing useful behaviour should be preserved unless a future task demonstrates that a change materially improves the experience.

Priority areas around the Viewer are:

- entry into the Viewer
- continuity from garment discovery
- presentation
- progressive evidence around the Viewer

---

## 13. Content Integrity

Portfolio content must remain truthful.

Do not fabricate:

- sketches
- patterns
- technical documents
- development stages
- client work
- authorship

Reference or demo material must not be presented as original authored work.

**Content drives layout.  
Layout does not fabricate content.**

---

## 14. Testing Strategy

During early visual exploration:

Do not run the full repository test suite after every small design change.

Use only the level of verification needed to confirm that the current scene functions and can be reviewed.

After visual approval:

Run the appropriate engineering QA comprehensively.

The purpose is to avoid spending large amounts of time validating a visual direction before we know whether we want to keep it.

---

## 15. Screenshot Strategy

Screenshots are decision tools, not a fixed bureaucratic deliverable.

Capture the minimum set needed to judge the current scene.

For example, an Opening task may require:

- desktop opening
- desktop interaction / transition state
- mobile opening

Add more only when they help answer a real design question.

Do not request large screenshot matrices automatically.

---

## 16. Branch Strategy

Major design experiments should use isolated branches.

Do not experiment directly on `main`.

When two genuinely strong concepts deserve comparison, create them from the same approved base rather than endlessly modifying one experiment.

Prefer:

**Concept A vs Concept B**

over:

**Concept A → patch → patch → patch → lost original direction**

---

## 17. Status Definitions

### EXPERIMENTAL
Implemented, but not approved.

### VISUALLY APPROVED
Human review accepts the creative result.

### ENGINEERING APPROVED
Responsive, accessibility, performance and relevant tests are accepted.

### BASELINE
Both visual and engineering approval are complete. Future work may safely build from this version.

### DONE
Creative intent, visual approval and engineering stability are all complete.

“Agent completed,” “tests passed,” or “commit pushed” alone do not mean DONE.

---

## 18. Rules We Are Retiring

Do not:

- start major creative work from a blank “be creative” prompt when reference research would help
- assign the entire Portfolio redesign in one task
- combine Art Direction, Git, backend, accessibility, QA and multiple design scenes in one long prompt
- treat tests as proof of visual success
- treat the latest commit as the best commit by default
- build the next phase on top of a scene that has not been visually approved
- repeat the same validation instruction after every small implementation detail

---

## 19. Immediate Next Action

# REFERENCE HARVEST — ROUND 1

Research focus:

**Portfolio Opening + discovery of the four Portfolio worlds**

The output should be an analytical reference board, not a generic inspiration list.

For each selected reference, capture:

- source / project
- what is worth learning from it
- the exact interaction or composition principle
- why it may fit this Portfolio
- what should not be copied
- whether it can combine with another selected idea

The research should then produce a small number of promising design directions for the Opening.

No new Opening implementation should begin before this research is reviewed.

---

# Operating Principle

## Research before invention.
## One creative problem at a time.
## Visual approval before heavy engineering.
## GitHub as the source of truth.
## Agents execute; humans approve.
