> **HISTORICAL — rejected as incomplete.** This dated nine-world / 90-look audit
> preserves the previous delivery. It is not the current acceptance contract. See
> [four-world correction](../fashion-correction/README.md) and [current QA](../fashion-correction/QA.md).

# Final fashion refinement — executed review

21 October 2026, UTC. Base main: `a4b0aba1591ac043b11ca9b75b6079b0ed27a9be` (merged PR #44). Candidate: `refine/portfolio-fashion-categories-photo-finalization`. This report records local verification, not owner creative approval, a GitHub CI result or a deployed release.

## Scope and preservation

- All **90 displayed looks** were visually classified: fifty Womenswear, forty Menswear, ten per category. [Individual audit](LOOK-AUDIT.tsv); [retail sources and naming decision](TAXONOMY.md).
- All **108 routable subjects** retain their category/ID, source associations, intrinsic dimensions, existing views, crop/split metadata and inseparable exceptions. A compiled data comparison against the main-equivalent source tree matched every record for those fields. [Fingerprint and exact compared fields](SOURCE-INTEGRITY.json). No source array was reordered, photograph replaced, public asset edited or garment moved to fit a label.
- The owner master extends existing `ImageAsset`, `FinalViews`, `Subject.views`, photo components and readers. Explicit `views:3` and valid 2:1 geometry enable equal thirds; unsafe geometry falls back to the original. No actual owner master was supplied or published.
- Existing public routes, chapter covers, Home, Development, Tech Packs, Contact, backend and deployment settings remain unchanged. CI additions are focused test commands. No third-party demonstration or technical-development stage enters either fashion reader.

## Browser evidence

Actual built `/portfolio/` was reviewed at **1440×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844**. Nine categories × six viewports = **54 category reviews**. Each recorded opening, midpoint, payoff, complete archive, reader and return; every archive contained ten unique links, every inspected source restored focus, and there was no document-width overflow or page runtime error. [Structured results](QA-RESULTS.json).

- Six `compositions-*.jpg` sheets: actual timeline positions, three frames per world.
- `screens/`: native desktop/mobile opening and reader captures for every world.
- `archives-1440.jpg` and `archives-390.jpg`: all nine archive interfaces.
- `before-after-*.jpg`: main versus candidate taxonomy/opening comparisons.
- `before-compositions-*.jpg`: the first review pass, retained to expose the defects rather than overwrite them.
- [Motion corrections](motion-corrections.jpg): the three concrete partial-figure failures and corrected complete frames.
- `three-panel-qa-*.jpg`: actual reader geometry tests. Coloured registration fields are **TEST ONLY**, not generated garments or project evidence. Native 5400×2700 white and transparent PNGs are produced only inside a disposable test build.

## Defects found and corrected

1. **Cold Womenswear category arrivals:** the URL could name a later category while the screen remained in an earlier one. Initial smooth scrolling raced ScrollTrigger's startup refresh. Initial arrivals now settle immediately; deliberate later navigation keeps its smooth movement.
2. **Late-category scroll clamping:** rebuilding cameras temporarily removed their enhanced heights. The world became shorter, clamping a cold Swimwear arrival into Occasionwear. Rebuilds retain their enhanced layout until the new timeline is ready. Reduced-motion fallback still deliberately removes enhancement.
3. **Partial models during vertical arrivals/departures:** Activewear desktop midpoint, Occasionwear desktop midpoint and Streetwear portrait midpoint exposed floating heads or feet. The prior complete composition now holds until the next complete look cuts in; vertical departures cannot leave feet crossing the stage. Existing cast, shot coordinates, horizontal camera relationships, shot order and final compositions are retained.
4. **Repeated menu labels:** after unifying short and full taxonomy names, Womenswear's navigator repeated the same name twice. The redundant subtitle was removed.
5. **Third-view touch targets:** Menswear's existing view buttons now retain a 44px minimum width as well as their existing height.
6. **Unexplained cold Menswear arrivals:** decoded mobile footage exposed a brief empty photographic field before the Casualwear opening loaded. The existing media-status element now explains pending loading and marks the frame busy; the active film's opening image receives high fetch priority. No hidden world/archive/reader is newly preloaded. Existing failure recovery remains. Deliberately blocked/failed real sources verify that visitors can immediately jump worlds, late completions cannot reactivate stale worlds, and the archive remains usable. This corrects missing feedback; it does not promise instantaneous cold-network delivery.
7. **Return clone inherited the inspector's origin:** denser decoded frames exposed an incorrect return path, sometimes leaving the photographic field empty during the cut. The cloned photo retained the reader's inline centre transform origin, overriding the utility's intended top-left CSS origin. At the actual 1440px animation midpoint, its bounds were approximately 76px right and 200px below the calculated path. Explicitly setting the clone's origin to top-left fixes the coordinate mismatch. The original photo, inspector's own centre-origin zoom, timing, easing, routing and source-return architecture are unchanged. This utility is imported by the Womenswear reader only. [Measured midpoint before/after](return-midpoint-correction.jpg).

## Menswear test timing investigation

The initial serial regression run failed `1366/m-streetwear/3: composed resting state` after a fixed 1,100ms sleep. It did not record enough renderer telemetry to attribute that original stall conclusively. Forty controlled scene changes at the failing size then completed in the correct states with correct announcements, scroll positions and requested selections; no routing or animation-source change was justified.

A controlled 850ms renderer stall reproduced the sampling problem:

```text
fixed deadline 1,100ms: composition 2, “Streetwear. The room within”
actual completion 1,819ms: composition 3, “Streetwear. An opening in the room”
```

This is an injected stress result, not a claim that the original run's scheduler cause was captured. GSAP's frame-driven animation completion is not guaranteed by elapsed wall time. The production regression now waits, with a 4-second bound, for the **existing onComplete live announcement and requested composition**, then executes every original geometry, active-actor, inertness, keyboard and focus assertion. It does not extend a blind sleep, remove assertions or modify the Menswear motion implementation. A genuine incomplete/wrong transition still fails.

## Executed checks

Environment: Node 24.19.0, Playwright 1.56.1, pinned Chromium 141.0.7390.37, Linux. Browser suites run serially. Fonts use the repository's existing deterministic test fixture. This is not physical Safari or projector evidence.

| Command / check | Actual result |
| --- | --- |
| `npm run build` | PASS; Astro reports 11 pages/endpoints. |
| Targeted TypeScript 5.9.3, changed data/photo/controller modules | PASS, no emit. |
| `node tests/final-photography.mjs` | PASS: 23. |
| `node tests/womenswear-ten-looks.mjs` | PASS: 113. |
| `node tests/menswear-content.mjs` | PASS: 167. |
| `node tests/three-panel-photography.mjs` | PASS: 198; both existing readers, all six sizes, exact thirds/source proportions, genuine choices, alpha/white integrity, touch targets, inspection, Escape and primary-only film/archive after return. |
| `node tests/fashion-navigation.mjs` | PASS: 46; cold arrivals for all nine stable category routes, desktop and phone. |
| `node tests/fashion-final-review.mjs` | PASS: 54 full category/viewport reviews. |
| `node tests/womenswear-v2.mjs` | PASS: 1,925. |
| `node tests/womenswear-photography.mjs` | PASS: 438; all 58 photo routes, genuine views, touch swipe/pinch and failed-source fallback. |
| `node tests/womenswear-continuity.mjs` | PASS: 122; interruption, resize, focus and motion-preference changes. |
| `node tests/garment-match-cut.mjs` | PASS: 48; real paused WAAPI midpoint geometry, Front/Back after inspection, all six sizes, actual occurrence focus and cleanup. The test failed against the uncorrected utility before passing with the origin fix. |
| `node tests/menswear-production.mjs` | PASS: 585, all six viewports; actual completion synchronization, original assertions retained. |
| `node tests/menswear-navigation.mjs` | PASS: 49; direct jumps, history, interrupted navigation, native touch, reduced motion and no-JavaScript fallback. |
| `node tests/menswear-resize-return.mjs` | PASS: 12; source-occurrence return across breakpoints. |
| `node tests/menswear-media-loading.mjs` | PASS: 16; delayed/failed actual sources, loading/cleared busy state, priority, direct navigation and stale completion. |
| `node tests/smoke.mjs` | PASS: 302, zero failures. |
| `node tests/portfolio-opening.mjs` | PASS: 100; protected opening/covers/entry/ending. |
| `npm run test:domain` | PASS: 138; source and built-output canonical/domain checks. |
| Explicit category-menu bounds checks | PASS at all six sizes, both chapters. |
| Production isolation and Git whitespace check | PASS; no fixture/lab/review media or routes in the build, `git diff --check` clean. |

The smoke suite initially reported two obsolete label expectations (Ready-to-Wear/Tailoring and Evening & Occasionwear). Only the expected taxonomy was updated; server-rendered Womenswear coverage now checks all five names instead of one old string. A first smoke launch also failed before browser assertions because Astro telemetry attempted to create an unavailable home configuration directory. The final run used `ASTRO_TELEMETRY_DISABLED=1`; no application fix or configuration change was needed. Browser results above are actual completed runs, not inferred from an exit-free build.

The final loading-feedback and clone-origin patches change no decoded resting composition. Delay/failure, history, midpoint geometry and cross-breakpoint/continuity checks were rerun against rebuilt candidates, followed by the relevant production/three-panel/smoke checks and final continuous recordings. The 54 resting-state review images remain applicable; source pixels and scene geometry are identical.

For browser suites use `PORTFOLIO_QA_URL=http://127.0.0.1:4431` with `npm run preview -- --host 127.0.0.1 --port 4431`. Smoke owns its own server/port. The three-panel suite builds the actual Portfolio components in an isolated temporary project, on an OS-assigned port, without adding a route or fixture to production. Its initial helper race was corrected to await the specific selected panel; an occupied fixed port was replaced with an available port. Geometry assertions were retained.

## Motion evidence and capture findings

The final desktop and phone MP4s are actual continuous browser recordings through the nine in-app worlds, archive selection, genuine available Back views, Look Closer, zoom/Fit and exact source return. Desktop uses native wheel input; phone uses native CDP touch gestures. The recorder asserts that scrolling does not open a garment and that each return focuses the actual selected occurrence. It does not reload between categories or reconstruct motion from stills.

Final capture completed all eighteen category/device journeys. Published recordings are approximately **2:38 desktop** and **2:03 phone**. Both were decoded and inspected after the origin correction; the new midpoint regression separately holds actual WAAPI frames at 50% progress. Source photos, controls and designed resting states remain intact.

The first mobile capture attempted 14.75px of final adjustment. An event trace showed full swipes producing `pointercancel`, but that sub-threshold gesture producing native `pointerup`/`click`, correctly opening the photograph as a tap. The recorder now stops microscopic finishing adjustments rather than manufacturing taps. No application touch handler was changed to make the recording pass. Actual swipe/pinch coverage remains in the existing functional suites.

Decoded frames are inspected from both recordings, including denser samples around the corrected Womenswear arrivals, Menswear destination loading, reader entry/return and final compositions. Blank pre-bootstrap video frames are loading of the page itself, not authored cinematic scenes. Archive approaches naturally show part of the adjacent section while scrolling; Look Closer deliberately shows detail. Neither is presented as a primary complete-look resting shot.

Diagnostic contact sheets and raw WebMs remain ignored. Final published videos are H.264 derivatives of the completed browser recordings, with no transitions removed or invented. Functional browser suites and final recordings run sequentially.

## Visual critique and remaining limits

- **Fashion hierarchy:** complete primary photographs remain dominant. The nine worlds retain their existing cast and identity. No automatic Back/Side/Editorial transition was introduced.
- **Integration:** old Occasionwear/Swimwear images retain grey floors, marks and uneven white grounds; editorial Pexels photographs retain their genuine environments. These source characteristics are visible in the evidence. They were not erased, recoloured, background-removed or passed off as seamless owner masters.
- **Composition:** the verified floating fragments are corrected. No new scenes or wholesale spatial redesign were added. Some older large-screen title/photograph spacing remains deliberately close.
- **Rhythm:** targeted complete-look cuts replace broken vertical entrances. Existing horizontal transitions, Menswear films and presenter-controlled resting frames remain intact. This refinement is not a claim that all earlier art direction has been reinvented.
- **Typography:** professional category names now agree across navigation, openings, handoffs, archives, reader context and accessible labels. “Presence”, “Momentum”, “Evolution” and “Authority” remain film titles, not garment classifications.
- **Interaction:** existing routing, source-occurrence focus/return, inspection, optional views and reduced-motion behavior are preserved and exercised. No second router or new reader platform was added.
- **Mobile:** portrait frames are reviewed independently; the longer Womenswear product-family title fits. Authentic-source borders remain visible where the original contains them. All ten archive entries remain reachable in every category.

Remaining prerequisites: real owner front/back/third-panel photography, confirmed credits and view labels; replacement of the temporary category-fit exceptions in the audit; physical iPhone Safari, browser chrome/safe-area behavior, hardware memory/frame pacing with real 5400px masters, fullscreen/projector/remotes. No sustained-device FPS claim is made. The complete-look photography tests cannot certify garment completeness inside a future owner's improperly framed panel.

No public preview was created, no production release verified, and no merge or deployment performed. GitHub review materials and the local application instructions are the review method. Owner visual approval and any later integration/release decision remain separate.
