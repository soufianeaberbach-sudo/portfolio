# Reference Harvest 01 — Opening + Portfolio Worlds

**Project:** Soufiane Aberbach Portfolio  
**Phase:** Reference Harvest — Round 1  
**Status:** Selected direction  
**Base creative document:** `docs/portfolio/CREATIVE-DIRECTION.md`  
**Roadmap:** `docs/portfolio/PORTFOLIO-ROADMAP.md`

---

# 1. Decision

The selected direction for the next Portfolio prototype is:

## CINEMATIC EDITORIAL CHAPTERS

The Portfolio should not begin by compressing Womenswear, Menswear, Tech Packs and Pattern Development into four conventional cards.

Instead, the opening should establish a strong fashion editorial scene, then reveal a lightweight living chapter index that lets the visitor discover four distinct chapters within the same practice.

The first prototype will cover only:

**Opening → Signature transition → Living Chapter Index → Womenswear entry**

This prototype exists to establish the visual grammar for the rest of the Portfolio.

---

# 2. Why This Direction

This direction is selected because it can combine:

- fashion-image authority
- editorial composition
- cinematic pacing
- a clear navigational system
- distinct identities for the four Portfolio worlds
- modern frontend interaction
- progressive technical depth

It also avoids forcing four very different types of work into one repeated component pattern.

The four worlds can remain equal in professional value while being different in visual behaviour.

---

# 3. Selected References and What We Learn From Them

## Dondre Green Portfolio — Codrops case study
Source:
https://tympanus.net/codrops/2025/01/07/case-study-dondre-green/

Useful principle:
The hero does not simply end. Its title and images reorganise through scroll and become part of the next state.

Use for Soufiane:
Treat the Opening as a living composition that evolves into navigation / discovery.

Do not copy:
The photography treatment, exact shutter transition or layout.

---

## Design Embraced Portfolio — Codrops case study
Source:
https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/

Useful principle:
An existing visual element can carry the user into the next project rather than disappearing before a new page loads.

Use for Soufiane:
The Opening image can become the bridge into Womenswear, and later category imagery can carry into the Garment Viewer.

Do not copy:
The full routing model or visual identity.

---

## Podium — Codrops case study
Source:
https://tympanus.net/codrops/2026/06/23/podium-building-a-website-where-running-becomes-storytelling/

Useful principle:
Use the media itself as the transition object. Restraint and pacing can create more impact than adding a separate effect layer.

Use for Soufiane:
Let fashion imagery carry transitions whenever possible.

Do not copy:
The deliberate slowness as a mandatory interaction rule.

---

## Pell Mell — Codrops case study
Source:
https://tympanus.net/codrops/2026/03/27/pell-mell-crafting-a-visual-exploration-platform-with-editorial-rhythm/

Useful principle:
A strict underlying structure can look visually free and editorial. Discovery can feel closer to a magazine than a platform grid.

Use for Soufiane:
Build a disciplined invisible layout system while allowing garments and chapters to feel editorial.

Do not copy:
The exact archive / directory structure.

---

## Bisous — Codrops case study
Source:
https://tympanus.net/codrops/2026/06/29/inside-bisous-designing-an-editorial-experience-for-cinematic-cgi/

Useful principle:
A secondary navigation system can borrow from technical / production interfaces without literally imitating them, and continuous transitions preserve immersion.

Use for Soufiane:
A small chapter index may carry subtle technical precision while remaining editorial.

Do not copy:
The studio's visual codes or production-tag styling directly.

---

## LUISAVIAROMA UX/UI Concept — Behance
Source:
https://www.behance.net/gallery/232762731/LUISAVIAROMA-UXUI

Useful principle:
An adaptive side navigation can act like a fashion-catalogue annotation system and change according to the current context.

Use for Soufiane:
A Living Chapter Index can remain consistent while the world around it changes.

Do not copy:
The e-commerce filters or commerce information architecture.

---

## Sirnik Studio Portfolio — Behance
Source:
https://www.behance.net/gallery/249940813/Sirnik-Studio-A-Premium-Webflow-Portfolio

Useful principle:
Scale, controlled whitespace, fashion-influenced typography and atmospheric pacing can create a cinematic result without visual overload.

Use for Soufiane:
Opening composition and rhythm.

Do not copy:
The brutalist identity or exact typography treatment.

---

## Arnaud Rocca Portfolio — Codrops case study
Source:
https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/

Useful principle:
Film-title inspiration can become a reusable interaction system rather than a one-off decoration.

Use for Soufiane:
Treat motion ideas as a visual language that can recur selectively.

Do not copy:
The exact text effect or WebGL system.

---

## Stefan Vitasović Portfolio — Codrops case study
Source:
https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/

Useful principle:
A small set of recurring visual hooks can make a portfolio memorable.

Use for Soufiane:
Develop one or two recognisable motion motifs rather than many unrelated effects.

Do not copy:
The developer-centric visual identity.

---

# 4. Rejected Directions

## Four conventional cards
Rejected because it makes four different professional worlds feel like a dashboard or service menu.

## Forced 2×2 grid
Rejected as the primary reveal because it gives clarity but not enough narrative or cinematic value.

## Full snap-scroll experience
Rejected because the Portfolio should not fight the visitor's scrolling or force every chapter to behave like a presentation deck.

## Heavy WebGL hero
Rejected for the first prototype.
The fashion content should establish authority first. WebGL remains available later where transformation itself is the subject, especially Pattern Development.

## Literal technical / pattern visual metaphor
Rejected.
Technical expertise should appear through real content, precision and evidence, not through decorative simulation.

## One identical template for every world
Rejected because the four worlds need different art direction.

---

# 5. Selected Experience Blueprint

