# Final executed QA — Womenswear V2.1

Completed 2026-10-19T14:55:12.531409+00:00. Frozen application source:
`2e551d7c5c8fdabd7e17bd1dbc8a1ad0fcf9b8c5`. Reviewed V2 baseline:
`17b119f8e9e771dc20d0eff0f6878f500f4563bf`. Later commits package tests and review evidence.

## Executed commands and results

`ASTRO_TELEMETRY_DISABLED=1 npm run build`: PASS, 11 Astro pages built.
Built preview: `http://127.0.0.1:4389`. Build output remained immutable during
final tests and captures. Playwright 1.56.1 / Chromium with committed font fixtures.
The following suites ran serially, with `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers`
and `PORTFOLIO_QA_URL=http://127.0.0.1:4389`. Smoke owned separate ports 4394/4395.
Commands were `node tests/<name>.mjs` (the smoke/opening scripts are also the
existing npm test commands). Exact timestamps/results are in RESULTS.json.

| Suite | Checks | Result |
| --- | ---: | --- |
| `womenswear-ten-looks.mjs` | 113 | PASS |
| `womenswear-historical-return.mjs` | 96 | PASS |
| `final-photography.mjs` | 9 | PASS |
| `womenswear-v2.mjs` | 1925 | PASS |
| `womenswear-photography.mjs` | 438 | PASS |
| `womenswear-reference-reader.mjs` | 270 | PASS |
| `womenswear-reader-configurations.mjs` | 52 | PASS |
| `womenswear-continuity.mjs` | 122 | PASS |
| `womenswear-responsive-return.mjs` | 80 | PASS |
| `rtw-production-integration.mjs` | 783 | PASS |
| `rtw-production-reliability.mjs` | 74 | PASS |
| `rtw-pre-pr.mjs` | 268 | PASS |
| `smoke.mjs` | 352 | PASS |
| `portfolio-opening.mjs` | 100 | PASS |

Total: **4682 functional/content assertions**, plus four
separate focus-stress scenarios. Counts are reported from this run, not reused
from V2. No final suite failed or required an assertion to be removed.

`FOCUS_WORKERS=2 FOCUS_RUNS=2 FOCUS_CPU=4 node tests/rtw-focus.mjs`: PASS, 4/4.
This replays the original focus assertion under two concurrent workers at fourfold
CPU slowdown; it ran separately from the serial functional suites. See FOCUS.json.

`tsc --noEmit --skipLibCheck --module esnext --moduleResolution bundler --target es2022
--resolveJsonModule --allowSyntheticDefaultImports --lib es2022,dom,dom.iterable`
on the collection, direction and exhibition modules: PASS, zero diagnostics.
`git diff --check`: PASS.

## Content / regression coverage

- Five archives, exactly ten distinct IDs each; fifty unique displayed source
  photographs. Fifty-eight readers retain all 49 historical IDs plus nine additions.
- Every original source path and dimension checked against the committed V2
  reference manifest. Historical arrays, image files and source geometry remain
  unchanged. Excluded eight URLs still open their original readers.
- All 58 URLs inspected at six sizes; all 58 cold phone sources and genuine views
  exercised. All 50 displayed primary windows and 30 available back windows were
  additionally captured from actual readers for visual audit.
- Four inseparable two-up sources stay complete. All ten Swim looks and eight
  added Streetwear sources remain single-view. No missing back/side is fabricated.
- Existing composite/separate Front/Back/Side/Editorial/detail configurations
  tested through the real parser and response-only browser fixtures. No test
  specimen becomes public data. New real-asset readers checked at all six sizes
  for honest credits, full-source access and caption/photo/control clearance.
- Front-only camera state at multiple timeline positions, offstage focus,
  keyboard archive traversal, real CDP swipe/pinch, zoom/pan/Fit, source failure,
  delayed decoding, cancelled view requests, rapid entry/Return, Escape layers,
  exact archive horizontal/vertical return, camera occurrence return, history,
  reduced motion, and no-JavaScript links/resting states covered.
