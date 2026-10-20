# Menswear photography handoff

The maintained contract is forty displayed looks: ten each in `m-streetwear`, `m-activewear`, `m-rtw`, `m-tailoring`. [SLOTS.tsv](SLOTS.tsv) maps every current slot, stable route, source, credit and available view.

`src/data/portfolio.ts` retains its sixteen historical entries unchanged. `src/data/menswear-collection.ts` provides the explicit ten-slot edit; it does not delete or reorder the historical arrays. Current additions and source metadata live in `src/data/menswear-references.json`. The film’s semantic photographic roles are in `src/data/menswear-direction.ts`.

## Replace a slot without breaking its address

Retain the slot `id`. Add new source paths; never overwrite the preserved original reference files. Supply its `photography` using the existing `FinalViews` model, together with its own `credit`:

- `composite`: one genuine Front/Back source, measured `front` split and `views: 2`; set `separable: false` when bodies cannot safely be divided.
- `front` and `back`: separate original photographs.
- Optional `side`, `editorial`, and `details: [{image, note?}]` only when actually supplied.
- Unknown or unsafe split geometry falls back to the whole original. Never infer an angle or split through anatomy.

Each image needs a truthful `src`, actual `width`/`height`, accurate alt text and suitable responsive `srcset`. Preserve natural proportions, original files and appropriate image quality. A two-up is one look, not two references. Do not reuse the old photographer’s credit or old garment description after replacing a photograph.

The adapter reuses `projectSubject`/`FinalViews` parsing but retains **reference** status. Uploading a photograph does not verify authorship. Only after owner provenance and publication approval, an existing genuine project in the category’s `projects` may be connected by the slot’s `projectId`. No new development-story interface is involved: the reader renders final photography only.

The camera takes the supplied primary/front view. Additional angles stay inside the reader. Verified old blank-margin windows are applied only to their exact original files; new files fall back to complete primary geometry. The entire Streetwear architectural mechanism is source-specific: an unrelated replacement uses complete primary shots instead of the old wall crop or seam. Unknown replacement images also default to a white surrounding stage, rather than inheriting a former photograph’s dark ground. A future art-directed replacement may warrant deliberate photographic recuration; it never inherits an arbitrary crop from a former model.

## Inspection and source return

Only available views receive controls. The reader requests its selected full source rendition before inspection; the archive uses small responsive sources. Look Closer supports zoom, pan, pinch, Fit/reset, keyboard and original-source access. Current local new renditions are 1800/2000px high; inspection cannot invent the detail of a larger camera original. External source pages are credited separately.

The measured match cut uses the same source image and its real crop window. Different genuine photographs are never morphed together on return. The router restores the actual stage or archive occurrence, not the first matching reference. Native fragment targets remain available without JavaScript; enhanced category navigation removes those targets to prevent browser history from stealing focus.

## Replacement acceptance

Verify all ten unique identities per world, all historical URLs, available view labels, safe composite windows, complete silhouettes, credits, original-source inspection and failed-image fallback. Review all six responsive sizes, actual scroll/Presentation Mode motion, direct world jumps, keyboard/touch, browser Back/Forward, reduced motion and exact source return. Run the relevant Menswear and protected Womenswear regressions plus the production build. Media replacement alone never authorizes claims of original ABERBACH work or production deployment.
