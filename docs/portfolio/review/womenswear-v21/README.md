# Womenswear V2.1 — ten looks in every world

Continues reviewed V2 `17b119f8e9e771dc20d0eff0f6878f500f4563bf` on the same
feature branch. This is a review candidate, not a creative approval or production
release. Main, deployment configuration and historical review folders are intact.

## Review the actual browser evidence

- [Desktop: opening / midpoint / payoff](desktop-overview.jpg)
- [Mobile: opening / midpoint / payoff](mobile-overview.jpg)
- [Desktop continuous browser recording](motion/desktop.mp4)
- [Mobile continuous browser recording](motion/mobile.mp4)
- [Desktop V2 → V2.1 final-shot comparison](comparisons/1440-before-after.jpg)
- [Mobile V2 → V2.1 final-shot comparison](comparisons/390-before-after.jpg)
- [Full-size individual compositions](stills/)
- [All fifty primary looks and genuine back views](audits/)
- [Five cinematic storyboards and curation reasons](STORYBOARDS.md)
- [Executed QA and limitations](QA.md)

Each journey sheet contains opening, cinematic start, midpoint, payoff, archive,
reader, exact occurrence return, and the next-category handoff. The first two
columns in the overviews are not substitutes for the full journey sheets.

| Viewport | RTW | Activewear | Streetwear | Occasion | Swim |
| --- | --- | --- | --- | --- | --- |
| 1440 × 900 | [review](sheets/1440-rtw.jpg) | [review](sheets/1440-activewear.jpg) | [review](sheets/1440-streetwear.jpg) | [review](sheets/1440-evening.jpg) | [review](sheets/1440-swimwear.jpg) |
| 1366 × 768 | [review](sheets/1366-rtw.jpg) | [review](sheets/1366-activewear.jpg) | [review](sheets/1366-streetwear.jpg) | [review](sheets/1366-evening.jpg) | [review](sheets/1366-swimwear.jpg) |
| 1024 × 768 | [review](sheets/1024-rtw.jpg) | [review](sheets/1024-activewear.jpg) | [review](sheets/1024-streetwear.jpg) | [review](sheets/1024-evening.jpg) | [review](sheets/1024-swimwear.jpg) |
| 768 × 1024 | [review](sheets/768-rtw.jpg) | [review](sheets/768-activewear.jpg) | [review](sheets/768-streetwear.jpg) | [review](sheets/768-evening.jpg) | [review](sheets/768-swimwear.jpg) |
| 430 × 932 | [review](sheets/430-rtw.jpg) | [review](sheets/430-activewear.jpg) | [review](sheets/430-streetwear.jpg) | [review](sheets/430-evening.jpg) | [review](sheets/430-swimwear.jpg) |
| 390 × 844 | [review](sheets/390-rtw.jpg) | [review](sheets/390-activewear.jpg) | [review](sheets/390-streetwear.jpg) | [review](sheets/390-evening.jpg) | [review](sheets/390-swimwear.jpg) |

## Content contract

50 displayed garments: ten per archive. 58 routable references: the original 49
plus nine licensed additions. Seven excluded RTW references and one excluded
Occasion reference keep their original source, ID, views and direct URL.
The immutable historical arrays are not reordered or reduced.

- [Fifty-slot handoff, compact TSV](SLOTS.tsv)
- [Slots, image geometry, views and excluded URLs, JSON](SLOTS.json)
- [Metadata-only photographic replacement guide](REPLACEMENT.md)
- [New source permissions and creator credits](ATTRIBUTION.md)
- [Canonical source/provenance data](../../../../src/data/womenswear-references.json)
- [Exact V2.1 changed-file list](FILES.txt)

Eight distinct Streetwear outfits and one white cut-out swimsuit are labelled
reference photography and credited in the reader. They do not become ABERBACH
projects or imply creator/model endorsement. There are no Sketch, Pattern, Flat,
CLO or empty development stages in the Womenswear reader.

## Actual visual critique and refinements

| Dimension | Finding and correction |
| --- | --- |
| Fashion hierarchy | Activewear's repeated white ending becomes a full brown flared silhouette. Swim's silver interval resolves into a white one-piece. RTW and the long Occasion silhouettes retain their scale. |
| Image integration | New studio grounds remain authentic, with fine source edges. Four source-qualified windows remove empty lateral margins only; no background removal or recolouring. Older Occasion/Swim paper texture remains a source limitation, not a retouched claim of seamless white. |
| Composition | The first V2.1 phone pass stranded wider photos below a large empty field. Measured margin windows and vertical balancing restore presence. The expanded Streetwear edit passes through planted, lifted and extended volumes. |
| Rhythm | Streetwear has four selected roles and a concise ten-look archive. Activewear changes the leg shape at its resolution; Swim changes silhouette and atmosphere. Ten references do not require ten theatrical scenes. |
| Typography | The existing category titles and restrained marks remain. A newly credited seated look exposed a small caption/photo overlap; compact credited readers now reserve clearance. Source credits retain a restrained underlined link. |
| Interaction / motion | Both complete recordings were decoded at 4 frames/second and inspected across start, exchanges, payoff, reader and return. No persistent blank/ghosted primary looks were found. Photographic exchanges briefly cross the viewport edge and resolve into complete silhouettes; Look Closer deliberately crops only while inspecting. A real duplicate-history-event focus defect and excluded-URL focus gap were corrected. |
| Mobile | Portrait edits retain one dominant full primary look, a swipeable ten-look archive, genuine optional view controls and readable source context. Wider originals balance by available space; desktop coordinates are not simply scaled down. |

Recordings are real continuous Chromium browser takes; only bootstrap trim and
H.264 encoding are applied. No fabricated motion, interpolation, composite-video
transitions or image replacement. The final small credited-caption correction is
shown in the recaptured credited-reader examples and tested at all six sizes;
the continuous films open the unchanged historical reader references.

## Remaining limits / independent approval

Physical iPhone Safari, dynamic browser chrome, safe-area handling and sustained
thermal/frame-pacing performance remain unverified on hardware. Browser touch
emulation is not real-device sign-off. Real owner photography is still required;
these diverse temporary sources do not pretend to be one photographed collection.
Their backgrounds, lighting, poses and existing artefacts limit perfect continuity.
Historical source creators were not supplied in the existing metadata and are
explicitly left unknown. The new additions have verified Pexels credits.

No preview hosting, PR, merge or deployment is part of this delivery. To inspect
locally, run `npm ci`, `npm run build`, then `npm run preview -- --host 127.0.0.1`;
open `/portfolio/#womenswear`. The existing public navigation remains authoritative.
Independent visual approval is still required before integration or release.
