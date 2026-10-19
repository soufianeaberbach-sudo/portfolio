# Womenswear cinematic experience 2.0

Review candidate on `feat/womenswear-cinematic-experience-v2`, based on merged
production `dfc2f3d5e9d7aee4bb2906bf15c44dcc3a23d180`. No merge or deployment.

## Start here

- [Desktop overview](desktop-overview.jpg) · [Mobile overview](mobile-overview.jpg)
- [Desktop film](motion/desktop.mp4) · [Mobile film](motion/mobile.mp4)
- [Responsive source-return proof](motion/responsive-return.mp4) (desktop browser resized to phone width; intentional recording letterbox)
- [Desktop before/after](comparisons/1440-before-after.jpg) · [Mobile before/after](comparisons/390-before-after.jpg)
- [Five individual storyboards and curation](STORYBOARDS.md)
- [49-reference source/view manifest](REFERENCES.json)
- [Executed QA and limitations](QA.md) · [Exact changed-file manifest](FILES.txt)

The films are actual continuous Chromium browser takes, not animated screenshots.
Only 1.5 seconds of initial route/bootstrap is trimmed. They show the whole five-
category journey, native archive discovery, measured reader entry, deliberate
Front/Back/Complete original where available, Look Closer, return and handoff.
The phone film includes real CDP touch swipes through the four longer archives.
The scripted scrolling compresses review time; the website remains visitor-driven.

## Five edits on one white floor

| World | Cinematic idea | Named photographic selection | Archive |
| --- | --- | --- | --- |
| Ready-to-Wear | Long lines interrupted by separates; diagonal continuity | 01 satin, 02 pink shirt, 03 stone jumpsuit, 05 print/rust | 17 |
| Activewear | A relay between stepping red, cropped black and white/red | 08, 04, 01 | 10 |
| Streetwear | Brief counterweight between compact hoodie volume and long trousers | 02 burgundy, 01 cream | 2, compact pair |
| Occasion | Two silhouettes open a central axis for the final navy gown | 04 black, 11 champagne, 03 navy | 11 |
| Swim | Open intervals around a dominant blue centre | 06 blue, 08 black, 05 silver | 9 |

Selections use stable IDs and documented visual roles, never array parity.
Primary resting shots preserve complete visible figures. The exhibition never
travels into a back view. White photography sits on white; originals with visible
paper/studio texture receive a restrained photographic edge. Source pixels,
dimensions, identities, attribution and source associations are unchanged.

Mobile has its own shot map. RTW alternates lateral and vertical handoffs;
Activewear uses a brisk vertical relay followed by a lateral arrival; Streetwear
uses two complete portraits; Occasion slows its vertical changes; Swim uses clear
single-look intervals. A small `SWIPE TO EXPLORE` cue accompanies the longer
archives; Streetwear says `BOTH LOOKS`.

## Photography, not a development story

All 49 references retain their original identity and honest reference disclosure.
No Sketch, Pattern, Flat, CLO or independent review example enters this public
experience. Even a future verified subject uses final photography here.

One reader consumes existing `Subject.views` / `FinalViews` through a small
adapter. Separable composites expose Front, Back and Complete original; separate
photographs use their actual assets and dimensions; supplied Side, Editorial and
Detail views appear only when present. Missing/unknown split geometry falls back
to the whole original. There is no second content model or router.

Current exceptions are `rtw-ref-08`, `rtw-ref-16`, `activewear-ref-10` and
`evening-ref-01`: inseparable originals, with one whole-source presentation.
All nine Swim references are single-view. The remaining 36 references have genuine
front/back windows. Source inspection provides zoom, pan, pinch, Fit, keyboard
navigation and the original file. Exhibition return resolves on the primary view
before the measured cut, preserving the front-only exhibition rule.

The Portfolio router still owns hash/history, Escape, scroll locking and focus.
Return goes to the actual camera/archive occurrence, including horizontal rail
position. Resizing recomputes photographic geometry. Reduced motion and keyboard
entry settle immediately; no-JS retains resting compositions, complete archives
and native garment targets. The no-JS experience is a static document fallback,
without cinematic history or measured return.

## Visual critique and corrections

