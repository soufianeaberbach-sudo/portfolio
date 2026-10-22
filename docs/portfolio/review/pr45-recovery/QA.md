# Executed QA — PR #45 recovery

22 October 2026 UTC. Final application source `d2d85aaca192bf95757c4be1cb16996957ae038a`;
subsequent review changes contain evidence/docs and a capture helper only.

## Technical gate

[GitHub run 39749114581](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/39749114581)
completed **SUCCESS** for the source correction. This is an actual remote result,
not a local pass substituted for failed CI. Original run 39684977683 and diagnostic
run 39746675476 remain failed historical evidence. The final review commit triggers
a separate full run; its result is checked and linked in the final PR handoff.

| Executed check | Result / scope |
| --- | --- |
| Node 22 production build | PASS, 11 pages/endpoints |
| TypeScript 5.9.3 affected reader/utility check | PASS, no emit |
| Original unchanged Node 22 photography fixture | 270 PASS locally; did not dismiss failed CI |
| Four-times CPU-throttled original fixture | 270 PASS locally; no environmental root-cause claim |
| Repeated original selections | 192 PASS locally; failure still reproduced in diagnostic CI |
| Cold Original request experiments | 20 actual delayed source selections PASS; not a fix claim |
| Native decode isolation | 30/30 active decodes rejected by same-value sizes reassignment; 0/30 unchanged, 0/30 assignment before decode after frame boundary |
| Controlled old-reader failure | Loaded 5400px Original remained hidden; observed old error/selection reproduced |
| Corrected photographic fixture | **474 PASS locally and remotely**; all six sizes; native in-flight decode, redundant hidden decode rejection, held/late/distinct/failed requests, ARIA state, keyboard recovery, mobile taps, exact thirds/alpha, single/two-up/inseparable cases |
| Actual source/geometry preservation | 108 identical subject fingerprints, 224 unchanged original files, 8×10 unique edit slots |
| Owner-contract browser suite on corrected build | **376 PASS**; every actual historical route/image, real wheel/touch through both chapters, direct jumps, manual world boundaries and source occurrence |
| Protected opening / whole-site smoke in remote CI | **302 PASS, 0 failed**; all protected page, chapter/reader/navigation assertions retained |
| Remote reader/continuity | 49 Menswear navigation; 12 resize return; 98 Womenswear continuity; 48 actual WAAPI return midpoints; 40 cold-navigation checks PASS |
| Remote presentation/history | 264 endpoint/interruption/focus; 32 historical list; 10 archive keys; 20 bare-chapter Back/Forward/Escape; 8 cross-subject origin; 16 delayed/failed media PASS |
| Remote content/geometry/source | 167 Menswear +111 Womenswear +23 photo configuration checks PASS; 108/224 audit PASS |
| Other existing CI gates | Worker 509 and domain 138 assertions PASS; production checker, build and Worker dry run succeeded; no deployment |
| Fresh visual baseline audit | 24 world/viewport cases; actual opening/midpoint/payoff/archive/reader/inspection/return/handoff captures |
| New current-source motion | Desktop and phone; all 20 composed holds, 8 actual film reader inspections/returns, rapid reversal/interruption and reduced-motion cases; no runtime errors |
| Presentation1920×1080 | 20 actual holds PASS; Chromium fullscreen exercised successfully |

Commands use pinned Playwright 1.56.1 / Chromium 141.0.7390.37 build 1194 and locally
Node 22.23.3, matching the CI application runtime/browser. Local Debian13 is not
identical to GitHub's Ubuntu24.04.5. Archivo/Inter/JetBrains Mono fixtures were
installed before captures; fallback fonts were not used to judge geometry.
[Machine report](RESULTS.json) lists commands, logs and scope; no older 585/1751
pass counts were silently reused as current executions.

## What failed during this investigation

- Reproducing unmodified code locally passed. Diagnostic CI then proved failure
  at 430px and exposed valid loaded images plus a rejected request. That second
  failure was investigated, not retried until green.
- The strengthened failed-source test initially failed: Arrow Right advanced from
  stale requested view3, not visible view1. This led to the actual requested-view
  recovery fix. The assertion was retained and now passes in both adapters.
- An initial isolated native-decode experiment mixed consecutive attribute changes.
  Frame-separated controls removed carryover: unchanged 0/30, size-write-before 0/30,
  size-write-during 30/30, loading-write 0/30. The report uses the isolated results.
- The first local storyboard render referenced the suit's incorrect `.webp` path.
  The verified original is `/portfolio/editorial/pexels-16862147.jpg`; the study
  path was corrected and rerendered. No production asset was altered.

No timeout increase, skipped configuration, retry-until-pass policy, fabricated
fixture garment, source substitution or removed meaningful assertion. Geometry
registration fields are explicitly **TEST ONLY**. Genuine owner master acceptance
remains pending real files.

## Visual findings

All primary paused figures remain complete in the six-size audit and 1920px
presentation. At 1024px the earlier Casualwear title clearance still helps. The
390px archive/reader/inspection captures keep controls reachable. Sources retain
real studio/location grounds and native proportions.

The critical artistic weaknesses are the Activewear body-crossing diagonal mask,
Streetwear's closing full-grey atmosphere and uneven comparison scale, and the
Casualwear extra insert before the neutral finale. Tailoring's context cut remains
honest and preferable to a fabricated spatial bridge. See the precise
[world-by-world proposal](ART-DIRECTION.md) and current decoded motion. These
findings do not amount to owner approval. Proposed stills are not tested new motion.

## Performance, access and limits

[Memory observations](MEMORY.json): a bounded Chromium JS-heap/DOM sample before
and after 24 explicit world jumps. It excludes native/decoded image/GPU memory and
cannot prove leak freedom, sustained performance or physical Safari behavior.
Repeated source updates/decode work were reduced; no additional animation engine,
photography processing or source files were introduced.

No exact-commit hosted PR preview was verified. The connected Netlify deployment
is an older unrelated application, not this PR. No new deployment was authorized
or performed. [Exact local / same-network iPhone method](README.md#interactive-review-access).

Physical iPhone Safari, browser chrome/safe areas, real presenter remotes,
projectors, screen readers, hardware frame pacing and real owner 5400×2700 files
remain unverified. No 60fps claim. No owner artistic approval, merge or production
release. Main and all protected chapters, assets and infrastructure remain intact.
