# ABERBACH — locked-master English adaptation

The latest owner instruction locks the supplied 905 × 1280 design image.
This is an adaptation of that model, not a new design. Current files and the
side-by-side comparison are in
[the English review package](../../docs/cv-locked-master-en-2026-10-30/REVIEW.md).
The preceding `cv-approved-model-en` attempt was rejected and is historical.

## Source and boundary

`career.json` retains the six documented roles/titles/dates, exact owner summary,
six expertise areas, eight tools and four spoken languages. LinkedIn access was
incomplete (HTTP 999); full profile verification is not claimed. The owner
explicitly authorized the canonical fallback. New supporting lines describe
only the supplied title/remit and professional positioning; they add no
achievements, projects, management claims or unsupported detailed duties.
Education, certifications, proficiency levels and metrics remain omitted.

English owner visual review is still pending. The workflow blocks FR/ES
rendering and release replacement until that review. No new FR/ES editions,
public files, website components, backend or Cloudflare files were changed.

## Locked visual system

The source uses the model's own coordinate system to preserve its orange
portrait banner/base, masthead, name hierarchy, circular contact icons, six
expertise pictograms, software/language bars, section rules, timeline and
script-style footer. The owner name in the footer is typeset script, not a
claim of an authentic handwritten autograph. The latest locked-master
instruction supersedes the preceding SA-header design; no substitute header
has been introduced.

The bars all use an identical decorative fill, hidden from accessibility APIs.
No proficiency values, levels, progress semantics or differing ratings are
stored or implied by differences between items. Their appearance remains part
of the supplied model. The script font and its OFL license live in `fonts/`.
Other fonts reuse the repository's committed fixtures.

`portrait.jpg` is the byte-identical RGB owner attachment. Only a crisp cover
crop in the original frame is applied: no AI regeneration, retouching, filter,
mask, haze or blur. `fashion-signature.svg` is editable, unfilled original
Bezier line art following the model's cropped right-edge gesture, with
CSS-controlled orange stroke at 12% opacity. No raster/neon/dress-form asset is
used. `model-icons.mjs` contains editable outlines of the model's six icon subjects.

The master intentionally extends the orange banner to the top and crops the
fashion graphic at the right edge. All actual text stays within print-safe
margins. Borderless printing is needed to retain the top-edge accent exactly.

## Image-first production

Use the existing pinned Playwright browser path where needed.

    CV_OUTPUT_DIR=docs/cv-locked-master-en-2026-10-30 \
    CV_QA_DIR=.qa-director/cv-locked-en \
    node scripts/cv/render.mjs --layout-preview --locale en

Inspect the 2480 × 3508 / 300 DPI PNG against the supplied model, record its
hash and full-resolution review in `image-review.json`, then:

    CV_OUTPUT_DIR=docs/cv-locked-master-en-2026-10-30 \
    CV_QA_DIR=.qa-director/cv-locked-en \
    python3 scripts/cv/finalize.py --proof --locale en
    npm run test:cv -- --proof-dir docs/cv-locked-master-en-2026-10-30 --locale en

PDF conversion embeds the actual reviewed PNG at exact A4 size. Source text
and links remain searchable/selectable underneath it. Only the underlying
PDF search layer removes tracking from uppercase labels to prevent Chromium
from inserting false spaces inside words; this cannot alter the visible
artwork. Verification compares decoded embedded pixels byte for byte.
No PDF/UA certification is claimed.

After actual owner approval, adapt FR/ES with the same system, then use the
existing `public/cv/Soufiane-Aberbach-CV-*.png/.pdf` paths and unchanged
`CVDownloads.astro` controls. Owner review and release are separate states.