| Dimension | Observed problem | Correction |
| --- | --- | --- |
| Fashion hierarchy | A first phone width calculation made complete figures too small | Corrected width-limit arithmetic; full-size primary looks reviewed at six sizes |
| Image integration | Activewear 01's front window exposed a sliver of its neighbouring heel | Source-qualified empty-gap windows, without touching either figure |
| Composition | Streetwear's reduced phone pair left weak, small silhouettes | Two complete portraits and a short two-door archive |
| Composition | Occasion initially repeated RTW's alternating pair geometry | Black/champagne part to open a central navy axis; weaker pale-blue source replaced |
| Rhythm | Swim's first three-look payoff had equal lineup weight | Dominant blue centre with subordinate lateral intervals; independent phone solos |
| Navigation | Category arrival landed beyond the first camera frame, leaving a fading title | Womenswear-only bar offset now lands on the actual opening; six-size regression coverage |
| Typography | Approaching phone figures crossed the departing title; reader context was too small | Internal title clears earlier; reader disclosure and view labels increased to 10px |
| Responsive return | A secondary camera occurrence could disappear in the phone edit; a rail item could remain outside the resized rail | Reframe the same camera door at its nearest complete shot; restore the actual archive occurrence after rebuild |
| Interaction | Future five-view controls could crowd the inspection toolbar | Selected view stays legible during inspection; other view choices return on exit |
| Motion / loading | Recorded view/inspection changes briefly cleared an image under load | Current photograph retained until the requested source decodes; stale requests cancelled, next genuine view prepared, and native rendition stable through inspection; final films inspected |

No photographic retouching, destructive cutout, fake perspective, fabricated
photography or technical-story material was used.

## Evidence map

`sheets/{width}-{category}.jpg` contains **opening, cinematic start, midpoint,
payoff, archive, reader, exact return and handoff** in that order. There are five
category sheets for each exact viewport:

| Viewport | RTW | Activewear | Streetwear | Occasion | Swim |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | [view](sheets/1440-rtw.jpg) | [view](sheets/1440-activewear.jpg) | [view](sheets/1440-streetwear.jpg) | [view](sheets/1440-evening.jpg) | [view](sheets/1440-swimwear.jpg) |
| 1366×768 | [view](sheets/1366-rtw.jpg) | [view](sheets/1366-activewear.jpg) | [view](sheets/1366-streetwear.jpg) | [view](sheets/1366-evening.jpg) | [view](sheets/1366-swimwear.jpg) |
| 1024×768 | [view](sheets/1024-rtw.jpg) | [view](sheets/1024-activewear.jpg) | [view](sheets/1024-streetwear.jpg) | [view](sheets/1024-evening.jpg) | [view](sheets/1024-swimwear.jpg) |
| 768×1024 | [view](sheets/768-rtw.jpg) | [view](sheets/768-activewear.jpg) | [view](sheets/768-streetwear.jpg) | [view](sheets/768-evening.jpg) | [view](sheets/768-swimwear.jpg) |
| 430×932 | [view](sheets/430-rtw.jpg) | [view](sheets/430-activewear.jpg) | [view](sheets/430-streetwear.jpg) | [view](sheets/430-evening.jpg) | [view](sheets/430-swimwear.jpg) |
| 390×844 | [view](sheets/390-rtw.jpg) | [view](sheets/390-activewear.jpg) | [view](sheets/390-streetwear.jpg) | [view](sheets/390-evening.jpg) | [view](sheets/390-swimwear.jpg) |

[Full-resolution stills](stills/) preserve opening/payoff/archive/reader at 1440×900
and 390×844. [Reader audits](audits/) contain real browser crops of all 49 primary
and 36 back windows. These are inspection evidence, not proposed gallery layouts.
Intermediate captures and discarded edits stay in ignored local QA storage.
Capture reproduction uses `tests/womenswear-capture.mjs` (six-size stills by
default; `WW_MOTION_ONLY=1` for continuous desktop/phone browser recordings).

## Scope, reproduction and approval

Generalized the RTW photo/reader/match-cut foundations and replaced their obsolete
RTW-only presentation files. `WomenswearAct.astro` selects the new composition only
for public Womenswear; its development-only fallback remains. `portfolio.astro`
has scoped reader hooks, not a new router. Existing shared CSS is not replaced.

No changes to the Portfolio opening, chapter cover assets/composition, Menswear,
Pattern Development, Tech Packs, Home, Contact, backend, Cloudflare or deployment
configuration. Existing reference data and all production image files are unchanged.
Review media lives outside `public` and is absent from the production build.

To review interactively: check out this branch, run `npm ci`, `npm run build`, then
`npm run preview -- --host 127.0.0.1 --port 4389`. Open
`http://127.0.0.1:4389/portfolio/#womenswear/rtw`. Continue with the category controls
or each archive's handoff. No isolated public preview was deployed: a usable
authenticated upload target was not available. Production remains unchanged.

Remaining limitations: originals contain existing paper/gray grounds, photographic
artifacts and, in RTW 17, an already-cropped elbow. They were preserved, not repaired.
Static studio sources constrain genuine camera perspective. Phone cinematography
uses complete portrait succession with category-specific rhythm and directions;
it does not fabricate action or a 3D set. Browser emulation does not establish
physical iPhone Safari, dynamic browser chrome, thermal performance or 60fps on
hardware. Those and independent creative approval remain the review checkpoint.
For a local iPhone review on the same Wi-Fi network, serve the built branch with
`npm run preview -- --host 0.0.0.0 --port 4389` and open
`http://YOUR-LAN-IP:4389/portfolio/#womenswear/rtw` in Safari.
