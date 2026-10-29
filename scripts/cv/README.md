# ABERBACH editorial CV system — redesign draft

The prior CV design is unapproved and superseded by this rebuild. The existing
six public downloads remain untouched until the owner supplies the original
color portrait and the new image masters pass review. This is not a completed
replacement release yet.

## Sources

- `career.json`: shared six-role chronology, EN/FR/ES text, grouped expertise,
  eight tools and four actual working languages. Photoshop, Excel and Amazigh
  are owner-confirmed additions in the redesign brief. No proficiency ratings,
  degrees, certifications, team sizes, named contracts or metrics were added.
- Main employers/titles/dates remain verified against Experience. Detailed role
  bullets are draft functional descriptions derived from the owner's declared
  specialties and verified job functions. Precise employer attribution is pending
  clarification and must be reviewed before release; source flags retain that
  distinction rather than presenting assumptions as evidence.
- Selected brand names come from the current Home programme-exposure list. Their
  qualifier explicitly excludes direct employment and endorsement.
- `template.html`: editable A4 grid, content-first chronology, natural-color
  portrait frame, white paper and restrained Aberbach orange. The previous
  grayscale filters are removed.
- `portrait.png`: currently the **old monochrome derivative only**. The original
  color attachment is no longer present in this workspace. Never colorize it to
  invent the original colors. Replace it only from the owner's actual photo.

## Image-first production

Use existing Playwright and committed font fixtures. No generated typography,
external font request or new application dependency is required. Python print
requirements are in `requirements.txt`.

```sh
node scripts/cv/render.mjs --prepare-portrait /path/to/original-color-photo.jpg
```

The supplied file stays outside public/. Browser cropping creates the shared
portrait derivative without facial alteration or grayscale treatment. Inspect
that derivative and the actual PNG editions at native 2480×3508 resolution.
Color validation rejects monochrome input. PNGs carry 300 DPI metadata; geometry
checks reject clipped text, footer collisions or missing fonts. The release
layout manifest is written only for a real color render.

After visual PNG inspection:

```sh
python3 scripts/cv/finalize.py
npm run test:cv
```

Finalization preserves the reviewed PNG pixels on exact 210×297mm PDF pages,
with searchable source text and working contact links underneath. It rejects
layout previews. Independent verification checks chronology, all eight tools,
four spoken languages, qualified brand exposure, portrait color/consistency,
printer margins, page dimensions and decoded PNG/PDF pixel equality.

Final file paths stay unchanged:
`public/cv/Soufiane-Aberbach-CV-{EN,FR,ES}.{png,pdf}`. The Experience component
already provides current-language PDF downloads and all six alternate options.

## Composition review without the missing photograph

```sh
CV_OUTPUT_DIR=.qa-director/cv-rebuild/draft \
CV_QA_DIR=.qa-director/cv-rebuild/draft \
node scripts/cv/render.mjs --layout-preview
python3 scripts/cv/verify.py --layout-preview-dir .qa-director/cv-rebuild/draft
```

This substitutes an explicit COLOR PORTRAIT PENDING panel when only the old
monochrome source is available. Preview mode cannot target public/. It is for
layout review only and never passes release verification or final PDF creation.
`CHROMIUM_PATH` can select an appropriate installed browser when the repository's
pinned Playwright browser is unavailable.
