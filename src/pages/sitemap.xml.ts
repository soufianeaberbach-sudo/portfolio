const routes = ['/', '/expertise/', '/portfolio/', '/process/', '/experience/', '/contact/', '/privacy/'];

export const prerender = true;

export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://soufianeaberbach.com');
  const urls = routes
    .map((route) => `  <url><loc>${new URL(route, origin)}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
