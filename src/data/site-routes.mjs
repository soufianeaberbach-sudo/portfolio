/** Indexable public pages shared by the sitemap, diagnostics and route tests.
 * Fragments and flow endpoints are not independent pages. */
export const indexableRoutes = [
  { path: '/', title: 'Home' },
  { path: '/expertise/', title: 'Expertise' },
  { path: '/portfolio/', title: 'Portfolio' },
  { path: '/process/', title: 'Process' },
  { path: '/experience/', title: 'Experience' },
  { path: '/contact/', title: 'Contact' },
  { path: '/privacy/', title: 'Privacy & Confidentiality', trust: true },
  { path: '/before-we-start/', title: 'Before We Start', trust: true },
  { path: '/working-terms/', title: 'Working Terms', trust: true },
];
export const trustRoutes = indexableRoutes.filter((route) => route.trust);

/** The site's languages, mirrored from src/i18n/locales.ts so plain-Node
 * tests and diagnostics can read them without a TypeScript loader. English
 * keeps the original unprefixed URLs; the others add a prefix. */
export const siteLocales = ['en', 'fr', 'es', 'ar'];
export const localizedPath = (path, locale) => (locale === 'en' ? path : `/${locale}${path}`);

/** Every indexable page in every language: 9 pages x 4 languages = 36. */
export const localizedRoutes = indexableRoutes.flatMap((route) =>
  siteLocales.map((locale) => ({ ...route, locale, base: route.path, path: localizedPath(route.path, locale) })),
);
