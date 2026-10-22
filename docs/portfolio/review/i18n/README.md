# Localization QA — EN · FR · ES · AR

**22 October 2026 · branch `feat/complete-multilingual-localization` (base
`80ccdac`, current main at time of writing) · not merged, not deployed.**
Architecture, glossary and owner-review items: [LOCALIZATION.md](../../LOCALIZATION.md).

## Commands and results (run on the final build)

| Command | Result |
| --- | --- |
| `npm run build` | 44 pages (11 English incl. 404 + 33 localized), 0 errors |
| `npx wrangler deploy --dry-run` | Worker configuration valid; Worker unchanged |
| `npm run test:worker` | 509 passed, 0 failed |
| `npm run test:domain` | 264 passed, 0 failed (extended from English-only to 36 routes) |
| `npm run test:production` | 0 failed (fixture now expects 36 sitemap URLs) |
| `npm run test:smoke` | 302 passed, 0 failed |
| `npm run test:i18n` (new) | 579 passed, 0 failed |
| CI Portfolio contracts: `menswear-content`, `final-photography`, `womenswear-ten-looks`, `fashion-source-integrity` | 167 / 23 / 111 / pass — all exit 0 |
| CI Portfolio browser suites (12, incl. `fashion-eight-worlds` 376, `menswear-presentation-seeks` 264, `womenswear-continuity` 98, `garment-match-cut` 48, `fashion-navigation` 40) | all exit 0 |
| `three-panel-photography` | 474 checks passed |

Existing tests were extended, not weakened: the domain suite's "no /fr/ route
yet" and "no hreflang yet" guards became "exactly the four approved languages"
and "reciprocal hreflang present"; canonical/og:url/no-www/old-domain checks
now cover all 36 pages; mailto checks cover Contact and Privacy in all four
languages.

## What `tests/i18n.mjs` proves

- 36 indexable pages: `lang`, `dir`, self-canonical, `og:url`, reciprocal
  hreflang (en/fr/es/ar/x-default), `og:locale`, localized description,
  internal links stay in-language and resolve, switcher offers all four.
- Sitemap: 36 URLs, 5 alternates each. Localized 404s exist and are served
  for missing localized paths. Flow pages are noindex without alternates.
- Dictionaries: identical shape, no empty strings, same placeholders, only
  trusted inline tags. Trust-page anchors identical in every language.
- Form contract: the five stage values equal the Worker's `STAGES`; every
  Worker refusal has a localized message; payload field names unchanged;
  French validation and refusal messages; unknown message → localized
  generic line; English still shows server text verbatim.
- No English sentences on any localized page; all 117 Portfolio image
  descriptions translated; Portfolio element ids, subjects and `#fragment`
  links identical to English.
- Browser: switching keeps the page and the Portfolio fragment; works without
  JavaScript; Back returns to the previous language; phone menu switcher with
  ≥44px targets; zero horizontal overflow for all 9 Arabic pages at 1440,
  1366, 1024, 768, 430, 390 and FR/ES at 1440 and 390; IBM Plex Sans Arabic
  loaded; no tracking/uppercase on Arabic labels; LTR-isolated email; arrows
  mirrored in Arabic only; the Front window shows the same region of the
  photograph in every language; deep links open the same garment reader;
  Escape closes it; Menswear scene captions localized.

## Defects found by QA and fixed

1. Honeypot `left:-9999px` produced ~10,000px horizontal scroll in RTL →
   `inset-inline-start`.
2. Arabic two-up reader showed the **Back** in the **Front** window (overflowing
   image aligned right in RTL) → photographic containers kept LTR; regression
   test added.
3. Switcher separators fell inside the Arabic link ("ES عربي |", "FREN").
4. Mobile menu rules styled the language row as page rows.
5. SA monogram reversed in RTL; nav numbers touching labels; hero rule/rings
   crossing Arabic text; Expertise index rules misplaced → logical properties.
6. Arabic ascenders/shadda colliding under Latin leading (0.84–1.08) → 1.3 floor.
7. "Je / suis" split; FR/ES CLO3D and ES positioning headlines overflowing 390px
   → recomposed copy, role on its own line.
8. Two-word chapter names (DOSSIERS TECHNIQUES, الأزياء الرجالية) running
   across the photograph / off canvas → break at spaces outside English.
9. Menswear scene controls reversed while film and arrow keys stayed LTR.

## Browser evidence

`stills/` — 57 JPEG captures from the built site with the site's real fonts
(including IBM Plex Sans Arabic, now in `tests/fixtures/fonts`). Naming:
`<locale>_<path>_<width>x<height>[_s<scrollY>][_menu].jpg`.

- All four languages: Home 1440 and 390, Portfolio opening 1440, brief form
  1440, Tech Packs cover 1440.
- Arabic: Home, Contact form and Menswear cover at 1366, 1024, 768, 430;
  Expertise, Process, Experience, Privacy, Before We Start, Working Terms at
  1440 and 390; menu at 390; garment reader 1440/390; Womenswear Occasionwear;
  Menswear Tailoring film; Development.
- French: menu 390, Womenswear Casualwear, Tech Packs world, Experience.
- Spanish: Menswear Activewear film, Process 390, Expertise.

Screenshots are evidence for judgement, not approval. Motion START / MIDPOINT /
PAYOFF captures were not re-taken: no animation, timing or choreography was
changed; only text, direction-aware decoration and RTL containment.

## Limits

- Translations are not native-speaker reviewed or certified (see owner review
  list in LOCALIZATION.md).
- Physical iPhone Safari / Android checks were not possible here.
- The no-JavaScript brief confirmation stays English (Worker redirect unchanged).
- Production deployment, Cloudflare and search-console submission untouched.
