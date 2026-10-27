# Controlled Tech Pack corrections

These sources apply localized corrections within the approved master geometry.
They do not generate complete page illustrations. The original baseline remains
available in Git; the current PNGs, PDFs and manifests are already built. **Do not
run the render pipeline merely to resume work or verify an unchanged document.**

## Source chain

`specs.py` preserves the initial demonstration specifications. `revisions.py` and
`precision.py` apply the prior audit. `completion.py` contains the current
garment-specific operation sets, leader/POM corrections and reconciled values.
`credibility.py` applies the 26 October owner corrections: no invented leggings insert, independent dress body/strap datums, and targeted construction clarifications. `artwork.py` inserts the licensed photographs and label proofs inside the existing
page regions. Read the final specifications in
`docs/techpack-refinement-2026-10-25/engineering-specifications.json`; do not mistake
an intentionally retained historical entry in `specs.py` for the final output.

The bundled master PDF is an input template, not a deliverable. Fonts and approved
technical flats are in `assets/`. Historical photographic masters are preserved.
Raw photographic inputs and their licensing metadata are in
`assets/source-photographs/`. Material derivative attribution and SHA256 values
are published in `public/techpacks/materials/material-credits.json` and the
website's material-credits page. Colour treatments and generated component/label
visualizations are identified there and in the documents.

## Reproduce a necessary correction

Run from the repository root using Python 3 with the versions in
`requirements.txt`, preferably in a task-specific virtual environment.

The exporter compares against the published PR54 baseline. Prepare a disposable
baseline directory once, without touching the working tree:

```sh
mkdir -p .qa-director/completion/baseline
git archive 0c317597f347af3032f027fa62a03a165f40fa56 public/techpacks/pages | tar -x -C .qa-director/completion/baseline --strip-components=2
```

The resulting path must contain `pages/AB-W-SH-01/` and the other four styles.
An existing saved baseline may instead be passed with `--baseline PATH`.

After editing the relevant source, render only the affected garment:

```sh
python scripts/techpack-development/export_revision.py --only AB-W-SH-01
python scripts/techpack-development/build_reader_previews.py
```

For a correction confined to specific pages, pass `--pages 2` (or a comma-separated
list) together with `--only`. The exporter verifies and retains all unselected
PNGs against their existing receipts, rebuilds only that PDF, and leaves cover
previews untouched unless page 1 changed. For example, the installed-slider
photograph update uses `--only AB-W-DR-03 --pages 2`.

Verify existing deliverables without rendering or changing anything:

```sh
python scripts/techpack-development/verify_documents.py
```

The second command skips reader copies whose source hash has not changed. Use
`build_artwork.py` only when component imagery/artwork itself changes; it rebuilds
the material derivatives and credit register, so it is unnecessary for text/POM
corrections. Three remaining generated trim images and the woven-label proof are
saved inputs; a generation service is not required to reproduce their current
placement. The installed-slider image is a genuine licensed photograph with its
original colour and geometry preserved; it is not a verified 6 mm product sample.

`export_revision.py` preserves deliberately unchanged PNGs byte-for-byte. It
exports corrected pages at 3508 × 2480, packages the exact PNG pixels into ten-page
A4 landscape PDFs, checks every embedded RGB image, then renders all PDF pages
back and compares them to their PNG sources. No lossy PDF artwork conversion is
used. It also refreshes covers, content-hashed page/PDF URLs, revision identities,
engineering specifications and audit receipts. It does not build or deploy the
website. After an actual asset change, build the site and run the affected reader
and source-integrity checks.

## Evidence and limits

- `audit_operations.py` records dispositions for the original 100 construction
  instructions; current operation counts are garment-specific.
- `docs/techpack-refinement-2026-10-25/` contains cross-page audit, complete final
  specifications, page/PDF hashes, pixel comparisons and reader-copy source hashes.
- `.qa-director/completion/documents/` is disposable render/text/round-trip QA.
- These are development demonstrations. Material photographs are representative,
  not tested supplier swatches. Three trim references are accepted representative visualizations under the 26 October brief; their distinction remains in the credit metadata. They must not be described as genuine product photography.