- Twenty cross-viewport source-return cases: all five categories, camera/archive,
  desktop→phone and phone→desktop. Same occurrence and focus, complete visibility,
  no stale match-cut clone.
- Existing smoke and opening suites preserve the protected Portfolio opening,
  chapter cover, other chapters and site navigation. Count assertions alone were
  adapted to the new display contract; historical RTW 17-source checks, focus
  checks, interruption deadlines and other meaningful assertions remain.

## Defects found and corrected

1. First new wide photographs sat too low on phones. Qualified empty-margin
   windows and vertically balanced width-limited frames restore composition.
2. The longest credited caption touched its photograph. Compact credited readers
   reserve clearance; all 54 real-source/viewport combinations now pass.
3. Excluded direct URLs had no visible source door on return. The category
   control now receives focus when no photographic occurrence exists.
4. Forward traversal generated popstate and hashchange for the same route,
   rerunning category arrival and stealing restored focus. Womenswear history
   now ignores an already-synchronised duplicate; explicit navigation still
   reapplies the requested shot. All eight excluded URLs pass close/Back/Forward
   at 1440 and 390 with the original focus assertions retained.

During refinement, intermediate regression runs were deliberately stopped when
source fixes required a new build. A new source-link test initially compared a
relative asset path with the browser's absolute href; the comparison now resolves
the URL and still requires the exact same pathname. The final frozen-build run
above is complete and has no concealed failures.

## Actual visual and motion review

All five categories reviewed at 1440×900, 1366×768, 1024×768, 768×1024, 430×932,
390×844. Thirty eight-state sheets cover opening, camera start, midpoint, payoff,
archive, reader, return and handoff. Native primary-size stills and V2 payoff
comparisons are supplied. Midpoint captures use complete responsive resting
positions, rather than stopping just before a mobile keyframe.

Both continuous native browser recordings were decoded at 4 fps and reviewed:
362 desktop frames, 361 mobile frames. Start, intermediate handoffs, complete
resting views, archive entry, deliberate back/original viewing, inspection,
match-cut return and next-category handoff were inspected. No persistent blank
image, ghosted body, stale transform or accidental primary back view was found.
Short entering/exiting edge crops resolve immediately to complete resting looks.
The final credited-caption spacing is separately recaptured in audited readers;
films open unchanged historical readers. No synthetic video animation is used.

A cold, unpreforced Streetwear navigation probe found all four cast sources loaded
at the opening and subsequent resting shots. This is local-browser evidence, not
a slow-network or physical-device performance benchmark. Animation remains the
existing transform-based GSAP/WAAPI system, without new dependencies or perpetual
work. No claim of measured hardware 60 fps is made.

## Isolation / protected data

Build inspection confirms 10/10/10/10/10 archive entries, 58 readers, 18 intended
new responsive WebP files, no lab/review routes and no Sybil/MoMu/CGElves media or
technical-demo stages in the Portfolio output. Review documents and films are in
`docs/`, not `public/`. Original image changes: zero. Unexpected source changes:
zero against the explicit Womenswear source allowlist. No package, backend,
Cloudflare, deployment, Home, Menswear, Development, Tech Pack or Contact source
changes. The small shared-router changes are scoped to Womenswear return/history.

## Limits and approval

Physical iPhone Safari, browser chrome/safe areas, thermal performance and sustained
frame pacing require owner/device testing. No new live preview or deployment was
created. Original source texture/artefacts remain visible where present; these are
intentionally framed photographic surfaces, not destructively cleaned backgrounds.
Independent photography varies in lighting and does not constitute one verified
owner collection. Historical external provenance is unknown where not supplied;
all nine new sources have verified Pexels attribution. Owner photography is still
needed for eventual replacement. No Sketch/Pattern/CLO story is implemented.

No merge, PR or deployment. Independent visual approval remains outstanding.
