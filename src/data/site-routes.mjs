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
