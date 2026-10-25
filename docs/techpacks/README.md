# ABERBACH technical development collection

Five fixed Portfolio slots, documented from existing portfolio references. These are substantial **proposed development specifications**, not approved bulk-production packs or evidence of physical manufacture. Original garment authorship remains unverified. The document author is ABERBACH; third-party logos are excluded from production artwork.

| Slot | Garment / source | PDF pages | Editable source |
| --- | --- | --- | --- |
| 01 Jersey Top | Olive off-shoulder knit top; `assets/source/JERSEY & KNITS/8.png` / `rtw-ref-15` | 12 | [style](01-jersey-top/style.json), [drawings](01-jersey-top/drawings), [manifest](01-jersey-top/sources.json) |
| 02 Tailored Trouser | Oatmeal pleated wide leg; `assets/source/WOMENSWEAR - WOVEN/2.png` / `rtw-ref-02` | 13 | [style](02-tailored-trouser/style.json), [drawings](02-tailored-trouser/drawings), [manifest](02-tailored-trouser/sources.json) |
| 03 Performance Legging | Red / white panel legging; `assets/source/SPORTSWEAR & ACTIVEWEAR/8.png` / `activewear-ref-08` | 12 | [style](03-performance-legging/style.json), [drawings](03-performance-legging/drawings), [manifest](03-performance-legging/sources.json) |
| 04 Woven Dress | Blue / ivory diagonal-stripe open-back dress; `assets/source/WOMENSWEAR - WOVEN/4.png` / `rtw-ref-04` | 12 | [style](04-woven-dress/style.json), [drawings](04-woven-dress/drawings), [manifest](04-woven-dress/sources.json) |
| 05 Hooded Sweatshirt | Burgundy cropped raglan hoodie; `assets/source/JERSEY & KNITS/6.png` / `streetwear-ref-02` | 12 | [style](05-hooded-sweatshirt/style.json), [drawings](05-hooded-sweatshirt/drawings), [manifest](05-hooded-sweatshirt/sources.json) |

## Reproduce

Use Node dependencies from `npm ci`; Python dependencies are in `scripts/techpacks/requirements.txt`.

```sh
python3 -m pip install -r scripts/techpacks/requirements.txt
npx playwright install chromium
npm run techpacks:build
npm run test:techpacks
npm run build
npm run preview -- --host 127.0.0.1 --port 4339
# In another terminal:
PORTFOLIO_QA_URL=http://127.0.0.1:4339 npm run test:techpacks:browser
```

`PLAYWRIGHT_BROWSERS_PATH` may select the installed pinned browser. `TECHPACK_CHROMIUM` is an explicit optional fallback executable for PDF rendering only; browser regression uses the pinned Playwright build. No production deployment is part of this workflow.

Edit the garment-specific `style.json` and SVGs, then rebuild. JSON is the canonical technical data; SVGs are the canonical editable drawing geometry. The renderer never reconstructs drawings from photos. Generated HTML stays in ignored `.work/techpacks`. PDFs, cover WebPs and every rendered page are under `public/techpacks/<slug>/`. Website records in `src/data/techpacks.json` are generated from these same datasets; page counts and URLs stay synchronized.

## Engineering rules

- CONFIRMED applies to cited source-visible facts. It does not mean sample-verified manufacture.
- Materials, component dimensions, seam sections, tolerances, size values and grade rules are PROPOSED for first sampling.
- Supplier IDs, fibre identity, physical colour matching, care/origin, tested shrinkage, marker yields and production approval remain TBD.
- Base size EU 38 and EU 34–42 range use a declared internal body basis. No automatic UK mapping is made.
- Each POM has one named diagram reference and a defined method; widths are half-flat, other measurements explicitly identify vertical, component or contour methods.
- Each operation names its BOM dependencies. Hidden gusset, fly, lining, neck stabilization and hood construction remain explicitly proposed.
- SVG strokes distinguish exterior edges, seams, folds, actual stitch rows and labelled hidden components. Printed stripe is surface artwork, not a panel seam. Detail drawings are schematics, not cutting patterns.

## Validation boundaries

Automated checks cover data completeness, trim references, unique IDs, diagram coverage, per-size arithmetic, product-level ease/passage relationships, SVG XML, PDF integrity, text bounds, page counts, preview creation and browser links/downloads/reader states. Mutation tests demonstrate detection of missing elastic, bad grades, missing POM references and an impossible waistband passage target.

Rendered-page and browser evidence is in [review](review). Automated success does not establish physical fit, material performance, approved grading, garment ownership or sample-room acceptance. See each style's `assumptions.md` and final QC/revision page for its release holds.
