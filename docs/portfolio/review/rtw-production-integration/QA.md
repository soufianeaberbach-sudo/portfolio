# Executed production integration QA

Date: **2026-10-18 UTC**. Base: `e9793113d29767fdf0a4be1bcb4d1d7918e94d82`.
Branch: `feat/rtw-cinematic-production-integration`.
The task implements photographic Capability A only. Art direction is approved in
principle; a Draft PR is authorized after hardening. Merge and deployment remain
separate approval checkpoints. Passing tests does not grant either approval.

## Production baseline, captured before integration

The unmodified main build succeeded: **11 production pages**.
The existing smoke suite passed **352 checks, 0 failures**; opening passed
**100 checks, 0 failures**. All 17 direct reference links opened without process
stages; recorded navigation returned to the category, Back reopened the reference,
and Forward returned again. Baseline reader recordings were retained as local raw
QA, with representative front/back/inspection screenshots published separately.

Baseline render sizes: **1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844**.
RTW, all four protected category arrivals, reader front/back, inspection, return
and the opening were captured in a separate baseline directory with font fixtures.
The published baseline retains six RTW arrivals and desktop/mobile reader states;
protected arrivals appear in the before/after comparison sheets.

An initial smoke invocation failed to start because telemetry attempted to create
an unavailable home configuration directory. Setting `ASTRO_TELEMETRY_DISABLED=1`
resolved the environment issue. The existing Playwright 1.56.1 Chromium was
installed in `/tmp/aberbach-pw-browsers`; no repository dependency changed.

## Final executed checks

The built preview used `http://127.0.0.1:4371`; development iteration used 4373.
Focused final suites were explicitly rerun against the **built preview**, not
only Astro dev. Browser commands used
`PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers`.

| Command | Executed result |
| --- | --- |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | PASS, 11 production pages. |
| `ASTRO_TELEMETRY_DISABLED=1 SMOKE_PORT=4380 npm run test:smoke` | PASS, **352**, 0 failures. The script runs its own preview and a temporary static fixture server. |
| `PORTFOLIO_QA_URL=http://127.0.0.1:4371 npm run test:opening` | PASS, **100**, 0 failures. |
| `PORTFOLIO_QA_URL=http://127.0.0.1:4371 node tests/rtw-production-integration.mjs` | PASS, **783**. Six exact viewports, all 17 mappings/readers at each size, real views, whole-source exceptions, source-occurrence/scroll/focus return, history, inspection, interruptions, camera reframing after resize, protected Activewear access and native no-JavaScript access. |
| `PORTFOLIO_QA_URL=http://127.0.0.1:4371 node tests/rtw-production-reliability.mjs` | PASS, **74**. All 17 cold deep links and actual decoded sources; genuine front/back travel; real CDP swipe/pinch, inspection resize and persistent image-failure feedback/return. |
| `node tests/rtw-pre-pr.mjs` on the built preview | PASS, **373**: all 17 archive links through native Tab, real phone swipes, repeated keyboard and interrupted pointer entry/return, exact occurrence/scroll/focus, preference changes. |
| `FOCUS_CPU=4 node tests/rtw-focus.mjs` | PASS, **12/12** concurrent scenarios; keyboard variant **8/8**. See [controlled investigation](FOCUS.md). |
| TypeScript `--noEmit` for the four new RTW script modules, ES2022 + DOM, bundler resolution | PASS, no diagnostics. |
| Production output inspection | PASS: no lab routes, Connolly, CGElves, ST656-1, Night Drifter or V-lab source URLs in emitted HTML/JS/CSS/JSON. |
| Git scope/integrity | PASS: production images, portfolio data, studio-gap adapter, shared Womenswear/cover styles, backend and configuration unchanged. |

The final small whole-pair label edit was additionally rendered in the actual
390px and 768px reader: `FRONT + BACK` stays readable without the former four-line
wrap. Both complete figures and Look Closer remain available.

Interim failures were investigated rather than hidden or waived:

- A smoke fixture port collided with the local dev server (`SMOKE_PORT + 1`).
  Dedicated 4380/4381 ports resolved it.
- Rebuilding output while a browser suite was navigating produced an invalid
  intermediate run. Final output was stabilized before verification.
- The original parallel BODY failure was investigated during final hardening.
  Old animated test positioning reproduced failures in two independent parallel
  controls (8/12 and 2/12); synchronous fixture positioning passed 12/12 under
  4× CPU throttle and 8/8 keyboard scenarios. The unchanged focus assertion then
  passed in the complete smoke suite run alongside opening. See [FOCUS.md](FOCUS.md)
  for traces, causal limits and CI isolation. Production focus code was unchanged.
- The initial new suite assumed assigning an unchanged hash would re-enter the
  category. It now exercises the real category link, which invokes the router.
- The all-reference geometry check exposed the portrait-tablet whole-pair width
  issue. Portrait composition was corrected, not the assertion.
- Real pinch initially hit a density-adjusted intrinsic-size ceiling. Source
  dimensions/high-resolution inspection were corrected; the real touch test passes.

## Visual and motion review

