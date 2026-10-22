/* Internationalization tests: English, French, Spanish, Arabic.
 *
 *   npm run build && node tests/i18n.mjs
 *
 * Two halves. The STATIC half reads dist/ and the translation dictionaries:
 * page count, lang/dir, canonical, reciprocal hreflang, sitemap, localized
 * links, dictionary completeness, placeholders, the Worker message map and a
 * scan for English left on localized pages. The BROWSER half drives the
 * built site: language switching keeps the place, Arabic is genuinely RTL and
 * fits every width, the brief form speaks the page language while posting the
 * unchanged contract, and Portfolio deep links open the same garment.
 *
 * Machine checks find missing keys and leftovers. They cannot certify
 * native-speaker quality; that is the editorial review recorded in
 * docs/portfolio/LOCALIZATION.md.
 */
import { createServer } from 'node:http';
import { readFile, stat, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { installFonts } from './fixtures/fonts.mjs';
import { indexableRoutes, localizedRoutes, siteLocales, localizedPath } from '../src/data/site-routes.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://aberbach.co';
const PREFIXED = ['fr', 'es', 'ar'];

let passed = 0;
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) { passed += 1; console.log(`  ok   ${name}`); }
  else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};
const group = (name) => console.log(`\n${name}`);
const file = (path) => join(DIST, path.replace(/^\//, ''), path.endsWith('/') ? 'index.html' : '');
const html = (path) => readFile(file(path), 'utf8');
const attr = (source, pattern) => source.match(pattern)?.[1] ?? '';

/* ---------------------------------------------------------------------------
   The dictionaries, loaded exactly as the site compiles them.
   --------------------------------------------------------------------------- */
const scratch = await mkdtemp(join(tmpdir(), 'aberbach-i18n-'));
const entry = join(scratch, 'entry.ts');
const bundle = join(scratch, 'dicts.mjs');
const src = (p) => JSON.stringify(join(ROOT, 'src', p));
await (await import('node:fs/promises')).writeFile(entry, `
export { ui } from ${src('i18n/ui.ts')};
export { home } from ${src('i18n/pages/home.ts')};
export { expertise } from ${src('i18n/pages/expertise.ts')};
export { process } from ${src('i18n/pages/process.ts')};
export { experience } from ${src('i18n/pages/experience.ts')};
export { contact } from ${src('i18n/pages/contact.ts')};
export { trust } from ${src('i18n/pages/trust.ts')};
export { misc } from ${src('i18n/pages/misc.ts')};
export { terms } from ${src('i18n/portfolio-terms.ts')};
export { pf } from ${src('i18n/portfolio.ts')};
export { garmentAlt, garmentSources } from ${src('i18n/garments.ts')};
export { localizePath, stripLocale, getLocale } from ${src('i18n/locales.ts')};
`);
await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: bundle, logLevel: 'silent' });
const D = await import(pathToFileURL(bundle).href);
await rm(scratch, { recursive: true, force: true });

