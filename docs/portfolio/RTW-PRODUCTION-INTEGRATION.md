# RTW — controlled photographic integration

Branch: `feat/rtw-cinematic-production-integration`.
Base: `e9793113d29767fdf0a4be1bcb4d1d7918e94d82` (verified main).
Capability A only. **Art direction approved in principle; final hardening verified
for a Draft PR. Merge and deployment require separate approval.**

## The integrated experience

One white exhibition floor carries a progression of complete looks. The camera
approaches the champagne slip, travels across its genuine source to the back,
introduces the rust halter, shifts toward pink shirting and stone trousers,
pauses on a complete jumpsuit, and resolves the warm colour passage with printed
shirting and rust trousers. Desktop shots relate at most two complete looks;
phones and portrait tablets concentrate on one primary silhouette at a time.

The five cast roles resolve explicit reference IDs and document their visual
reasons in `src/data/rtw-direction.ts`. No role or category is assigned by an
array index. The archive contains every one of the 17 production references,
including the selected looks. The existing five-category control stays visible.
The ending is a short, real link into the unchanged Activewear arrival.

The sequence uses CSS sticky positioning and a scoped GSAP ScrollTrigger in the
existing Womenswear scroll container. There are no oversized decorative body
planes, new libraries, canvases or unrelated animation engines. Primary resting
shots preserve full heads, hands, hems and shoes to the extent present in the
actual source photograph. Transitional entrances/exits deliberately pass through
the edge of the stage; they are not primary garment presentations.

Reduced motion and unavailable enhancement use a complete resting anchor and the
full archive, without a long pinned journey. Native garment fragment targets also
remain usable without JavaScript; the fallback shows the original whole source.

## Reader and continuity

The photographic reader follows V's white floor, large complete look, quiet type
and Front / Back / Look Closer language. It is not the V lab. The original source
can be opened directly from inspection. Look Closer supports bounded drag, pinch,
keyboard pan/zoom and Fit. Only inspection requests the existing 1400px rendition;
hidden readers are not all eagerly decoded. The original source, responsive
renditions, alt text and shared metadata remain unchanged.

`rtw-ref-08` and `rtw-ref-16` remain complete inseparable pairs. Their reader does
not invent separate Front/Back buttons. Other views use production metadata.
Five optional resting apertures trim empty studio margins inside those production
partitions, bound to both ID and exact source path. Unknown/invalid split metadata
falls back to the whole photograph. No pixels, garment edges or white fabric are
masked, recolored, removed or regenerated.

Entry/return moves a measured image clone for 560ms on an opaque white floor.
Source and destination images decode before originals are hidden. The clone uses
the actual loaded rendition. Reader copy stays clear while the garment crosses
its field; Return remains available, and focusing a control settles the entry.
Keyboard actions and reduced motion settle immediately. Early interruption can
settle directly instead of finishing an obsolete cinematic move. No perpetual
animation or navigation delay is required.

The actual clicked occurrence is retained: a camera subject and an archive link
with the same reference ID do not share a return target. The router keeps scroll,
focus, hash/history and chapter ownership. Resizing while reading rebuilds camera
geometry on release and preserves the shot's normalized position where applicable,
instead of reusing old screen coordinates. Source view and archive access survive.

## Selective production adaptation

Only two shared production source files change:

- `WomenswearAct.astro`: an RTW/reference-preview exhibition branch and an
  RTW/reference-only reader branch. Other territory composition and reader markup
  is retained; development fixtures and future verified subjects retain the
  existing generic implementation.
- `portfolio.astro`: one scoped controller initializer, guarded image continuity
  hooks, RTW source selection and keyboard modality, and exclusion of RTW readers
  from generic inspection bindings. Existing route parsing, pushState, popstate,
  hashchange, chapter control, Escape hierarchy and focus ownership remain here.

The public URL contract remains `#womenswear/rtw/<reference-id>`. No `#A`–`#E`
router or competing history controller is introduced. Existing generic navigation
and the other four Womenswear readers remain intact.

