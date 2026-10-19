# Womenswear V2 — executed QA

Date: 2026-10-19 UTC. Feature baseline: merged main
`dfc2f3d5e9d7aee4bb2906bf15c44dcc3a23d180`.
Browser: repository Playwright 1.56.1 Chromium, committed Archivo/Inter/JetBrains
Mono font fixtures. Node 24.19.0. Actual built Portfolio, not a design lab.

## Scope and browser matrix

Reviewed **1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844**.
Each category's eight-state sheet covers opening, cinematic start, midpoint,
payoff, complete archive, reader, return and handoff. Full-resolution desktop and
phone stills and two actual browser films accompany them. All 49 primary and 36
back windows were also inspected in rendered reader audit sheets.

The before/after material uses the unchanged production baseline built separately
and served from a frozen output directory. Baseline browsing covered all six
sizes; the two primary-size comparison sets were retained. Final and baseline
outputs were served independently, not swapped underneath the same preview.

Visual findings and corrections are recorded in [README](README.md). Garments,
source grounds, title clearance, scale, complete hems/feet, archive readability,
reader controls and category handoffs were reviewed. Native films were sampled
throughout at 2fps and checked at entry/view/inspection/return transitions. The
films retain natural scroll-boundary cropping while leaving a scene; primary
resting compositions preserve complete visible figures. Look Closer is deliberate
inspection, not a primary cropped-body shot.

## Executed regression suites

Final results and execution times are also in [RESULTS.json](RESULTS.json).
All commands below use `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers` locally;
use the installed browser location in another environment. Astro commands use
`ASTRO_TELEMETRY_DISABLED=1` in this workspace.

| Command | Coverage | Final result |
| --- | --- | --- |
| `npm run build` | Production static build, 11 pages | Pass |
| TypeScript `--noEmit` on the four controllers/helpers and final-photography adapter | DOM and model compatibility | Pass, zero diagnostics |
| `node tests/womenswear-v2.mjs` | Six sizes; 49 unique archive doors; all-category navigation, primary-only shots, reader/history/source return, all 49 deep links, reduced motion and no-JS | 1769 checks |
| `node tests/womenswear-continuity.mjs` | All five categories at desktop/phone; rapid entry/Escape/reentry, pointer Return during entry, resize, clones, focus, preference changes | 122 checks |
| `node tests/womenswear-responsive-return.mjs` | Actual camera and archive occurrences in all five categories; desktop→phone and phone→desktop; identity, visibility, focus and clone cleanup | 80 checks |
| `node tests/womenswear-photography.mjs` | All 49 cold phone links, actual decoded sources, 36 Back/Original controls, 13 whole/single exceptions, stable rendition on inspection, real touch/pinch/resize, unavailable source | 384 checks |
| `node tests/final-photography.mjs` | Real adapter with composite, inseparable, separate Front/Back, optional Side/Editorial/Detail, varied aspect ratios, invalid/missing geometry, deduplication | 9 checks |
| `node tests/womenswear-reader-configurations.mjs` | Browser response-only neutral UI fixtures; five actual view slots at desktop/phone, portrait/landscape/tall/square proportions, control clearance, cold decode and cancellation | 52 checks |
| `node tests/rtw-production-integration.mjs` | Existing RTW six-size, 17-identity/source mapping, history, actual occurrence return and no-JS regression | 783 checks |
| `node tests/rtw-production-reliability.mjs` | Existing RTW cold loads, image failure, real swipe/pinch and resize regression | 74 checks |
| `node tests/rtw-pre-pr.mjs` | Existing archive keyboard/touch, repeated exact return and rapid pointer interruption assertions | 373 checks |
| `node tests/smoke.mjs` | Whole-site navigation, truthful references, covers, reader, keyboard/touch and existing chapter behavior | 352 passed, zero failed |
| `node tests/portfolio-opening.mjs` | Protected opening/covers and Womenswear arrival | 100 passed, zero failed |
| `FOCUS_WORKERS=2 FOCUS_RUNS=2 FOCUS_CPU=4 node tests/rtw-focus.mjs` | Original smoke focus restoration under parallel 4× CPU throttling | 4/4 runs |

Built preview: `PORTFOLIO_QA_URL=http://127.0.0.1:4389`. Smoke starts its own
preview and fixture servers with `SMOKE_PORT=4394` (fixture on 4395). Two read-only regression batches ran against one immutable build, with suites
sequential inside each batch; the focus suite deliberately ran its own two
concurrent workers. No rebuild occurred during those final batches. [FOCUS.json](FOCUS.json) retains that final trace.

No meaningful assertions were removed. Legacy `.rtw-*` selectors became the
shared `.ww-*` selectors. Counts remain scoped to RTW in legacy suites. Back/Front
assertions remain; the additional Complete original control changes the expected
count from two to three. The old assertion that the exhibition inherits Back was
changed to primary-only return, as explicitly required. Repetitive “missing story”
copy assertions now check honest Reference photography disclosure and zero fake
stages. View tests await the actual decoded panel instead of assuming that a cold
image is immediately displayed. New delayed-source checks prove the previous
photograph stays visible and a cancelled request cannot win later.

## Timing and loading investigation

