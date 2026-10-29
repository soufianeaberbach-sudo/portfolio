# EN / FR / ES localization and CV maintenance

This implementation starts from approved main `6a487817cd4a585c5140547aa9b74e2b8c6dac35`.
PR #46 is an old, unmerged translation source, never a replacement for current
Portfolio components, photography, documents or Contact behavior.

English remains unprefixed. French uses `/fr/`; Spanish uses `/es/`. All three
are LTR. Locale comes only from the URL: there is no cookie, browser-language,
geographic or automatic language redirect. Arabic website localization is
absent; the owner's actual Arabic/French/English working languages remain.

## Shared architecture

- `src/i18n/locales.ts` defines the three locales and language-aware links.
  `src/data/site-routes.mjs` exposes the same manifest to plain-Node diagnostics.
- Thin `src/pages/[locale]/` wrappers render the current shared page components.
  Ten indexable pages produce 30 sitemap URLs; localized confirmation and 404
  pages bring the static build to 36 pages. Cloudflare receives nearest-language
  `404.html` files through the build hook.
- English defines typed dictionary shapes. FR/ES must supply the same keys,
  array content and interpolation fields. Trusted inline headline markup is
  authored in dictionaries, never generated from visitor input. French narrow
  nonbreaking punctuation spacing is applied centrally.
- Portfolio translations overlay immutable IDs/source strings. Original
  English garment data, ordering, source identities, photographs, crop geometry,
  technical PDFs and PNG pages remain unchanged. The engineering documents
  retain their original English artwork; all surrounding reader UI is localized.
- `garment-copy.ts` validates source hashes for 188 current garment records,
  sharing 147 translated copies where English is identical. Stale or missing
  current translations stop the build. Current generated photograph alts and
  post-PR46 controls have additional explicit maps.
- Internal sentinels such as `Third view`, file names, hashes, API fields and
  English Worker stage values are never translated. Labels are translated after
  photographic selection, preserving the latest Front/Back inspection logic.
- Canonicals, reciprocal EN/FR/ES/x-default hreflang, Open Graph locales,
  structured-data language/URLs and sitemap links share the route helpers.
  Desktop/mobile switchers preserve the current page and Portfolio fragment.
- Contact keeps `/api/brief`, fields, enumeration values, validation, upload,
  anti-spam and Turnstile behavior. Known server refusals display localized
  text; unknown refusals use the localized fallback. Worker and Wrangler bytes
  are unchanged. No live production form submission is used by QA.

## CV production and downloads

`public/cv/` contains the six finished PNG/PDF editions. The Experience page's
compact `CVDownloads.astro` action downloads the current language PDF; its
native expandable options expose every PDF and PNG with descriptive filenames.
The global page transition explicitly respects download links.

`scripts/cv/career.json` is the shared CV career record; `template.html` is the
editable deterministic layout. The retained portrait is a processed derivative
of the owner's supplied photo. The original attachment is not published.
PNG-first rendering, exact A4 conversion, searchable text and independent print
checks are documented in [the production guide](../../scripts/cv/README.md).

## Editing and verification

Update English and both translations together. Preserve immutable data and
source hashes. Extend tests when adding new public routes, runtime messages or
photograph descriptions. Run build, Worker/domain/production diagnostics,
`test:smoke`, `test:i18n`, `test:cv`, and the existing CI source/document/browser
suites. Exact localization-source authorization lives in
`tests/fixtures/localization-preservation.json`; it never exempts photographs,
garment data, Worker code or production bindings. CI fetches the pinned approved
baseline explicitly because its normal PR checkout is shallow.

Reconciliation matrices and actual inspected screenshots:
[pages](review/i18n-cv/PAGES-RECONCILIATION.md),
[Portfolio](review/i18n-reconciliation/PORTFOLIO.md),
[page visual review](review/i18n-cv/PAGES-VISUAL-QA.md),
[CV print review](review/i18n-cv/CV-REVIEW.md).

The [release report](review/i18n-cv/RELEASE.md) distinguishes local verification,
remote CI and production deployment. A successful build or merge is not itself
proof of a live deployment.
