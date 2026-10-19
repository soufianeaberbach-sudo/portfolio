# ABERBACH — maintained creative direction

**ACTIVE · reconciled 19 October 2026.** Scope: website identity and Portfolio
creative constraints. This consolidates explicit owner decisions, not a new
visual proposal. For implementation and deployment facts start with
[CURRENT-STATE.md](CURRENT-STATE.md). Approval, implementation and live verification
are separate states. Earlier exploratory wording is preserved in
[Git history](https://github.com/soufianeaberbach-sudo/portfolio/blob/a36ae62af385641f2c4d92c07bcd851d10ee24d7/docs/portfolio/CREATIVE-DIRECTION.md).

## Positioning

Soufiane Aberbach is a **Fashion Designer, Industrial Patternmaker and Technical
Product Developer**. **BETWEEN INSTINCT & CONSTRUCTION** connects fashion instinct
with the engineering needed to make a product real. The audience includes fashion
brands, design/product teams, sourcing/manufacturing partners and independent
clients. Independence is presented with professional confidence, not marketplace
or generic freelancer-template language.

Fashion defines the identity; genuine technical work can prove capability;
technology supports understanding. Never infer client work, construction history,
authorship, fit validation or industrial readiness from a photograph.

## Visual language already established

Luxury editorial composition; garment authority; strong black typography;
controlled negative space; confident scale; minimal interface noise; meaningful
transitions. Work → context → interface. Real technical content belongs where it
exists and where the current chapter scope permits it.

The following are **source facts**, not proposed new tokens:

| Scope / source | Current values and usage |
| --- | --- |
| [global.css](../../src/styles/global.css) | `--paper: #f3f0e9`, `--paper-bright: #fbfaf6`, `--ink: #11110f`, `--ink-soft: #383832`, `--muted: #6e6d64`; restrained line tokens. |
| Global accents | `--signal: #d45f36` is the single orange signal; `--acid: #d7e662` also exists. A defined token is not a mandate to use it in every chapter. |
| [portfolio-cinematic.css](../../src/styles/portfolio-cinematic.css) | Bone `--bone: #eee1da`; Womenswear `--ww-accent: #c7020c`; Menswear `--mw-accent: #2d81de`; Development `--dev-accent: #087888`; Tech Packs uses global signal. |
| Womenswear interiors | Pure white `#fff`, ink and disciplined red signals. [portfolio-womenswear.css](../../src/styles/portfolio-womenswear.css) and [womenswear-cinematic.css](../../src/styles/womenswear-cinematic.css). The opening/cover stays bone. |
| Typography | `--display`: Archivo, `--body`: Inter, `--mono`: JetBrains Mono. [SiteLayout](../../src/layouts/SiteLayout.astro) loads Archivo variable width/weight, Inter 400/500/600 and Mono 400/500. Display headlines use Archivo; prose uses Inter; orientation/control labels use Mono. |

The opening contrasts expanded INSTINCT and condensed CONSTRUCTION at equal
visual authority, joined by a lighter ampersand. Covers vary Archivo width and
chapter accent within the established family. These specific source treatments
are protected; do not replace them with speculative typography or new fonts.

**NO ACCIDENTAL IMAGE RECTANGLE.** Integrate a studio ground into the page or
frame it intentionally. Retain authentic paper, shadows and source limitations;
never erase light fabric, hair or garment edges to force white. No destructive
background removal/recoloring or fabricated anatomy. A photographic limitation
is documented, not hidden by a claim of seamless integration.

## Current journey and chapter identities

Opening → Womenswear → Menswear → Pattern Development → Tech Packs → ending.
The actual third cover/navigation label is **Development**; inside it is
**Pattern Development**, retaining the existing `#3d-simulation` identifier.
[Source-accurate map](SITE-MAP-AND-NAVIGATION.md).

The opening is a bone studio campaign with the editorial masthead, three figures
and a measured handoff into the red-dress Womenswear cover. The subsequent
blue-suit Menswear, turquoise-gown Development and document-sheet Tech Packs
covers share a restrained composition while retaining their own identity.
No separate large mid-journey index is approved. The compact chapter control
already provides orientation; old “Living Chapter Index” studies are historical.

Chapter interiors need not imitate Womenswear. Menswear's intended direction is
structural, proportion-led and precise; its current deck is an earlier system.
Development can communicate genuine pattern engineering, grading and validation
through verified material, currently supplied recordings. Tech Packs is
**document-first**, currently clearly labelled interface-demo PDFs. Do not invent
new transformations, WebGL effects or professional evidence to fill those gaps.

## Womenswear: five worlds, one photographic system

**APPROVED DESIGN DECISIONS · IMPLEMENTED IN MAIN via PR #42.**
Photography-only, full garments in primary resting compositions, ten displayed
looks per category, all historical identities retained. These are binding
content/interaction decisions, not optional inspiration.

| World | Character | Latest photographic progression |
| --- | --- | --- |
| Ready-to-Wear | Fluidity and proportion | Champagne slip through shirting/jumpsuit to the print/rust relationship. Preserve successful opening. |
| Activewear | Energy, direction and precision | Red/black/white progression resolving into the brown flared silhouette; no repeated white ending. |
| Streetwear | Volume, attitude and contrast | Burgundy volume, brown oversized hoodie, olive/white lift and black utility resolution; full ten-look archive. |
| Occasion | Ceremony, elegance and fabric fall | Long silhouettes with space for hems, drape and train; black/champagne/navy passage. |
| Swim | Clarity, lightness and restraint | Blue/black/silver passage resolving into white cut-out swim photography; no fabricated back views. |

Detailed shot selection and desktop/mobile edits:
[merged V2.1 storyboards](review/womenswear-v21/STORYBOARDS.md).
Shared access does not mean five identical timelines; category differentiation
comes from actual photography, composition, emphasis and rhythm. No arbitrary
array-index layouts, random scattering, catalogue lineups or generic moving grids.

Every category has ten archive entries. The cinematic cast may be a subset.
Historical/excluded garments retain valid deep links without expanding the
visible edit beyond ten. Source attribution is part of the experience.

The exhibition shows **front/primary only**. Back, Side, Editorial and Detail
are deliberate reader choices only when real media exists. Complete Original
preserves composite-source integrity. An inseparable pair stays whole.

**POSTPONED:** Sketch, Pattern, Flat, CLO and development stories inside individual
Womenswear readers. Their earlier isolated studies are not production templates.
This does not postpone the separate Development or Tech Packs chapters.

## Motion and interaction

Every major resting frame must work as an editorial image when motion pauses.
Motion connects strong compositions, reveals progression or preserves continuity.
It does not excuse weak scale, cropping, repeated images, dead space or static
catalogue geometry. Choose the simplest technique that preserves the idea.

Preserve existing GSAP/ScrollTrigger, CSS and WAAPI architecture, interruption,
real image decoding, reduced motion and navigation. No perpetual spectacle,
forced long sequences, generic repeated fades/scales or automatic garment turns.
The visitor must control entry, inspection, return and direct navigation.

Full silhouette first: head, hands, hem and shoes wherever present in the source.
Specific detail inspection may crop deliberately, with the full look still
available. Never enlarge a primary shot until the actual design disappears.

Mobile is a separate art-directed composition: large readable garments,
restrained context, natural swipe archives, usable controls and genuine source
inspection. Do not shrink desktop coordinates or hide essential provenance.

## Approval and future work

Substantial creative changes require browser review, critique, refinement and
explicit owner visual approval. Functional tests do not confer artistic approval.
Review six exact viewports and decoded motion frames as specified in the
[roadmap](PORTFOLIO-ROADMAP.md); real iPhone Safari remains a separate check.

Preserve source identities and immutable review evidence. Only owner-authorized,
verified project data can change reference status. The [photo handoff](PHOTO-CONTENT-HANDOFF.md)
explains metadata-only replacements and the separate verified-content migration
gate. Follow the current task boundary; speculative historical concepts are not
an invitation to redesign protected chapters or activate infrastructure.
