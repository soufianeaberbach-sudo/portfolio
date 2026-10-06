# Aberbach — Codex contract

## Product identity

Aberbach is a fashion portfolio first: fashion work, technical intelligence and
product development. **BETWEEN INSTINCT & CONSTRUCTION.** Fashion, garments and
evidence must remain more memorable than UI mechanics. Avoid generic SaaS
aesthetics, ecommerce presentation, Pinterest-like walls, dashboard language and
interaction for interaction's sake.

## Design authority

Use this order: explicit current user direction → user-approved visual/design
frame → existing approved site language and design system → real project
data/assets → agent interpretation. Exploratory Figma frames are not approved
without explicit user approval. Never overwrite an approved area for convenience.

## Portfolio model and shared grammar

**CATEGORY = WORLD · PROJECT = STORY · IMAGE = EVIDENCE.** Hierarchy controls
presentation weight, not evidence access. Never invent project history, sketches,
patterns, development evidence, garment relationships, client claims or provenance.
No fake evidence.

For category work: **SAME GRAMMAR — DIFFERENT DIALECT.** Personality normally comes
from curation, scale, rhythm, crop, spacing, typography emphasis, restrained motion
and real content. Do not invent a separate UI engine or interaction gimmick for
each category.

## Image integration

**NO ACCIDENTAL IMAGE RECTANGLE.** Intentionally integrate neutral studio grounds
with the presentation or intentionally frame them. An accidental white rectangle
around a garment on a bone page is a visual failure. Solve the page ground and
art direction first. Do not destructively remove or recolor image backgrounds
without explicit approval; protect light garments, hair, fabric texture and edges.

## Boundaries and engineering

Read minimum relevant context; do not re-audit the repository on every task.
Do not redesign unrelated pages. The existing Portfolio opening is protected
unless explicitly included in the task. Necessary small handoff fixes must stay
small. Preserve interaction integrity unless the task changes it. Remove obsolete
presentation systems after an approved replacement; avoid unrelated refactors.
Preserve the existing Astro architecture, components, tokens and GSAP language.

## Tests and visual completion

Tests passing != visual approval. Protect functionality, navigation, accessibility,
responsive safety, reduced motion, interaction integrity and truthful content.
Do not turn subjective art direction into rigid tests such as requiring every
category to have unique geometry.

Meaningful visual work requires **browser render → screenshots → visual critique
→ refinement → final regression check**. Do not claim completion with obvious
visual defects remaining.

## Design workflow and tools

For Aberbach visual/design work, use
[aberbach-fashion-art-direction](.codex/skills/aberbach-fashion-art-direction/SKILL.md).
Its `.agents/skills/aberbach-fashion-art-direction` symlink enables native Codex
discovery; the `.codex` directory holds the single source. Backend/infrastructure
tasks do not need this skill. Claude guidance informed these rules; generic skill
defaults do not override this contract or the current brief.

Reuse `.mcp.json` Playwright when exposed in the session, or the existing npm
Playwright dependency. Start locally with `npm run dev -- --host 127.0.0.1`.
Exact screenshot sizes, font handling, preview/test commands and helper limits
are in the skill's [browser workflow](.codex/skills/aberbach-fashion-art-direction/references/browser-workflow.md).
