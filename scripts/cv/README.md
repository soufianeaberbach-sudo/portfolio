# ABERBACH — Fashion Editorial CV production

The current visual direction is the new [30 October creative reset](../../docs/cv-creative-reset-2026-10-30/REVIEW.md).
Earlier outlined-name/timeline/collar layouts are rejected history.

## Current factual and release status

The complete LinkedIn profile remains inaccessible (HTTP 999 on 30 October 2026);
no exported profile PDF is attached. About, complete employment descriptions,
education, certifications and skills have not been fully verified from LinkedIn.

The six roles/titles/dates are explicitly owner-supplied and agree with the current
Experience page. Schema 4 separates this known-fact verification from the pending
primary-source comparison. It contains no employer-duty claims. The profile and
development-practice text describe owner-confirmed career-wide capabilities.
Eight tools and four spoken languages are retained; Spanish is an edition only.
Unsupported education, certifications, metrics and brand-contract claims are omitted.

Automatic approval review rejected replacement of public CV files while the full
LinkedIn source remains unavailable. The source gate is retained. The six new
review files are outside public/ and PDFs identify themselves as unpublished
design proofs. Existing public downloads and Experience controls are unchanged.
Do not describe proof QA as permission to publish or as complete LinkedIn review.

## Real portrait and photographic atmosphere

- portrait.jpg is the exact 1166 × 1280 owner color attachment, kept outside public/.
- portrait-cutout.png is an image-tool background-removal edit used for ALPHA ONLY.
  The layout's visible RGB comes from portrait.jpg, not model-generated face pixels.
  The same mask/soft lower edge integrates the original portrait in every edition.
- portrait-source.json pins original and mask hashes and explains their treatment.
- atelier-dress-form.png is a separately generated photographic atmosphere,
  never evidence of an actual workplace/employer. Its provenance/hash is recorded.
- The rejected collar image and provenance file are removed.
- The real SA span/orange-dot markup and CSS are reused from the current site.
- Bodoni Moda is embedded with its OFL license; Archivo/Inter use existing fixtures.

## Editable, image-first workflow

career.json is the shared EN/FR/ES content. template.html implements selected
Concept 01. render.mjs produces native 2480 × 3508 PNGs with 300 DPI metadata;
the source text PDF remains temporary until images have been visually inspected.

Unpublished review render:

    CV_OUTPUT_DIR=docs/cv-creative-reset-2026-10-30/editions \
    CV_QA_DIR=.qa-director/cv-reset/review \
    node scripts/cv/render.mjs --layout-preview

Use the repository-pinned Playwright browser via PLAYWRIGHT_BROWSERS_PATH where
required. Independently inspect every native PNG. image-review.json must record
each actual PNG hash and full-resolution review before conversion.

    CV_OUTPUT_DIR=docs/cv-creative-reset-2026-10-30/editions \
    CV_QA_DIR=.qa-director/cv-reset/review \
    python3 scripts/cv/finalize.py --proof
    npm run test:cv -- --proof-dir docs/cv-creative-reset-2026-10-30/editions

Proof rendering and conversion refuse public/ destinations. Normal production
rendering remains blocked by pending primary-source verification/owner release
authorization. The default test:cv remains a release check, not a proof shortcut.

PDF conversion uses the reviewed PNG itself on an exact 210 × 297 mm page. It
retains tagged searchable text/contact links and removes redundant hidden photos.
Independent QA checks pixel-identical embedded images, chronology, full text,
source hashes, original color, consistent portraits, actual SA proportions,
loaded fonts, white safe margins and mannequin/text separation. No PDF/UA
certification is implied.

Final website paths remain public/cv/Soufiane-Aberbach-CV-{EN,FR,ES}.{png,pdf}.
They must only be replaced once the documented release blocker is resolved.