An early concurrent capture/input run missed the existing 650ms rapid-pointer
return assertion. Serial runs could pass, so retry alone was not treated as a fix.
Code inspection found that focusing Return during entry cancelled the match cut
and cleared `entering` before the router handled the click. That could start an
unnecessary second 560ms cut, leaving little budget for decoding and frame work.
The corrected focus handler preserves interrupted-entry state; an early pointer
Return now settles immediately. Focus during an outgoing cut settles its pending
completion rather than stranding the reader. The new 122-check continuity suite
includes immediate pointer-return/focus assertions in every world at both primary
sizes. The original 373-check input suite retains its 650ms assertions.
A separately built earlier source provides a negative control: the identical rapid
pointer action did not immediately close the reader before the correction, and
did afterward at both primary sizes. Observed click-to-close times were 875–961ms
before and 106–149ms afterward, including Playwright input overhead; this is not a
hardware performance benchmark. [POINTER-RETURN.json](POINTER-RETURN.json) records
the exact sources, inputs and focus outcomes.

Recorded inspection also exposed transient source clearing during view/rendition
changes. The reader now keeps the current photograph until a replacement decodes,
invalidates superseded requests, prepares only the selected reader's next genuine
view, and uses one native rendition through zoom/reset. All 49 references verify
rendition stability. Neutral response-only fixtures add an intentional 500ms
source delay and cancellation checks; they are not garment photographs or public
assets. Static crop transforms avoid unnecessary nested 3D layers.

A screenshot session was invalidated when a build replaced its asset directory;
a narrow reader capture showed a failed image. That session was discarded from
the review package and recaptured on a stable build, with visible-image decode
checks before saving. Final evidence is not drawn from that invalid session.
An earlier smoke attempt without the workspace telemetry setting also failed at
server startup; it was rerun with the required environment. Neither is reported
as a passing application check.

A responsive-source check additionally found that an original camera occurrence
could become invisible when the new phone edit omitted it from that shot. The
controller now chooses its nearest complete shot on resize, preserving the same
source door. Archive visibility is restored after every responsive stage rebuild
and after removing inertness. Unchanged viewports preserve their exact original
scroll position. [RESPONSIVE-RETURN.json](RESPONSIVE-RETURN.json) records 80 checks
across all five categories, both resize directions, camera and archive doors.
The [responsive return recording](motion/responsive-return.mp4) demonstrates the
corrected RTW secondary-look return; gray letterboxing is the recorder canvas
after the browser viewport narrows, not website whitespace.

## Photography and archive coverage

**17 RTW / 10 Activewear / 2 Streetwear / 11 Occasion / 9 Swim = 49 unique IDs.**
See [REFERENCES.json](REFERENCES.json) for exact existing sources, unchanged
metadata and actual reader views. No source array or production image changed.

Inseparable: `rtw-ref-08`, `rtw-ref-16`, `activewear-ref-10`, `evening-ref-01`.
Single-view: all nine Swim references. These have no fabricated Back/Side controls.
The remaining 36 references expose Front, Back and Complete original. Future
separate/optional photographs are tested through the existing data model and
neutral UI fixtures, not inserted as invented public photography.

Cinematic roles never animate the view window. Returning after deliberate Back
inspection resolves on the primary view before the measured cut. Reader history,
Escape, scroll locking and focus remain owned by the existing Portfolio router.
All archive identities are reachable by native links and keyboard; longer rails
support native touch exploration, with a compact two-door Streetwear equivalent.
No-JS uses server-rendered crop offsets, complete archives and native reader
anchors; its readers expose the whole original without relying on JS geometry.
It is a static document fallback; cinematic history, inspection and measured
source-return interactions require JavaScript.

## Protection, bundle and performance

No changes to public image files, `src/data/portfolio.ts`, existing geometry data,
shared Portfolio styles, Home, Contact, Menswear/Development/Tech Packs components,
backend, Cloudflare, deployment config, package manifests or dependencies.
`portfolio.astro` has scoped Womenswear reader hooks and a bar-aligned arrival for
new photographic worlds; the protected opening controller remains unchanged.
The production build emits 11 pages, no lab/review routes, no review media and no
Sybil Connolly, MoMu or CGElves examples. Review evidence is outside `public`.

Only the active reader and its next genuine view request native-resolution
photography. Hidden readers are not eagerly decoded at startup. Motion uses the
existing GSAP/ScrollTrigger and WAAPI dependencies, transforms and bounded
inspection. There are no shaders, new libraries or perpetual effects. Build-size
measurements are retained in RESULTS.json. No hardware 60fps claim is made.

## Limits and approval

Physical iPhone Safari, dynamic browser chrome, safe-area/thermal behavior,
screen-reader hardware and measured real-device frame pacing remain unverified.
Chromium touch, pinch, keyboard and reduced-motion emulation passed; it is not
real-device approval. Existing photographic gray/paper grounds, source artifacts
and RTW 17's already-cropped elbow remain untouched. Existing chapter crossfades
outside the Womenswear floor are preserved.

No isolated public preview was deployed: no authenticated preview upload target
was available in this environment. Use the branch's built Portfolio locally for
interaction review. No production hosting, DNS or configuration changed.

This is an implementation review candidate, not a declaration of creative approval.
No PR, merge or deployment is authorized or performed. Independent desktop and
physical iPhone review is the next checkpoint.
