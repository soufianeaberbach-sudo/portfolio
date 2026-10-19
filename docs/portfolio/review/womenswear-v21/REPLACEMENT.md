# Replacing a look without redesigning the exhibition

`src/data/portfolio.ts` remains the historical pool. Do not reorder its arrays,
delete its images, recycle an excluded ID or count a back view as another look.
`src/data/womenswear-collection.ts` defines ten visible slots per category.
`SLOTS.tsv` is the compact fifty-slot handoff; `SLOTS.json` includes all available
views, qualified windows and excluded-but-routable historical references.

For a photographic replacement, retain the slot ID. Add its `photography`
property using the existing `FinalViews` schema:

```ts
{
 id:'streetwear-ref-03',
 photography:{
  front:{src:'/your/front.webp',srcset:'...',width:1200,height:1800,
         alt:'An accurate description of this supplied photograph.',front:1,views:1},
  back:/* the genuine back ImageAsset, if supplied */,
  // side, editorial and details:[{image: ImageAsset}] are independently optional.
 },
 credit:{source:'Owner-supplied photography',photographer:'Actual credited creator'}
}
```

Alternatively supply `composite: ImageAsset` with `views:2`, a measured `front`
split and `separable:true`. Where figures touch, use `separable:false`: the entire
original remains available and no false front/back controls appear. Unknown or
invalid splits fall back to the original. Never guess dimensions or a split.

The camera always uses the first available final photograph. Separate originals
retain their own aspect ratios. The reader uses only supplied views and adds
Complete Original for separable two-up files. No technical stages are introduced.
The existing `Project.final` schema is also supported for genuinely verified
projects; these temporary references do not become verified projects merely by
changing a photograph. Ownership/status must be supplied honestly through the
existing Project data model, never inferred from an image.

`photoFrames` in `womenswear-direction.ts` contains measured empty-margin windows,
qualified by exact source URL. A replacement file automatically loses the former
photograph's window. It falls back to the complete source, not an obsolete crop.
If desired, add a new measured window as content metadata after checking every
head, hand, hem and shoe. Whole-source access remains in Look Closer. Do not
retouch photographic backgrounds, stretch figures or fabricate additional views.

Cinematic roles resolve stable IDs from the visible edit. Replacing their photos
requires no new timeline or page code. Different source proportions fit within
the stage; wide originals are balanced vertically on compact screens. Review
new photographs on phone and desktop before publication. A timeline cannot
compensate for inadequate source framing or create missing pixels.

A replaced slot uses its new caption and credit; the old Pexels creator is never
silently attached to replacement photography. Update the manifest and source
permissions whenever content changes. Historical URLs continue resolving to
preserved readers even when excluded from the visible ten-look edit.
