# Fashion-first Portfolio / paired garment inspection

Owner brief: 25 October 2026. Implementation baseline: latest main `2534e904a63eed2c2a3520371262e243e121428a`, the deployed five-Tech-Pack correction. Working tree was clean before this branch. Open PRs #46 (localization) and #52 (older Tech Pack delivery) were inspected and left untouched. No feature branch was treated as the main baseline.

This candidate implements the owner's explicit new experience contract. It supersedes the older front-only exhibition, selectable Complete Original and horizontal ten-look archive behaviors. It retains the Portfolio opening, chapter covers, white photographic interiors, established red/blue identities, original garment selections, source credits, historical routes, reader return and optional presentation controls.

## What changed

- Fashion is the exhibition image whenever a genuine garment-specific Fashion view exists: 72 of 80 featured looks. Eight Womenswear partial sets have no supplied Fashion view and retain their actual Front photograph. No replacement photography is generated. `fashion-fallbacks.json` records each exact identity, source and reason. Six featured looks lack Back photography; the reader states this without inventing a view.
- Front and Back are visible together in the existing reader: balanced desktop columns, natural Front → Back flow below 900px. Every actual photo has its own zoom, Fit and pan state. The photograph is the clickable target; there is no duplicate enlarged-image box.
- Mouse click/drag, independent +/-/Fit controls, keyboard zoom/pan, and real two-finger touch pinch operate on the selected photograph. Fitted photographs permit native vertical scrolling. Touch panning is reserved for an actively enlarged photo; Fit restores native scrolling.
- Genuine additional Fashion, Side or Detail photographs remain individually accessible below the main pair. No redundant combined master is added. Separable masters use exact existing geometric windows; inseparable historical evidence remains intact as the sole available source photograph when necessary. No original photographic file, credit or identity is deleted.
- Existing cinematic introductions retain their cast, composition directions and scroll-responsive movement while using Fashion photography. Ten-look edits now continue vertically in a staggered photographic sequence rather than requiring a horizontal rail. Direct world and scene links remain optional.
- Continued native wheel/touch/keyboard movement at the end of Womenswear enters Menswear, and at the end of Menswear enters Development, through the existing router. No wheel interception or synthetic scrolling is used to traverse the exhibitions. The existing chapter/reader layers still own their native scrollers; body locking remains limited to an open layer.
- Reader transitions retain the established opaque frame-to-reader clipping language. Midpoint review exposed an outgoing Front/Fashion double pose; the final return stays opaque and hides the origin photograph until the cut completes. Returning from a different garment in a look sequence settles immediately rather than implying that it is the original source garment. Different photographic views are never morphed into each other, and transitions do not create duplicate enlarged photographs. Keyboard focus, resize, reduced motion and rapid return can interrupt entry safely.

## Scope and source protection

The five audited PDFs, all fifty corrected PNG pages, their previews, BOM/POM content and Tech Pack reader remain unchanged in this candidate. The brief provided concrete Portfolio changes but no further page-specific Tech Pack correction; clarification was requested while the independent Portfolio work continued. Do not describe these documents as newly revised by this branch.

All 108 historical subjects and eighty provisional presentation identities retain their URLs, source geometry and attribution. The existing preservation test receives an exact eleven-file owner-authorization receipt for the presentation code changed by this brief. Every original asset and all other protected source/evidence hashes remain strict; no public-image exemption is added. Hosting, backend, Contact and unrelated Portfolio content are outside this change.

## Visual critique and refinements

1. **Fashion hierarchy:** the walking/posed image now leads both exhibitions, while the opened reader gives construction-facing Front/Back equal weight. The actual garment remains the focal point.
2. **Image integration:** the existing exact-white studio presentation is retained. Original paper/texture and inseparable historical sources are preserved; no background erasure or recoloring is performed. The full edits use photographs without card borders or ecommerce decoration.
3. **Composition:** the initial paired reader exposed a framing problem under long captions. Viewing height now accounts for the actual caption/header space, so both complete desktop frames fit. Each image retains its source aspect ratio. Compact portrait tablets join phones in the vertical arrangement, keeping each portrait large. Larger screens retain the pair. The smaller-screen layout uses available width without stretching.
4. **Rhythm:** cinematic introductions resolve into a naturally scrolling complete edit. Staggered paired and single full-width placements vary the sequence within the existing editorial grammar. No Next control is required to reach another look, collection or following fashion chapter.
5. **Typography:** existing Archivo, Inter and JetBrains Mono remain. The first pass made source credit too prominent; the final credit is subordinate and detailed provenance follows the images. Front/Back labels and zoom controls are compact and readable.
6. **Interaction:** the first native-scroll probe sampled only at gesture endpoints and missed images traversed during touch inertia. The final test uses native wheel/touch plus IntersectionObserver observations throughout the movement. All eighty identities must actually enter the viewport. Independent zoom, Fit, keyboard pan and native pinch are tested separately from that traversal.
7. **Mobile:** each complete portrait is individually readable, Front precedes Back without a menu, and zoom controls retain 44px targets. A normal one-finger swipe over a fitted photo scrolls the reader, including after Fit. Physical-device Safari remains a separate unverified check.

