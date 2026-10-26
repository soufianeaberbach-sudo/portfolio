# Browser and document visual review — 26 October 2026

Reviewed actual rendered pages with the project's real test font fixtures, at
1440 × 900, 1280 × 800, 1024 × 768, 768 × 1024, 390 × 844 and 375 × 812.
Evidence is under [evidence/](evidence/). Screenshots are captures of the built
candidate, not design mockups. Mobile gestures are Chromium touch emulation.

## Findings and refinement

1. **Fashion hierarchy:** Womenswear and Menswear exhibitions retain garment-first
   photographs and the existing chapter identities. Curated garment copy belongs
   in inspection, not over the exhibition photographs. The first actual shirt and
   denim-trouser views remain the same garment in exhibition and paired inspection.
2. **Image integration:** original photographic grounds and silhouettes are
   preserved. No photography was regenerated or cropped to enlarge the garments.
   Neutral image areas remain integrated with the established white exhibition.
3. **Composition:** desktop inspection presents balanced Front and Back columns;
   full silhouettes fit each viewport. At portrait widths, the individual views
   follow vertically; Back remains in the reading flow rather than a hidden menu.
   No redundant enlarged-image box or original-composite button was introduced.
4. **Rhythm:** existing native exhibitions, collection handoffs and chapter
   transitions are unchanged. The document reader uses a continuous page stack
   with stable gaps and page captions. Fit-width can intentionally make a landscape
   page taller than the desktop viewport; Fit-page displays the complete page.
5. **Typography:** concise garment descriptions sit below the title with readable
   line lengths. Provenance remains a closed disclosure rather than a primary
   badge. Document artwork keeps its original technical type, tables and hierarchy.
6. **Interaction:** document controls stay above the scrolling stack. All ten pages
   are present and individually reachable; the active page indicator follows the
   viewport. Keyboard, independent garment zoom, document pinch/pan, native fitted
   scrolling and close/return behavior have functional-test evidence.
7. **Mobile:** the first 375px reader capture showed Fit-page alone on a wrapped
   toolbar line. Reducing only the page-input width and toolbar gap keeps all
   controls together while retaining 44px targets. The final 375px screenshot and
   887-check reader rerun verify the correction. No garment layout was changed.

Reviewed the final six listing and six reader captures, plus 24 Womenswear/
Menswear exhibition/inspection captures. The screenshots show intact headings,
controls and aspect ratios without horizontal layout overflow. A clipped fragment
of the preceding/next exhibition photograph can appear at a scroll boundary;
the full photograph remains available through native scrolling and inspection.

## Technical pages

Reviewed the five final ten-page contact sheets against the approved baseline,
plus focused BOM, construction, labels, measurements and POM captures. The page
system remains white with repeated black header/footer bars, consistent technical
rows and sharp ruled tables. The garment identities, colourways and silhouettes
are preserved. Construction tables use actual operation counts without unused
numbered rows; the four-row legging Back remains deliberately full-height in the
same table system.

Focused review covered the shirt's neckline inset, the legging's elastic and tape
calculations/internal gusset datum, dress neckline versus empire datum, trouser
curved back-rise path and hood-lifted neckline/label inset. The final specifications
and operation audit record the engineering decisions; an opening PDF alone is not
treated as technical review evidence.

Material and trim imagery stays inside the BOM cells; labels keep physical
dimension/placement text. At full-page thumbnail scale, small technical text needs
zoom, as expected for an A4 landscape page on a phone. Source PNGs remain 3508px
wide, and reader zoom selects them rather than enlarging only the reading copy.

## Limits

Four trim references remain disclosed visualizations rather than genuine product
photographs; see the main report. No physical iOS/Safari or actual sewing/sample
trial was performed. This is local candidate verification, not live-site proof.
