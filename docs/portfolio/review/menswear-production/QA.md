# Menswear production QA

Executed 20 October 2026 UTC in the managed Linux workspace. Node 24.19.0, Playwright 1.56.1, Chromium 141.0.7390.37. Archivo, Inter and JetBrains Mono fixtures were installed for browser review. Physical Apple devices, remotes and projector hardware were not available.

## Application and scope

Base: main `65ab3a07c2729b42cd72e50b11ff7f63767c614b`. Production implementation and review are on `feat/menswear-cinematic-production`; no merge/deployment is authorized or performed. The PR’s final HEAD identifies the complete source and evidence snapshot.

Womenswear components, photograph data, direction maps, image utilities, source assets and styles are byte-identical to the base. Only the Portfolio integration point/router adds a scoped Menswear adapter. Existing Development, Tech Packs, covers, Home, Contact, backend and production configuration are unchanged. CI additions run content/continuity checks; they do not deploy.

## Executed results

| Check | Actual result |
| --- | --- |
| `npm run build` | PASS · 11 public pages; development-only lab produces no routes |
| Targeted TypeScript compilation of Menswear data, direction, film and reader | PASS |
| `node tests/menswear-content.mjs` | 167 passed · ten slots/world, forty unique displayed sources, all historical identities, licensing and supplied-view replacements |
| `node tests/final-photography.mjs` | 9 passed · composite, inseparable, unknown split, separate files and optional media |
| `node tests/womenswear-ten-looks.mjs` | 113 passed · protected fifty-look/eight-excluded Womenswear contract |
| `node tests/menswear-production.mjs` | 585 passed · every displayed look, ten historical exclusions, full-source inspection, six viewports, all authored rests, presentation keys and source focus |
| `node tests/menswear-navigation.mjs` | 49 passed · rapid interruption, direct jumps, Back/Forward, preference changes, actual CDP touch events, cross-chapter cleanup and no-JavaScript fallback |
| `node tests/menswear-resize-return.mjs` | 12 passed · desktop/phone role substitution, recomputed geometry, resized archive occurrence and clone cleanup under both motion preferences |
| Unmodified `node tests/womenswear-continuity.mjs` | 122 passed · actual pointer entry, interrupted return, resize, reader views and focus across all protected categories |
| `npm run test:smoke` | 302 passed / 0 failed |
| `node tests/portfolio-opening.mjs` | 100 passed / 0 failed |
| `npm run test:worker` | 509 passed / 0 failed · no backend source changed |
| `npm run test:domain` | 138 passed / 0 failed |
| `npm run test:production` | 6 passed / 0 failed · stubbed checker only, no live deployment verification |

`PORTFOLIO_QA_URL=http://127.0.0.1:4393` selected the built local preview for browser checks. Smoke started/stopped its own preview on a separate port with `ASTRO_TELEMETRY_DISABLED=1`, avoiding a telemetry write outside the managed workspace. GitHub Actions is a separate result and is reported on the PR; local passes are not presented as remote checks.

## Real visual and motion review

Reviewed 1440×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844; also captured 1920×1080 presentation stills. Each world’s five moments, archive, photographic reader, source return and handoff were captured in the actual Portfolio. [VIEWPORTS.json](VIEWPORTS.json) records 28 category/viewport reviews, all without document overflow and all with source focus restored. Full desktop/phone stills and concise other-size sheets are retained; raw duplicate captures stay outside Git.

Six continuous browser recordings show desktop/mobile presenter controls, desktop native wheel exploration, mobile native touch exploration, reduced motion and direct return while the source is zoomed. They are browser-generated recordings encoded to H.264 without reconstructing movement from stills. Decoded frames across the complete recordings were inspected, including opening, camera gates, final poses, archive entry, zoom/return and rapid interruption. Empty padded cells in the temporary decoding contact sheets are not browser frames and are not published as evidence.

### Visible findings corrected