try {
  group('locale helpers');
  check('English paths are unprefixed', D.localizePath('/contact/#brief', 'en') === '/contact/#brief');
  check('Arabic paths carry the prefix and fragment', D.localizePath('/contact/#brief', 'ar') === '/ar/contact/#brief');
  check('switching between prefixed languages', D.localizePath('/es/contact/', 'ar') === '/ar/contact/');
  check('home is /fr/', D.localizePath('/', 'fr') === '/fr/');
  check('external and mailto hrefs untouched', D.localizePath('mailto:x@y.z', 'fr') === 'mailto:x@y.z');
  check('stripLocale', D.stripLocale('/fr/portfolio/') === '/portfolio/' && D.stripLocale('/portfolio/') === '/portfolio/');
  check('getLocale ignores lookalike paths', D.getLocale('/french/') === 'en' && D.getLocale('/ar/') === 'ar');

  /* -------------------------------------------------------------------------
     DICTIONARY COMPLETENESS
     Same keys, same nesting, same array lengths, no empty strings where
     English has words, the same {placeholders}, and only the inline tags the
     renderer trusts.
     ------------------------------------------------------------------------- */
  group('dictionaries are complete in every language');
  const dictionaries = ['ui', 'home', 'expertise', 'process', 'experience', 'contact', 'trust', 'misc', 'terms', 'pf'];
  const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const tags = (s) => [...s.matchAll(/<\/?([a-z]+)/g)].map((m) => m[1]);
  const ALLOWED = new Set(['em', 'br', 'b', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'dl', 'dt', 'dd']);
  for (const name of dictionaries) {
    const dict = D[name];
    for (const locale of PREFIXED) {
      const problems = [];
      const walk = (en, other, path) => {
        if (typeof en === 'string') {
          if (typeof other !== 'string') return problems.push(`${path}: not a string`);
          if (en.trim() && !other.trim()) problems.push(`${path}: empty`);
          if (placeholders(en) !== placeholders(other)) problems.push(`${path}: placeholders ${placeholders(en)} vs ${placeholders(other)}`);
          const bad = tags(other).filter((t) => !ALLOWED.has(t));
          if (bad.length) problems.push(`${path}: tag <${bad[0]}>`);
          return;
        }
        if (Array.isArray(en)) {
          /* Display title lines are recomposed per language; their count is
             a typographic decision, not a missing translation. */
          if (!Array.isArray(other) || (other.length !== en.length && !path.includes('womenTitles'))) return problems.push(`${path}: array length`);
          if (path.includes('womenTitles')) return other.every((line) => typeof line === 'string' && line.trim()) || problems.push(`${path}: empty line`);
          en.forEach((item, i) => walk(item, other[i], `${path}[${i}]`));
          return;
        }
        if (en && typeof en === 'object') {
          const a = Object.keys(en).sort().join(',');
          const b = other && typeof other === 'object' ? Object.keys(other).sort().join(',') : '';
          if (a !== b) return problems.push(`${path}: keys differ`);
          for (const key of Object.keys(en)) walk(en[key], other[key], `${path}.${key}`);
        }
      };
      walk(dict.en, dict[locale], name);
      check(`${name}.${locale} matches the English shape`, problems.length === 0, problems.slice(0, 4).join('; '));
    }
  }
  check('trust section ids are identical in every language', PREFIXED.every((l) =>
    ['privacy', 'before', 'terms'].every((p) => D.trust[l][p].sections.map((s) => s.id).join() === D.trust.en[p].sections.map((s) => s.id).join())));

  group('the brief form keeps its machine contract');
  const worker = await readFile(join(ROOT, 'worker', 'index.ts'), 'utf8');
  const stageBlock = worker.match(/const STAGES = \[([\s\S]*?)\]/)?.[1] ?? '';
  const workerStages = [...stageBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const form = await readFile(join(ROOT, 'src', 'components', 'BriefForm.astro'), 'utf8');
  const formBlock = form.match(/const stages = \[([\s\S]*?)\]/)?.[1] ?? '';
  const formStages = [...formBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  check('form stage values equal the Worker STAGES exactly', workerStages.length === 5 && workerStages.join('|') === formStages.join('|'), formStages.join('|'));
  check('every language labels all five stages', PREFIXED.every((l) => D.contact[l].form.stages.length === 5));
  const messages = new Set([
    ...[...worker.matchAll(/error: '([^']{12,})'/g)].map((m) => m[1]),
    ...[...worker.matchAll(/fail\(\s*\d+,\s*'([^']+)'/g)].map((m) => m[1]),
    ...[...worker.matchAll(/\? '([^']{20,})'\s*\n?\s*: '([^']{20,})'/g)].flatMap((m) => [m[1], m[2]]),
    ...[...worker.matchAll(/const message =\s*'([^']+)'/g)].map((m) => m[1]),
    ...[...worker.matchAll(/const message = '([^']+)'/g)].map((m) => m[1]),
  ]);
  for (const message of [...worker.matchAll(/error: `([^`]+)`/g)].map((m) => m[1].replace('${mb}', '10'))) messages.add(message);
  const mapped = new Set(D.contact.en.form.serverErrors);
  const unmapped = [...messages].filter((m) => !mapped.has(m) && !['Use POST.'].includes(m));
  check(`every Worker refusal (${messages.size}) has a localized message`, unmapped.length === 0, unmapped.join(' | '));

  /* -------------------------------------------------------------------------
     PAGES, LANG, DIRECTION, CANONICAL, HREFLANG
     ------------------------------------------------------------------------- */
  group('36 indexable localized pages');
  check('9 pages x 4 languages', localizedRoutes.length === 36 && indexableRoutes.length === 9);
  for (const route of localizedRoutes) {
    const label = route.path;
    if (!existsSync(file(route.path))) { check(`${label} exists`, false); continue; }
    const source = await html(route.path);
    const lang = attr(source, /<html[^>]*\blang="([^"]+)"/);
    const dir = attr(source, /<html[^>]*\bdir="([^"]+)"/);
    check(`${label} lang=${route.locale} dir=${route.locale === 'ar' ? 'rtl' : 'ltr'}`, lang === route.locale && dir === (route.locale === 'ar' ? 'rtl' : 'ltr'), `${lang} ${dir}`);
    const canonical = attr(source, /<link rel="canonical" href="([^"]+)"/);
    check(`${label} canonical is itself`, canonical === ORIGIN + route.path, canonical);
    check(`${label} og:url equals canonical`, attr(source, /<meta property="og:url" content="([^"]+)"/) === canonical);
    const alternates = Object.fromEntries([...source.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
    const expected = Object.fromEntries([...siteLocales.map((l) => [l, ORIGIN + localizedPath(route.base, l)]), ['x-default', ORIGIN + route.base]]);
    check(`${label} reciprocal hreflang (en fr es ar x-default)`, JSON.stringify(alternates) === JSON.stringify(expected), JSON.stringify(alternates));
    const ogLocale = attr(source, /<meta property="og:locale" content="([^"]+)"/);
    check(`${label} og:locale`, ogLocale === { en: 'en_US', fr: 'fr_FR', es: 'es_ES', ar: 'ar_AR' }[route.locale], ogLocale);
    const title = attr(source, /<title>([^<]+)<\/title>/);
    const description = attr(source, /<meta name="description" content="([^"]+)"/);
    if (route.locale !== 'en') {
      const english = await html(route.base);
      check(`${label} has a title naming Soufiane Aberbach`, title.includes('Soufiane Aberbach'), title);
      check(`${label} description differs from English`, description && description !== attr(english, /<meta name="description" content="([^"]+)"/));
    }
    /* Every internal link stays in the page's language and resolves. */
    const hrefs = [...source.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)/g)].map((m) => m[1]).filter((h) => !/\.(pdf|webp|jpg|png|mp4)$/.test(h));
    const foreign = route.locale === 'en'
      ? hrefs.filter((h) => /^\/(fr|es|ar)\//.test(h) && !source.includes(`data-lang-link="${h.split('/')[1]}"`))
      : hrefs.filter((h) => !h.startsWith(`/${route.locale}/`));
    const switcher = new Set([...source.matchAll(/<a[^>]*href="([^"]+)"[^>]*data-lang-link/g)].map((m) => m[1]));
    check(`${label} internal links stay in ${route.locale}`, foreign.filter((h) => !switcher.has(h)).length === 0, foreign.filter((h) => !switcher.has(h)).slice(0, 4).join(' '));
    const broken = hrefs.filter((h) => !existsSync(file(h.endsWith('/') ? h : h + '/')) && !existsSync(join(DIST, h)));
    check(`${label} internal links resolve`, broken.length === 0, broken.slice(0, 4).join(' '));
    check(`${label} language switcher offers all four`, siteLocales.every((l) => source.includes(`data-lang-link="${l}"`) && source.includes(`href="${localizedPath(route.base, l)}" hreflang="${l}"`)));
  }

  group('flow pages and 404');
  for (const locale of PREFIXED) {
    const sent = await html(`/${locale}/contact/sent/`);
    check(`/${locale}/contact/sent/ is noindex with no alternates`, sent.includes('noindex') && !sent.includes('rel="alternate"'));
    check(`/${locale}/404.html exists for Cloudflare's nearest-404 lookup`, existsSync(join(DIST, locale, '404.html')));
    const notFound = await readFile(join(DIST, locale, '404.html'), 'utf8');
    check(`/${locale}/404.html is ${locale} and noindex`, notFound.includes(`lang="${locale}"`) && notFound.includes('noindex'));
  }

  group('sitemap');
  const sitemap = await readFile(join(DIST, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check('lists 36 URLs', locs.length === 36, String(locs.length));
  check('lists every localized route once', localizedRoutes.every((r) => locs.filter((l) => l === ORIGIN + r.path).length === 1));
  check('each URL carries five xhtml alternates', (sitemap.match(/<xhtml:link /g) ?? []).length === 36 * 5);
  check('declares the xhtml namespace', sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));

  group('structured data');
  for (const locale of siteLocales) {
    const source = await html(localizedPath('/', locale));
    const json = JSON.parse(attr(source, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || '{}');
    const site = json['@graph']?.find((n) => n['@type'] === 'WebSite');
    check(`${locale} home WebSite inLanguage=${locale} and url is its own home`, site?.inLanguage === locale && site?.url === ORIGIN + localizedPath('/', locale));
    const person = json['@graph']?.find((n) => n['@type'] === 'Person');
    check(`${locale} Person keeps the same verified facts`, person?.address?.addressLocality === 'Tangier' && person?.sameAs?.length === 4 && !('knowsLanguage' in person) && !('areaServed' in person));
  }

  /* -------------------------------------------------------------------------
     NO ENGLISH LEFT BEHIND
     Text and accessible attributes of every localized page, minus what is
     English on purpose: the brand masthead, names, brands, software,
     photographer credits and source ids.
     ------------------------------------------------------------------------- */
  group('no untranslated English on localized pages');
  const STOP = /\b(the|and|with|your|from|this|that|into|before|after|which|what|when|where|will|would|should|about|here|there|been|have|their|they|only|every|each|than|then|more|through|for|our|its|are|is|was|not|can|you)\b/gi;
  const ALLOW = [
    /Soufiane Aberbach/g, /DISPLACED BY DESIGN CLOTHING/g, /In The Style/g, /I Saw It First/g, /Little Mistress London/g,
    /Fashion Nova/g, /River Island/g, /Monstera Production/g, /SHVETS production/g, /RDNE Stock project/g, /MART PRODUCTION/g,
    /cottonbro studio/g, /Instituto Alpha Fitness/g, /INFECTED Store/g, /Wayne Fotografias/g, /Royal Anwar/g,
    /Between\s*Instinct\s*&(amp;)?\s*Construction/gi, /Gerber AccuMark/g, /Adobe Illustrator/g, /Google (Drive|Fonts)/g,
    /Cloudflare (Turnstile|R2)/g, /Web Analytics/g, /Massimo Dutti/g,
  ];
  const visible = (source) => {
    let s = source.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
    s = s.replace(/<(\w+)[^>]*\slang="en"[^>]*>[\s\S]*?<\/\1>/g, ' ');
    s = s.replace(/<a[^>]*data-lang-link[^>]*>[\s\S]*?<\/a>/g, ' ');
    const attrs = [...s.matchAll(/\s(?:alt|aria-label|title|placeholder|content)="([^"]*)"/g)].map((m) => m[1]);
    const text = s.replace(/<[^>]+>/g, '\n').split('\n');
    return [...text, ...attrs].map((t) => t.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim()).filter(Boolean);
  };
  for (const route of localizedRoutes.filter((r) => r.locale !== 'en')) {
    const segments = visible(await html(route.path)).filter((t) => !/^https?:\/\//.test(t) && !/^[\w-]+-ref-\d+|^m-[\w-]+-pexels/.test(t));
    const english = segments.filter((t) => {
      let cleaned = t;
      for (const pattern of ALLOW) cleaned = cleaned.replace(pattern, '');
      return (cleaned.match(STOP) ?? []).length >= 2;
    });
    check(`${route.path} has no English sentences`, english.length === 0, english.slice(0, 3).join(' ‖ '));
  }

  group('every garment description is translated');
  const enPortfolio = await html('/portfolio/');
  const enAlts = [...new Set([...enPortfolio.matchAll(/alt="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')))];
  for (const locale of PREFIXED) {
    const page = await html(`/${locale}/portfolio/`);
    const left = enAlts.filter((alt) => page.includes(`alt="${alt}"`));
    check(`${locale} Portfolio shows none of the ${enAlts.length} English image descriptions`, left.length === 0, left.slice(0, 3).join(' | '));
    const untranslated = enAlts.filter((alt) => D.garmentAlt(alt, locale) === alt && !/^(First page|Poster frame|Woman in a red|Man in a cobalt|Chrome mannequin|Tech pack cover)/.test(alt));
    check(`${locale} garment map covers every photograph`, untranslated.length === 0, untranslated.slice(0, 3).join(' | '));
  }

  group('Portfolio identities are language-independent');
  const ids = (source) => [...source.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]).sort().join(' ');
  const dataSubjects = (source) => [...source.matchAll(/data-subject="([^"]+)"/g)].map((m) => m[1]).sort().join(' ');
  for (const locale of PREFIXED) {
    const page = await html(`/${locale}/portfolio/`);
    check(`${locale} Portfolio has exactly the English element ids`, ids(page) === ids(enPortfolio));
    check(`${locale} Portfolio has exactly the English subjects`, dataSubjects(page) === dataSubjects(enPortfolio) && dataSubjects(page).split(' ').length > 100);
    const hashes = (source) => [...source.matchAll(/href="(#[^"]+)"/g)].map((m) => m[1]).sort().join(' ');
    check(`${locale} Portfolio fragment links are untranslated`, hashes(page) === hashes(enPortfolio));
  }

  /* -------------------------------------------------------------------------
     THE BROWSER HALF
     ------------------------------------------------------------------------- */
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.txt': 'text/plain' };
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let path = decodeURIComponent(url.pathname);
    let target = join(DIST, path);
    try {
      if ((await stat(target)).isDirectory()) target = join(target, 'index.html');
      res.writeHead(200, { 'content-type': types[extname(target)] ?? 'application/octet-stream' });
      res.end(await readFile(target));
    } catch {
      /* Cloudflare's nearest-404 behaviour. */
      const locale = path.split('/')[1];
      const notFound = PREFIXED.includes(locale) ? join(DIST, locale, '404.html') : join(DIST, '404.html');
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(await readFile(notFound));
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const BASE = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const context = async (options = {}) => {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
    await installFonts(c);
    return c;
  };

  try {
    group('language switcher');
    {
      const c = await context();
      const p = await c.newPage();
      await p.goto(BASE + '/process/', { waitUntil: 'domcontentloaded' });
      await Promise.all([p.waitForURL('**/fr/process/'), p.click('.lang-switch--header [data-lang-link="fr"]')]);
      check('EN → FR lands on the equivalent page', new URL(p.url()).pathname === '/fr/process/');
      check('French page announces French', (await p.evaluate(() => document.documentElement.lang)) === 'fr');
      await Promise.all([p.waitForURL('**/ar/process/'), p.click('.lang-switch--header [data-lang-link="ar"]')]);
      check('FR → AR lands on the equivalent page', new URL(p.url()).pathname === '/ar/process/');
      check('Arabic document is rtl', (await p.evaluate(() => getComputedStyle(document.documentElement).direction)) === 'rtl');
      const current = await p.getAttribute('.lang-switch--header [aria-current="true"]', 'data-lang-link');
      check('current language is marked', current === 'ar', String(current));
      await p.goBack();
      await p.waitForURL('**/fr/process/');
      check('Back returns to the previous language', new URL(p.url()).pathname === '/fr/process/');

      /* A Portfolio address survives the switch: the fragment is immutable. */
      await p.goto(BASE + '/portfolio/#menswear', { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(600);
      const hash = await p.evaluate(() => location.hash);
      /* The Portfolio's header can be scrolled out of view; activate the
         link the way a keyboard or assistive technology would. */
      await Promise.all([p.waitForURL(/\/es\/portfolio\//), p.evaluate(() => document.querySelector('.lang-switch--header [data-lang-link="es"]').click())]);
      check('Portfolio fragment is preserved across languages', new URL(p.url()).hash === hash && new URL(p.url()).pathname === '/es/portfolio/', p.url());
      await c.close();
    }
    {
      const c = await context({ javaScriptEnabled: false });
      const p = await c.newPage();
      await p.goto(BASE + '/es/contact/', { waitUntil: 'domcontentloaded' });
      const href = await p.getAttribute('.lang-switch--header [data-lang-link="fr"]', 'href');
      check('switcher works without JavaScript (plain link)', href === '/fr/contact/', String(href));
      await c.close();
    }
    {
      const c = await context({ viewport: { width: 390, height: 844 } });
      const p = await c.newPage();
      await p.goto(BASE + '/fr/', { waitUntil: 'domcontentloaded' });
      check('header switcher is hidden on a phone', !(await p.isVisible('.lang-switch--header')));
      await p.click('.menu-toggle');
      await p.waitForTimeout(400);
      check('menu switcher is visible on a phone', await p.isVisible('.lang-switch--menu'));
      const box = await p.locator('.lang-switch--menu a').first().boundingBox();
      check('menu language targets are at least 44px tall', (box?.height ?? 0) >= 44, String(box?.height));
      check('menu toggle label is localized', (await p.textContent('.menu-toggle .sr-only'))?.trim() === 'Fermer le menu');
      await c.close();
    }

    group('Arabic RTL layout');
    for (const width of [1440, 1366, 1024, 768, 430, 390]) {
      const c = await context({ viewport: { width, height: 900 } });
      const p = await c.newPage();
      for (const route of indexableRoutes) {
        await p.goto(BASE + localizedPath(route.path, 'ar'), { waitUntil: 'domcontentloaded' });
        await p.waitForTimeout(120);
        const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        check(`no horizontal overflow /ar${route.path} @ ${width}`, overflow <= 0, `${overflow}px`);
      }
      await c.close();
    }
    for (const locale of ['fr', 'es']) {
      for (const width of [1440, 390]) {
        const c = await context({ viewport: { width, height: 900 } });
        const p = await c.newPage();
        for (const route of indexableRoutes) {
          await p.goto(BASE + localizedPath(route.path, locale), { waitUntil: 'domcontentloaded' });
          await p.waitForTimeout(120);
          const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          check(`no horizontal overflow /${locale}${route.path} @ ${width}`, overflow <= 0, `${overflow}px`);
        }
        await c.close();
      }
    }
    {
      const c = await context();
      const p = await c.newPage();
      await p.goto(BASE + '/ar/contact/', { waitUntil: 'domcontentloaded' });
      await p.evaluate(() => document.fonts.ready);
      const font = await p.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily);
      check('Arabic headings use IBM Plex Sans Arabic', font.includes('IBM Plex Sans Arabic'), font);
      const plexLoaded = await p.evaluate(() => document.fonts.check('700 32px "IBM Plex Sans Arabic"', 'ابدأ'));
      check('IBM Plex Sans Arabic is loaded for Arabic text', plexLoaded);
      const spacing = await p.evaluate(() => getComputedStyle(document.querySelector('.eyebrow')).letterSpacing);
      check('Arabic labels carry no letter-spacing', spacing === 'normal' || spacing === '0px', spacing);
      const transform = await p.evaluate(() => getComputedStyle(document.querySelector('.eyebrow')).textTransform);
      check('Arabic labels are not text-transformed', transform === 'none', transform);
      const emailDir = await p.evaluate(() => getComputedStyle(document.querySelector('.ct-reach__value bdi')).direction);
      check('email address is isolated left-to-right', emailDir === 'ltr', emailDir);
      const arrow = await p.evaluate(() => getComputedStyle(document.querySelector('.arrow--ne path')).transform);
      check('directional arrows are mirrored in RTL', arrow.startsWith('matrix(-1'), arrow);
      await p.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });
      const arrowEn = await p.evaluate(() => getComputedStyle(document.querySelector('.arrow--ne path')).transform);
      check('arrows are not mirrored in English', arrowEn === 'none', arrowEn);
      await c.close();
    }

    group('brief form speaks the page language, posts the same contract');
    {
      const c = await context();
      const p = await c.newPage();
      let posted = null;
      await p.route('**/api/brief', async (route) => {
        posted = route.request().postDataJSON();
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, field: 'name', error: 'That name is too long.' }) });
      });
      await p.goto(BASE + '/fr/contact/', { waitUntil: 'domcontentloaded' });
      await p.click('[data-submit]');
      check('French validation message', (await p.textContent('#bf-name-err'))?.trim() === 'Merci d’indiquer votre nom.');
      await p.fill('#bf-name', 'Test');
      await p.fill('#bf-email', 'test@example.com');
      await p.click('.stage:nth-child(3)');
      await p.fill('#bf-message', 'Un problème d’équilibre sur une veste.');
      await p.evaluate(() => { document.querySelector('[data-started]').value = String(Date.now() - 60000); });
      await p.click('[data-submit]');
      await p.waitForTimeout(500);
      check('stage VALUE is the unchanged English contract', posted?.stage === 'Fit / sample', JSON.stringify(posted?.stage));
      check('payload field names are unchanged', posted && ['name', 'company', 'email', 'stage', 'message', 'link', 'website', 't'].every((k) => k in posted), Object.keys(posted ?? {}).join(','));
      check('Worker refusal shown in French', (await p.textContent('#bf-name-err'))?.trim() === 'Ce nom est trop long.');
      check('form still posts to /api/brief', (await p.getAttribute('[data-brief-form]', 'action')) === '/api/brief');
      await p.unroute('**/api/brief');
      await p.route('**/api/brief', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'An unexpected new message.' }) }));
      await p.click('[data-submit]');
      await p.waitForTimeout(400);
      check('an unknown server message falls back to localized text', (await p.textContent('[data-alert-text]'))?.trim() === 'Le brief n’a pas pu être envoyé. Rien de ce que vous avez saisi n’a été perdu.');
      await c.close();
    }
    {
      const c = await context();
      const p = await c.newPage();
      await p.route('**/api/brief', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'An unexpected new message.' }) }));
      await p.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });
      await p.fill('#bf-name', 'Test');
      await p.fill('#bf-email', 'test@example.com');
      await p.click('.stage:nth-child(1)');
      await p.fill('#bf-message', 'A balance problem on a jacket.');
      await p.click('[data-submit]');
      await p.waitForTimeout(400);
      check('English still shows a server message verbatim', (await p.textContent('[data-alert-text]'))?.trim() === 'An unexpected new message.');
      await c.close();
    }

    group('Portfolio deep links in every language');
    for (const locale of PREFIXED) {
      const c = await context();
      const p = await c.newPage();
      await p.goto(`${BASE}/${locale}/portfolio/#womenswear/casualwear/rtw-ref-02`, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(1500);
      const open = await p.evaluate(() => {
        const reader = document.querySelector('[data-ww-reader][data-subject="rtw-ref-02"]');
        return reader && !reader.hidden ? reader.querySelector('h3')?.textContent ?? '' : null;
      });
      check(`${locale} deep link opens the same garment reader`, open !== null && open.length > 10, String(open));
      check(`${locale} reader caption is localized`, open !== null && !/shirt worn with/.test(open), String(open));
      await p.keyboard.press('Escape');
      await p.waitForTimeout(800);
      const closed = await p.evaluate(() => document.querySelector('[data-ww-reader][data-subject="rtw-ref-02"]')?.hidden);
      check(`${locale} Escape closes the reader`, closed === true);
      await p.goto(`${BASE}/${locale}/portfolio/#menswear/m-tailoring`, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(1200);
      const caption = await p.textContent('[data-mw-film="m-tailoring"] [data-mw-scene-caption]');
      check(`${locale} Menswear scene caption is localized`, caption && caption.trim() !== 'In the clear', String(caption));
      await c.close();
    }

    group('localized 404');
    {
      const c = await context();
      const p = await c.newPage();
      const res = await p.goto(BASE + '/es/no-such-page/', { waitUntil: 'domcontentloaded' });
      check('missing Spanish path answers 404 with the Spanish page', res?.status() === 404 && (await p.evaluate(() => document.documentElement.lang)) === 'es');
      await c.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
} catch (error) {
  failures.push(`threw: ${error?.stack ?? error}`);
  console.log(error);
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
