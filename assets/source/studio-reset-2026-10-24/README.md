# Expertise and Process — creative reset

This set replaces all four Expertise and five Process images introduced by
`ec4b7310a82d1da0454de832b5a7496de26d0e63`, now merged into main as
`fe5c373a2fc1a3c64ef9580c77f8ec5d36ae6bc1`.

**No previous Expertise or Process image was supplied as a generation reference,
edited, copied or used as a composition guide.** Every image-generation request
was text-only; no `referenced_image_paths` or conversation-image inclusion was
used. This also applies to the replacement candidates generated during this task.

These are generated photographic illustrations of professional practice. They
are not documentary evidence of Soufiane's actual studio, physical samples,
clients, employees or manufacturing history.

## Planned before generation

`SHOT-PLAN.json` records the actual subsection meaning, subject, action,
environment, permitted props, exclusions and full prompt for all nine initial
shots. `REPLACEMENT-04.json` and `PROCESS-REFINEMENT-PLAN.json` record subsequent
plans and prompts. `SELECTION.json` identifies the final selected native outputs;
`MANIFEST.json` records their SHA256 hashes, native sizes and 18 responsive files.

| Actual subsection | Final scene | State of the material |
| --- | --- | --- |
| Expertise / Design intent | Designer tests the drape of one length of wool crepe | Unsewn yardage, clearly not a garment |
| Expertise / Fit system | Fitter pinches side-waist ease on a bodice toile | Sewn cotton prototype, raw hem |
| Expertise / Technical translation | Patternmaker reviews one hanging sleeve pattern | Stiff paper, physical cut contour and notch |
| Expertise / Production control | Controller checks one enclosed shirt seam | Finished navy garment, enclosed allowances |
| Process / Brief / Intent lock | Two colleagues discuss one reference shirt | Finished reference garment |
| Process / Technical build | Patternmaker draws one sleeve-cap curve | Paper draft, no sewn fabric |
| Process / Fit / Validation | Fitter checks upper-back ease on a live fit model | Unfinished cotton shirt toile, raw hem/cuffs |
| Process / Size / Specification lock | Technician checks one flat chest measurement | Finished navy shirt, tape flat between side edges |
| Process / Pre-production / Handoff | Colleagues hand over one hanging reference shirt | Finished navy garment on a normal hanger |

The Process sequence consistently follows shirt development. Each image shows
one action rather than assembling several representations into a tableau.
The prototype is visibly different from the finished reference. No garment has
graphic overlays, fake balance marks, dotted annotations or floating symbols.
The single measuring tape is laid flat; its consecutive 0–54cm scale and physical
position were visually checked at full native size. No rulers appear.

## Rejection and refinement

Four final Expertise and five final Process images are selected from twelve
new candidates. Three superseded natives remain under `rejected/`:

- Expertise 04 buttonhole: rejected for unconvincing/fringed stitching; replaced
  by a simpler finished enclosed-seam inspection.
- Process 03 skirt fitting and 04 trouser measurement: individually plausible,
  but replaced after browser review because changing product types weakened the
  shirt-development sequence. Neither was used as a generation reference.

Native Expertise files are 1448×1086; Process files are 1536×1024. The delivery
script only downsizes proportionally and encodes WebP. It does not recolor,
retouch, crop, synthesize text or paint anatomical/technical corrections.
Reproduce with `python scripts/prepare-studio-reset.py`.

[Integration and visual verification](../../../docs/portfolio/review/studio-reset-2026-10-24/README.md).
