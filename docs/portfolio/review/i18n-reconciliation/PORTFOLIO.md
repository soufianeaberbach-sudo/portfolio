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

## Final targeted browser evidence

All 18 language/viewport combinations passed: EN, FR, ES at 390×844, 430×932,
768×1024, 1024×768, 1440×900 and 1920×1080. This produced 72 actual captures and
126 recorded functional check groups, with zero browser runtime errors. Each
combination exercised real loaded Front/Back photographs, independent Front and
Back zoom, Fit, Escape return, five available Tech Packs, the mounted ten-page
image reader, close behavior and document-width safety.

The final candidate at preview port 4460 additionally passed eight explicit
checks across FR and ES: current source provenance labels, current shot labels,
document controls and intentionally failed image requests producing localized
error/retry controls. Those checks used the final compiled candidate after the
reader dictionary alias correction and short-label reconciliation.

Actual render critique:

- **Fashion hierarchy / image integration:** FR1440 Menswear keeps full Front
  and Back silhouettes on white grounds. The type remains subordinate and no
  crop, background, ordering or photograph was altered.
- **Composition / typography:** the FR390 garment heading and description fit
  the existing measure; help text wraps to two readable lines. The ES430 title,
  description and Delantero/Ajustar controls fit without clipping.
- **Rhythm:** chapter and garment return affordances remain in their established
  positions. The translated Tech Packs chapter retains its document-first
  column and spacing.
- **Interaction / mobile:** independent zoom and Fit preserve the other photo's
  state. Desktop presents both complete frames; mobile keeps the established
  stacked inspection order. The longer FR document Fit controls wrap into a
  second toolbar row without overlap at phone width.
- **Technical documents:** the final FR1440 reader shows the complete first
  technical page at Fit page, with translated surrounding controls. Source
  engineering documents retain their original English artwork and exact files.

Selected screenshots are retained in
`../i18n-cv/screenshots/portfolio/`; full temporary captures remain under
`.qa-director/i18n-portfolio/`. The machine record is
[portfolio-browser-results.json](portfolio-browser-results.json), with final
short-label/failure-state checks in
[portfolio-final-label-results.json](portfolio-final-label-results.json).

This is browser emulation. It does not establish physical iPhone Safari or
Android device testing, production deployment, or owner artistic approval.
