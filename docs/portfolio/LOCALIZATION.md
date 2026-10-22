# ABERBACH — localization (EN · FR · ES · AR)

**Status: implemented on `feat/complete-multilingual-localization`, not merged,
not deployed.** English is the original and its public URLs are unchanged.
Translations are careful professional editorial work produced in this branch;
they have been self-reviewed twice but have **not** been reviewed by native
speakers or certified. Owner review items are listed at the end.

## 1. Architecture

| Concern | Where | How |
| --- | --- | --- |
| Languages, URL rules | `src/i18n/locales.ts` | `en` (default, unprefixed), `fr`, `es`, `ar` (`dir="rtl"`). `getLocale(url)`, `localizePath(href, locale)`, `stripLocale(path)`. The locale is read **only** from the URL — no cookies, headers, geo or browser-language redirects. |
| Routes | `src/pages/[locale]/*.astro` | Thin static wrappers (`getStaticPaths` → fr/es/ar) that render the **same** page component as English. No page is duplicated; `/fr/portfolio/` renders `src/pages/portfolio.astro`. |
| Localized 404 | `astro.config.mjs` hook | Moves `/<locale>/404/index.html` to `/<locale>/404.html` so Cloudflare's existing `not_found_handling: "404-page"` serves the nearest localized 404. No Worker or Cloudflare change. |
| Dictionaries | `src/i18n/dict.ts` + `src/i18n/ui.ts`, `src/i18n/pages/*.ts` | `defineDict(en, {fr, es, ar})`: English is the shape; the others must match it (typed, and re-checked by `tests/i18n.mjs`). French gets automatic narrow no-break spaces before `: ; ? !`. |
| Headlines | dictionary strings | May carry trusted `<em>`/`<br>`; each language chooses its own line breaks and highlighted word. Rendered with `set:html`, never from visitor input. |
| Portfolio words | `src/i18n/portfolio.ts` (build), `src/i18n/portfolio-terms.ts` (build + browser), `src/i18n/garments.ts` (build) | Overlaid at render time, keyed by immutable ids and by the English source text already in `src/data/*`. **No data file was edited**; ids, `#fragments`, crops, image files and history logic are untouched. |
| Browser scripts | `clientLocale()` in `portfolio-terms.ts`; `data-roles` / `data-text` JSON attributes | Runtime messages (reader status, Present/Exit, rail hints, PDF fallback, form validation) come from the page language. No network request, no runtime translation. |
| SEO | `src/layouts/SiteLayout.astro`, `src/pages/sitemap.xml.ts`, `src/data/site-routes.mjs` | Self-canonical per language, reciprocal `hreflang` for en/fr/es/ar + `x-default` (English), `og:locale` + alternates, localized title/description, structured data `inLanguage` and localized `url`. Sitemap: 36 URLs, each with 5 `xhtml:link` alternates. Noindex flow pages declare no alternates. |
| Language switcher | `src/components/SiteHeader.astro`, `global.css` | `EN · FR · ES · عربي`, plain links (work without JS), each tagged with its own `lang`/`hreflang`; current language marked with `aria-current`. Desktop: beside the brief CTA. Phone: inside the menu with ≥44px targets. With JS the current `#fragment` is carried across (Portfolio addresses are immutable ids). Nothing is stored. |
| Arabic RTL | `src/styles/rtl.css` (+ logical properties in page styles) | See §3. |

### Adding or changing copy

1. Edit the English string in the relevant dictionary under `src/i18n/`.
2. Edit the same key in `fr`, `es` and `ar` (same keys, same array lengths,
   same `{placeholders}`).
3. `npm run build && npm run test:i18n` — fails on missing keys, empty strings,
   placeholder mismatches, unmapped Worker messages, English left on a
   localized page, untranslated image descriptions, RTL overflow and more.

A new garment photograph only needs its English description added to
`src/i18n/garments.ts` with three translations. A new page needs a dictionary,
a wrapper in `src/pages/[locale]/`, and an entry in `site-routes.mjs`.

## 2. What is deliberately not translated

- **BETWEEN INSTINCT & CONSTRUCTION** masthead (brand signature, `lang="en"`).
- Personal and company names (Soufiane Aberbach, Loratex, Roadtex, Lariconf,
  Ava Marie), brand logos, software (CLO3D, Gerber AccuMark, Lectra, Optitex,
  Vetigraph, Adobe Illustrator), platform names, photographer credits.
- Ids, `#fragments`, `data-*` attributes, file names, the `/api/brief`
  endpoint, form field names and the **five English stage values** the Worker
  validates (`Idea / reference` … `Production issue`). Only their labels change.
- The Worker itself: its English refusals are mapped to the page language in
  the browser (`contact.form.serverErrors`); an unknown message shows the
  localized generic line (English keeps showing the server text verbatim).
- The no-JavaScript native POST still lands on `/contact/sent/` (English),
  because the Worker's redirect is unchanged. JavaScript visitors never leave
  the localized page.

