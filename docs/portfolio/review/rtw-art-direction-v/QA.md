# Final V — executed QA

Date: **2026-10-12 UTC**. Repository: `soufianeaberbach-sudo/portfolio`.
Branch: `review/rtw-art-direction-v-final`. Clean base: IV `7be2db9`.
These are executed results from this final refinement, not inherited pass counts.
Tests passing do not grant artistic or production-integration approval.

## Commands and results

| Executed command | Final result |
| --- | --- |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | PASS, 11 production pages. No lab routes or example source assets in `dist`. Empty development-proof chunks are eliminated; expected build warnings noted. |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers node tests/rtw-art-direction-v.mjs` | PASS, **610** checks across six sizes, real source resolutions, original front/back, whole-source fit, all document edges, reset, keyboard, partial stages, reduced motion, interruption and exact return. |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers node tests/rtw-art-direction-v-reliability.mjs` | PASS, **77** checks: existing Subject/Project selectors, fixtures rejected as owner history, reference-only mode, missing independent sources, surviving construction source, pointer early return, stale callbacks, deep links, front during arrival, actual emulated pinch, inspector resize, canceled retreat/re-entry and changed reduced-motion preference. |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers PORTFOLIO_QA_URL=http://127.0.0.1:4361 node tests/rtw-cinematic.mjs` | PASS, **181** public RTW continuity checks: all 17 references, real source views, reader/Look Closer, touch, keyboard, deep links and return. |
| Offline HTML browser exercise at 1440×900 and 390×844 | PASS, complete B–E navigation, source inspection, return/focus and all three intended fonts; **zero HTTP requests and zero page errors**. Source/license links are intentionally external when selected. |

Dev proof tested at `http://127.0.0.1:4352/lab/rtw-v/journey/`.
The port is local review configuration; the published proof uses relative sources.
No dependency or infrastructure change was required.

## Actual visual review

Browser/font-fixture review at **1440×900, 1366×768, 1024×768, 768×1024,
430×932 and 390×844**. Every A–E movement reviewed. Additional full-source and
intentional detail frames cover illustration, flat, whole pattern and digital render.

Findings and final corrections:

- A/E retain complete heads, garment hems and shoes, natural source proportions,
  genuine back, clean photographic ground and original source pixels.
- B's initial full-paper framing gave the drawing too little authority. Its
  measured 9%/11% outer-paper window keeps both drawn silhouettes complete;
  full-resolution inspection retains all paper/title marks. Lossless RGB verified.
- C's former small secondary drawing did not explain construction. The complete
  front/back flat now leads; the matching whole pattern is the next reading.
- Unrelated-medium fade gaps/ghosting were removed. Complete representations cut
  sequentially on the same axis; comparison copy explicitly rejects a causal link.
- Entry/return and resize/interruption defects were tested and corrected. The
  public measured match-cut utility is byte-for-byte unchanged.
- A second 38MP sketch decode caused an inspection delay. The decoded original is
  borrowed into the inspector and restored, reducing that unnecessary work.
- Whole-document overview, intentional sleeve/notch zoom, all edges, Fit/Reset,
  pinch, pan and resize were exercised with the real MoMu SVGs, not specimens.
- Context and attribution remain visible on phones; one representation owns the
  field. No horizontal page overflow or three-model mobile lineup.

Final native browser recordings are encoded as H.264 MP4 and reviewed as decoded
frame sequences, including dense entry, source switching, full inspections,
front/back travel and measured return. Durations: approximately **22.84s desktop,
23.04s mobile, 5.04s interruption, 5.40s reduced motion**. Only initial loading is
trimmed. The recordings are not screenshot animations. Phone includes CDP touch
and a real emulated two-pointer pinch. Additional interruption/resize cases are
executed functional tests, not simulated motion descriptions.

## Integrity, isolation and history

- MoMu geometry/annotations are unchanged from the recovery source: UTF-16 → UTF-8
  transcode only. Native viewBox coordinates are used; no invented measurements.
- Night Drifter TIFF and WebP decoded RGB hash:
  `9ea7f20958240ebc5578365d139dc4c82d4e719a9d373d904d5fdf17d8fb8719`.
  No color/line/background edits or downsampling.
- CGElves original JPEG retained byte-for-byte. No wireframe, recoloring or false CLO label.
- Public source files, photographs, data, reader, navigation, backend and unrelated
  chapters are unchanged relative to IV. No lab or third-party assets emitted to production.
- Recovery remains `320b53754bab1108b9b6982f49634ce749f00ad7`; III remains
  `2c346c8d906e8e6e335f01fb02f13d1325586fff`; IV remains
  `7be2db9889a3b23a6b937487e4d974126fbd1370`; feature remains
  `22bc6a14b508aad57099e6528bd9030d02ce84bd`.
- Clean final changes are enumerated in `FILES.txt`. No raw `.qa-director` backlog
  or duplicate TIFF original is included. No history rewrite or force push.

## Known limitations / unresolved issues

1. **D's palette and morphology mismatch remain.** The authentic purple robe is
   the permitted licensed fallback, separated and labelled honestly. Better neutral
   linked owner evidence or an accessible suitable licensed render is still needed
   for the intended luxury satin-development counterpart. No final artistic approval.
2. These examples do not prove the champagne slip's development. Real owner-supplied
   linked assets and provenance are required. Verified selectors are unit-tested;
   an actual complete owner project has not been rendered or visually validated.
3. Raster D is 1000px. Native source inspection exposes its limit rather than
   inventing resolution. The whole-pattern overview needs zoom for fine annotations.
4. Chromium emulation does not certify physical phones, Safari, browser-chrome
   behavior or a measured 60fps budget. No perpetual effect, shader or new library.
5. Earlier 503 interface failures did not retain an identifiable asset URL. This
   pass reused local verified sources, kept incremental Git checkpoints, avoided
   indefinite unavailable-host retries and publishes review artifacts through Git.

No hidden blocking functional failure remains in the executed scope. **Art-direction
approval and production integration remain separate, pending decisions.**
