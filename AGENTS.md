# Aberbach — Codex contract

## Product identity

Aberbach is a fashion portfolio first: fashion work, technical intelligence and
product development. **BETWEEN INSTINCT & CONSTRUCTION.** Fashion, garments and
evidence must remain more memorable than UI mechanics. Avoid generic SaaS
aesthetics, ecommerce presentation, Pinterest-like walls, dashboard language and
interaction for interaction's sake.

## Design authority

Start substantial Portfolio work with the current task →
[CURRENT-STATE.md](docs/portfolio/CURRENT-STATE.md) → relevant active
[creative direction](docs/portfolio/CREATIVE-DIRECTION.md) and
[roadmap](docs/portfolio/PORTFOLIO-ROADMAP.md) section → relevant source.

Authority: latest explicit user instructions → latest explicitly approved
creative/functional decisions → verified implementation for facts about existing
behavior → maintained documentation → AGENTS/CLAUDE development rules → historical
documents as background → agent interpretation. Approval, implementation, merge
and verified deployment are separate states. Exploratory Figma frames need
explicit approval. Never overwrite an approved area for convenience.

Womenswear currently has five photography-only worlds, ten displayed looks each;
front/primary-only cinema and genuine optional reader views. Development stories
inside its garment readers are postponed. Preserve historical IDs and source
records; see the current-state and photo-handoff documents for the dated contract.

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
