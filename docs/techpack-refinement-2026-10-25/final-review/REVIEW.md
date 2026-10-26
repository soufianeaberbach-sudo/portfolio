# Final technical review and remaining photo blockers

Candidate based on saved commit `24fecfeec5e1280bc8a524c94f4ecf167dc7890f`.
PR55 remains draft. No merge or deployment is authorized by this review while the
required trim-photo replacements remain incomplete.

## Changes in this pass

| Style / page | Confirmed defect or asset gap | Correction |
| --- | --- | --- |
| AB-W-DR-03 / 02 | Generated ring/slider visualization | Genuine licensed coated-metal slider photograph, identified as an installed-slider family reference. The caption does not claim to show a companion ring or authenticate the written 6mm opening. |
| AB-W-SH-01 / 10 | M measures the visible back collar profile rather than the separate stand; E cuts inside the sleeve | M moves to a finished-stand detail. E follows the sleeve outer edge from shoulder join to cuff end. Values and original flat remain unchanged. |
| AB-M-HD-05 / 10 | C/D start inside the body above the dropped-armhole seam | C ends at the actual upper sleeve/body seam junctions. D starts at that junction and follows the sleeve outer edge to cuff end. Values and original flat remain unchanged. |
| AB-W-SH-01, AB-W-LG-02, AB-M-TR-04, AB-M-HD-05 / 10 | The PDF drawing library closes multi-segment measurement paths by default, adding a straight closing chord | Keep the ten curved measurement paths open. Only intended sleeve, leg and rise paths plus endpoint arrowheads remain. |

Five PNGs changed. The other 45 PNGs are byte-identical to `24fecfee`, and all ten
cover previews remain byte-identical. Each updated page retains the exact header,
information rows and footer pixels. Only affected reading copies were regenerated.
All five PDFs were repackaged from the corresponding final ten PNG pages because
each document has one affected page. No garment photography, silhouette, colourway,
measurement value, construction operation or page count was changed in this pass.

The new exporter `--pages` option retains unselected PNGs against their saved
hashes and avoids regenerating unchanged covers. The read-only document verifier
checks all five PDFs, every embedded PNG, page placement/order, revision graph,
reading copies, material hashes and the ten unchanged PR54 foundation files.
It also inspects actual generated vector paths to reject a closing chord on a
curved measurement. No artwork is exported by verification.

## Technical review scope and findings

Reviewed the 64 current numbered construction instructions, 80 A–P measurement
rows, material/trim specifications, label placements and POM methods across the
five final documents, using final specification JSON, the existing operation
audit, actual flats, complete page contact sheets and focused full-resolution
diagrams. Earlier audit and source evidence are retained; this is a continuation,
not a fresh garment design.

- **Shirt:** five functional front buttons including collar, four cuff buttons,
  one spare; ten total. Patch pockets have folded tops and sewn sides/base, with
  top-corner reinforcement. Collar/stand, continuous wrist slit and cuffs are
  coherent; woven 301 assembly and 504 finishing remain separate. M/E diagram
  geometry was corrected as recorded above. No measurement values were changed.
- **Legging:** 65cm elastic cut including 1cm lap yields a 64cm M loop; 68cm
  consumption includes waste. The 100cm M extended-waist target requires 56.25%
  extension, within the specified minimum 70% functional extension. Six 86.6cm
  tape cuts total 5.196m net, below 5.45m estimated supply. Three 6mm stripes plus
  two 4mm gaps form 26mm. 514 joins, guided 406 tape application and 406 hems have
  distinct functions. Gusset corners, rise-to-X methods and inseam origins remain
  coherent. Remove the unintended closing chords from seam-following POM paths.
- **Dress:** distinct front/back neck drops and CF empire datum; gathered lower
  bust panels, supported bias skirt, partial lining and concealed CB zip are
  consistent. Adjustable 5mm straps use proposed 6mm hardware openings. Satin and
  lining references differ. Brand label remains on back lining clear of the zip;
  there is no invented neck facing. Replace the generated hardware image with a
  genuine installed-slider reference, with its limitations stated explicitly.
- **Trouser:** fly facing/shield/zip and button closure form an executable assembly.
  Slant pockets have facings/bags; fused single-welt pockets include corner
  triangles, bags and waistband anchorage. Seat seam reinforcement, separate 504
  finishes and pressing are coherent. Back-rise F follows the CB seam to crotch;
  remove closing chords without changing the method or measurement values.
- **Hoodie:** four self-fabric hood panels, independent inner/outer CB joins,
  bagged opening and hood-to-neck join agree. 514 joins precede secondary 406
  topstitching. Rib loops are quartered and stretched during joining; no arbitrary
  new rib ratio is introduced. Neck tape and short upper label tacks remain
  compatible. Hangtag stays at the inside neck label. Correct C/D diagram
  endpoints and remove the sleeve path's closing chord.

