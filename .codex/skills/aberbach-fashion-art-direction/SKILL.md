---
name: aberbach-fashion-art-direction
description: >-
  Art-direct and review the Aberbach fashion portfolio. Use for Portfolio art
  direction, fashion/editorial layout, visual redesign, responsive composition,
  image hierarchy, visual QA, and design-to-code work on Aberbach. Excludes
  backend, infrastructure, deployment, and nonvisual maintenance tasks.
---

# Aberbach fashion art direction

Apply the [root contract](../../../AGENTS.md) and the current brief. Use this
workflow for significant visual work; scale it to the task without expanding its
boundary. Existing approved language takes priority over generic design advice.

## A. Inspect

Understand the current approved surface, real assets/content, hierarchy, studio
background characteristics, interaction dependencies and task boundary. Read only
the relevant components, tokens and data; look at the rendered surface. Do not
start by editing CSS. Distinguish approved references from exploratory studies.

## B. Frame the design decision

State the few decisions that govern the result: hierarchy, garment scale,
image-ground relationship, rhythm, category differentiation and transition logic.
Explain how they serve the actual work. Avoid a giant implementation plan.
Use content and composition to express personality within the shared grammar.

## C. Implement one coherent pass

When the task concerns a full journey, compose that journey as a whole before
local polishing. Keep scale, typography, ground and transitions coherent across
chapters. Reuse Astro components, tokens and responsive conventions. Restraint
and precise spacing matter more than adding controls or effects. Use purposeful,
responsive, interruptible motion; preserve reduced-motion access and input
feedback. Do not let local polish damage whole-page coherence.

## D. Render in a real browser

Follow [browser-workflow.md](references/browser-workflow.md). Experience entry,
scroll, project/evidence access, garment views, return navigation, keyboard and
touch behavior where relevant. Source inspection cannot substitute for rendered
UI review. For long Portfolio journeys, inspect the whole relevant chapter.

## E. Critique your own result

After the first coherent pass, explicitly review all seven dimensions using
[visual-qa.md](references/visual-qa.md): fashion hierarchy, image integration,
composition, rhythm, typography, interaction and mobile composition. Record
concrete visible findings, including location/state and why they matter. Green
tests and generated screenshots do not constitute a critique.

## F. Refine

Fix visible problems before claiming completion; revisit the affected journey
after each meaningful correction. Substantial redesigns require at least one
genuine visual critique pass. Mobile needs deliberate editing of scale, crop,
order and pacing, not merely vertically stacked desktop sections.

Review substantial responsive work at **1440×900, 768×1024 and 390×844**; use
**1024×768 and 430×932** for sanity/regression. Browse during implementation as
needed, then make one disciplined final screenshot set after composition and
refinement stabilize. Avoid dozens of repetitive captures. Never judge exact
typography from known fallback fonts.

## G. Verify

Run relevant functional tests after the coherent visual pass is stable. Check
navigation, keyboard/focus, evidence access, responsive safety, reduced motion and
interaction integrity. If verification exposes a visual defect, refine and
recheck it. Review the final Git diff for scope, truthful content and obsolete
presentation systems. Report screenshot paths, critique/refinements, checks run
and any unverified limitations. Completion requires a final regression check.

## Figma

Use Figma for approved references, composition studies, design-to-code comparison
and hierarchy review before implementation. Only an explicitly user-approved
frame becomes authoritative; Figma access or an exploratory frame does not grant
approval or expand task scope.

For an approved frame: **approved Figma frame → design context → implementation
→ browser screenshot → visual comparison → refinement**. Load the available
Figma design-to-code skill before requesting design context. Adapt generated code
to existing Astro components, tokens, responsive behavior, accessibility and
actual project assets; do not blindly paste it. If tooling is unavailable, use
available approved references, disclose the limitation and continue useful work.
Never fabricate Figma access or block unnecessarily.
