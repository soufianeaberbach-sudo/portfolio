# Phase A — read-only Menswear reconnaissance

Verified 19 October 2026. Latest remote main and branch base:
`65ab3a07c2729b42cd72e50b11ff7f63767c614b` (merged documentation PR #43).
Feature: `feat/menswear-cinematic-presentation`. No historical experiment is a baseline.

## What exists

`portfolio.ts` builds four categories, then replaces their placeholder references
with `editorial` Pexels assets. IDs are explicit `<category>-pexels-<photo-id>`.
There are **16 entries / 11 distinct source images**, no verified Projects:

| Category | Current Pexels IDs |
| --- | --- |
| m-streetwear | 8505243, 30599804, 30954220, 16711124 |
| m-activewear | 7648388, 20038943, 30954220, 5037287 |
| m-rtw | 16711124, 8505243, 17552351, 4651396 |
| m-tailoring | 4651396, 16862147, 17552351, 18320052 |

Repeated sources: 30954220 (Street/Active), 16711124 and 8505243 (Street/RTW),
17552351 and 4651396 (RTW/Tailoring). They are not sixteen different garments.
The paired tailoring portrait is a single supplied composition, not invented
front/back evidence. A complete-look edit must exclude source-cut torso portraits
from primary roles: 20038943, 17552351, 18320052, 4651396 and the head-cut landscape
runner 5037287. Original sources/URLs remain intact in production.

`GarmentWorld.astro` supplies a category index, four-per-category decks, selected
image counters, drag/arrow controls and generic development-placeholder plates.
The current brief supersedes those plates for future Menswear, but this proof
does not modify them or the public reader. Real browser baseline screenshots at
1440×900 and 390×844 and DOM checks confirmed four entries in each current deck.

## Routing and dependencies

`portfolio.astro` remains authority for #menswear and #menswear/m-streetwear,
/m-activewear, /m-rtw, /m-tailoring. It selects category screens and manages body
locking, history, Escape, focus and decks. Public Menswear has no Womenswear-style
individual photo-reader deep links today; do not claim that new subject URLs
already work. Its existing category and image identities must survive integration.

Reuse candidates: ImageAsset / FinalViews / Subject, `referenceSubject`,
`finalPhotographs` and source dimensions; existing GSAP, WAAPI and font fixtures.
The current match-cut helper targets Womenswear markup and shared singleton state.
Using it unchanged in a simultaneous new reader would couple lifecycles; the
isolated proof therefore measures its own local clone rather than modifying that
helper. A future shared extraction needs explicit approval and regression QA.

## Protected scope

No edits to Womenswear data, scripts, CSS, imagery, opening, covers, public
Portfolio, router, Home, Development, Tech Packs, Contact, backend or deployment.
The new route is DEV-only and imports no public page. It does not install global
Portfolio listeners or a second public router. Its local view state proves the
navigation vocabulary; full production hash/history integration is an approval-
gated next phase. Existing public category links remain available unchanged.

## Media selection and constraints

Six existing full-look sources plus six licensed new *review-only* sources give
12 unique candidate photographs, three per world without cross-world duplicates.
All are temporary independent references, not one authored ABERBACH collection.
Six rejected research downloads remain in /tmp only; cropped-body and weak
candidates are not committed. See ASSETS.json and ATTRIBUTION.md.

Source atmospheres differ: urban brick, pale concrete, olive, cool white, dark
studio and warm ivory. Treat these as distinct photographic rooms with intentional
edges. Do not disguise them as models sharing one studio floor. No relighting,
background removal, generated imagery, artificial perspective or back-view turn.
The new white/green look has a measured empty-margin display window; complete
original remains inspectable. Original source files are untouched.

## Scope of Phase C

Streetwear is the main five-movement motion experiment. The other three worlds
are five composed storyboard keyframes plus direct destination/keyboard studies,
not approved full category films. The proof has only three genuine candidate
archive entries per category, clearly disclosed. Ten slots/forty unique garments
are the future production contract, **not falsely counted as completed here**.
Full sourcing, historical-ID migration, production history integration and all-
category cinematic refinement wait for artistic approval.
