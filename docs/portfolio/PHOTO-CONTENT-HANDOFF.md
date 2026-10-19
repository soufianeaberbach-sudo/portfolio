# Photography content handoff

**ACTIVE · 19 October 2026.** Use the implemented V2.1 content adapter, not a new
image system. Source baseline: main `a36ae62af385641f2c4d92c07bcd851d10ee24d7`;
review head `34c0286978de846298dbb2a4340979dd4b8887a6`.
[Authoritative fifty-slot snapshot](review/womenswear-v21/SLOTS.tsv) ·
[Geometry/views snapshot](review/womenswear-v21/SLOTS.json) ·
[Source licensing](review/womenswear-v21/ATTRIBUTION.md).
These dated manifests are review evidence; do not silently rewrite them after a
replacement. Publish a new dated manifest when content changes.

## Stable slots versus historical pool

[portfolio.ts](../../src/data/portfolio.ts) retains the original 49 references.
[womenswear-references.json](../../src/data/womenswear-references.json) adds eight
Streetwear and one Swim reference. [womenswear-collection.ts](../../src/data/womenswear-collection.ts)
selects ten displayed IDs per category and accepts optional `photography: FinalViews`
and `credit: ImageCredit` overrides. The complete pool renders 58 readers;
the exhibition/archive edit renders 50 unique entries.

In the table each number is the suffix of `<category>-ref-NN`; preserve both
category and reference identity. A slot is an editorial position, not an angle.

| Display slot | rtw | activewear | streetwear | evening (Occasion) | swimwear (Swim) |
| --- | --- | --- | --- | --- | --- |
| 01 | 01 | 01 | 01 | 01 | 01 |
| 02 | 02 | 02 | 02 | 02 | 02 |
| 03 | 03 | 03 | 03 | 03 | 03 |
| 04 | 04 | 04 | 04 | 04 | 04 |
| 05 | 05 | 05 | 05 | 05 | 05 |
| 06 | 06 | 06 | 06 | 06 | 06 |
| 07 | 07 | 07 | 07 | 07 | 07 |
| 08 | 10 | 08 | 08 | 08 | 08 |
| 09 | 11 | 09 | 09 | 10 | 09 |
| 10 | 15 | 10 | 10 | 11 | 10 |

Excluded but routable: RTW 08, 09, 12, 13, 14, 16, 17; Occasion 09. Never delete,
renumber or reuse an excluded identity. Old links remain
`/portfolio/#womenswear/<category>/<reference-id>`. Do not reorder the historical
arrays: they generated existing IDs by position. Do not duplicate a look to fill
a slot, mix categories, or count Front and Back as separate garments.

## Intake and metadata

Before editing content obtain the actual photo files, rights to publish, creator
credits, correct category/identity, confirmed angles and a literal description.
Use new source filenames rather than overwriting preserved historical originals.
Keep the stable display ID and category. Record replacement date and old→new
source mapping; confirm with the owner whether an existing reference URL should
now resolve to the replacement or a separately preserved project identity.

`ImageAsset` records `src`, responsive `srcset`, intrinsic `width`/`height`, `alt`,
`front`, optional `views: 1 | 2` and `separable`. Dimensions refer to the actual
largest rendition; responsive widths must match actual files. Measure, never
guess. Preserve original proportions, garment appearance and available pixels.
Prepare adequate-resolution renditions for the actual full-look/inspection use;
no universal aspect ratio or new mandatory resolution is imposed. Current new
reference renditions are 900/1800 pixels high, not a required future schema.

Use `CollectionSlot.photography` for final-photo replacement. It is parsed through
existing `projectSubject` view handling **without** promoting the reference to a
verified project. `collectionCredit` uses the replacement's own credit, never the
former Pexels creator. Update source permissions and dimensions with every asset.

## Supported configurations

