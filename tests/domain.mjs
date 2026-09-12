/* Domain guard.
 *
 * Phase A moved the website origin to https://aberbach.co. This asserts the
 * migration stayed complete — in the source AND in the built output, which is
 * what actually ships — so a reintroduced old-domain URL fails CI instead of
 * quietly splitting the site's canonical identity across two hosts.
 *
 * It also pins the public contact address. That address is a Gmail mailbox,
 * not a website URL, so the domain migration does not touch it — but the
 * DISPLAYED form matters, because it is the public identity. The chosen form
 * has no dot in the local part. This file asserts the exact address is PRESENT
 * wherever the site shows it, and that the dotted variant is absent: Gmail
 * routes both to the same mailbox, which is precisely why the wrong one could
 * otherwise be reintroduced and never noticed.
 *
 *   npm run build && npm run test:domain
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
/* A line may name the old domain on purpose — this guard has to declare what
   it forbids, and a migration record has to say what was migrated from. Such a
   line carries the marker below and is skipped. Every skipped line is listed in
   the output, so the exemptions stay visible and cannot quietly multiply. */
const ALLOW_MARKER = 'domain-guard-allow';
const OLD_WEBSITE_DOMAIN = 'soufianeaberbach' + '.com';
const NEW_ORIGIN = 'https://aberbach.co';
const PUBLIC_EMAIL = 'soufianeaberbach@gmail.com';
/* Assembled rather than written out, so this file does not itself count as an
   occurrence of the form it forbids. */
const DOTTED_EMAIL = 'soufiane' + '.' + 'aberbach@gmail.com';

let passed = 0;
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) { passed += 1; console.log(`  ok   ${name}`); }
  else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};
const group = (name) => console.log(`\n${name}`);

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.astro', '.wrangler']);
const TEXT_EXT = /\.(astro|ts|tsx|js|mjs|cjs|json|jsonc|md|css|txt|yml|yaml|html|svg)$/;

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(join(dir, entry.name), out);
    } else if (TEXT_EXT.test(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

/* ------------------------------------------------------------------ source */

group('source carries no old website domain');
{
  const files = await walk(ROOT);
  const hits = [];
  const allowed = [];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    text.split('\n').forEach((line, i) => {
      /* The email address contains a different local part and a different
         domain, so it never matches this — but strip it first anyway so the
         guard can never be the reason someone "fixes" the public address. */
      if (!line.replaceAll(PUBLIC_EMAIL, '').includes(OLD_WEBSITE_DOMAIN)) return;
      const at = `${relative(ROOT, file)}:${i + 1}`;
      if (line.includes(ALLOW_MARKER)) allowed.push(at);
      else hits.push(at);
    });
  }
  check(
    `no old website domain anywhere in source (${files.length} files scanned)`,
    hits.length === 0,
    hits.slice(0, 6).join(', ') + (hits.length > 6 ? ` … +${hits.length - 6}` : ''),
  );
  console.log(`       ${allowed.length} deliberate mention(s): ${allowed.join(', ') || 'none'}`);
}

group('the public contact email is exactly the chosen form');
{
  const expected = [
    'src/components/BriefForm.astro',
    'src/pages/contact.astro',
    'src/pages/privacy.astro',
    'wrangler.jsonc',
  ];
  for (const file of expected) {
    const text = await readFile(join(ROOT, file), 'utf8');
    check(`${file} uses ${PUBLIC_EMAIL}`, text.includes(PUBLIC_EMAIL));
    check(`${file} does not use the dotted form`, !text.includes(DOTTED_EMAIL));
  }

  /* Every mailto on the site is built from one constant per file, so pinning
     the constant pins the links — but assert the rendered result too, because
     that is what a visitor actually clicks. */
  const files = await walk(ROOT);
  const dotted = [];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    text.split('\n').forEach((line, i) => {
      if (!line.includes(DOTTED_EMAIL)) return;
      if (line.includes(ALLOW_MARKER)) return;
      dotted.push(`${relative(ROOT, file)}:${i + 1}`);
    });
  }
  check(
    'the dotted display form appears nowhere in source',
    dotted.length === 0,
    dotted.slice(0, 6).join(', '),
  );

  const to = (await readFile(join(ROOT, 'wrangler.jsonc'), 'utf8')).match(/"BRIEF_TO":\s*"([^"]*)"/)?.[1] ?? '';
  check(`BRIEF_TO is ${PUBLIC_EMAIL}`, to === PUBLIC_EMAIL, to);

  const from = (await readFile(join(ROOT, 'wrangler.jsonc'), 'utf8')).match(/"BRIEF_FROM":\s*"([^"]*)"/)?.[1] ?? '';
  check('BRIEF_FROM is still brief@aberbach.co', from === 'brief@aberbach.co', from);
  check('BRIEF_FROM is not the public address', from !== PUBLIC_EMAIL, from);
}

