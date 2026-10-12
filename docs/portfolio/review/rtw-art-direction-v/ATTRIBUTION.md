# Real imagery, independent examples

These review materials do not document the development of the champagne slip.
No external work is represented as Aberbach's original work. Only the two MoMu
ST656-1 documents share a verified project relationship.

All licenses and sources were checked on **12 October 2026**. The machine-readable
[manifest](asset-provenance.json) contains direct originals, dimensions, hashes,
creators, relationships and modification records.

| Material | Creator / collection | Source and license | Changes |
| --- | --- | --- | --- |
| Night Drifter | Sybil Connolly / Hunt Museum, HM 1999.13.081 | [Commons file page](https://commons.wikimedia.org/wiki/File:Design_Sketch_by_Sybil_Connolly,_Night_Drifter.tif), [museum record](https://www.huntmuseum.com/collection/design-sketch-night-drifter/), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 4542 × 8397 original TIFF converted to lossless WebP at identical resolution; decoded RGB pixel hashes match. A gallery window trims only outer paper margins (9% top / 11% bottom), keeping both drawn looks complete. Inspector shows the full original including pencil title and edges. TIFF remains available upstream; no duplicate in the clean branch. |
| Dress ST656-1 pattern | Creative patterndesign training and development VDAB / MoMu Antwerp Study Collection, Pattern-a-thon 2022 | [Commons file page](https://commons.wikimedia.org/wiki/File:Pattern_of_a_dress_(ST656-1)_-_MoMu_Antwerp_Study_Collection.svg), [collection record](http://data.momu.be/ark:34546/mc5b5v), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | UTF-16 XML transcoded to UTF-8. XML trees identical; all geometry, annotations, grainlines and notches unchanged. Nominal 4840 × 5421; vector viewBox 1 0 5378 6024. |
| Dress ST656-1 front/back drawing | Same VDAB creator and MoMu study | [Commons file page](https://commons.wikimedia.org/wiki/File:Pattern_drawing_of_a_dress_(ST656-1)_-_MoMu_Antwerp_Study_Collection.svg), [collection record](http://data.momu.be/ark:34546/mc5b5v), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | UTF-16 → UTF-8 only. XML trees identical. Nominal 631 × 549; vector viewBox 0 0 701 610. |
| Purple digital robe | CGElves | [Commons file page](https://commons.wikimedia.org/wiki/File:Dynamic_3D_Digital_Clothing_Model_by_CG_Elves_Purple.jpg), [creator's source](https://cgelves.com/free-to-use-images-of-3d-digital-clothing-models/), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Original 1000 × 1000 JPEG, byte-for-byte. Authentic Marvelous Designer render. No grid, tracing, cropping or retouching. Not CLO3D, a scan or verified fit evidence. |
| Champagne reference, front/back | Existing repository photography; author not supplied/verified | `public/portfolio/woven/1-1400.webp`, existing portfolio reference | No source changes. Existing geometric front/back windows. No original-work or project-history claim. |

MoMu encoding adaptations and adaptations of the licensed technical/digital
source material in these review artifacts are released under **CC BY-SA 4.0**.
Reuse must credit the named creators, link the original sources and license,
indicate changes, and apply the same or a compatible license to adaptations.
No creator or museum endorsement is implied. CC0 material remains CC0.

The package is an aggregation. Existing Portfolio photographs and code retain
their existing rights; this statement does not relicense them. Sources and
licenses are also exposed in each inspector and embedded in the offline proof.
The PDF includes credits, modification notices and license links.

## Final curation and the digital limitation

The final [provenance manifest](asset-provenance.json) records the new focused
candidate comparison. Night Drifter is selected over the earlier knee-length
Connolly drawing for its full-length neutral silhouette, authentic back study,
and higher resolution. The source file is preserved through lossless conversion.

For D, the Pixel Swan silk-dress model has a confirmed CC BY 4.0 license, but a
new render through the official viewer could not be obtained: the viewer returned
an authentication error. No website poster was copied and no access restriction
was bypassed. Software provenance is unspecified, so it was never called CLO.

Additional licensed sources were inspected: Steve Jurvetson's Digital Dress is a
photographed projection exhibit, not simulation; Creative Tools' actual MD view
is only 550 × 310 and shows a different tailored outfit; CGElves' 1907 × 769 preset
image is pattern UI rather than a digital garment. The creator's old free-image
page currently returns 404. Generative stock garments were excluded because they
are not verified garment-development work. No repeated unavailable-host loop.

The original CGElves robe is therefore retained as the brief's permitted licensed
fallback. **Its color and silhouette mismatch remain a design limitation.** The
interface names it an independent digital material study and switches whole
representations without fading, registering, recoloring or implying an outcome.

## Historical material in before/after comparisons

The recovery B frame also contains Sybil Connolly's **Many Pannelled Dress**,
Hunt Museum HM 1999.13.101: [original source](https://commons.wikimedia.org/wiki/File:Design_Sketch_by_Sybil_Connolly,_Many_Pannelled_Dress.tiff),
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), 1653 × 2338.
It is reproduced only inside the labelled recovery comparison; its former source
files remain on the recovery branch. IV's neutral synthetic specimens remain
labelled historical UI demos and are not used as final technical evidence.
MoMu and CGElves sources in the comparison carry the same attribution and licenses
as above. No museum or artist endorsement is implied.

All selected files downloaded from direct `upload.wikimedia.org` originals with
HTTP 200. Raster files were decoded and visually inspected. Vector geometry was
compared structurally, then reviewed in the browser. Sources are kept under
`src/lab/rtw-v/assets`, served only by guarded development routes and embedded in
the downloadable review proof. No example assets are placed in `public` or emitted
to the production build.
