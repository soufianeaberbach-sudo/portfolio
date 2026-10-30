# ABERBACH — approved-model English master

The current visual target is the owner's attached model, preserved in
[the English review package](../../docs/cv-approved-model-en-2026-10-30/REVIEW.md).
This is a faithful adaptation, not another concept exploration.

## Content and current review boundary

career.json schema 5 records the exact canonical fallback data supplied by the
owner: identity/contact, verbatim summary, six expertise areas, eight tools,
four spoken languages and six exact English titles/dates. LinkedIn still returns
HTTP 999; complete profile verification is not claimed. The owner explicitly
authorized this canonical fallback. Education, certifications, proficiency
levels, metrics and unsupported employer duties are omitted.

The remaining boundary is the requested ENGLISH VISUAL REVIEW. workflow records
that English has not yet been approved. FR/ES rendering and public replacement
are gated accordingly. No further factual permission is needed for the supplied
canonical data. Existing website downloads and CVDownloads.astro are unchanged.

## Portrait, brand and line artwork

portrait.jpg is the original owner attachment, matched byte for byte to the
newly supplied photograph. The upper-left crop uses object-fit:cover only.
No generative portrait, filter, blur, mask, fog, fade or tonal edit is applied.

The real SA span/orange-dot markup and current brand CSS are reused. Archivo
and Inter use existing committed font fixtures.

fashion-signature.svg is original hand-authored Bézier artwork inspired by
the flowing fashion gesture in the approved model. It is transparent, unfilled,
and uses CSS-controlled #D45F36 stroke at 12% opacity. It is not a physical
dress form, raster image or technical pattern. The rejected neon asset was
never copied into the repository or used as source. Earlier photographic
mannequin, portrait-mask and serif-font assets are retired from production.

## Image-first English production

Use the pinned Playwright browser via PLAYWRIGHT_BROWSERS_PATH where needed.

    CV_OUTPUT_DIR=docs/cv-approved-model-en-2026-10-30 \
    CV_QA_DIR=.qa-director/cv-approved-en/review \
    node scripts/cv/render.mjs --layout-preview --locale en

Inspect the actual 2480 × 3508 / 300 DPI image at native resolution. Record the
reviewed PNG hash and full-resolution inspection in image-review.json, then:

    CV_OUTPUT_DIR=docs/cv-approved-model-en-2026-10-30 \
    CV_QA_DIR=.qa-director/cv-approved-en/review \
    python3 scripts/cv/finalize.py --proof --locale en
    npm run test:cv -- --proof-dir docs/cv-approved-model-en-2026-10-30 --locale en

The reviewed PNG supplies the exact visible PDF image on a 210 × 297 mm page;
searchable source text and contact links are retained. Verification checks the
canonical data, margins, loaded fonts, original sharp color photo, authentic
SA proportions, unobtrusive transparent SVG and pixel-identical PDF raster.
Proof metadata distinguishes owner review from release; the page artwork has
no draft-verification footer. No PDF/UA certification is claimed.

The review package includes self-contained editable HTML/CSS. Maintained
production sources are template.html, career.json and the existing renderer,
finalizer and verifier. After English visual approval, adapt FR/ES using this
same layout and reuse the current public/cv/Soufiane-Aberbach-CV-*.png/.pdf paths.
