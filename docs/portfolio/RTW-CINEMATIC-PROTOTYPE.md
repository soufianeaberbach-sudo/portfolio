# Ready-to-Wear cinematic prototype

Prototype awaiting visual approval. Branch starts at
`fd5d1b33933f2993388a1d8ad5d70ba5fc3638cb`.

The camera establishes one garment, approaches it, discovers its back, admits a
cast, traverses that cast, pauses on one silhouette, and reunites the range.
The white floor starts inside RTW. The Portfolio opening, Womenswear cover and
other territories retain their baseline design.

## Actual cast

All sources are existing reference photographs; this study claims no authorship
or development history. The semantic selection is in `src/data/rtw-direction.ts`.

| Reference | Camera role | Visible reason |
| --- | --- | --- |
| rtw-ref-01 · woven/1 | Anchor | Long champagne satin silhouette; low back rewards the first turn. |
| rtw-ref-06 · woven/6 | Arrival | Rust halter mini brings colour and a shorter silhouette. |
| rtw-ref-02 · woven/2 | Distance | Pink shirting remains recognisable at a farther viewpoint. |
| rtw-ref-12 · jersey/3 | Near pass | Fluid tie-front blouse and chocolate trousers carry the closer view. |
| rtw-ref-03 · woven/3 | Interruption | Stone jumpsuit quiets the palette into one continuous line. |
| rtw-ref-05 · woven/5 | Resolution | Floral layering and rust trousers recall the arrival while broadening the range. |

All 17 RTW references also remain available in the archive. Touching pairs stay
whole in the reader. No sketch, pattern, CLO or fitting evidence is invented.

## Techniques

One CSS sticky stage and a GSAP/ScrollTrigger timeline inside the existing chapter
scroller. The wide DOM tableau moves through a common camera displacement.
Upright screens use sequential focused arrivals and two casts of three. Supporting
work uses native horizontal overflow. The main phone sequence is 5.4 viewport
heights, followed by the archive and a one-viewport ending.

Front/back travel moves the original image through an aperture bounded by empty
studio gaps. There is no screenshot crossfade, shader, recolouring or background
removal. WAAPI measures source/reader rectangles for a 560ms garment match cut;
the chosen reader view returns intact to its source. Existing hash navigation owns
addresses, focus and return position. The reader uses Front, Back and Look Closer.

## Browser critique and corrections

- **Hierarchy:** the anchor inherited a CSS translation, displacing it on phone
  and cropping it at reunion. Reset its transform coordinates explicitly.
- **Integration:** striped and cream/olive sources had conspicuous native floor
  patches at large scale. Recurated the main cast, narrowed only empty studio
  gaps, and kept both stage and reader pure white. Original photo pixels remain
  untouched; source floor shadows and retouch marks remain in some references.
- **Composition:** six figures overlapped on upright tablet. Replaced that view
  with two casts of three and preserved complete silhouettes.
- **Rhythm:** lifted the phone reunion to remove unused upper space; shortened
  the ending to one viewport so the departing garment keeps its head.
- **Typography:** separated phone title and model; made the running head persist
  through the archive and change to Activewear at the ending.
- **Interaction/motion:** repaired import scope, clone stacking and a callback
  argument error. Removed the split-body return when reader view changed. Hidden
  actors leave the tab order; background exhibition content becomes inert while
  the reader owns focus. Touch controls have a 44px minimum target.
- **Mobile:** focused passes replace the wide tableau. The archive swipes
  naturally; reader inspection supports bounded touch panning and keyboard arrows.

## Review evidence

Committed representative images: `docs/portfolio/review/rtw-cinematic-prototype/`.

Final local captures: `.qa-director/rtw-cinematic/final/`.
Primary: 1440×900, 768×1024, 390×844. Sanity: 1024×768, 430×932.
Each covers threshold, approach, crossover/back, cast, traverse, silence, reunion,
archive, reader entry/front/back/inspection, return and ending. Camera and match-cut
screenshot sequences and a local Playwright WebM accompany the captures.

Validation: build; smoke regression; protected opening regression; RTW continuity
checks including every deep link, exact scroll/focus return, keyboard, touch and
reduced motion. Chromium emulation does not verify physical-device Safari.

Local recorded traverse: 112 animation frames, 16.7ms median / 16.8ms p95,
with no observed long tasks during the measured movement. This is a headless
Chromium check, not a claim about every device. Rapid match-cut reversal was
reviewed at all five sizes; obsolete exit completion cannot hide a reopened reader.

Final validation: Astro build completed (11 routes); smoke 366/366; opening
100/100; RTW continuity 136/136. Final five-size captures report zero runtime
errors, zero horizontal world overflow and zero scroll-position difference on
return. Compact motion recording:
`.qa-director/rtw-cinematic/final/motion/1440-traverse-match-cut-compact.webm`.
