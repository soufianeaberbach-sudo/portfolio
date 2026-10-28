# CV image and print review — 28 October 2026

Reviewed all three final **2480 × 3508 PNGs at native A4 resolution** using image
inspection, following actual browser rendering. These public deliverables are
also the full-resolution review evidence; no duplicate full-size screenshots
are needed in documentation.

| Edition | Reviewed image | Matching PDF |
| --- | --- | --- |
| English | [PNG](../../../../public/cv/Soufiane-Aberbach-CV-EN.png) | [PDF](../../../../public/cv/Soufiane-Aberbach-CV-EN.pdf) |
| Français | [PNG](../../../../public/cv/Soufiane-Aberbach-CV-FR.png) | [PDF](../../../../public/cv/Soufiane-Aberbach-CV-FR.pdf) |
| Español | [PNG](../../../../public/cv/Soufiane-Aberbach-CV-ES.png) | [PDF](../../../../public/cv/Soufiane-Aberbach-CV-ES.pdf) |

## Facts and composition

All six positions and six software systems were verified against current main
`6a487817cd4a585c5140547aa9b74e2b8c6dac35` Experience/Expertise content. Contact
uses the approved `soufianeaberbach@gmail.com` and `aberbach.co`; no phone or
private address is added. Actual working languages are Arabic, French and
English. All editions contain the same career, not different biographies.

Senior fashion design and product development lead the header, summary and
current Ava Marie position. Earlier CAD, production and operations titles are
presented without fabricated duties or achievements. Education, qualifications,
metrics and language levels are omitted.

White paper (#FFFFFF), near-black Archivo/Inter typography, neutral grey body
copy and small #D45F36 rules/dot carry the established identity. The owner's
portrait appears in a restrained 36.8 × 48.4 mm monochrome crop. Facial identity,
age and expression are unchanged. Content has at least 10 mm printer-safe
margins; typography remains real text in the editable HTML source.

## Concrete critique and refinements

1. **Hierarchy:** the two-line name and explicitly composed senior title lead;
   the Ava Marie entry has more weight than earlier positions. The photograph
   supports identity without dominating the chronology.
2. **Image integration:** the monochrome rectangular portrait has an intentional
   editorial frame and a small orange baseline. Hair, glasses and facial edges
   are intact; no background removal, halos or synthetic detail.
3. **Composition:** two aligned columns separate competencies from a clear
   reverse chronology. No boxes, ratings, charts or decorative icons. Consistent
   outer margins and a modest footer keep the white page balanced.
4. **Rhythm:** the current position opens the experience list; the remaining
   five positions share consistent spacing. All six fit without compression.
5. **Typography:** first-pass small text was enlarged. The initial Spanish
   header orphaned “producto”; all editions now have intentional two-line title
   compositions. French accents (including Évaluation, préproduction, Févr.,
   Août) and Spanish accents (sénior, Tánger, Árabe, Francés, Inglés) were checked.
6. **Integrity:** enlarging the copy exposed a French footer collision in
   automated geometry QA. The source was corrected by editing the French skill
   composition and grouping software deliberately, then all images rerendered.
   Final geometry has no clipping/overlap and a clear gap before the footer.
7. **Interaction/output:** these are fixed A4 documents; website responsive
   download controls are reviewed separately. PDF contact links remain usable.

## Print and consistency checks

`node tests/cv.mjs` passes for all three editions. PNG metadata is 299.9994 DPI
(the integer PNG pixels-per-metre representation of 300 DPI). PDFs have exactly
210 × 297 mm media/crop boxes, one page, searchable source text and all six
positions. Every final PDF's full-page raster decodes to **identical RGB
pixels** to its corresponding reviewed PNG. The PDF raster has exactly the
page bounds, without clipping or added margins. All three photographs are
pixel-identical in composition. The independent border test confirms true white
printer-safe edges.

The PDFs retain the tagged browser text layer; no PDF/UA conformance audit is
claimed. [Machine print report](cv-print-verification.json).

Editable source and reproduction instructions:
[`scripts/cv/README.md`](../../../../scripts/cv/README.md).