All six sizes were rendered in the real browser using Archivo, Inter and JetBrains
Mono from the existing fixture. Primary shot, traversal, pause, payoff, archive,
reader, actual back, inspection, return and Activewear handoff were inspected.
Full silhouettes were reviewed source by source in the front/back audit sheets.
Reference 08 and 16 remain whole pairs at phone and tablet sizes.

Four native browser recordings were encoded as H.264 MP4; only the first 0.25s
loading interval is trimmed. Final source takes are approximately **17.00s desktop,
15.40s mobile, 4.68s interruption and 2.52s reduced motion** before that trim.
The browser sequence was inspected as decoded 5fps frame sheets, with selected
native frames examined around entry/return. START, MIDPOINT and PAYOFF were also
captured as individual compositions. These are not screenshot animations.

Corrections from visual critique:

- Primary garment identities remain complete; oversized detail planes removed.
- Studio-gap floor spill reduced through measured empty-margin apertures.
- Unrelated silhouettes no longer show through a translucent reader floor.
- Copy and controls stay clear while the measured garment crosses their field;
  Return stays available and keyboard focus can settle the cut.
- Portrait readers fit the complete source to both width and height.
- Inspection controls now share a quiet white footer instead of isolated white
  button patches over the photograph.
- Original source shadows/texture remain; no background removal or recoloring.

## Protected category comparison

Activewear, Streetwear, Occasion and Swim retain their component markup, image
metadata, shared CSS and generic reader behavior. Published desktop/mobile sheets
compare the original and integrated category-relative arrivals. All 24 local
six-size arrival comparisons were reviewed; small scroll/subpixel rounding
variations remain. The JPEGs are not claimed to be pixel-identical.

The opening suite's only adaptation changes its obsolete RTW hero selectors in
its final reduced-motion chapter-entry checks. Garment-height/type-clearance
assertions and the protected opening assertions remain. Smoke changes retain
49 unique Womenswear identities while allowing duplicate camera/archive doors,
and preserve real view, magnification, keyboard, touch, deep-link and focus checks.

## Limits and approval boundary

- `rtw-ref-17`'s frontal elbow is already cut at the original source-panel seam.
  The UI preserves those source pixels and offers the original; it cannot recover
  missing anatomy without inventing imagery. Studio seams/shadows remain authentic.
- Complete inseparable pairs are width-limited on phones. They remain inspectable;
  separate artificial Front/Back crops are not offered.
- The archive is deliberate discovery utility, not another cinematic scene.
  Reduced motion/no JavaScript use one full anchor plus the complete archive.
- Chromium emulation does not certify physical-device Safari or measured 60fps.
  No perpetual effect, extra library, WebGL or backend change was introduced.
- Only reference photography is public. No verified technical story is supplied
  or implemented. Capability B requires separately approved genuine owner evidence.

No new visual assets were downloaded. No public source photographs were changed.
Draft PR preparation is authorized following these checks. No merge, deployment,
Cloudflare change or historical-branch rewrite occurred.


## Final pre-PR visual review

Only the archive discoverability treatment changed after `929f24f`: a static
10px mono “SWIPE TO EXPLORE” line with a small red directional mark. It appears
on phones and portrait tablet; desktop keeps the approved composition. Existing
rail semantics already announce horizontal exploration to assistive technology,
so the duplicate visual cue is hidden from the accessibility tree. No carousel
buttons, cards, snapping changes, new animations or new input handlers were added.

Actual archive views were checked at all six sizes: all contain 17 references,
none overflow the chapter; the cue appears at 390, 430 and portrait 768 only.
Full-resolution 390/430/768 archive screenshots and a dedicated
[before/after](archive-mobile-before-after.jpg) are published. The 390 archive
and archive-return screenshots and mobile movie were refreshed. Unaffected
opening/reader/desktop screenshots, desktop movie and protected comparisons are
retained from the approved render; no redundant capture collection was committed.

Seven-dimension critique of this focused change:

1. Fashion hierarchy: the rail's original complete silhouettes and scale remain.
2. Image integration: the cue adds no surface behind the white photography.
3. Composition: it sits under archive context, above the figures, without overlap.
4. Rhythm: the rail remains utility after the cinematic passage; no new pause.
5. Typography: the quiet text is readable at 390 and supports discovery.
6. Interaction: actual swipes move the rail; native Tab brings all 17 doors into
   view. Direct navigation, early returns and reduced motion remain controllable.
7. Mobile: 390/430 and portrait 768 retain clear handoff and category controls;
   the instruction no longer depends on seeing an operating-system scrollbar.

The unchanged desktop movie and updated phone movie were inspected through
extracted 5fps frames and timestamped 2fps review sheets, including camera start,
midpoint/payoff, measured entry, reader, inspection and return. No new blank
frame, ghosted garment, stale clone, image-scale jump or control collision was
observed. The phone movie includes a real archive swipe and last-reference
entry/return. Existing opening-layer arrival remains visible at movie start;
source exits at stage edges and the intentional Look Closer crop remain distinct
from complete resting garment shots. This is visual review, not a hardware
frame-time or physical Safari certification.

The 373-input suite additionally repeats keyboard/archive returns and early
pointer interruption at 1440, 1024, portrait 768, 430 and 390. All six exact
viewports and every reference are covered by the 783-check integration suite.
Protected category assertions pass in smoke; their source/styles/photographs and
published comparison sheets are unchanged from `929f24f`.
