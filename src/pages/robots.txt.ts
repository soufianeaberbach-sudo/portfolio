export const prerender = true;

export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://aberbach.co');

  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', origin)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
