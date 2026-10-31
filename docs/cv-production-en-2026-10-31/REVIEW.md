# English CV — existing editable production

[Full-size PNG](Soufiane-Aberbach-CV-EN.png) ·
[Matching A4 PDF](Soufiane-Aberbach-CV-EN.pdf) ·
[Self-contained editable HTML/CSS](Soufiane-Aberbach-CV-EN.html) ·
[Approved-reference comparison](Reference-and-English-comparison.jpg) ·
[Content verification](CONTENT-VERIFICATION.md)

English is ready for owner review. PR #59 remains draft. No French/Spanish CVs,
public replacements, merge or production deployment are included.

## Implementation and visual review

The existing template, photograph, icon module, fashion SVG, script typeface,
renderer and finalizer are reused. The baseline was rendered before editing
from commit `e2d64cc8bd3dd9adb2527c6bc584f9e8f2e330bc` and compared visually
with the supplied reference. All already matching visual elements were retained.

The necessary editorial correction removes unverified title-derived employer
contexts from career.json, retains all six confirmed roles/dates and shows the
confirmed current Tangier location. Summary, technical expertise, software and
languages already match the canonical source and are preserved. No invented
duties, achievements, qualifications, client claims or proficiency levels appear.

One demonstrated rendering issue required a single template value change:
without the former final description, the last row became 2.4375px shorter and
shortened its timeline. Freezing that row at its measured baseline 87.4375px
retains the exact original endpoint. No other template code changed. No renderer,
exporter, verifier, font, icon, SVG or portrait source changed.

The final PNG was viewed at its actual 2480 × 3508 resolution and beside the
approved reference. The portrait is sharp and natural, its crop/frame unchanged;
contact icons, six expertise icons, software/language bars, section markers,
chronology, fashion illustration and script-style footer are all present.
No clipping, collisions or overflowing contact/role labels were found. Unsupported
copy is omitted without shrinking type, moving roles or filling space with guesses.

All measured fixed geometry matches the baseline. An additional baseline PNG
comparison—not a pixel-equality demand against the flattened reference—finds
**zero changed pixels outside the six edited text boxes**. This verifies that
the image hierarchy, portrait, frame, icons, bars, signature and other decoration
have not drifted during this content-only correction. The existing fashion SVG
and script font also match their original source hashes.

[Design-preservation evidence](design-preservation.json) ·
[Layout measurements](layout-report.json) · [Image inspection receipt](image-review.json)

## Export and scope

PNG: 2480 × 3508, 300 DPI, white A4 composition rendered from live text, vector
art and the original photo. It is not an enlarged 905 × 1280 reference image.

PDF: one 210 × 297 mm page, using the exact reviewed PNG as its visible image,
with searchable/selectable source text and live contact links. The decoded PDF
raster is pixel-identical to the PNG. No PDF/UA certification is claimed. As in
the approved design, the top-edge orange accent needs borderless printing for
exact edge reproduction; readable text remains within print-safe margins.

Maintained editable sources: `scripts/cv/career.json` and the existing
`scripts/cv/template.html`; this package also includes a portable HTML/CSS snapshot.
All existing public CV downloads, website sources, Contact backend, Portfolio,
Tech Packs and Cloudflare configuration remain unchanged. Owner English review
is kept separate from publication and later language adaptation.
