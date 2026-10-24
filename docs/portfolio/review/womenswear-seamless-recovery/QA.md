# Final Womenswear recovery QA

## Executed checks

- Final Astro build: 11 pages pass.
- All nine recovery readers at 1440×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844: **906 browser assertions pass**. Every actual view, full-source decode, correct proportions, historical route, Look Closer and exact archive focus return checked. [Results](browser/RESULTS.json).
- All 31 preserved complete sets at 1440×900 and 390×844: **1,862 assertions pass**, including Front, Back, Editorial and Complete Original. [Results](preserved-set-regression/RESULTS.json).
- Existing historical photographic reliability suite: **438 assertions pass**, including 58 original sources, touch, pinch, zoom, failure handling and reader return.
- Existing cinematic continuity suite: **98 assertions pass**, including interrupted entry/return, preference changes, keyboard and viewport resize.
- Forty-look identity/licensing/replacement contracts: **231 assertions pass**; photographic geometry configurations: **23 pass**.
- Existing recovery/version unit suites: **9 + 3 tests pass**.
- All 108 original source identity/geometry fingerprints and original source-file fingerprints pass. All forty Womenswear source SHA-256 values are unchanged. No Menswear application source/asset or existing generated artwork changed.
- All 13 active recovery views have actual valid PNG/WebP paths, 1800×2700 proportions and an exact pure-white exterior. Pixel comparison confirms zero changed fully opaque foreground pixels across the five non-generative segmented source views. [Technical audit](TECHNICAL-AUDIT.json).

The historical-return test initially expected the old `rtw` world after closing a historical reader. Existing routing correctly resolves that alias to `casualwear`; the assertion now tests the canonical destination. No routing code was changed. The corrected historical Back/Forward and focus-return suite passes 96 assertions.

## Browser critique and refinement

| Dimension | Observed finding and final response |
| --- | --- |
| Fashion hierarchy | Full silhouettes dominate the reader. Normalized alpha bounds align scale and grounding across single-source and retained V1 views. No redesign or casting detour. |
| Image integration | First browser pass exposed faint RGB studio rectangles in Occasionwear 02 and Swimwear 02, plus the old source border. Clean masks, new recovery paths and white canvases remove these. Native RGB and first exports remain retained. Tiny low-alpha exterior noise in two exports was corrected outside the subject only. |
| Composition | Entire heads, hands, gown train, feet and footwear remain visible. Gentle contact shadows ground the figures without a floor panel. |
| Rhythm | Existing four worlds, ten looks each, camera roles and primary-only cinema remain. Partial readers contain only their actual supplied views. |
| Typography | Committed Archivo/Inter/JetBrains Mono fixtures loaded. Existing hierarchy and UI styles retained. Provenance distinguishes retouched sources from generated presentation studies. |
| Interaction | View switching, real-source inspection, exact archive return, interrupted transitions and reduced motion pass. Initial screenshots caught the match-cut clone during motion; final capture now waits for `.ww-match` and `data-ww-moving` cleanup. No duplicate figure remains in resting captures. |
| Mobile | All nine primary looks fit at 390×844 with readable captions, complete silhouettes and accessible controls. 430×932 and tablet sizes also pass. No overflow or stretched figures. Ivory mesh, white shoes, fine ties and pale gown hems remain visible. |

## Evidence and limits

Thirty final screenshots cover every recovered view on desktop/mobile and the complete six-size matrix with Swimwear 06. [Desktop contact sheet](DESKTOP-REVIEW.jpg), [mobile contact sheet](MOBILE-REVIEW.jpg), [individual screenshots](browser/), [actual before image](comparison/before-swimwear-01.jpg).

These are built-branch Chromium checks, including mobile/touch emulation. Physical iPhone Safari, owner artistic acceptance and production deployment are not claimed. No merge or deployment performed. Missing Back/Editorial views remain truthfully absent; none blocks usable coverage under the current brief.

## Shared CI snapshot compatibility

The prior studio preservation test froze seven Womenswear application/metadata blobs at a historical Menswear snapshot. Its exact-hash expectations now recognize the seven owner-authorized Womenswear changes through `tests/fixtures/womenswear-recovery-preservation.json`. The fixture records both the baseline and selected new Git blob SHA1. No public artwork or Menswear exemption is permitted. **3,111 exact Git/working-source preservation checks pass** with every remaining original blob strict. Menswear application code, data, styling and artwork are unchanged; only the shared preservation test named `menswear-studio-preservation.mjs` was adapted. The existing correction-evidence graph/hash checks remain intact.