group('configured origin');
{
  const config = await readFile(join(ROOT, 'astro.config.mjs'), 'utf8');
  const site = config.match(/site:\s*'([^']+)'/)?.[1] ?? '';
  check(`astro.config site is ${NEW_ORIGIN}`, site === NEW_ORIGIN, site);
  check('site has no trailing slash', !site.endsWith('/'), site);
  check('site is the apex, not www', !site.includes('//www.'), site);
  check('site is https', site.startsWith('https://'), site);
}

/* ------------------------------------------------------------------- built */

const distPath = join(ROOT, 'dist');
let hasDist = true;
try { await stat(distPath); } catch { hasDist = false; }

if (!hasDist) {
  console.log('\nNo dist/ — run `npm run build` first to check the built output.');
  failures.push('dist/ missing: the built-output assertions did not run');
} else {
  const ROUTES = ['', 'expertise', 'portfolio', 'process', 'experience', 'contact', 'privacy'];

  group('built pages canonicalize to the apex');
  for (const route of ROUTES) {
    const file = join(distPath, route, 'index.html');
    const html = await readFile(file, 'utf8');
    const label = `/${route}${route ? '/' : ''}`;
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
    const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1] ?? '';
    const expected = `${NEW_ORIGIN}/${route}${route ? '/' : ''}`;
    check(`${label} canonical is ${expected}`, canonical === expected, canonical);
    check(`${label} og:url matches the canonical`, ogUrl === canonical, `${ogUrl} vs ${canonical}`);
    check(`${label} carries no old domain`, !html.includes(OLD_WEBSITE_DOMAIN));
    check(`${label} canonical is not www`, !canonical.includes('//www.'), canonical);
  }

  group('built mailto links use the chosen address');
{
  for (const route of ['contact', 'privacy']) {
    const html = await readFile(join(distPath, route, 'index.html'), 'utf8');
    const mailtos = [...html.matchAll(/href="mailto:([^"?]+)/g)].map((m) => m[1]);
    check(`/${route}/ renders at least one mailto link`, mailtos.length > 0, `${mailtos.length} found`);
    check(`/${route}/ mailto links all use ${PUBLIC_EMAIL}`, mailtos.every((m) => m === PUBLIC_EMAIL), mailtos.join(' '));
    check(`/${route}/ shows no dotted address anywhere`, !html.includes(DOTTED_EMAIL));
  }
  /* The no-JavaScript fallback on Contact is the one route a visitor without
     scripting has, so its address is asserted separately. */
  const contact = await readFile(join(distPath, 'contact', 'index.html'), 'utf8');
  const noscript = contact.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? '';
  check('the no-JavaScript fallback carries the chosen address', noscript.includes(PUBLIC_EMAIL), noscript.slice(0, 120));
}

