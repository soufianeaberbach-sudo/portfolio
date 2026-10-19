# Phase C QA / executed 19 October 2026 UTC

Scope: isolated Menswear creative concept on
`feat/menswear-cinematic-presentation`, based on
`65ab3a07c2729b42cd72e50b11ff7f63767c614b`.
No production integration, public router alteration or forty-look completion is
claimed. Automated passes are not artistic approval.

## Executed checks

| Command / check | Actual result |
| --- | --- |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers node tests/menswear-concept.mjs` | PASS, **970 assertions**, final run 19:56 UTC; [machine results](RESULTS.json). Six sizes, four worlds, five shots each; geometry, title clearance, image readiness, no horizontal overflow, hidden-look inertness, archive/reader access, exact occurrence/focus return, interruption, keyboard, touch/pinch and reduced motion. |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers node tests/menswear-concept-stress.mjs` | PASS, **21 assertions**, 19:57 UTC; [results](STRESS.json). Delayed decode, rapid world changes, failed destination, failed initial image, fullscreen denial, resized interrupted return, 1920×1080 and mobile keynote framing, actual wheel and actual touch-event exploration. |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers node tests/menswear-concept-capture.mjs` | Completed after source refinement, approximately 19:59 UTC. All six viewport matrices and continuous desktop/mobile recordings generated from the real browser. |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | PASS, **11 public pages**, final build completed 19:59 UTC. No lab page emitted. |
| `ASTRO_TELEMETRY_DISABLED=1 SMOKE_PORT=4361 PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers npm run test:smoke` | PASS, exit 0. Existing Portfolio smoke suite retained unchanged, including Womenswear and legacy Menswear behavior. |
| `npm run test:domain` | PASS, **138 passed, 0 failed**. Existing suite unchanged. |
| Temporary TypeScript 5.9.3 `tsc --noEmit --skipLibCheck --module esnext --moduleResolution bundler --target es2022 --lib es2022,dom,dom.iterable src/lab/menswear/frames.ts src/lab/menswear/proof.ts` | PASS, no diagnostics. Compiler used from a temporary npm cache; no dependency or lockfile change. |
| Clone-and-serve review with all non-local requests blocked | PASS. Local fonts, original/new photos, direct world selection and photo reader work without an external CDN. Rechecked after final source/bundle generation. |
| Protected-tree comparison against the main baseline | No changes in public Portfolio, components, data, styles, scripts, images, worker, .github, Astro/package/deployment configuration. |
| Production output scan | No `/lab/menswear` output, review path, concept markup or new review photograph included in `dist`. |
| `git diff --check`, source-asset dimensions/hashes, review-link and exact-file-manifest validation | PASS in final publication check. |

The proof tests expect the development server on port 4357, as described in
[README.md](README.md). Tests are focused additions; no existing assertion was
removed or weakened. Source capture scripts are committed, raw intermediate
WebMs and decoded frames remain outside Git.

## Defects discovered and corrected

- An early fixed overlay allowed programmatic positioning but prevented real
  wheel/touch scroll. The actual motion review exposed it. A native scroll
  walkway with sticky framing replaced it; both input paths now have regression
  checks. Passing direct scene tests alone was insufficient.
- Chromium's `synthesizeScrollGesture` with touch mode did not generate scrolling
  in this environment. The test/capture now sends actual touchStart/move/end
  events. The real element scroll offset and scene position must change.
- Presentation Mode initially concealed Worlds. Its control now remains available
  on desktop and mobile, with safe independent mobile toolbar space.
- Delayed old source decodes could otherwise restore stale work; generation
  tokens and destination preparation protect current state. Failed destinations
  retain the current scene; failed initial sources retain navigation/exit.
- Resize during return now settles the clone and recomputes framing. Native
  Explore position is preserved as a normalized scene position on resize.
- Mobile titles now reserve measured image space. Empty photographic margins
  are windowed only where safe, with complete-source reader access.

## Visual and motion review

Reviewed actual output at **1440×900, 1366×768, 1024×768, 768×1024, 430×932 and
390×844**, plus a 1920×1080 keynote sanity check. All four storyboards were reviewed
at those six sizes. Native opening, payoff, archive, menu, reader and inspection
frames provide detail beyond the contact grids.

The continuous [desktop](motion/desktop.mp4) and [mobile](motion/mobile.mp4)
recordings show native input, manual keynote advancement/interruption, direct
category jump, inspection and exact scene/archive return. They are browser
captures, not reconstructed animations. Only 0.3 seconds of startup is removed;
H.264 encoding changes the container/codec, not playback speed or scene order.
All 186 sampled frames at 4 fps were visually inspected; see [motion metadata](MOTION.json)
and [critique](CRITIQUE.md). Static tests do not substitute for that review.

## Boundaries and unresolved verification

- Chromium emulation is not physical iPhone Safari, a hardware remote, real
  fullscreen policy on every device or physical projector validation.
- No 60fps, Core Web Vitals, sustained device-performance or 4K fidelity claim.
  Transform-based motion and existing GSAP avoid a new rendering framework,
  but actual device measurement remains required after concept approval.
- Only fourteen sourced candidates are in the proof; 26 future positions are
  unsourced. Each displayed current candidate is unique. No invented Front/Back,
  technical stages or common project history is shown.
- Full public history/deep links, forty-look archive coverage, genuine multi-view
  switching and shared router integration are future approval-gated work. Current
  public behavior remains untouched; the proof has local state, not a second router.
- JavaScript is required for this isolated proof. It does not replace the public
  site's fallback. Production fallback requirements belong to the approved
  integration task, not a claim made by this prototype.
- Streetwear has the authored motion treatment. Other worlds are visual/keynote
  studies with the remaining artistic reservations listed in CRITIQUE.md.

No blocking failure is concealed. **Ready for concept review; not production
approval.** No PR, merge, hosting deployment or production configuration change.