`src/data/portfolio.ts`, `src/data/womenswear-exhibition.ts`, shared Womenswear CSS,
cover/opening CSS, ActFigure, StoryPlate, all production photography, other pages,
backend and Cloudflare configuration are unchanged. No experimental branch was
merged or wholesale file replacement performed. Historical branches are retained.

## Browser critique and corrections

1. **Fashion hierarchy:** full silhouettes replace the experimental repeated
   close-body planes. The neutral jumpsuit provides a genuine pause; the final
   rust/print pair has a visible colour relationship rather than a model lineup.
2. **Image integration:** the floor stays pure white. Early windows admitted small
   neighbouring floor-shadow spills; measured empty-gap apertures were tightened.
   Original studio shadows and source limitations are retained honestly.
3. **Composition:** phone and portrait-tablet readers now fit width as well as
   height, including complete two-figure sources. A source-by-source front/back
   browser audit checked all 17 originals, beyond DOM measurements.
4. **Rhythm:** the approach, source turn, arrivals, pause and payoff share one
   stage. The archive provides utility after that passage; Activewear is not
   replaced with another splash screen.
5. **Typography:** existing Aberbach faces/tokens remain. The category control is
   not hidden. Reader description and reference status stay readable on phones.
6. **Interaction:** recording review exposed translucent figures through the old
   whole-reader fade. Only the garment now moves over an opaque floor. Copy that
   crossed the moving garment was deferred until landing. Keyboard Escape was
   corrected locally to settle immediately despite the router's capture handler.
7. **Mobile:** one full look leads; portrait tablet has its own narrow composition.
   Pinch testing exposed density-adjusted `naturalHeight` under `srcset`; inspection
   now uses declared source dimensions and requests high resolution on demand.

## Test adaptations

`tests/smoke.mjs` still checks all 49 Womenswear identities. It counts unique entry
IDs because the camera and archive legitimately repeat selected references. RTW
archive/reader selectors replace obsolete hero/support markup. Genuine view access,
inspection magnification, touch, history, focus and truthfulness checks remain.

`tests/portfolio-opening.mjs` changes only the RTW selectors in its concluding
reduced-motion chapter-entry checks. The garment-height and type-clearance
assertions are retained; protected opening assertions are not weakened.

Focused tests additionally cover all six exact viewport sizes, all 17 mappings,
cold deep links and actual image decoding, genuine back/front travel, whole-pair
exceptions, both source occurrences, touch swipe/pinch, interrupted navigation,
resize, missing images, reference-only content and native no-JavaScript access.

## Evidence and remaining limits

[Review index](review/rtw-production-integration/README.md) ·
[Executed QA](review/rtw-production-integration/QA.md) ·
[Exact changed files](review/rtw-production-integration/FILES.txt).

The screenshots and MP4s are actual browser output with the committed font fixture.
Comparisons include the original production baseline; raw capture collections,
unselected takes and intermediate media stay ignored. Screenshot audit sheets
are review tools, not public gallery layouts.

The original `jersey/10` photograph (`rtw-ref-17`) already cuts the frontal elbow
at its own source-panel seam. The reader preserves the available pixels and makes
the original source accessible; it does not invent missing anatomy. Fine source
shadows and seams cannot be repaired without changing protected photography.

Chromium phone emulation is not physical-device Safari or a measured 60fps
certification. Final approval must inspect the supplied browser evidence. The
conditional verified development-story capability remains a separate future task:
no owner evidence is supplied, no Subject migration is made, and no Connolly,
MoMu, CGElves, placeholder technical stages or lab media enter this implementation.

Final pre-PR hardening adds only a restrained compact archive discovery cue and
focused input tests. The disclosed parallel focus failure was reproduced and
isolated to animated smoke-fixture positioning; synchronous test positioning
preserves the original focus assertions. Production focus/router behavior was
not changed. See the [focus investigation](review/rtw-production-integration/FOCUS.md).

A Draft PR is now authorized after successful verification. No merge or deployment
is performed. Rollback: close the unmerged PR; if a future merge is authorized,
revert that integration merge/commit as one unit to restore the production RTW
markup and generic reader. No data migration or asset rollback is required.
