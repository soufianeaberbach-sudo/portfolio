# ABERBACH — English production from the existing editable design

The existing editable implementation is the production foundation. The supplied
image remains the visual reference, not a raster to erase or an output-resolution
limit. Current files and comparison are in
[the English review package](../../docs/cv-production-en-2026-10-31/REVIEW.md).
No new design, fonts, illustrations or portrait treatment are introduced.

## Source and boundary

`career.json` retains the six documented roles/titles/dates, exact owner summary,
six expertise areas, eight tools and four spoken languages. LinkedIn access was
incomplete (latest public access HTTP 429; the authorized connection returns
only the profile URL); full profile verification is not claimed. The owner
explicitly authorized the canonical fallback. Unsupported title-derived role
descriptions are omitted. Only Ava Marie’s confirmed Tangier location appears
below a role title; broader expertise stays in the profile and skills column.
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
stored. Their appearance remains part
of the supplied model. The script font and its OFL license live in `fonts/`.
Other fonts reuse the repository's committed fixtures.

`portrait.jpg` is the byte-identical RGB owner attachment. Only a crisp cover
crop in the original frame is applied: no AI regeneration, retouching, filter,
mask, haze or blur. `fashion-signature.svg` is editable, unfilled original
Bezier line art following the model's cropped right-edge gesture, with
CSS-controlled orange stroke at 12% opacity. No raster/neon/dress-form asset is
used. `model-icons.mjs` contains editable outlines of the model's six icon subjects.

The one CSS correction freezes the final experience row at its measured
baseline height, 87.4375px. Without it, omitting unsupported text would shorten
the orange timeline by 2.4375px. All other template code, the renderer, finalizer,
verifier, portrait, icons, SVG and fonts are unchanged. Full-resolution baseline
comparison confirms zero changes outside the edited role-context boxes.

The master intentionally extends the orange banner to the top and crops the
fashion graphic at the right edge. All actual text stays within print-safe
margins. Borderless printing is needed to retain the top-edge accent exactly.

## Image-first production

Use the existing pinned Playwright browser path where needed.

    CV_OUTPUT_DIR=docs/cv-production-en-2026-10-31 \
    CV_QA_DIR=.qa-director/cv-content-2026-10-31/final-qa \
    node scripts/cv/render.mjs --layout-preview --locale en

Inspect the 2480 × 3508 / 300 DPI PNG against the supplied model, record its
hash and full-resolution review in `image-review.json`, then:

    CV_OUTPUT_DIR=docs/cv-production-en-2026-10-31 \
    CV_QA_DIR=.qa-director/cv-content-2026-10-31/final-qa \
    python3 scripts/cv/finalize.py --proof --locale en
    npm run test:cv -- --proof-dir docs/cv-production-en-2026-10-31 --locale en

PDF conversion embeds the actual reviewed PNG at exact A4 size. Source text
and links remain searchable/selectable underneath it. Only the underlying
PDF search layer removes tracking from uppercase labels to prevent Chromium
from inserting false spaces inside words; this cannot alter the visible
artwork. Verification compares decoded embedded pixels byte for byte.
No PDF/UA certification is claimed.

After actual owner approval, adapt FR/ES with the same system, then use the
existing `public/cv/Soufiane-Aberbach-CV-*.png/.pdf` paths and unchanged
`CVDownloads.astro` controls. Owner review and release are separate states.