1. Oversized kneeling and small standing figures gave an unconvincing human-scale relationship. The desktop compression view now gives the genuine low pose its own field; phones use a standing alternative.
2. An overlap left red head/foot bands behind the phone’s kneeling image. The portrait sequence now selects one complete white tracksuit at that point, with no residual figure.
3. Centred wipes combined unrelated bodies. Portrait transitions now use deliberate complete-shot edits; the principal architectural reveal and the wide RTW interval retain their source-supported motion.
4. The opening opacity transition ghosted cover models through the new photograph. Menswear enters as an opaque viewing space without modifying the cover.
5. The final Streetwear figure was too small inside blank source margins. A verified empty-margin window increases presence while retaining the whole garment.
6. Adjacent Tailoring phone frames repeated the same studio subject. A complete pale suit now supplies a distinct light-colour counterpoint.
7. A closed Menswear actor could intercept a protected Womenswear pointer click. Closed-world visibility/pointer containment now suppresses it; the unmodified physical-pointer regression passes.
8. Direct historical routes could capture an unrelated previously focused archive link. Return-source validation now requires the actual selected reference ID.
9. Reduced-motion Back could lose focus to a native category fragment target. Targets remain in the no-JavaScript HTML but are removed from enhanced Menswear category navigation, leaving the router authoritative.
10. Cross-breakpoint return could retain stale camera geometry or substitute a different responsive actor. Geometry is repainted during inspection; the actual source role is held until deliberate progression. Archive position is not replaced by a camera offset.
11. The portrait tablet opening let its title overlap the photographic field. A dedicated upper title zone and complete single-look framing now apply to tall tablet canvases.
12. RTW’s opening progression still tracked the old concept too closely. A real carried-chair photograph now reverses the expectation of another seated pose and gives the final expansive gesture a clearer antecedent.
13. Inspection could retain a responsive thumbnail. Opening a reader now prepares the selected full source; its match-cut clone also decodes the full rendition.
14. A direct return while zoomed could reset the reader before its measured exit. The exit now retains the actual inspected source geometry, clips the travelling clone to the reader viewport and resets only after hiding. The dedicated browser recording ends at the original focused source with no abandoned clone.
15. A future replacement could inherit the former photograph’s crop, architectural seam or dark stage. Source-specific effects now require their exact source; other files receive complete primary geometry and a neutral ground. Responsive thumbnail descriptors also use actual file dimensions.

## Smoke coverage migration

The removed Menswear tests described the retired four-card wheel: forced scale ratios, atmospheric blur, wrap-around, dragging that stack and three fabricated development-plate slots. These mechanisms are no longer public Menswear behavior. Their access, keyboard, integrity, photographic inspection and return guarantees are covered by the actual new films, archives and readers. Unrelated opening, Womenswear, Tech Pack, Development, legal, contact and backend assertions remain.

The old global assertion “no element has `inert`” incorrectly rejected intentionally disabled hidden camera actors. It now verifies the exact background surfaces controlled by the router. One initial smoke attempt also encountered an already occupied auxiliary port; the final run used an isolated port. A publication rerun initially omitted `ASTRO_TELEMETRY_DISABLED=1`, so Astro exited before serving the application when it could not create its external configuration directory. The corrected environment disables telemetry without changing application code or assertions. These startup conditions were diagnosed separately from application results.

## Performance and limitations

[PERFORMANCE.json](PERFORMANCE.json) contains the actual local request profile and headless 180-frame scripted-scroll timing, with its measurement limits. Source windows use finite DOM planes and scoped rendering; there is no perpetual effect, WebGL layer or new runtime dependency. Hidden readers stay lazy, and the selected reader requests its full source only when entered. The closed chapter skips rendering where supported; older browsers retain visibility and pointer safeguards.

These measurements do not certify physical 60 fps, Safari memory use, touch latency or projector quality. Native Safari fullscreen, dynamic browser chrome/safe areas, physical iPhone pinch/swipe and actual remotes need real-device review. Current high-resolution local additions are 1800/2000px renditions, not a claim to camera-native detail.

### Pre-existing protected behavior observed

A fresh local `#womenswear/activewear` arrival can retain the RTW opening position while the URL already names Activewear. The same cold/warm distinction was reproduced in the preserved main-derived baseline and this feature, using byte-identical Womenswear and Portfolio baseline source; warm category navigation reaches Activewear in both. It has not been silently fixed through this Menswear task. The protected comparison uses equivalent warm navigation. This observation is not a claim about the exact deployed website version.

### Content and artistic limits

All forty displayed looks remain independent reference photography. No owner project, garment relationship or development evidence is invented. The historical page for Pexels 30954220 now returns 404; its already-existing production file/license record is preserved and the missing creator is not fabricated. All thirty-four new source files have verified individual licensed-source records.

The Streetwear architectural passage is the most source-specific cinematic idea. Other films depend more on editorial rhythm, genuine posed contrasts and photographic atmosphere. Temporary images cannot provide the continuity of an owner-directed campaign shoot. Final artistic approval and merge/deployment approval remain the owner’s separate decisions.

## Rollback

Revert this PR’s merge commit through a reviewed rollback branch if integration is later approved and regresses. No data migration or backend reversal is required. The original historical reference arrays, photographs, Womenswear implementation and experimental branches remain intact. Do not merge either concept branch as a rollback or integration strategy.
