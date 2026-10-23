# Proposed taxonomy and safe migration

Status: **PENDING OWNER CONFIRMATION. No website navigation or category source code changed.**

| Existing technical ID | Proposed public label | New original IDs | Allocation |
|---|---|---|---:|
| m-streetwear | Casualwear | mw-r2-casualwear-01…10 | 10 |
| m-activewear | Activewear | mw-r2-activewear-01…10 | 10 |
| m-rtw | Outerwear | mw-r2-outerwear-01…10 | 10 |
| m-tailoring | Tailoring | mw-r2-tailoring-01…10 | 10 |

Retail evidence in [RESEARCH.md](RESEARCH.md) supports distinct outerwear and tailoring families and activity-specific sportswear. Casualwear is an intentionally broad everyday showroom umbrella. Categories overlap in retail; this is a curated exhibition, not an assertion of a universal taxonomy.

## Verified current implementation

`src/data/menswear-collection.ts` defines four ten-position featured edits and preserves 50 historical routable Menswear subjects. Their `m-…-pexels-…` source IDs and credits identify historical photographs. The current code assigns some photography by slot; that must not cause a new concept to inherit a Pexels identity.

`menswear-direction.ts` has numeric photo-based cast/motion keys. `MenswearAct.astro` binds cast entries by `-pexels-${photo}` suffix and applies old crop/seam rules. `menswear-film.ts` positions numeric actor keys. The viewer preserves occurrence world, browser history and return location. These are dependencies to adapt carefully after approval.

## Implementation after approval

1. Keep all four technical world IDs and existing route grammar. Change display labels only after taxonomy confirmation; preserve any old label text needed as an alias in search/accessibility context.
2. Preserve every historical subject, source identity, attribution and historical deep link. Add each approved original AI look as a new subject with its own `mw-r2-…` identity and explicit AI concept provenance. Keep the historical pool and its original photo associations intact; never repoint a Pexels subject to a new AI garment.
3. Add a separate approved forty-position featured edit. Explicitly bind presentation actors/motion keys to the new subjects through a small adapter; numeric motion keys remain presentation keys, not evidence that a new garment has a historical source identity. Resolve the actor subject directly rather than suffix-matching a new identity to an old photo ID.
4. Preserve GSAP choreography and cinematic sequence. New full-length photos need new framing metadata; historical portrait crop windows and two-panel seam handling must not be applied to them. Keep original framing metadata on legacy subjects. No new presentation engine is proposed.
5. Feed genuine Front, Back and Editorial into the existing viewer. Front is the cinema primary; three separate view assets remain selectable. Keep concept, material and construction text honest about proposed AI design and absence of physical development evidence. Do not manufacture detail views from crops as independent evidence.
6. Retain `returnWorld`, occurrence context, URL ownership and browser-history behavior. Cross-category historical references continue opening their historical subject and return to the actual source occurrence. Do not redirect a historical garment to a superficially similar new one.
7. Gate activation on explicit owner approval and full selected-set QC. Public photography remains unchanged during this reset review. No Womenswear or unrelated Portfolio edits.

## Required migration verification

Programmatic cases: exactly four groups and ten unique featured concept IDs each; new and legacy subject resolution; unchanged 50 legacy IDs/credits/source URLs; correct view mapping; no new concept masquerading as a manufactured client project; no dangling local assets.

Browser cases: direct links to a legacy item and each new category; Front/Back/Editorial switching; next/previous garment; close/Escape; Back/Forward; occurrence and scroll restoration; Presentation Mode; keyboard focus; reduced motion; resizing and mobile touch at the repository's six review sizes. Recheck other sections, including Womenswear, after shared routing changes.

These migration tests are future integration work. They are not claimed as exercised now because the app remains unchanged.