## 3. Arabic right-to-left

- `<html lang="ar" dir="rtl">`; IBM Plex Sans Arabic (Google Fonts, Arabic
  pages only). Archivo/Inter stay first in the display/body stacks so Latin
  names keep the identity; labels lead with Plex.
- No letter-spacing or uppercase on Arabic; Arabic leading (≥1.3 on display
  type, overriding Latin settings as tight as 0.84); slightly larger
  navigation labels.
- Logical properties on the standard pages (borders, paddings, alignment,
  decorative rules), mirrored hero rule/rings, RTL-aware growth/reveal of
  lines and the process stamps.
- Directional arrows mirror (`.arrow--ne/left/right` path only); up/down,
  logos, photographs and garments never mirror. The SA monogram stays LTR.
- Email, phone, URLs, dates, company names and credits use `<bdi>`/`dir="ltr"`.
- **Portfolio:** photographic compositions are *not* mirrored. Crops, rails,
  stages, the Menswear film and its scene controls stay left-to-right
  (`direction: ltr` on photographic containers), because their geometry is
  measured from the left of each source file — in RTL an overflowing two-up
  image would otherwise show the Back in the Front window (found in QA, fixed,
  and now tested). Words around the pictures are right-to-left. Multi-word
  chapter names wrap at spaces instead of running across the photograph.

## 4. Terminology glossary

| English | Context | Français | Español | العربية |
| --- | --- | --- | --- | --- |
| Fashion design | discipline | design de mode | diseño de moda | تصميم الأزياء |
| Fashion Designer | title | designer de mode | diseñador de moda | مصمّم أزياء |
| Industrial patternmaking | discipline | modélisme industriel / patronage | patronaje industrial | إعداد الباترونات الصناعية |
| Pattern maker | role | modéliste | patronista | مُعِدّ باترونات |
| Pattern (the object) | document | patron | patrón | باترون |
| Pattern architecture | construction | architecture du patron | arquitectura del patrón | بنية الباترون |
| Block architecture | base pattern | architecture du patron de base | arquitectura del patrón base | بنية الباترون الأساسي |
| Grading / grade rules | sizes | gradation / règles de gradation | escalado (de tallas) / reglas de escalado | تدريج المقاسات / قواعد التدريج |
| Fit (quality) | garment on body | bien-aller | ajuste | المقاس، الملاءمة |
| Fit development / validation | stage | validation du bien-aller | validación del ajuste | التحقّق من المقاس والملاءمة |
| Fitting (session) | event | essayage | prueba de ajuste | جلسة قياس |
| Ease | allowance | aisance | holgura | هامش الراحة |
| Balance | front/back hang | équilibre | equilibrio | التوازن |
| Drape | fabric fall | tombé | caída | الانسدال |
| Points of measure (POM) | spec | points de mesure | puntos de medida | نقاط القياس |
| Tolerance | spec | tolérance | tolerancia | هامش التفاوت |
| Construction (logic/specification) | assembly | montage (logique / spécifications de montage) | confección (lógica / especificación de confección) | التركيب (منطق / مواصفات التركيب) |
| Seams & assembly | assembly | coutures & assemblage | costuras y montaje | الدروز والتجميع |
| Tech pack | document | dossier technique | ficha técnica | ملف تقني |
| Technical flat | drawing | dessin technique à plat | plano técnico / dibujo técnico plano | رسم تقني مسطّح |
| Bill of materials | document | nomenclature | lista de materiales | قائمة المواد |
| Trims | components | fournitures | fornituras | الإكسسوارات |
| Sample / sampling | prototype stage | prototype / prototypage | muestra | عيّنة / إعداد العيّنات |
| Toile | mock-up | toile | toile | قماش التجربة |
| Dress form | equipment | buste | maniquí | مانيكان |
| Product development | discipline | développement produit | desarrollo de producto | تطوير المنتج |
| Pre-production | stage | préproduction | preproducción | ما قبل الإنتاج |
| Handoff (to production) | stage | transmission (à la production) | traspaso (a producción) | التسليم (للإنتاج) |
| First piece | verification | première pièce | primera prenda | القطعة الأولى |
| Manufacturing / production | industry | production / fabrication, usine | producción / fabricación, fábrica | الإنتاج / التصنيع، المصنع |
| Bulk | volume run | série | producción en serie | الإنتاج الكمّي |
| CAD | software | CAO | CAD | CAD / التطوير بالحاسوب |
| 3D simulation | CLO3D | simulation 3D | simulación 3D | محاكاة ثلاثية الأبعاد |
| Silhouette | design | silhouette | silueta | الهيئة |
| Womenswear / Menswear | chapters | Femme / Homme | Mujer / Hombre | الأزياء النسائية / الأزياء الرجالية |
| Casualwear | category | Décontracté | Casual | الملابس اليومية |
| Activewear | category | Sport | Deporte | الملابس الرياضية |
| Occasionwear | category | Soirée | Fiesta | ملابس المناسبات |
| Swimwear | category | Bain | Baño | ملابس السباحة |
| Streetwear | category | Streetwear | Streetwear | أزياء الشارع |
| Tailoring & Outerwear | category | Costumes & manteaux | Sastrería y abrigos | البدلات والملابس الخارجية |
| Development (chapter) | Portfolio | Développement | Desarrollo | التطوير |
| Pattern Development | Portfolio | Développement des patrons | Desarrollo de patrones | تطوير الباترونات |
| Brief | enquiry | brief | brief | موجز (المشروع) |
| Auto-Entrepreneur | Moroccan legal status | auto-entrepreneur | auto-entrepreneur (official term kept) | مقاول ذاتي |

