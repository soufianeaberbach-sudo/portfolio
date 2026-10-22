# PR #45 — photography decode recovery

22 October 2026 UTC. Corrective continuation of `6abe79a443153c6a6839780cd4e348e6245d60bb`.
Main remains `a4b0aba1591ac043b11ca9b75b6079b0ed27a9be`; PR #45 is open and unmerged.
Source correction: `d2d85aaca192bf95757c4be1cb16996957ae038a`.

## Failure, reproduction and root cause

The complete [original failed job](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/39684977683)
was retrieved and inspected (2,012 log lines). It passed build/smoke, continuity,
route identity and source integrity, then timed out waiting for Womenswear's
Complete Original panel. The original fixture passed locally under **Node 22.23.3**,
Playwright **1.56.1**, Chromium **141.0.7390.37 / build1194**, including a throttled
run and 192 repeated view selections. Those passes did **not** establish a fix.
Local host: Debian 13; GitHub runner: Ubuntu 24.04.5. The previous local report
used Node 24; that mismatch was eliminated for this investigation.

A diagnostic-only commit `b33cf13` added click/state/image output and selected-view
ARIA assertions without removing a check or extending the 30-second wait. The
[diagnostic CI run](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/39746675476)
failed again at **430×932**, selecting view3. Its [actual log excerpt](CI-FAILURE-EXCERPT.txt)
shows the click arrived, view2 remained selected, the status said unavailable,
and all four image nodes eventually reported the same original PNG and 5400px
natural width. This was an application lifecycle defect, not proof of a slow runner.

The controllers and Womenswear prefetch unconditionally reassigned `sizes` during
selection, including the same value on an already-prefetched image. A native
Chromium isolation experiment gave **30/30 rejected in-flight decodes** when the
same `sizes` value was reassigned; **0/30** with no mutation. Assignments performed
before a new decode, after a frame boundary, also gave 0/30 rejections. Thus the
problem is invalidating a pending request, not the image's dimensions or license,
not corrupt fixture PNG generation, and not a need for a larger timeout.

A controlled reproduction against the unchanged compiled reader showed that a
loaded Original receiving such a decode rejection remained hidden indefinitely.
The fixed reader shows Original with the correct pressed state and 5400px source
under the same request outcome: [before](three-panel-before-430.jpg) /
[after](three-panel-after-430.jpg). Registration colours are **TEST ONLY**, not
invented garment evidence. The browser's exact internal scheduling of the first
CI rejection is not observable from its old log; the invalidation mechanism and
permanent-error handling were reproduced independently. No OOM, runner slowness
or Node bug is asserted without evidence.

## Narrow source correction

| File | Change / reason |
| --- | --- |
| `src/scripts/garment-photo.ts` | Idempotent `preparePhotograph`: write loading/sizes only when changed. `sameLoadedPhotograph` recognises another complete window over the full source already displayed. It requires matching actual source URL, positive/equal natural dimensions and completed loads; a thumbnail upgrade or different photo cannot use it. |
| `src/scripts/womenswear-reader.ts` | Apply stable preparation to selection and prefetch. Reuse the loaded master for composite windows; preserve decode gating and honest errors for a different source. On a failed request, restore keyboard progression to the visible view. |
| `src/scripts/menswear-reader.ts` | Apply the same narrow preparation/reuse and failed-view recovery. No film, router, source data, choreography or presentation-layout changes. |
| `tests/three-panel-photography.mjs` | Preserve the original geometry/alpha/source assertions; add selected ARIA state, native in-flight decode preservation, controlled loaded-source rejection, held/distinct/failed-source interruption, keyboard recovery, mobile taps and real inseparable sources. Diagnostic output remains available on failure. |

The failed-view test found a second genuine defect: `requestedView` stayed at a
failed target while the old photograph remained visible. Arrow Right therefore
continued from the failed index. Both controllers now resume from the actual
visible view. Generation guards continue to prevent late requests overwriting a
newer selection, inspection or return. No general retry loop or fake successful
decode was introduced. Different photographs still wait for their own decode.

## Verification and scope

The [source-correction GitHub run](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/39749114581)
**completed successfully**, including **474 real-Portfolio photographic checks**.
See [QA](QA.md) and [machine results](RESULTS.json) for scope and executed commands.
The final review-material commit triggers another CI run; its exact final status
is reported in PR #45 and the delivery message, not presumed from this source run.

No application visual redesign, category/count change, source-image change,
production configuration, merge or deployment. All 108 routes and 224 original
files remain; see [source audit](SOURCE-INTEGRITY.json). Historical reports and
recordings were retained. New browser evidence lives in this new dated directory.