The 301, 504, 514 and 406 identifiers retain their correct stitch meanings.
They are not used as interchangeable seam classes or machine model names. No
unnecessary 401/516/602/607 code was introduced. Plausible alternate sewing choices
were retained rather than being classified as errors. Material compositions, care
copy, size systems and deliberate component grading remain unchanged. P09 notes
stay outside the complete measurement data rows.

## Genuine photograph and licensing

The installed slider comes from **SaltySemanticSchmuck**,
[Small bra strap with metal tri-glide slide](https://commons.wikimedia.org/wiki/File:Small_bra_strap_with_metal_tri-glide_slide.jpg),
under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Only a crop was applied; colour, hardware geometry and photographed strap were
retained. The source image and attribution metadata are committed. The derivative
retains CC BY-SA 4.0 and is linked from the public material-credit register. This
is a component-family photograph, not evidence of an approved 6mm, low-nickel
production set. The companion ring is not shown.

## Exact remaining blockers

| Required reference | Why current candidates were rejected | Required to finish |
| --- | --- | --- |
| 6mm nylon/elastane stretch stripe tape | Available reusable ribbon images show woven/nonstretch trim, finished garments, or unknown structures; no dependable matching loose-trim photo with commercial reuse rights was established | Owner-authorized or suitably licensed genuine narrow stretch-tape photograph, with a credible material-family identification |
| 8mm knitted waist elastic | The German packaged-elastic and museum references are braided/woven structures. Other CC images show wide waistband applications or shirring. A genuine knitted-elastic supplier photograph on Flickr is All Rights Reserved | Licensed genuine narrow knitted-elastic product photograph; do not relabel braided elastic as knit |
| 6mm clear TPU stay tape | Search results include ordinary adhesive tape, medical products, jewellery cord and copyrighted sewing/retail photographs. None establishes both the correct flat garment elastic and reuse permission | Owner-authorized or suitably licensed photograph of genuine flat clear garment elastic; ordinary sticky tape and round cord are unsuitable |

The search continued beyond the saved 199-candidate library: new Commons queries,
Flickr searches restricted to commercial-reuse CC licences, and 40 selected
CC-licensed candidate images were visually inspected. Those results must not be described as
matching products merely because a reuse licence exists. Openverse API discovery
returned HTTP 403 challenge pages; other sources remained accessible.

Examples of rejected/permission-dependent references:

- [Knitted-elastic supplier photograph](https://www.flickr.com/photos/saijiameshband/54853505581):
  page metadata says **All Rights Reserved**; no reuse licence was established.
- [Gummilitze package](https://commons.wikimedia.org/wiki/File:Gummilitze_-_Gummiband_einziehbar.jpg):
  CC BY-SA 4.0, but the visible narrow elastic structure is unsuitable as a reliable
  knitted-elastic reference.
- [6mm clear Framilon retail listing](https://haberdasheryfan.com/products/framilon-clear-flat-elastic-tape-6mm-wide-used-for-underwear-swimwear-clothing-masks-etc):
  a relevant product listing alone does not establish image reuse permission.

The three current generated component visualizations remain plainly identified
in the BOMs and credit register. No supplier was contacted, no stock licence was
purchased and no new synthetic trim was substituted. These are asset-rights/type
blockers, not a failed site build or a claimed deployment-credential failure.

## Verification and release status

The final production build passed. All five PDFs and all 50 embedded page pixels,
reading copies, material hashes and revision links passed the read-only verifier.
The final 915-check reader run passed across all six requested viewport sizes,
including all 50 pages on desktop and mobile, optional PDF downloads, fit/zoom,
pinch/pan and exact close/return behavior. The 305-check smoke suite passed during
this pass; the later changes affect only POM images and version manifests. The
document/path verifier is also added to GitHub CI so the closing-chord regression
cannot silently return. The subsequent screenshot review found Fit-page clipping
under reduced motion: the global nonzero transition duration temporarily retained
old stack widths during scroll calculations. A rule scoped to `.tp-reader-pages`
disables those size transitions. The reader regression now checks that Fit-page
keeps the selected page and places the complete figure inside the viewport, rather
than checking only its zoom factor. All 28 added fit/selection assertions pass.
Results and actual screenshots are saved beside this
report. Existing successful Portfolio behavior
remains protected; no PR54 photo/zoom/scroll controller was changed. All five
documents still have ten A4 landscape pages at 3508 × 2480 source resolution.

PR55 must remain draft and unmerged while the three required genuine photographs
are unresolved. The candidate has not been deployed; the current public site and
PDF URLs must not be described as serving this revision. Physical iOS Safari is
also not verified by Chromium mobile emulation.
