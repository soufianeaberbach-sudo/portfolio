# ABERBACH — DESIGN & QA RULES

## Authority

Read the current task → [CURRENT-STATE.md](docs/portfolio/CURRENT-STATE.md)
→ relevant [creative direction](docs/portfolio/CREATIVE-DIRECTION.md)
→ relevant [roadmap](docs/portfolio/PORTFOLIO-ROADMAP.md) section → source.
Follow the single authority order in [AGENTS.md](AGENTS.md); historical research
and review evidence are not active specifications. Do not confuse approved,
implemented, merged and deployed. Womenswear is photography-only now; technical
storytelling inside its readers is postponed, not the separate engineering chapters.

Preserve the existing Astro architecture, tokens and GSAP language. Do not migrate
frameworks, CSS systems, fonts or component architecture because a generic skill
suggests it. Skills advise; the current authorized brief governs.

## Design Skills

For Aberbach visual work, the primary workflow is
[aberbach-fashion-art-direction](.codex/skills/aberbach-fashion-art-direction/SKILL.md).
Consult the following older skills only where relevant; they do not override
current project decisions. Documentation-only work needs factual/link/scope checks,
not a new visual implementation or browser capture campaign.

Use `design-taste-frontend` to critique:
- generic AI layout patterns
- hierarchy
- composition
- typography
- visual density
- editorial confidence
- unnecessary UI

Use `emil-design-eng` for:
- interaction details
- spacing
- motion decisions
- easing
- timing
- interface polish
- restraint

Use `review-animations` after meaningful motion work.

Use `mobile-native` when reviewing phone/tablet behaviour.

Never apply a Skill mechanically.
Project-specific art direction overrides generic Skill preferences.

## Playwright

Before declaring substantial UI work complete:

Experience the real website with Playwright.

Do not judge only from code or green tests.

Walk through the interface as a visitor:
- enter the chapter
- scroll naturally
- open projects
- inspect garments
- use front/back interactions
- go back
- use keyboard navigation
- test mobile interaction

Review at minimum:

1440×900
1366×768
1024×768
768×1024
430×932
390×844

For meaningful animated scenes capture:
START
MIDPOINT
PAYOFF

Screenshots are evidence for visual judgement,
not proof merely because they were generated.

Critique them before final approval.

Tests prove behaviour.
They do not approve art direction.

## Figma

Figma is a visual source of truth ONLY when a frame or component is explicitly marked APPROVED.

Do not assume unfinished Figma exploration overrides the live approved website.

## Portfolio principle

Fashion is the hero.

CATEGORY = WORLD
PROJECT = STORY
IMAGE = EVIDENCE

Product + Presentation + Language + Rhythm must work together.

The interface must never become more memorable than the work.
