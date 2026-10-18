# Ready-to-Wear — production integration review

Capability A, photographic references only. Branch:
`feat/rtw-cinematic-production-integration`. Base production commit:
`e9793113d29767fdf0a4be1bcb4d1d7918e94d82`.

- [Focus investigation and CI isolation](FOCUS.md) · [Recorded experiment results](focus-evidence.json)
- [Mobile archive discoverability before / after](archive-mobile-before-after.jpg)
- [Art direction and architecture](../../RTW-PRODUCTION-INTEGRATION.md)
- [Executed QA, critique and limitations](QA.md) · [Exact changed-file manifest](FILES.txt)
- [Desktop before / after](desktop-before-after.jpg) · [Mobile before / after](mobile-before-after.jpg)
- [Desktop protected-category comparison](protected-desktop-comparison.jpg) · [Mobile protected-category comparison](protected-mobile-comparison.jpg)
- [All 17 front / whole-source audit](reference-front-audit.jpg) · [Back / whole-source audit](reference-back-audit.jpg)
- [Production baseline at six sizes](baseline/) · [Final full-resolution compositions](final/)
- [Desktop browser recording](desktop-motion.mp4) · [Mobile browser recording](mobile-motion.mp4)
- [Interrupted entries](interrupted-motion.mp4) · [Reduced motion](reduced-motion.mp4)

All screenshots and recordings come from the real browser. The baseline and final
folders are separate. Before/after comparisons use the same champagne reference on both desktop and
phone. Additional camera-entry frames and recordings show the selected look
actually clicked: champagne on desktop and rust on phone.

The audit sheets collect actual native photo-window screenshots for inspection;
they are not public exhibition layouts. Whole pairs 08 and 16 appear in both sheets
as whole sources. The original panel seam clips reference 17's frontal elbow; no
missing pixels are fabricated. Open the original source from Look Closer.

MP4s use native browser recordings, with only 0.25s of initial loading trimmed.
The existing Portfolio opening/handoff is still visible at the beginning. Review
START / MIDPOINT / PAYOFF and return, not only the first frame.

Public development-story demonstrations are excluded. Final hardening is verified
for the authorized Draft PR; no merge or deployment. The phone archive screenshots
and movie include the new discovery cue. Unaffected approved imagery is retained.

To inspect the actual application locally on this branch, run `npm ci`,
`npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4339`.
Open `http://127.0.0.1:4339/portfolio/#womenswear/rtw`. No review deployment is required.
