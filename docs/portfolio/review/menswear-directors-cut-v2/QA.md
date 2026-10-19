# Director's Cut V2 / actual verification

**19 October 2026 UTC · isolated Streetwear concept, not production acceptance.**

Frozen comparison commit: `045bedaded6e3b168dafb60b010f613eca209f6c`.
Branch: `feat/menswear-directors-cut-v2`. Existing public Portfolio, its router,
Womenswear, production photographs, configuration and V1 review evidence are
unchanged. Only new V2 lab/review/test files are added relative to that baseline.

## Executed checks

| Check | Actual result |
| --- | --- |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers node tests/menswear-directors-cut-v2.mjs` | **PASS, 236 assertions**, final run 23:23 UTC; [results](RESULTS.json). Five complete/interactive act rests at all six requested sizes and 1920×1080; image readiness and proportions, overflow, hidden-photo inertness, direct four-world jump, keynote interruption, reader, zoom/Fit, archive/scene source focus, real wheel/touch, reduced motion and resized interrupted return. |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers MENSWEAR_V2_VERIFICATION_VIDEO=1 node tests/menswear-directors-cut-v2-offline.mjs` | **PASS, 8 additional assertions**, 23:24 UTC; [results](OFFLINE.json). All non-local requests blocked. Verifies the committed static proof, measured crop clone, native image ratio during entry, resized interrupted return, exact focus, clone cleanup, reduced motion, fullscreen refusal and direct destination jump. |
| Temporary TypeScript 5.9.3 `tsc --noEmit --skipLibCheck --module esnext --moduleResolution bundler --target es2022 --lib es2022,dom,dom.iterable` on V2 frames / street-film / proof | **PASS, no diagnostics**. Uses a temporary npm cache, no repository dependency or lockfile change. |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | **PASS, 11 pages**. No V2 lab route, concept bundle or review media emitted into production output. |
| `ASTRO_TELEMETRY_DISABLED=1 SMOKE_PORT=4382 PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers npm run test:smoke` | **PASS, 352 passed / 0 failed**. Existing smoke suite and assertions unchanged. Protected public components are byte-for-byte unchanged through later lab-only corrections. |
| Actual browser capture | Six viewport sets plus five native 1920×1080 presentation stills. Continuous desktop/mobile wheel/touch and presenter interactions, not slideshow reconstruction. |
| Git protected-tree comparison | No diff in V1 concept/review, public Portfolio/components/data/scripts/styles/media, worker, .github, package/lockfile or Astro/deployment configuration. |
| Final publication validation | Relative Markdown links, exact file manifest, source hashes, bundled stylesheet parity, `git diff --check` and production isolation checked. |

Tests expect Astro DEV on port 4377 and the repository static server on 4369.
See [local instructions](README.md). Browser capture uses
`tests/menswear-directors-cut-v2-capture.mjs`; set `MENSWEAR_V2_MOTION_ONLY=1`
to avoid regenerating unchanged stills when only the recording needs refresh.
Raw WebMs and sampled video frames remain in /tmp, outside the commit.

## Issues actually found, not hidden by retries

1. A peripheral leaf initially showed part of the departing model. The source
   seam/held crop was corrected; final rest states retain architecture only.
2. Sequential captures showed stale leaf pixels despite an apparently clean
   isolated hero-frame load. Paint containment and explicit visibility cleanup
   were added to the two isolated moving leaves. Repeated sequence captures and
   motion samples check the actual path, not only a direct final-frame load.
3. Native wheel quantization can stop a few pixels short of a mathematical act
   coordinate. Small visual hold ranges stabilize composed rests while leaving
   native scrolling continuous; there is no scroll snap or forced waiting.
4. The first clone-and-serve attempt resolved its relative media base against
   the origin rather than the HTML URL. Corrected base resolution, rebuilt the
   bundle and reran with all external requests blocked. The final local proof
   actually loads; a GitHub HTML source page is not passed off as a preview.
5. A resized reader return exposed a real focus defect: painting temporarily
   made every photographic door inert. The renderer now updates active doors
   without that destructive state toggle. Both the main and offline suites
   assert focus after the resized interrupted return. No assertion was removed.
6. New camera windows required matching the **full same-source plane plus its
   actual clip**, rather than stretching a visible crop to the original reader
   rectangle. Uniform scale and clip travel preserve real proportions.

## Actual visual review

Reviewed the five act rests at **1440×900, 1366×768, 1024×768, 768×1024, 430×932,
390×844**, and **1920×1080** in Presentation Mode. Reviewed opening, expectation,
central source reveal, architectural opening and hero, plus their transition
positions, on desktop and portrait. The [critique](CRITIQUE.md) records the
artistic findings separately from test assertions.

Continuous desktop/mobile browser recordings include Explore, the full manual
passage, interrupted advancement, direct Tailoring jump without traversal,
Streetwear return, original-image inspection, Fit and scene/archive return.
The compact [verification recording](motion/verification.mp4) additionally shows
the resized return, reduced-motion cuts and fullscreen-refusal fallback.

Final MP4s are H.264 versions of real browser recordings. Only 0.3 seconds of
startup is trimmed from desktop/mobile; no scene cuts, speed changes, synthesized
frames or image interpolation. [MOTION.json](MOTION.json) gives final sizes and
sample counts. The final recordings were decoded at 4 fps (**126 desktop,
120 mobile and 15 verification frames**) and inspected across
their full lengths, with special attention to every transition, primary figure,
gate completion and return. This is sampled review, not a claim of frame-perfect
certification. A synchronous real-time video-review UI was not available here.

## Limits / approval boundary

- Physical Safari/iPhone chrome, hardware presentation remotes, real fullscreen
  policy, projector brightness and sustained device frame pacing remain untested.
  No 60fps or final 4K-quality guarantee is made.
- All current imagery remains independent temporary reference photography. No
  owner-authored garment/project relationship, Back/Side view or development
  evidence is invented. Source integrity and rights are in [SOURCES.md](SOURCES.md).
- The four-look Streetwear archive is complete for this concept, not a claimed
  ten-look archive or forty-look integration. Other world destinations are V1
  studies kept for navigation continuity, not newly implemented films.
- The proof requires JavaScript and local serving. Its DEV-only route does not
  replace or certify the public Portfolio's fallback, routing/history or readers.
- Artistic approval remains the owner's decision. See the explicit reservations
  in CRITIQUE.md; automated passes cannot establish the opera-house creative standard.

No PR, merge, hosting deployment, production-domain change or Cloudflare action.
