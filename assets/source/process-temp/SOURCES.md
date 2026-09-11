# Process page — temporary visual anchors

**THESE ARE NOT PHOTOGRAPHS YET.** The six files in `public/process-temp/` are
neutral holding plates: flat `#F0ECE3` fields with nothing drawn inside them.
They exist so the Process layout and its responsive behaviour can be validated
at every width. They are not Soufiane's work, they are not stock photography,
and no copy anywhere on the page refers to them — the page must never read as
unfinished because of a developer placeholder.

While a plate is in place its `alt` stays empty and the `<img>` carries
`role="presentation"`. That is truthful: a flat plate conveys nothing, so
describing one would be a false claim.

## The three slots

| Stage | Visual meaning | Frame | Files |
|---|---|---|---|
| 01 Brief / Intent lock | The starting information entering the project — brief, sketch, references, the material a client actually sends | 3:2 landscape | `01-brief-{900,1500}.webp` |
| 03 Fit / Validation | The product being evaluated before it is locked — fit, balance, proportion, validation in progress | 4:5 portrait | `03-validation-{720,1120}.webp` |
| 05 Pre-production / Handoff | The approved product entering controlled production — factory handoff, first piece, pre-production verification | 3:2 landscape | `05-handoff-{900,1500}.webp` |

Three different aspect ratios, deliberately: it stops the five stages reading
as five repeated templates, and it does not echo the single 4:3 frame the
Expertise page uses.

Stages 02 and 04 carry no photography. The accumulating dossier, the
structural terms at 02 and the specification leaf at 04 already explain them,
and a fourth and fifth image would flatten the page's rhythm.

## Replacing a plate

1. Produce both renditions at **exactly** the dimensions in the table above.
   Cover-scale, never distort:

   ```
   scale=W:H:force_original_aspect_ratio=increase:flags=lanczos, crop=W:H
   -c:v libwebp -quality 88 -compression_level 6
   ```

2. Overwrite the two files at the same paths.
3. In `src/pages/process.astro`, fill in that stage's `visual.alt` with a
   description of what the image **literally shows**, and change
   `visual.position` from `50% 50%` if the framing is not centre-weighted.
   The `role="presentation"` disappears on its own once `alt` is non-empty.

Nothing else changes. No layout geometry depends on image content — each frame
is an `aspect-ratio` box with `object-fit: cover`, so the composition holds
whatever lands in it.

## Producing the current plates

No script is committed for this. A committed generator that writes to these
same filenames is a footgun — it is how `.devtools/fetch-expertise-temp.sh`
ended up able to silently overwrite real assets. The plates came from:

```
ffmpeg -f lavfi -i color=c=0xF0ECE3:s=WxH -frames:v 1 \
  -c:v libwebp -quality 88 -compression_level 6 out.webp
```

Delete this file once all three stages carry real imagery, and remove the
`VISUALS` paragraph from the header comment of `src/pages/process.astro`.