## Verification

- `npm run build` passes.
- [Final six-viewport acceptance](verification.json): **946 checks**, including native mouse drag, keyboard pan, independent Fit, two-finger pinch, visible touch Fit controls and all eighty looks entering the viewport during actual wheel/touch traversal into Development.
- [Eighteen regression suites](regressions.json) pass: document access, Menswear navigation/look sequence/responsive return, Womenswear continuity, transition midpoints, cold category routes, all eight worlds, Presentation Mode, historical access, archive keyboard behavior, chapter history, route origin, failed/delayed images, real three-panel fixtures, protected opening and whole-site smoke. Smoke: **305 passed, 0 failed**. Final compact-tablet/gesture refinements were rechecked in the 946-check acceptance run.
- [Three-panel fixture run](three-panel.log): 234 checks across six sizes. Exact thirds, native proportions, alpha, individual zoom, source failure and appropriate exhibition selection are verified in the actual Portfolio components. Fixture files never enter the public build.
- [Transition midpoints and return](transition-final.log): 48 checks verify opaque clipping, hidden origin during return, exact source restoration and interruptibility at all six sizes.
- [Delayed and failed photographs](media-loading-final.log): 21 checks, including a pending Back that leaves Front usable and cannot trap reader return.
- [Fullscreen](fullscreen.json): paired reader, independent zoom, exact source return and native scroll restoration pass.
- [No-JavaScript fallback](no-js.json): both real Front/Back photographs remain readable and fit their frames; inactive zoom controls are hidden. Native DOM scrolling is used for this fallback layout check; it is separate from the actual touch/wheel traversal above.
- Photography/source contracts pass: 207 Menswear identity/replacement assertions, 571 AI collection assertions, 2,883 responsive-source hashes, 30 photograph-configuration checks, 231 Womenswear edit/identity checks; all 108 original source fingerprints remain unchanged.
- [Studio-image integrity](studio-background.log): **6,812 checks** over forty looks, 120 views and forty masters, including 42,812,811 protected foreground pixels and 3,785,266 protected light-garment pixels. No photographic file is changed by this candidate.
- Existing `tests/techpacks.mjs` verifies all five exact ten-page PDFs, fifty PNG dimensions, previews, metadata, desktop/mobile readers and ten complete downloads against this built Portfolio. All document assets remain byte-identical to main.

**Source preservation passes:** 3,111 original-blob/source checks and 4,849 total checks, including 1,733 exact SHA256 evidence files. See [the final source guard](source-preservation.log). Remote CI results are recorded on the implementation PR. Merge and production publication are verified separately through the ongoing task’s previously authorized PR/CI/Workers Builds workflow. This source review is not by itself a live deployment certificate.

## Screenshots and remaining limits

The final reader matrix is provided for both Womenswear and Menswear at 1440×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844. The `*-fashion-*` and `*-edit-*` captures show the unchanged cinematic grammar using Fashion photographs and the vertical complete edit. Representative screenshots:

- [Womenswear Fashion exhibition](womenswear-fashion-1440.png)
- [Menswear Fashion exhibition](menswear-fashion-1440.png)
- [Paired desktop reader](womenswear-reader-1440x900.png)
- [Compact-tablet portrait reader](menswear-reader-768x1024.png)
- [Mobile reader](womenswear-reader-390x844.png)
- [Vertical Menswear edit](menswear-edit-1440.png)

Physical iPhone Safari, browser-chrome/safe-area behavior on hardware and projector performance were unavailable. Browser emulation and headless fullscreen do not certify those devices. The entry frames of all eight collections were visually reviewed on desktop and phone; transition midpoint captures are included. Missing Fashion/Back views remain genuine content limitations, documented rather than fabricated. New page-specific Tech Pack refinements await the owner's instructions; the existing audited packs are preserved.

Implementation commits: `35be2fade792a29964494d5eb9391db16bfaabd1` and `9eaac7d849b1916f69db267bcb38f64735505b54`.
