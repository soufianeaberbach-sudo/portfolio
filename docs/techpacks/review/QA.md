# Technical and visual review — 25 October 2026

The five fixed slots contain 61 finished pages: Jersey Top 12, Tailored Trouser 13, Performance Legging 12, Woven Dress 12, Hooded Sweatshirt 12. All are development specifications requiring sample validation.

## Technical review

Five native original portfolio references were inspected at source resolution. Knit classification for the top and woven classification for the dress are engineering interpretations, not fibre/test claims. The trouser is the tailored oatmeal style worn with the pink shirt; only the trouser is specified. No bikini or woven shirt is substituted into the fixed slots.

Each style has its own geometry, 8 construction operations, BOM, proposed EU 34–42 chart, declared body basis, component details, POM methods, assembly order and QC. Across the collection: 35 BOM rows, 71 POMs and 40 linked operations. No supplier, tested fibre percentage, fit result, approved marker or physical manufacture is claimed.

The consistency pass checked closure/BOM agreement, seam/stitch terminology, allowances, lining and elastic dependencies, grade arithmetic, full versus half measures, source folds versus seams, paired garment correspondence and component dimensions. Important outcomes:

- Top: hidden low set-in junction remains proposed; no invented shoulder yoke or inserted elastic. Band and sleeve POMs reference the same low-armhole construction.
- Trouser: forward pleat folds are open rather than sewn dart triangles; back darts are separate proposals. Fly facing/shield, hook/bar, pocketing, fusing and double-welt methods reconcile. CF opening seam is distinct from fly topstitch.
- Legging: two-colour panels, recovery and hip passage targets are explicit. Gusset and internal elastic are proposed. Relaxed and extended waist are separate diagrams; no overlap hides a POM. No sports logo is reproduced.
- Dress: rounded back opening corrected from an initially pointed interpretation. Stripe is surface print, not diagonal seams; low skirt and localized side gathering are separate operations. Upper lining, stay tape, two neck buttons/loops and invisible zip reconcile with BOM. No 103 blindhem is specified for its 301 turned hem.
- Hoodie: front/resting back hood corrected to source; raglan sleeves retain volume and avoid set-in geometry. No kangaroo pocket or eyelets. Self hood lining, stitched cord exits and rib ratios are proposed. Hood height has attached datum extensions, and sleeve/body POMs follow the actual raglan underarm junction.

These checks establish internal documentation consistency, not approval of a production pattern or physical fit. Sampling must validate material force/recovery/shrinkage, drape, seam extension, pattern balance, range endpoints, labels and origin/care before release.

## Visual review

Every PDF page was rendered to `public/techpacks/<slug>/review/page-NN.png`. Initial exports were individually inspected, with repeated inspection of corrected drawings, detail and POM pages. Final collection contact sheets are beside this report. Text was also checked as selectable PDF spans, including bounds and replacement glyphs.

The review found and corrected crossed/overlapping construction leaders, a global SVG colour-style collision, a malformed colour SVG, tiny POM panels, overlapping POM labels, duplicate relaxed/extended waist lines, an incorrect pointed open-back interpretation, sleeve proportion/junction issues, hem stitch direction, and measurement notes outside the content area. Sparse leftover measurement pages were consolidated. All final layout overflow checks and document validations report zero errors. Original portfolio photography and original supplied PDFs are unchanged.

Seven ABERBACH art-direction checks:

1. Fashion hierarchy: paired front/back garments dominate covers; specifications have clear section headings and readable tables.
2. Image integration: white technical pages are intentionally framed on the existing paper website ground; photographs are not replaced.
3. Composition: enlarged operation flats and split POM views preserve garment/detail legibility; no decorative sewing props.
4. Rhythm: document-first rows and chapter transitions remain; content changes do not introduce a gallery/router.
5. Typography: deterministic committed font fixtures, restrained ink/green/grey; selectable text and labelled status.
6. Interaction: five Open/Download routes, reader Escape/close and source-focus restoration verified; native Chromium PDF reader additionally captured.
7. Mobile: all five previews decode; device-reader fallback has a visible proportional cover and direct complete-PDF link. Widths 390/430 and tablet 768/1024 checked. No physical Safari claim.

Native PDF viewing may take longer to paint than the surrounding dialog. Review captures wait for the preview or native PDF paint, rather than accepting an early blank image as completion. Hidden lazy fallback images are not awaited inside a native PDF object by the browser test; visible mobile covers are explicitly decoded.

## Checks actually executed

- `npm run build` — passed.
- `python scripts/techpacks/validate.py` — all five passed; schema, referenced BOM components, unique POM IDs, diagram coverage, grade arithmetic, dimensional relationships, SVG XML, PDF count/geometry/text bounds, previews and every page render.
- `python -m unittest discover -s scripts/techpacks -p 'test_*.py'` — 6 passed; intentionally corrupted BOM/grades/POM/passage cases detected.
- `npm run test:smoke` — 303 passed, 0 failed (demo-specific assertions updated for the new documents).
- `node tests/fashion-source-integrity.mjs` — 108 source fingerprints preserved; eight worlds and eighty displayed identities preserved.
- `node tests/fashion-navigation.mjs` — 40 checks passed.
- `node tests/fashion-chapter-history.mjs` — 20 checks passed.
- `node tests/techpacks.mjs` — six viewport sizes, all five previews/PDFs/download filenames and keyboard reader cycles; zero page errors or horizontal overflow. See `browser/results.json` for exact viewports.

The first dependency install failed because the default npm cache was outside writable roots; rerun with a task-local cache succeeded. Browser installation used the Playwright-pinned Chromium build. Early render failures and clipping/diagram errors were corrected before this final review. No failed export is supplied as a finished document.

## Release boundary

Owner review, sample/fit/material/marker/grade approval and legal/label verification remain outstanding. The branch implementation is ready for review, not authorized for bulk production. Merge and deployment were not performed.