## Scene A — Opening / Attraction

Purpose:
Immediate fashion authority and curiosity.

Experience:
- The opening uses one strong editorial fashion image.
- `BETWEEN INSTINCT & CONSTRUCTION` is integrated into the image composition rather than placed beside it as a generic hero.
- Navigation remains quiet.
- Supporting copy is minimal.
- The frame should feel complete before any movement begins.

The composition should be designed around the actual subject and negative space of the chosen image.

No UI-heavy chapter menu is visible at the first instant.

---

## Scene B — Signature Transition / Revelation

Purpose:
Reveal that the Portfolio contains a larger practice without creating a hard section break.

Experience:
- Normal scroll begins to reorganise the Opening composition.
- The existing image remains visually meaningful instead of disappearing into a fade.
- Typography changes role rather than simply leaving.
- The visual field becomes more structured.
- A lightweight chapter-navigation system emerges.

The important perception is:

**The Portfolio is opening up, not switching to a different page.**

The transition should be interruptible and linked to normal scroll progress.

---

## Scene C — Living Chapter Index

Purpose:
Give orientation and reveal the four professional worlds.

Content:
1. Womenswear
2. Menswear
3. Tech Packs
4. Pattern Development

The index is not the visual hero.

It is an intelligent orientation layer.

Behaviour:
- The active chapter gains presence.
- Inactive chapters remain visible enough to communicate range.
- The index may adapt in size, alignment or typography as the current chapter changes.
- It should remain usable by keyboard and touch.
- On mobile it may become a compact horizontal / anchored system rather than a desktop side rail.

The numbering is legitimate here because the chapters form a real navigational sequence.

---

## Scene D — Womenswear Entry / Immersion

Purpose:
Move from the Portfolio thesis into the first body of real fashion work.

Experience:
- The Opening image or visual plane should help carry the transition into Womenswear where practical.
- The interface recedes.
- Fashion imagery becomes more dominant.
- The chapter index remains available but quiet.
- Womenswear establishes the visual grammar that later chapters are allowed to reinterpret rather than duplicate.

Psychological objective:

**Desire before explanation.**

---

# 6. Four-World Art-Direction Logic

The later four chapters should share one brand universe while changing atmosphere.

## Womenswear
Editorial, fluid, image-led, silhouette and movement.

## Menswear
Controlled, structural, proportion-led, tailoring and detail.

## Tech Packs
Documentation, precision, paper / specification logic, product readiness.

## Pattern Development
Transformation, comparison, development states, strongest motion potential.

Equal professional value does not require identical presentation.

---

# 7. Motion Strategy for the Prototype

Use motion for:

- role change
- spatial continuity
- revealing structure
- guiding attention

Avoid movement that exists only to demonstrate animation skill.

The prototype should establish one recognisable motion motif that may later become part of the Portfolio language.

The first candidate motif is:

**An existing visual element changes role and position rather than disappearing and being replaced.**

This can apply to:
- opening image → Womenswear entry
- title → chapter identifier
- category image → garment viewer
- technical preview → document reader

---

# 8. Technical Direction

Current repository stack at the approved main baseline:

- Astro
- GSAP 3.15
- Playwright

No new animation framework is required for this prototype.

Preferred implementation:
- existing Astro architecture
- GSAP for scroll choreography where CSS alone is insufficient
- ScrollTrigger for scroll-linked state
- FLIP only where continuity between visual states genuinely benefits from it
- CSS for layout and simple transitions
- no WebGL in this phase
- no new major dependency unless the concept proves impossible without it

All motion must have:
- responsive behaviour
- `prefers-reduced-motion` fallback
- keyboard-safe navigation
- interruptible scroll-linked behaviour where applicable

---

# 9. Prototype Scope

The next implementation task is limited to:

1. Opening
2. Signature scroll transition
3. Living Chapter Index
4. Womenswear entry

Do not redesign:

- Womenswear category discovery yet
- Menswear chapter internals
- Tech Pack internals
- Pattern Development internals
- Garment Viewer internals
- Evidence layer
- ending / CTA
- backend
- other routes

The purpose of this prototype is to prove the visual grammar before expanding it.

---

# 10. Base Branch Decision

Do not build the new prototype on top of the unapproved experimental design commit.

Approved source baseline:

`main @ 9389740f1f9327b44af97c8dcc36dd50dea4746d`

Create a new isolated branch from this baseline.

Recommended branch:

`codex/portfolio-cinematic-chapters`

The old branch:

`codex/portfolio-cutting-table-redesign`

remains an experiment / reference only.

If a useful image asset exists only on the old branch, copy only the required asset into the new branch. Do not inherit old layout or CSS merely to access that asset.

---

# 11. Prototype Success Test

The prototype is successful only if a human reviewing browser screenshots can answer YES to these questions:

1. Does the first frame immediately feel fashion-led?
2. Does the Opening feel composed rather than templated?
3. Does scroll evolve the same experience rather than simply reveal another section?
4. Does the chapter index clarify the practice without becoming a dashboard?
5. Does entering Womenswear feel continuous?
6. Is there at least one memorable interaction idea?
7. Does the experience remain understandable without reading explanatory copy?
8. Does the interface remain secondary to the work?
9. Does mobile feel intentionally designed rather than stacked desktop?
10. Is the result strong enough to establish the visual language for the next chapter?

If not, refine the concept before expanding the Portfolio.

---

# 12. Next Action

Implement one visual prototype of:

**Opening → Transition → Living Chapter Index → Womenswear Entry**

using the approved Creative Direction and this reference synthesis.

Complete the visual pass first.

Then review a small number of decisive browser states.

Do not perform full-project engineering QA until the visual direction is approved.
