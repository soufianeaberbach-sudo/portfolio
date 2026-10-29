# ABERBACH CV production

Three language editions of one factual career record and one A4 layout.

- `career.json`: verified employers, dates, translated titles, competencies,
  software, actual working languages and public contact. English is factual
  authority; the source commit and pages are recorded in this file.
- `template.html`: editable deterministic layout. Archivo and Inter are embedded
  from the existing committed font fixtures; no network fonts are required.
- `portrait.png`: **processed derivative** of the owner-supplied photograph,
  cropped and rendered in monochrome by the browser. The original attachment is
  not copied into the repository or the public site. No generated portrait,
  facial changes, background replacement or invented image detail is used.
- `render.mjs`: typesets real text, checks font loading and page geometry,
  produces 2480 × 3508 PNGs with 300 DPI metadata, and retains searchable HTML
  text sources in ignored `.qa-director/cv/`.
- `finalize.py`: converts each reviewed image into an exact 210 × 297 mm PDF.
  The approved image covers the page; tagged text from the same HTML is retained
  underneath for searching/copying and contact links. It verifies the PDF image
  decodes to exactly the same RGB pixels as the approved PNG. This is a real
  image-to-PDF conversion, without re-typesetting or a visual redesign.
- `verify.py`: independent delivered-file checks: exact dimensions, resolution,
  white print margins, portrait consistency, all six career positions, real
  software/languages, searchable PDF text, working PDF links and pixel equality.

## Reproduce

Use the repository's existing Node/Playwright install. Install the print helpers
in a Python environment (`python3 -m pip install -r scripts/cv/requirements.txt`).

```sh
node scripts/cv/render.mjs
# Inspect all three PNGs at native resolution before final PDF production.
python3 scripts/cv/finalize.py
node tests/cv.mjs
```

Use `CHROMIUM_PATH` only when the existing Playwright browser is unavailable and
an appropriate local Chromium is already installed. `CV_OUTPUT_DIR` and
`CV_QA_DIR` can point to alternative repository-relative production/review
folders. The independent delivered-file test always checks `public/cv/`.

To prepare a replacement **owner-authorized** portrait, supply its local path:

```sh
node scripts/cv/render.mjs --prepare-portrait /path/to/owner-portrait.jpg
```

This updates only the cropped monochrome derivative, then renders the editions.
Review the real identity/crop before running final PDF production. The default
render requires no access to the original attachment.

The source retains the owner's real Arabic/French/English working languages.
Spanish publication does not create a Spanish-proficiency claim. Education,
certifications, metrics, employer responsibilities and proficiency levels are
omitted because the verified source does not establish them.
