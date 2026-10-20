# Menswear — production review

20 October 2026 · `feat/menswear-cinematic-production` · based on main `65ab3a07c2729b42cd72e50b11ff7f63767c614b`.

This is the actual `/portfolio/` Menswear chapter, replacing its four-item decks. It is a feature candidate for independent artistic and integration review, not a deployment or a claim of final creative approval. Womenswear, the master opening, chapter-cover artwork, Development, Tech Packs, Home and Contact source content remain protected.

## Review the experience

- [Desktop compositions](desktop.jpg) · [Mobile compositions](mobile.jpg)
- [Individual native screenshots](screens) · [1920 × 1080 presentation stills](presentation)
- [Desktop presenter recording](motion/desktop.mp4) · [Mobile presenter recording](motion/mobile.mp4)
- [Desktop natural-scroll recording](motion/explore-desktop.mp4) · [Mobile touch-scroll recording](motion/explore-mobile.mp4)
- [Reduced-motion interaction](motion/reduced-motion.mp4) · [Zoomed source → exact return](motion/inspection-return.mp4)
- [Before/after](before-after.jpg) · [Protected Womenswear comparison](protected-womenswear.jpg)
- [Four director’s storyboards](STORYBOARDS.md) · [QA and limitations](QA.md)
- [Forty-slot handoff](SLOTS.tsv) · [Photography replacement](PHOTO-HANDOFF.md)
- [Attribution](ATTRIBUTION.md) · [Asset dimensions, licenses and hashes](ASSETS.json) · [Exact changed files](FILES.txt)

GitHub displays review files and downloadable recordings. It does **not** host the interactive Portfolio from this folder. No new public preview hosting or production deployment was performed.

For the real interactive review, check out this branch and run:

```sh
git clone --branch feat/menswear-cinematic-production https://github.com/soufianeaberbach-sudo/portfolio.git
cd portfolio
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4393
```

Open `http://127.0.0.1:4393/portfolio/#menswear`. The four direct destinations are `#menswear/m-streetwear`, `#menswear/m-activewear`, `#menswear/m-rtw` and `#menswear/m-tailoring`. On a trusted local network, `--host 0.0.0.0` makes the same local preview available to another device at the computer’s LAN address; this does not create a public HTTPS preview.

## The four films

| World | Directed passage | Payoff |
| --- | --- | --- |
| Presence / Streetwear | A held cream volume, a city stride, an obstructing photographic wall, the original room discovered, the room’s actual seam opening. | Angular teal volume gives way to a different, complete quilted silhouette. |
| Momentum / Activewear | Poise, compression, a red vertical axis, an opposing white look, suspension. The wide kneeling pose has a standing alternative on phones. | A genuinely photographed airborne pose; no invented athletic motion. |
| Evolution / Ready-to-Wear | A compact seated shape, a photographed support, a model carrying a real chair, then an open interval between looks. | The interval opens into the actual expansive white-shirt pose and red photographic room. |
| Authority / Tailoring | Daylight, light/dark cloth contrast, charcoal in shadow, ivory in shadow, the city. | A complete overcoat silhouette in its genuine architectural surroundings. |

Typography names each world at its opening, then leaves the photography. Resting frames show complete photographed figures. Technical diagrams, simulations, fabricated garment views and development placeholders are absent.

## Control, without a forced sequence

Explore mode uses native scrolling. The five numbered controls select authored compositions without forcing ordinary browsing into slides. **Worlds** jumps directly to a destination; skipped films do not play. **10 looks** opens that world’s complete archive immediately.

**Present** holds the current composition indefinitely and supports previous/next, direct scene selection and optional fullscreen. Fullscreen denial retains the in-page presentation. With the film focused, supported remote/keyboard signals are Right/Down/PageDown/Space (next), Left/Up/PageUp/Shift+Space (previous), Home and End. Keys are not taken from links, form fields, menu controls or the photographic reader. Mouse/touch fallback controls remain available.

Click any cast or archive photograph to inspect it. The Portfolio router alone owns category/garment URLs, history, layer opening, focus and Escape. The Menswear adapter owns photographic state, zoom/pan and scoped motion. Return uses the actual clicked occurrence; viewport changes cancel stale measured animation and recompute the destination. Escape unwinds inspection, reader, world selector/presentation, category, then chapter.

## Content truth

Forty unique displayed photographs occupy ten stable slots per world. The sixteen historical Menswear entries remain unchanged in the source pool; thirty-four additions yield fifty routable reference identities. Duplicate historical photographs are never counted twice in the displayed forty.

All current displayed references have one genuine primary photograph. Front, Back, Complete Original, Side, Editorial and Detail controls are conditional on real supplied `FinalViews` metadata. Configuration fixtures test these future formats; no missing angle appears publicly. The main film always uses the primary/front representation.

Independent photographers, models and garments are not a common development project or ABERBACH work. The owner’s future photographs require explicit provenance and approval. See the handoff and attribution records.

## Remaining limits

Real iPhone Safari, physical presentation remotes, projector output, native Safari fullscreen and hardware performance still need owner/device verification. Chromium emulation and browser recordings do not establish those results or guarantee 60 fps. Independent temporary photography limits campaign continuity; owner-supplied art-directed photography remains the largest opportunity. One preserved historical Pexels page now returns 404; that pre-existing file and the uncertainty are documented, without inventing credit or introducing a replacement.

No merge, production deployment, Cloudflare/DNS change, technical-story integration or alteration of the original concept branches is included.

## Integration map

- `MenswearAct.astro`: scoped four-world film/ten-look archive and chapter navigator.
- `MenswearPhoto.astro` / `MenswearReader.astro`: measured photographic windows and one optional-view reader language.
- `menswear-collection.ts` / `menswear-references.json`: stable display slots over the preserved historical pool, genuine FinalViews parsing and per-source credits.
- `menswear-direction.ts` / `menswear-film.ts`: explicit photographic roles, responsive keyframes and source-based camera choreography.
- `menswear-reader.ts`: presentation controls, native explore state, interruption, inspection and responsive source continuity.
- `menswear-cinematic.css`: Menswear-only styling, closed-world safeguards and portrait art direction.
- `portfolio.astro`: small adapter dispatch inside the existing router; no replacement router or copied experimental Womenswear act.
- `tests` and CI: actual-interface regression checks and reproducible capture helpers. No production/deployment workflow was added.

The preserved [V1 concept](https://github.com/soufianeaberbach-sudo/portfolio/tree/045bedaded6e3b168dafb60b010f613eca209f6c/docs/portfolio/review/menswear-cinematic-concept) and [V2 Director’s Cut](https://github.com/soufianeaberbach-sudo/portfolio/tree/0bf99069f6df96a21b5ea8d0ce371b79db6c8336/docs/portfolio/review/menswear-directors-cut-v2) remain historical references. Their branch histories and review evidence were not merged into this implementation.
