# ABERBACH technical correction — 25 October 2026

Five existing garments, fifty approved-template pages. These are populated **Development Samples**, not factory-approved or client manufacturing records. Garment selections, silhouettes, swatches, colorways, headers, footers, typography and ten-page order are retained. The only flat-art edit removes the legging's exterior third-party-like thigh mark.

## Technical audit

The [audit matrix](audit-matrix.csv) records 241 reviewed elements: 153 retained, 73 major corrections and 15 minor corrections/clarifications. Every one of the 100 numbered front/back instructions and all 80 measurement rows was reviewed. The [JSON matrix](audit-matrix.json) preserves old/new specifications, rationale, synchronized pages and completion status. These counts describe matrix entries, not 88 independent manufacturing failures.

| Style | Pages | Principal corrections |
|---|---|---|
| AB-W-SH-01 | 02, 04, 05, 08–10 | Five front buttons including collar, four cuff buttons, one spare: ten supplied. Five front holes and four cuff holes. Patch-pocket construction replaces pocket-bag wording; HPS/CF placement replaces the incorrect underarm reference. Woven joining/edge finishing and collar/cuff/placket operations clarified. |
| AB-W-LG-02 | 01, 02, 04–06, 08–10 | M elastic cut 65 cm with 1 cm lap gives 64 cm closed loop; 68 cm material usage includes 3 cm waste. Stretch tapes, quantity and application sequence reconciled; 406 at 3.2 mm gauge on 6 mm tape. 514 gusset/rise/inseam geometry clarified. Exterior mark removed from every front view. |
| AB-W-DR-03 | 02, 04, 05, 07–10 | Distinct M front/back drops 26/30 cm; CF empire apex 26.5 cm. Correct neckline endpoints and unfolded strap path. Partial lining architecture, label clearance from zip, pointed empire assembly, 45° bias handling and estimated fabric use clarified. |
| AB-M-TR-04 | 02, 04, 05, 08–10 | Fly facing/shield, pocket bags/facings/stays and complete single-welt assembly specified. Dart/welt relationship clarified. Seat and inseam joining/finishing distinguished. F follows CB rise to crotch; D follows inseam, not the crotch gap. |
| AB-M-HD-05 | 03–05, 07–10 | Four-piece self-lined hood sequence, neck attachment and back-only seam tape clarified. Rib loops use existing finished POMs. 514 joins cuff/hem, then 406 topstitches the joined seam. Rib composition added to care label. Hangtag attaches at back-neck label. |

All five measurement pages retain sixteen populated A–P rows with their original columns. Former incomplete-looking note/empty rows are replaced by one full-width measurement-notes field. Otherwise plausible grading and component dimensions are retained. A–P directions, datums and measurement methods are mapped individually on page 10; diagrams remain not to scale.

## Industrial references

- [Coats — Basic Stitch Types](https://www.coats.com/en/info-hub/basic-stitch-types/): distinctions between 301, 504, 514 and 406; 602 adds top cover; 607 is a separate flatseam formation.
- [Coats — Seam Types](https://www.coats.com/en-us/info-hub/seam-types/): seam configuration and stitch formation are separate specifications; joining and edge finishing are distinguished.
- [ASTM D6193-16(2025), public scope/significance](https://store.astm.org/d6193-16r25.html): consulted for selection principles; the licensed standard was not accessed and formal compliance is not claimed.
- [JUKI MF-7500/7500D E11](https://www.juki.co.jp/industrial_e/products_e/apparel_e/cover_e/detail.php?cd=MF-7500/7500D_E11_E): differential-feed coverstitch equipment and 3.2/4.0 mm two-needle gauge options. The tape application is a development construction recommendation, subject to a sample sewing trial.

## Artifact verification

- Fifty unique RGB PNGs, 3508 × 2480, 300 DPI; no text-overflow findings. [PNG checks and baseline pixel preservation](png-validation.json).
- Five image-only PDFs, exactly ten pages each, exact A4 landscape MediaBoxes. All original PNG pixels are embedded losslessly. Every page was rendered back at source dimensions: **zero mean absolute pixel error for all fifty pages**, with image extraction proving source identity and order. Each file also passed Poppler `pdfinfo`. [PDF checks](pdf-verification.json).
- [Manifest](document-manifest.json) records the five intended production URLs and document identities. A URL in this manifest is not by itself a deployment certificate.
- Existing IDs `tp-01` through `tp-05`, document-first list, modal reader, focus/scroll return and mobile native-reader fallback are retained. Open PDF and Download PDF are available per document; mobile fallback includes a visible download because the existing mobile CSS hides toolbar links.
- Historical blank-demo assets remain in the repository, but active records no longer link to them.

## Local validation

`npm run build`, Worker dry-run, 509 Worker assertions, 138 domain assertions, production-checker tests and 303 smoke assertions pass. `tests/techpacks.mjs` verifies PDF headers/counts/content hashes, all fifty source dimensions, titles/order/genders/status/alt text, six viewport layouts, all five desktop and five mobile reader paths, ten complete downloads, teardown and scroll return. The same task test is included in CI's existing preview-server step.

Visual review covered every corrected page, each ten-page contact sheet and the browser at 1440×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844. The document remains the visual focus; previews retain complete page proportions, metadata stays subordinate, no new card/carousel system was introduced, and mobile retains the existing chapter/list grammar. A missing mobile download was corrected and the affected flow was rechecked. Headless Chromium exercises the existing PDF fallback, while full multipage PDF rendering was independently verified above. Physical iPhone Safari/hardware was not available.

## Publication handoff

The owner explicitly authorizes publication in this task. Local Wrangler has no Cloudflare login; the existing GitHub integration exposes successful **Workers Builds: portfolio** deployments on main. Publication uses that existing PR/merge/build path, with no Cloudflare configuration changes. A successful CI run is not live verification: the final handoff must record the merge SHA, Cloudflare build result and HTTPS checks against the five exact PDF hashes and reader metadata.
