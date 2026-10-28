# Current Portfolio localization reconciliation

Baseline: current `main` `6a487817cd4a585c5140547aa9b74e2b8c6dac35`.
Translation source: unmerged PR #46, `ccccb7f13e777ebd50eb000d40bbda64f437ee27`.
The old branch was used for copy and scoped per-file three-way comparison. No
old page, data registry or reader implementation replaced current main.

| Current English source | Existing FR / ES in PR46 | Change since PR46 | Required reconciliation |
| --- | --- | --- | --- |
| Opening, four chapter covers, shared history and immutable fragments | Professional FR/ES chapter copy available | Latest outer flow and Tech Pack reader imports | Port copy into current file, preserve all geometry and history logic; preserve English brand masthead |
| Fashion-first Womenswear selection | Old front-priority exhibition labels | Current commercial leads, Fashion/Front fallback, compact ten-look rail | Keep current selection, image references, attributes, ordering, sizes and `EditRailControls`; translate controls only |
| Womenswear current reviewed titles and descriptions | Old captions mostly described photographic staging | `garment-copy.json`: current visible garment language | New source-checked title/description overlay; no old caption substituted for current garment copy |
| Menswear current reviewed titles and descriptions | Reference-photo descriptions | Forty new AI concept looks and forty complete sets | Translate current source, retain AI concept names and disclosures; preserve independent historical identities |
| 188 reviewed garment IDs, 147 distinct title/description pairs | Not present as current editorial data | Aliased new and historical looks share corrected copy | One FR/ES record per unique English source; source SHA-256 invalidates stale translations; all IDs verified |
| Casualwear / Activewear / Outerwear / Tailoring | Streetwear / Activewear / Casualwear / Tailoring & Outerwear | Public category names changed while IDs remained | Update display category map by immutable IDs; leave `m-streetwear`, `m-rtw`, `m-tailoring` unchanged |
| Twenty current Menswear scene captions | Old composition captions translated | Current commercial scene labels | Add all current labels to typed runtime map; translate live region and scene-button accessible names |
| Paired Front/Back garment inspection | Old single-view controls | Current `GarmentInspection`, independent zoom/pan, image status | Preserve full component and `photo-inspection.ts`; localize labels, help, loading and failure text |
| Fashion / Source photograph / Available photograph | Old view labels only | Current `finalPhotographs` adapter supplies new labels | Add render-time labels; keep source labels during curation because `Third view` is a functional sentinel |
| Source and provenance panel | Old photograph credit display | AI retouch/generated claims, interpreted back notices | Translate every current disclaimer without weakening uncertainty or inventing authorship |
| Five ten-page Development Samples | Blank/demo pack labels and six-page assumptions | Five corrected garments, mixed Womenswear/Menswear, current descriptions/revisions | Overlay current titles, garment types, gender/category, descriptions and cover alt text; retain files, page images, revision strings, IDs |
| Image-backed document reader | Old browser PDF/iframe reader text | Current lazy page images, fit width/page, retry, keyboard/touch | Keep current reader engine; translate current toolbar, page descriptions, loading error and retry; no PDF renderer restoration |
| 281 distinct nonempty image alt descriptions in rendered EN Portfolio | Legacy studio and reference alt map | New Womenswear recovery and Menswear concept descriptions | Reuse accurate legacy translations; add exact source-text map for 30 new long Womenswear descriptions plus view/provisional wrappers and all 120 Menswear generated-view descriptions |
| Material image credits link | Absent | New current informational page | Translate link and use locale-aware URL |
| Full reference collection access | Old list labels | Current reviewed garment titles and preserved generated/historical separation | Translate heading, note, titles; preserve original hashes and counts |

The English data modules, asset files, original dimensions/crops, chronology of
looks, source credits and technical document content are untouched. All retained
locales are LTR. Arabic maps, RTL arrows and Arabic-specific code are excluded.

## Validation record

- First complete localized build: 36 pages, successful.
- Rendered text audit of `/fr/portfolio/` and `/es/portfolio/`: zero English
  sentences in public text and accessible labels.
- Rendered image audit: all 281 distinct nonempty English image descriptions
  differ in both translated Portfolio pages; no English alt silently reused.
- The first browser check passed 390px paired Womenswear/Menswear loading and
  independent zoom. It found a real document-reader runtime issue: a local
  `current` page index shadowed the newly imported dictionary. The dictionary
  import was renamed `readerCopy`; final QA must use the rebuilt bundle.
- Final browser results and actual screenshots are recorded by the release
  report, separately from these implementation observations.