Context-dependent terms are deliberately not forced into one word: *fit* is
*bien-aller* (quality) but *essayage* (session); *construction* is *montage*
(assembly) or *construction* (technical build); *production* is *usine* when it
means the factory floor.

## 5. Editorial decisions (where literal translation would be wrong)

- **Home role rotator.** FR "Je suis …" without article (*je suis modéliste*);
  ES "Y soy …"; AR "وأنا …". "Production Follower" → *chargé du suivi de
  production* / *técnico de producción* / *متابع للإنتاج* (not "follower").
  The window is sized to each language's longest role and may take its own
  line beside the lead, never clipping.
- **"The expensive mistake happens *before* the sewing line."** FR *avant
  l'atelier de couture*; ES *se comete antes de la costura* (shorter words so
  the display line fits a phone); AR *قبل خط الخياطة*.
- **"*See* it move. Before you make it."** FR *Voyez-le bouger. Avant de le
  coudre.*; ES *Míralo moverse. Antes de hacerlo.* — recomposed after QA
  because *mouvement*/*movimiento* overflowed 390px at display size.
- **Experience headline** recomposed per language (*Une vision du produit qui
  s'élargit* / *cada vez más amplia* / *ورؤية للمنتج تتّسع باستمرار*).
- **Highlighted words** chosen per grammar: *concorder*, *coincidir*, *تتّفق*;
  Portfolio covers highlight *silhouette/silueta/الهيئة*, *proportions*,
  *bien-aller/ajuste/الملاءمة*, *spécifications*.
- **Category names**: native retail vocabulary in FR/ES (*Femme/Homme*,
  *Soirée*, *Bain*, *Fiesta*, *Baño*), descriptive Arabic. Womenswear world
  titles are recomposed (*DÉCON—TRACTÉ*, *CASUAL*, *الملابس / اليومية*).
- **Spanish register**: *tú*, consistently (contemporary, direct; matches the
  English voice). French: *vous*. Arabic: masculine-singular imperative, the
  web convention.
- **Gender**: alt text never assigns a gender the English does not state
  (neutral *Modelo …*, *إطلالة …* for "a model").
- **Testimonials** are translated faithfully and labelled *Traduit de
  l'anglais* / *Traducido del inglés* / *مترجم عن الإنجليزية*.
- **Legal/information pages** keep every fact: 90-day expiry, one-hour hashed
  rate limit, 10 MB limit, provider list, activation caveats, ownership and
  third-party factory responsibility. Nothing added or softened.
- **Job titles** are translated faithfully (same position, reader's language);
  employers and dates are unchanged; months localized.

## 6. For owner review

1. Native-speaker review of all three languages, priority: Home masthead
   area, Portfolio cover statements, category names, Privacy, Working Terms.
2. Arabic rendering of the name — kept in Latin script (*Soufiane Aberbach*)
   everywhere rather than inventing an Arabic spelling. Confirm or supply one.
3. Arabic category names (two words) vs shorter retail forms (*نسائي/رجالي*).
4. French *Femme/Homme* and Spanish *Mujer/Hombre* as chapter titles.
5. Translated job titles on Experience vs keeping the English originals.
6. Spanish status line: *Auto-entrepreneur registrado en Marruecos*.
7. Whether testimonials should stay in English with a translation note
   instead of being translated.
8. Spanish *tú* register for B2B (switch to *usted* is a copy-only change).
9. The no-JavaScript confirmation page is English for all languages (Worker
   redirect unchanged by design).

## 7. Merge notes (parallel photography work)

`feat/womenswear-ai-photography-regeneration` (unmerged checkpoint) edits the
same lines of `FinalPhotoReader.astro` and `WomenswearExhibition.astro` and adds
English presentation strings and ~11 new image descriptions. When either branch
merges first, resolve by keeping both behaviours: apply the photography logic
(`generatedPresentation`, `featuredIdentity`) inside the localized markup, add
its new strings to `pf.reader` / `pf.women`, and its new alt texts to
`src/i18n/garments.ts`. `npm run test:i18n` lists anything still in English.
