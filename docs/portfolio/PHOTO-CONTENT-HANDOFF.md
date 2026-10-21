# Photography content handoff

**ACTIVE · 21 October 2026.** Main baseline `a4b0aba1591ac043b11ca9b75b6079b0ed27a9be`
contains Womenswear V2.1 and Menswear PR #44. The three-panel extension and final
category names below are a review candidate on
`refine/portfolio-fashion-categories-photo-finalization`; merge and deployment
remain separate approvals. Reuse the existing slot/FinalViews adapters.
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

| Display slot | rtw | activewear | streetwear | evening (Occasionwear) | swimwear (Swimwear) |
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
`front`, optional `views: 1 | 2 | 3`, `thirdView` and `separable`. Dimensions refer to the actual
largest rendition; responsive widths must match actual files. Measure, never
guess. Preserve original proportions, garment appearance and available pixels.
Prepare adequate-resolution renditions for the actual full-look/inspection use;
existing historical/separate photos retain their own aspect ratios. New owner
three-panel masters use the explicit standard below. Current reference renditions
are not re-exported or resized by this refinement.

Use `CollectionSlot.photography` for final-photo replacement. It is parsed through
existing `projectSubject` view handling **without** promoting the reference to a
verified project. `collectionCredit` uses the replacement's own credit, never the
former Pexels creator. Update source permissions and dimensions with every asset.

## Owner standard: one file, three views

Export **5400 × 2700 px**, a horizontal master with **three equal 1800 × 2700 px**
2:3 portrait panels of the **same garment**:

| View | Normalized source interval | Crop |
| --- | --- | --- |
| Front | `0 … 1/3` | First complete silhouette |
| Back | `1/3 … 2/3` | Complete back silhouette |
| Fashion pose or Detail | `2/3 … 1` | Genuine third view, deliberately chosen |

Use white `#FFFFFF` or a genuine transparent PNG. Preserve alpha, garment colour,
light fabrics, hair, hands, hems and footwear. Keep the complete front/back inside
their own panels, with consistent scale and ground. Do not construct a third view
from unrelated photographs. A detail is a secondary inspection view, not the
primary full look.

Attach the following metadata to the **existing stable slot's**
`photography.composite` (illustrative schema, no owner file is published yet):

```ts
{
  src: '/portfolio/owner/garment-master.png',
  srcset: '', // or real 2:1 renditions with accurate width descriptors
  width: 5400,
  height: 2700,
  alt: 'Literal description of the supplied front, back and third view',
  views: 3,
  front: 1 / 3,
  thirdView: 'editorial', // Fashion pose; use 'detail' for a real detail panel
  separable: true
}
```

The explicit `views:3` plus 2:1 geometry enables thirds. Incorrect ratios or
`separable:false` safely retain the complete original. A single wide source never
becomes three views by inference. Historical two-up splits remain measured as
before; **do not change their dimensions, `views` or split metadata**.

The film and archive use **Front only**. Reader choices are **Front**, **Back**,
**Fashion pose** or **Detail**, plus deliberate **Complete Original** and **Look
closer**. The three-panel board is never the default cinematic composition.
Existing keyboard/swipe, inspection and source return remain in use.

For efficient loading, supply proportional whole-master renditions, e.g.
1800×900 and 2700×1350, retaining the same thirds and transparency. Actual `srcset`
widths must match the files. The extension accounts for the full source width
behind a one-third aperture; it does not request a tiny one-third thumbnail as
though it covered the whole image. The selected reader prepares the full source.
The 5400px file remains available for original inspection. PNG or alpha-preserving
renditions must never be flattened merely to fit a layout. Measure memory and
frame pacing again with the real final masters on physical devices.

## Menswear uses the same photography contract

[menswear-collection.ts](../../src/data/menswear-collection.ts) keeps ten stable
slots each in `m-streetwear`, `m-activewear`, `m-rtw`, `m-tailoring`. The
[forty-slot snapshot](review/menswear-production/SLOTS.tsv) identifies their
Pexels-based stable IDs. Six historical sources plus 34 additions provide forty
unique displayed looks; all sixteen historical records remain and the pool has
fifty routable identities. Do not delete or reorder them.

Attach the same `photography: FinalViews` and replacement `credit` to an existing
`MenswearSlot`. No additional angle platform or reader is needed. Its verified
source-specific architectural/crop effects are not applied to unrelated owner
files. The primary/front region fits the existing stage. Preserve route identity
and add new asset paths; do not overwrite historical production photographs.

Category names are display metadata, not new URL paths. See the
[ninety-look taxonomy audit](review/fashion-finalization/TAXONOMY.md) for current
candidate names and content-fit exceptions. No garment is moved to make a label
fit. Menswear remains photography-only too.

## Supported configurations

| Supplied media | Existing metadata | Rendering rule |
| --- | --- | --- |
| Standard three-panel master | `composite`, `views:3`, `thirdView:editorial` or `detail`, 2:1 source | Equal complete Front / Back / third windows, plus Complete Original. |
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
  unique visible looks each, fifty Womenswear and forty Menswear overall; historical deep links still resolve.
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
