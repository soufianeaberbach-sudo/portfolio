# ABERBACH — Editorial Precision CV master

The selected design is Concept A / Fashion Editorial, reconstructed from an
image-generation composition study, then refined with accurate editable type.
The old CV directions are unapproved. Final release is blocked pending the
owner's original color portrait and complete LinkedIn career source.

## Authoritative content and real assets

`career.json` schema 3 records the exact EN/FR/ES data and its verification state.
The primary source is the owner's LinkedIn profile. Direct access returned HTTP
999; the public index only exposes a truncated About and incomplete experience /
education. Therefore `authoritativeSource.status` is pending, not verified.
Six historical roles/dates from the site are provisional until comparison with
the full profile export. Education, qualifications and certifications are not
inferred. Previous speculative employer-duty bullets have been removed.

After receiving the owner's exported profile PDF or complete screenshots:
compare every role, date and description, record the evidence, rewrite naturally
in all three languages, and mark the data verified only when the actual source
has been inspected. Current 12+ years is derived from February 2014–October 2026;
there are no current 11+ year statements in the master data. Eight tools and
Arabic/Amazigh/French/English come from the owner brief. Spanish is an edition,
not a claimed spoken language. Ambiguous brand exposure is omitted.

`template.html` faithfully implements the selected visual direction: filled /
outlined name contrast, asymmetric portrait, dated chronology and lower-page
professional scope. Brand colors and Archivo/Inter/JetBrains Mono match the site.

The SA. markup uses the real span + orange-dot construction. Its CSS is read
verbatim from `src/styles/global.css`. With root16px and the existing font files,
it measures exactly36.15625×31.1875CSSpx, as on the site. Export waits for font
settling; the independent verifier compares these source proportions.

`construction-detail.png` is an exact crop of the existing AB-W-SH-01 technical
flat. `construction-detail-source.json` pins the source hash and crop; verification
checks pixel equality. It is a discreet construction signature, never evidence of
employment, a named project or a fictional new pattern.

`portrait.png` still contains only the old monochrome derivative. It is never
used for final production or synthetically recolored. The original photo must be
reattached. Original attachments stay outside public/; a shared natural-color
crop is prepared without changing facial geometry or adding generated detail.

## Image-first release

Use the pinned Playwright/browser and committed font fixtures, with the existing
Pillow/PyMuPDF requirements. No external font download or new app package.

```sh
# Only after complete career-source verification and receipt of the real photo:
node scripts/cv/render.mjs --prepare-portrait /path/to/original-color-photo.jpg
# Inspect all three native 2480×3508 PNGs, content and portrait before conversion.
python3 scripts/cv/finalize.py
npm run test:cv
```

Render creates 300 DPI PNG masters first. It rejects unverified primary career
content and monochrome photo input. `export-layout.json` is written only for a
real release render. PDF conversion rejects previews/unverified career records;
the exact reviewed PNG covers a 210×297mm page with searchable source text and
contact links retained underneath. Independent QA checks white margins, chronology,
three publication languages, four spoken languages, eight tools, SA. proportions,
authentic construction pixels, natural photo color/consistency and exact PDF
raster fidelity. Searchability does not establish PDF/UA certification.

Final paths remain `public/cv/Soufiane-Aberbach-CV-{EN,FR,ES}.{png,pdf}`.
The Experience download controls are reused unchanged. The old six files are
preserved until new release masters are actually ready; no placeholder is served.

## Marked design proofs

```sh
CV_OUTPUT_DIR=.qa-director/cv-final/preview \
CV_QA_DIR=.qa-director/cv-final/preview \
node scripts/cv/render.mjs --layout-preview
python3 scripts/cv/verify.py --layout-preview-dir .qa-director/cv-final/preview
```

Preview mode is barred from public/. It labels the portrait area and footer as
pending, and can never pass release PDF conversion. It proves composition only.
Use `CHROMIUM_PATH` solely for an appropriate fallback browser; exact-brand QA
uses the repository's pinned browser and fonts.

Concepts, full-size proofs, source-access audit and critique are in
[the creative review](../../docs/cv-final-2026-10-29/REVIEW.md).