group('built social image is absolute on the apex');
  {
    const html = await readFile(join(distPath, 'index.html'), 'utf8');
    const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? '';
    check('og:image is absolute on the new origin', image.startsWith(`${NEW_ORIGIN}/`), image);
    const twitter = html.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1] ?? '';
    check('twitter:image matches og:image', twitter === image, `${twitter} vs ${image}`);
  }

  group('structured data uses the new website origin');
  {
    const html = await readFile(join(distPath, 'index.html'), 'utf8');
    const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    check('JSON-LD block present on the home page', Boolean(raw));
    const data = JSON.parse(raw);
    const nodes = data['@graph'] ?? [];
    check('graph has the Person and ProfessionalService nodes', nodes.length === 2, `${nodes.length} nodes`);

    const person = nodes.find((n) => n['@type'] === 'Person');
    const service = nodes.find((n) => n['@type'] === 'ProfessionalService');
    check('Person @id is on the apex', person?.['@id'] === `${NEW_ORIGIN}/#soufiane`, String(person?.['@id']));
    check('Person url is the apex', person?.url === `${NEW_ORIGIN}/`, String(person?.url));
    check('Person image is on the apex', String(person?.image).startsWith(`${NEW_ORIGIN}/`), String(person?.image));
    check('Service @id is on the apex', service?.['@id'] === `${NEW_ORIGIN}/#service`, String(service?.['@id']));
    check('Service url is the apex', service?.url === `${NEW_ORIGIN}/`, String(service?.url));
    check('Service provider points at the Person', service?.provider?.['@id'] === `${NEW_ORIGIN}/#soufiane`);
    check('no old domain in the whole graph', !JSON.stringify(data).includes(OLD_WEBSITE_DOMAIN));

    /* Claim discipline, carried over from the pass that set these. */
    const json = JSON.stringify(data);
    for (const banned of ['areaServed', 'aggregateRating', 'AggregateRating', 'review', 'Review', 'award', 'hasCredential', 'Offer']) {
      check(`no fabricated "${banned}" in structured data`, !json.includes(banned));
    }
    check('sameAs is still the four real profiles', Array.isArray(person?.sameAs) && person.sameAs.length === 4, String(person?.sameAs?.length));
  }

  group('sitemap');
  {
    const xml = await readFile(join(distPath, 'sitemap.xml'), 'utf8');
    check('no old domain in the sitemap', !xml.includes(OLD_WEBSITE_DOMAIN));
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const expected = ROUTES.map((r) => `${NEW_ORIGIN}/${r}${r ? '/' : ''}`);
    check(`lists exactly ${expected.length} URLs`, locs.length === expected.length, `${locs.length} found`);
    check('lists exactly the English routes', JSON.stringify(locs) === JSON.stringify(expected), locs.join(' '));
    check('every URL is https on the apex', locs.every((l) => l.startsWith(`${NEW_ORIGIN}/`)));
    check('no www URL', !locs.some((l) => l.includes('//www.')));
    check('no duplicates', new Set(locs).size === locs.length);
    /* Phase A is English-only, and noindex routes must never be listed. */
    for (const banned of ['/contact/sent', '/404', '/fr/', '/es/', '/ar/']) {
      check(`sitemap excludes ${banned}`, !locs.some((l) => l.includes(banned)));
    }
  }

  group('robots.txt');
  {
    const txt = await readFile(join(distPath, 'robots.txt'), 'utf8');
    check('no old domain in robots.txt', !txt.includes(OLD_WEBSITE_DOMAIN));
    check(`declares ${NEW_ORIGIN}/sitemap.xml`, txt.includes(`Sitemap: ${NEW_ORIGIN}/sitemap.xml`), txt.trim());
    check('still allows crawling', /^Allow: \/$/m.test(txt), txt.trim());
    check('disallows nothing', !/^Disallow: \S/m.test(txt), txt.trim());
  }

  group('noindex routes stayed noindex');
  for (const route of ['contact/sent', '404']) {
    const file = route === '404' ? join(distPath, '404.html') : join(distPath, route, 'index.html');
    const html = await readFile(file, 'utf8');
    check(`/${route} is noindex`, /<meta name="robots" content="noindex/.test(html));
    check(`/${route} carries no old domain`, !html.includes(OLD_WEBSITE_DOMAIN));
  }

  group('Phase A added no multilingual routes and no trackers');
  {
    const entries = await readdir(distPath, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    for (const locale of ['fr', 'es', 'ar', 'it']) {
      check(`no /${locale}/ route exists yet`, !dirs.includes(locale), dirs.join(' '));
    }
    const html = await readFile(join(distPath, 'index.html'), 'utf8');
    for (const tracker of [
      'googletagmanager', 'google-analytics', 'gtag(', 'connect.facebook.net',
      'snap.licdn.com', 'clarity.ms', 'hotjar', 'plausible', 'umami',
    ]) {
      check(`no ${tracker} on the home page`, !html.includes(tracker));
    }
    check('no hreflang alternates yet', !html.includes('hreflang'));
    check('html lang is still en', /<html lang="en"/.test(html));
  }
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
