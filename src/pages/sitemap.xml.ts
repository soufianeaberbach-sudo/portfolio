import { indexableRoutes, localizedPath, siteLocales } from '../data/site-routes.mjs';

export const prerender = true;

/* One <url> per page per language (36), each listing the same reciprocal
   alternates the page itself declares in its <head>, plus x-default. */
export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://aberbach.co');
  const href = (path: string) => new URL(path, origin).href;
  const urls = indexableRoutes
    .flatMap(({ path }) => {
      const alternates = [
        ...siteLocales.map((locale) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${href(localizedPath(path, locale))}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${href(path)}"/>`,
      ].join('\n');
      return siteLocales.map((locale) => `  <url>\n    <loc>${href(localizedPath(path, locale))}</loc>\n${alternates}\n  </url>`);
    })
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
