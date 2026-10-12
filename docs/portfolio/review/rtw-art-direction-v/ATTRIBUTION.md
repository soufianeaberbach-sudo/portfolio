# Real imagery, independent examples

These review materials do not document the development of the champagne slip.
No external work is represented as Aberbach's original work. Only the two MoMu
ST656-1 documents share a verified project relationship.

All licenses and sources were checked on **12 October 2026**. The machine-readable
[manifest](asset-provenance.json) contains direct originals, dimensions, hashes,
creators, relationships and modification records.

| Material | Creator / collection | Source and license | Changes |
| --- | --- | --- | --- |
| Many Pannelled Dress | Sybil Connolly / Hunt Museum, HM 1999.13.101 | [Commons file page](https://commons.wikimedia.org/wiki/File:Design_Sketch_by_Sybil_Connolly,_Many_Pannelled_Dress.tiff), [museum record](https://www.huntmuseum.com/collection/design-sketch-48/), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Original 1653 × 2338 TIFF retained. Browser PNG conversion at identical resolution; decoded pixel hashes match. Original paper, drawing and edge marks retained. |
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

## Candidate comparison

| Candidate inspected | Quality / resolution | Permission | Decision |
| --- | --- | --- | --- |
| Connolly, Many Pannelled Dress | 1653 × 2338; strong graphite/wash silhouette and authentic paper | CC0 | Selected: stronger drawing presence at both proportions. |
| Connolly, Carrickmacross Lace Dress | 1540 × 3145; expressive sleeves but narrower, finer figure | CC0 | Not selected: more whitespace and less garment authority in this canvas. |
| MoMu ST656-1 flat + pattern | Scalable vectors; multi-piece bodice/facings/sleeve/skirt, authentic markings; same collection identifier | CC BY-SA 4.0 | Selected together: the only verified document relationship in this proof. |
| MoMu ST650-3 slip | Initial supplied filename was not canonical and returned 404; collection page identifies the proper file | CC BY-SA candidate | Not selected: ST656-1 offers the stronger verified pattern/flat pair. No unverified download republished. |
| Jules David, Fashion illustration no. 2224 / Met 53.664.18 | 2918 × 3811; excellent watercolor, but a historical group scene | CC0, Met Open Access | Independently researched, downloaded and visually inspected; less appropriate than a focused designer's drawing. |
| Pixel Swan, Silk dress | Close visual candidate; API confirms downloadable model and CC BY 4.0 | Model CC BY 4.0; download API requires authentication (401) | Not republished. A model license was not assumed to authorize copying website preview media. |
| CGElves purple digital robe | 1000 × 1000; clean white, complete volume, fabric texture and drape | CC BY-SA 4.0 | Selected. Different garment explicitly identified; no false champagne comparison. |
| CGElves free floral skirt example | 700 × 700; actual MD material, but cropped body, patterned fabric and low resolution | CC BY-SA 4.0 | Downloaded and inspected, rejected on visual quality and incomplete framing. |

All selected files downloaded from direct `upload.wikimedia.org` originals with
HTTP 200. Raster files were decoded and visually inspected. Vector geometry was
compared structurally, then reviewed in the browser. Sources are kept under
`src/lab/rtw-v/assets`, served only by guarded development routes and embedded in
the downloadable review proof. No example assets are placed in `public` or emitted
to the production build.
