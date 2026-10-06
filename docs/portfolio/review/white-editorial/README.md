# Womenswear — white editorial exhibition

Branch: `feat/womenswear-white-editorial`.
Base: `origin/main` at `fd5d1b33933f2993388a1d8ad5d70ba5fc3638cb`.
Primary workflow: `.codex/skills/aberbach-fashion-art-direction/SKILL.md`.

The protected Portfolio opening and chapter cover remain unchanged. Entering
Womenswear changes the ground to pure white. A single editorial grammar gives
49 real archive references a hero, selected-work and supporting-work hierarchy.
Every reference remains enterable. There are no fabricated process stages.

RTW has breadth and combinations; Activewear tightens spacing; Streetwear's two
looks share one spread; Occasion increases silhouette scale and air; Swim opens
out before the Menswear handoff. Supporting sequences scroll horizontally instead
of extending into a long mobile grid. Selection uses named archive IDs, not
odd/even or array-index geometry.

The shared reader shows front/back views, supports native horizontal touch
scrolling, explicit keyboard view selection, bounded Look Closer, deep links,
Escape and return-to-place. Pointer entry/exit retain one interruptible crop
transition. Keyboard and reduced-motion actions are immediate. Old territory
scroll engines, alternate reader gestures and their unused data contract were
removed.

## Critique and refinement

1. **Fashion hierarchy:** first-pass hero figures read at substantial viewport
   height. Mobile selected RTW initially compressed three figures; changed it to
   a horizontal sequence that preserves their height.
2. **Image integration:** pure white removes the bone/white page mismatch. The
   old deck crop boundary exposed a sliver of a second model in the slip dress.
   Measured clear studio-gap centres now drive the Womenswear crop metadata.
   Four inseparable photographs stay whole. No photography was recoloured,
   masked, background-removed or rewritten.
3. **Composition:** Streetwear initially occupied two large scenes for two looks;
   condensed it to one spread, keeping both garments directly enterable.
4. **Rhythm:** removed pinned reveals, staggered collisions and diagonal runs.
   Reviewed all five categories, both ends of overflow rows and the handoff.
5. **Typography:** existing Archivo/Inter/JetBrains Mono fixtures loaded for
   review. Titles stay clear of garments; red is confined to orientation and
   active details. No additional type family was introduced.
6. **Motion/interaction:** checked reader crop-transition start, midpoint and
   payoff. Touch testing exposed a back-view active-state error: selection now
   follows the visible centre. Inspection preserves the selected view.
7. **Mobile:** reviewed large heroes, compact supporting sequences and the short
   Streetwear spread at 390 and 430 widths. Native touch swipe, reduced motion,
   keyboard controls and returning to the same vertical position were exercised.

## Remaining visual limitation

Several source images contain grey studio-floor patches with hard edges and
uneven near-white background areas. These remain visible, especially in Occasion,
the cream Streetwear look and some Swim photographs. A white page cannot erase
pixels already baked into the photography. The implementation removes the
page-ground mismatch, but **does not fully satisfy the strict seamless-image
success criterion for those source files**. Removing those patches would require
cleaner source photography or a separately authorized image treatment; neither
was fabricated or applied here. Real-device Safari was not available for testing.

## Browser review artifacts

These committed contact sheets preserve aspect ratios and include category
arrivals, selected work, supporting rows at both ends and the handoff:

- [1440 × 900](1440x900.png)
- [768 × 1024](768x1024.png)
- [390 × 844](390x844.png)
- [1024 × 768](1024x768.png)
- [430 × 932](430x932.png)

Full-resolution viewport captures, reader/front/back/inspection states, opening,
cover and Menswear captures are in the ignored local directory
`.qa-director/white-editorial/final/`. Review scripts and first-pass captures are
in `.qa-director/white-editorial/`. The final matrix recorded all 49 entries,
working return-to-place and zero browser exceptions at every size.

## Validation

- `npm run build`: passed.
- `npm run test:opening`: 100 passed, 0 failed; only the new exhibition selectors
  replaced the removed overture selectors. Opening assertions were retained.
- `npm run test:smoke`: 352 passed, 0 failed. Functional assertions retained; obsolete requirements for
  five unrelated mechanisms and bone-backed photographs were replaced with
  access, content-integrity and white-ground checks. Mobile view-state and
  inspection regression checks added.
- Task-scoped Playwright review: all five specified viewport sizes, each category
  reader, deep links, Look Closer, keyboard, touch swipe, reduced motion,
  return-to-place, Menswear handoff and browser-error checks.
- `git diff --check`: passed.

No PR, merge or deployment. The rescue branch was not checked out or modified.
