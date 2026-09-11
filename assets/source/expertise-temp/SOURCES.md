# Expertise page — temporary visual assets

**TEMPORARY STAND-INS — REPLACE WITH SOUFIANE'S OWN PROJECT IMAGES.**

The four images referenced by `/expertise-temp/` are the active visuals on the
Expertise page. They were supplied directly for this purpose and are temporary:
they stand in until Soufiane replaces them with images of his own real project
work. They are not documentation of a specific Soufiane project, and nothing on
the page attributes them to him.

Alt text in `src/components/ExpertiseVisual.astro` describes only what each
image literally shows.

## Files

| Stage | Files | Image content |
|---|---|---|
| 01 Design intent | `01-design-intent-{800,1400}.webp` | Atelier worktable — a large garment sketch on board beside the same design draped in toile on a dress form, with fabric swatches and pattern paper |
| 02 Fit system | `02-fit-system-{800,1400}.webp` | Dress form carrying an in-progress toile with a measuring tape at the waist, beside a worktable holding a measurement sheet and graded pattern paper |
| 03 Technical translation | `03-technical-translation-{800,1400}.webp` | One shirt design across four technical representations — flat drawing, cut paper pattern pieces, the digital pattern on screen, technical specification sheet |
| 04 Production control | `04-production-control-{800,1400}.webp` | Two jackets on a quality control table, a measuring tape across one, a checked inspection sheet, the rest of the production run on a rail behind |

All eight live in `public/expertise-temp/`.

## Processing

Each source arrived at 1448×1086, which is exactly 4:3 — the same ratio as the
widest frame the stage uses. Cover-scaling to 800×600 and 1400×1050 therefore
crops nothing, and every compositional element listed above survives intact:

```
scale=W:H:force_original_aspect_ratio=increase:flags=lanczos, crop=W:H
-c:v libwebp -quality 88 -compression_level 6
```

Because the sources are exact 4:3 and centre-weighted, every stage's
`object-position` is `50% 50%`. The frame narrows to 3:2, then 5:4, then 1:1 as
the viewport does, so a true centre keeps the trim even on both edges instead of
biasing it off one.

## Replacing them

Overwrite the eight filenames above with the new renditions at the same
dimensions, then update that stage's `alt` (and `position`, if the new framing
is not centre-weighted) in `ExpertiseVisual.astro`'s `STAGES` array. Nothing
else on the page depends on image content.

Finally, delete this file once the images are Soufiane's own work, and remove
the "TEMPORARY PLACEHOLDERS" note from the header comment of
`ExpertiseVisual.astro`.

## Note on `.devtools/fetch-expertise-temp.sh`

That script predates these images. It downloads a set of stock photographs and
writes them to **these same eight filenames**, so running it now would
overwrite the current assets. It is retained only as a record of the earlier
approach — do not run it unless you intend to replace these images.