| Supplied media | Existing metadata | Rendering rule |
| --- | --- | --- |
| One separable two-up Front/Back | `photography.composite`, `views:2`, measured `front` split, `separable:true` | Complete Front / Back windows and Complete Original. Keep every head, hand, hem and shoe inside its window. |
| One inseparable composite | `composite`, `views:2`, `separable:false` | Whole original; do not invent independent Front/Back windows. |
| One genuine primary photo | `front` or the genuine supplied final-view field, `views:1`, `front:1` | Whole photo; no guessed alternate angle. |
| Separate Front and Back | `front` and `back` ImageAssets, each with its own dimensions | Original photos directly, no two-up crop assumptions. |
| Optional Side / Fashion | `side`, `editorial` ImageAssets | Only supplied controls appear; the exhibition still uses first primary/front. |
| Optional detail photos | `details: [{image, note?}]` | Real details in reader; no replacement for full primary silhouette. Notes must be supplied, not inferred. |

Provide a genuine front/primary cover for the exhibition. The existing parser
orders supplied views and falls back to available media; it cannot determine
whether an unlabeled file is front-facing. Do not expect the timeline to infer
angles. [final-photography.ts](../../src/data/final-photography.ts) adds whole-source
access for split views, deduplicates identical source/crop combinations and uses
the whole original when geometry is unsafe.

Current inseparable exceptions: `rtw-ref-08`, `rtw-ref-16`, `activewear-ref-10`,
`evening-ref-01`. Current Swim and the eight new Streetwear sources are single-view.
This is source metadata, not a rule that all future photos must follow.

## Composition without rewriting the system

[womenswear-direction.ts](../../src/data/womenswear-direction.ts) resolves explicit
stable IDs for cast roles; replacements do not require new transitions. Its
`photoFrames` are measured empty-margin windows qualified by exact source URL.
A new source path automatically loses the old window and falls back to the new
whole source. Never reuse an old crop without measuring the replacement.

A metadata window can isolate a complete front/back figure or trim truly empty
margins; it cannot hide source anatomy cuts, remove backgrounds or erase texture.
Original-source access remains. Different aspect ratios fit the stage; mobile
may need a deliberately reviewed composition correction, not forced stretching.
Do not add automatic back/side/editorial switching during scroll.

## Truthful publication state

All current Womenswear references remain **reference-only**. A reference credit
can identify owner-supplied photography but does not itself prove original garment
authorship. Obtain explicit owner confirmation, rights, project identity and
factual descriptions before claiming a verified ABERBACH project.

The existing `Project.final` model supports genuine final photographs, but
`worldPublication` currently switches a garment world to projects when verified
projects exist. A first real Project is therefore **not** a safe one-record toggle
in a partially replaced fifty-slot reference world: audit mixed publication,
visible-slot mappings and historical-reader continuity in a separately authorized
content migration. Do not invent a parallel model or change that behavior during
a metadata-only task. No development evidence is required or authorized for
Womenswear; technical stages remain postponed.

## Replacement acceptance checklist

- Original files and old IDs preserved; category/slot mapping remains exactly ten
  unique visible looks each, fifty overall; historical deep links still resolve.
- Actual dimensions/srcset/angle labels verified, meaningful literal alt text,
  appropriate creator/source/license disclosure; no inferred material or history.
- Full primary looks, actual Front/Back and whole-source access checked; missing
  angles produce no controls; inseparable cases and unfamiliar ratios stay safe.
- All six viewports reviewed: 1440×900, 1366×768, 1024×768, 768×1024, 430×932,
  390×844. Check opening, midpoint/payoff, archive and reader, especially hems,
  caption clearance, studio edges and complete originals.
- Test swipe, keyboard, zoom/pan/Fit, reduced motion, slow/error decoding,
  source-occurrence return/focus, resize and history. Run relevant adapter,
  configuration, ten-look, historical-return and continuity tests plus build.
- Inspect actual motion and obtain owner visual/content approval; physical Safari
  when available. Refresh maintained state/provenance and add a dated review
  manifest. Neither a caption change nor green assertions is ownership approval.
