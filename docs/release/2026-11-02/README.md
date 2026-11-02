# ABERBACH.CO release preflight — 2 November 2026

PR #58 retains the existing English, French and Spanish website. This preflight
records the final owner-approved CV integration; merge and production state are
verified separately through the GitHub/Cloudflare build records and live site.
PR #59 contributes no commits or artwork and remains separate at `1c6625e`.

## Approved files

Language mapping was confirmed by reading each attachment: **1 = English,
2 = Spanish, 3 = French**. All original PNG bytes and 1055 × 1491 dimensions
are retained, including metadata, portraits, typography, skill bars, QR codes,
illustrations, signatures and layouts. The exact source/PDF/RGB/ICC hashes are
pinned in [the approval manifest](../../../scripts/cv/approved-images.json).

All PDFs are one exact 210 × 297 mm portrait page. Native pixels are embedded
losslessly at the largest proportional fit; no cropping, distortion or invented
resolution. The unavoidable vertical fitting allowance is 0.106635 mm per edge.
FR/ES Display P3 ICC profiles are retained and bound to the embedded PDF image.
All three PDFs were parsed, rasterized and visually compared with the source.
They are image-based; no searchable-text, 300-DPI or PDF/UA claim is made.

The existing CVDownloads component already selects the active language's PDF
and offers every PDF/PNG. Its real clicks, filenames, same-page behavior,
Content-Type, all six URLs and exact downloaded hashes passed verification.
The old CV design generator was not run and must not replace these files.

## Rerun results

- Production build: 36 pages; Cloudflare deployment dry-run: passed with original bindings.
- Worker: 509/0; domain/canonical guard: 293/0; production-checker fixtures: passed.
- Localization: 691/0; smoke: 368/0; approved CV integrity: 61/0.
- All 19 existing continuity suites: 5,977 checks passed.
- Additional localized interaction review: 560 checks, 18 combinations (EN/FR/ES at
  1440×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844).
- Protected source/evidence: 7,485 checks; 108 original photograph fingerprints.
- Five Tech Pack PDFs, all 50 native PNG pages and reading copies, measurement
  paths and credibility checks passed. Original photographs/documents unchanged.

[Machine results](verification.json) contain per-suite commands/counts, download
hashes, viewport records and resolved environment limitations. No assertion was
weakened to pass. Obsolete generated-CV layout assumptions were superseded by
exact owner-file hashes, native pixels, ICC, A4 fit and real-render checks.

## Visual review

Garments remain dominant in the white paired readers; complete silhouettes and
construction details are visible. Existing studio grounds, image geometry and
page compositions are retained. French/Spanish headings and body copy fit the
established rhythm, with Archivo/Inter/mono typography loaded in review.
Downloads remain a compact action under Experience. Navigation, zoom/Fit,
keyboard return, touch scrolling and reduced motion passed. Mobile readers stack
Front/Back with independent controls; the localized document toolbar and CV
options remain accessible. No unrelated styling change was needed.

This is Chromium desktop/touch emulation, not physical-device certification.
No real contact/email submission was made. Dependencies, generated builds and
large isolated fixture outputs reused temporary storage; no source, approved
asset, commit or unmerged work was deleted. Current PR checks and production
build records remain the authority for remote execution/deployment.
