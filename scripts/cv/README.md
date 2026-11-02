# Approved CV deliverables

The owner's final attachments of **2 November 2026** are the sole authority for
the public CVs. They supersede the generated CVs in PR #58 and the artwork in
PR #59. PR #59 stays separate; none of its artwork is used for this release.

`approved-images.json` records each attachment's actual language, original
filename, SHA-256, native dimensions, pixel mode, RGB digest, color-profile
digest, and reviewed PDF digest. The PNGs in `public/cv/` are byte-for-byte
copies. All three are **1055 × 1491**; no upscaling or 300-DPI claim is made.

`approved-images.py` reads those exact PNGs and writes only matching PDFs.
Each is one 210 × 297 mm portrait page. The native image is centered at its
largest aspect-preserving fit, without cropping or resampling. Its unavoidable
vertical fit allowance is about 0.107 mm per edge. RGB samples are embedded
losslessly; the original Display P3 ICC profiles in FR/ES are embedded and bound
to the PDF image. PNG metadata and all original bytes remain untouched.

```sh
python3 scripts/cv/approved-images.py
npm run test:cv
```

The independent verifier pins approved PNG/PDF hashes and checks native pixels,
ICC profile bytes, page count/size, fit, centering, lossless encoding and real PDF
rendering. PDFs are image-based, as explicitly approved. They do not invent
searchable text, higher resolution, or PDF/UA certification.

`CVDownloads.astro` selects the page language's PDF and offers PDF/PNG for every
edition. The i18n browser suite exercises actual downloads and filenames.

The older `career.json`, `template.html`, `portrait.png`, `render.mjs` and
`finalize.py` remain historical production sources. **Do not run the old design
generator against `public/cv/`.** It would overwrite the owner-approved files;
the hash verifier deliberately rejects any such substitution.
