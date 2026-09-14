/* Smoke tests for the portfolio.
 *
 * Deliberately narrow: these protect the specific defects fixed in the
 * final pass, so a regression in any of them fails CI. Not a general test
 * framework — no runner, no config, just Playwright's Chromium driving the
 * built site from `astro preview`.
 *
 *   npm run build && node tests/smoke.mjs
 */
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile as readFileAsync } from 'node:fs/promises';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const PORT = Number(process.env.SMOKE_PORT ?? 4321);
const HOST = '127.0.0.1';
const BASE = `http://${HOST}:${PORT}`;
const ROUTES = ['/', '/expertise/', '/portfolio/', '/process/', '/experience/', '/contact/'];
const WIDTHS = [390, 430, 768, 1024, 1440];

let passed = 0;
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) { passed += 1; console.log(`  ok   ${name}`); }
  else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

/* --host is load-bearing, not tidiness. Left to itself `astro preview` binds
   to whatever `localhost` resolves to first, and on a GitHub Actions runner
   /etc/hosts maps localhost to ::1 as well as 127.0.0.1, so the server came up
   IPv6-only while these tests fetched 127.0.0.1 and every request was refused
   until the timeout. Binding the same address the tests dial removes the
   ambiguity on any host. */
/* detached so the whole process group can be signalled. npx spawns a shell
   which spawns node, and killing only npx left the real preview server behind
   holding the piped stdio open — which looks exactly like a hung test run. */
const astroCli = fileURLToPath(new URL('../node_modules/astro/astro.js', import.meta.url));
const server = spawn(process.execPath, [astroCli, 'preview', '--host', HOST, '--port', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
});

/* Kept so a startup failure reports what the server actually said instead of
   the bare timeout that used to be all CI showed. */
let serverLog = '';
server.stdout?.on('data', (chunk) => { serverLog += chunk; });
server.stderr?.on('data', (chunk) => { serverLog += chunk; });
let serverExit = null;
server.on('exit', (code, signal) => { serverExit = signal ? `signal ${signal}` : `code ${code}`; });

let stopped = false;
const stop = () => {
  if (stopped) return;
  stopped = true;
  /* Negative pid: the group, not just npx. */
  try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  try { server.kill('SIGKILL'); } catch {}
};
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });

async function waitForServer() {
  let lastError = '';
  for (let i = 0; i < 60; i += 1) {
    if (serverExit !== null) break;
    try {
      const res = await fetch(BASE + '/');
      if (res.ok) return true;
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = error?.cause?.code ?? error?.code ?? String(error?.message ?? error);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `preview server did not start at ${BASE}\n` +
      `  last error: ${lastError || 'none'}\n` +
      `  process:    ${serverExit === null ? 'still running' : 'exited with ' + serverExit}\n` +
      `  output:     ${serverLog.trim() || '(none)'}`,
  );
}

await waitForServer();
const browser = await chromium.launch();

try {
  // ---- routes load, and no horizontal document overflow at any width
  console.log('\nroutes and overflow');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.route('**://fonts.googleapis.com/**', (r) => r.abort());
  for (const route of ROUTES) {
    const res = await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    check(`${route} responds 200`, res?.status() === 200, `status ${res?.status()}`);
  }
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`no horizontal overflow ${route} @ ${width}`, overflow === 0, `${overflow}px`);
    }
  }
  await ctx.close();

  // ---- mobile menu opens, closes, and Escape closes it
  console.log('\nmobile menu');
  {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await p.click('.menu-toggle');
    await p.waitForTimeout(400);
    check('menu opens', await p.evaluate(() => document.body.classList.contains('no-scroll')));
    const opaque = await p.evaluate(() => getComputedStyle(document.querySelector('.mobile-menu')).backgroundColor);
    check('menu background is opaque', !opaque.includes('rgba(0, 0, 0, 0)'), opaque);
    await p.click('.menu-toggle');
    await p.waitForTimeout(400);
    check('menu closes', await p.evaluate(() => !document.body.classList.contains('no-scroll')));
    await c.close();
  }

  /* ------------------------------------------------------------------------
     PORTFOLIO V6

     The block this replaces tested the V5 collection overlay by its own
     selectors ([data-collection-overlay], #collection-scrubber, the "Look 01"
     runway). V6 removed that UI, so those selectors cannot be asserted on any
     more. Every invariant they protected is re-asserted below against the new
     architecture — overlay opens, background inert, focus starts inside and is
     trapped both ways, Escape closes, inert is released, focus returns to the
     opening control, keyboard drives the queue, reduced motion settles
     instantly — and the index-bounds assertion the scrubber used to carry is
     now made directly against the queue's own bounds and its prev/next
     disabled states.
     ------------------------------------------------------------------------ */
  const openWomenswear = async (p) => {
    await p.evaluate(() => {
      const link = document.querySelector('[data-chapter="womenswear"]');
      link.id = 'smoke-trigger';
      link.click();
    });
    await p.waitForTimeout(900);
  };

  // ---- structure: four worlds, approved taxonomy, nothing invented
  console.log('\nportfolio architecture');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(500);

    const worlds = await p.evaluate(() => [...document.querySelectorAll('[data-world]')].map((e) => e.dataset.world));
    check('exactly four top-level worlds', worlds.length === 4, worlds.join(','));
    for (const id of ['womenswear', 'menswear', 'tech-packs', '3d-simulation']) {
      check(`world "${id}" exists`, worlds.includes(id));
    }

    const chapters = await p.evaluate(() => [...document.querySelectorAll('[data-chapter]')].map((e) => e.dataset.chapter));
    check('four chapters in the landing index', chapters.length === 4, chapters.join(','));

    /* The four worlds are gates in one continuous field, not cards: no
       radius, no frame on all four sides, nothing floating. */
    const cardish = await p.evaluate(() => [...document.querySelectorAll('[data-chapter]')].filter((el) => {
      const s = getComputedStyle(el);
      const framed = s.borderTopWidth !== '0px' && s.borderLeftWidth !== '0px'
        && s.borderRightWidth !== '0px' && s.borderBottomWidth !== '0px';
      return framed || s.borderRadius !== '0px' || s.boxShadow !== 'none';
    }).length);
    check('gates are one continuous field, not four cards', cardish === 0, `${cardish} boxed`);

    /* V7: THE LANDING IS FOUR SEQUENTIAL COVERS.
       Not four side-by-side columns, not a card grid, not a dashboard. Each
       cover is the better part of a screen, each starts below the one before
       it, and each spans the full width of the viewport. */
    const covers = await p.evaluate(() => {
      const list = [...document.querySelectorAll('.pf-cover')];
      const doc = document.documentElement.clientWidth;
      return list.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          chapter: el.dataset.chapter,
          top: Math.round(r.top + window.scrollY),
          height: Math.round(r.height),
          left: Math.round(r.left),
          width: Math.round(r.width),
          full: Math.round(r.width) >= doc - 1,
        };
      });
    });
    check('the landing carries four chapter covers', covers.length === 4, String(covers.length));
    check('the covers run in sequence, never side by side',
      covers.every((c, i) => i === 0 || c.top >= covers[i - 1].top + covers[i - 1].height - 2),
      covers.map((c) => `${c.chapter}@${c.top}+${c.height}`).join(' '));
    check('every cover spans the full width', covers.every((c) => c.full && c.left === 0),
      covers.map((c) => `${c.chapter}:${c.width}`).join(','));
    check('every cover is most of a screen tall',
      covers.every((c) => c.height >= 900 * 0.62), covers.map((c) => c.height).join(','));

    /* Each cover is composed from what its own chapter actually holds, so the
       four do not rhyme. In particular the Womenswear cover is ONE hero
       garment — the three-image deck in miniature turned the landing back into
       a card grid — and Menswear borrows no photograph at all. */
    const coverArt = await p.evaluate(() => ({
      womenswearImages: document.querySelectorAll('.pf-cover[data-chapter="womenswear"] img').length,
      menswearImages: document.querySelectorAll('.pf-cover[data-chapter="menswear"] img').length,
      menswearRows: document.querySelectorAll('.pf-cover[data-chapter="menswear"] .pf-covertype__row').length,
      folio: document.querySelectorAll('.pf-cover[data-chapter="tech-packs"] .pf-foliomark').length,
      folioSheets: [...document.querySelectorAll('.pf-cover[data-chapter="tech-packs"] .pf-foliomark__sheet')].map((el) => ({
        src: el.querySelector('img')?.getAttribute('src') ?? '',
        box: (() => { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(r.left), Math.round(r.top)]; })(),
        spine: !!el.querySelector('.pf-foliomark__spine'),
      })),
      still: document.querySelectorAll('.pf-cover[data-chapter="3d-simulation"] .pf-cover__still').length,
      play: document.querySelectorAll('.pf-cover[data-chapter="3d-simulation"] .pf-cover__play').length,
    }));
    check('the womenswear cover is one hero garment', coverArt.womenswearImages === 1, String(coverArt.womenswearImages));
    check('the menswear cover borrows no photograph',
      coverArt.menswearImages === 0 && coverArt.menswearRows === 4,
      `${coverArt.menswearImages} images / ${coverArt.menswearRows} rows`);
    check('the tech pack cover is a physical folio', coverArt.folio === 1);
    check('the folio cover is three real first pages, stacked and overlapping',
      coverArt.folioSheets.length === 3
      && coverArt.folioSheets.every((sh) => /\/demo\/techpacks\/demo-\d\d-[a-z-]+-p1\.webp$/.test(sh.src) && sh.spine)
      && coverArt.folioSheets.every((sh, i) => i === 0 || (sh.box[2] > coverArt.folioSheets[i - 1].box[2]
        && sh.box[2] < coverArt.folioSheets[i - 1].box[2] + coverArt.folioSheets[i - 1].box[0])),
      JSON.stringify(coverArt.folioSheets.map((sh) => sh.src.split('/').pop())));
    check('the 3D cover is a frame of the real recording with a play mark',
      coverArt.still === 1 && coverArt.play === 1);

    const cats = await p.evaluate(() => ({
      women: [...document.querySelectorAll('[data-world="womenswear"] .pf-band__label')].map((e) => e.textContent.trim()),
      men: [...document.querySelectorAll('[data-world="menswear"] .pf-band__label')].map((e) => e.textContent.trim()),
    }));
    const approvedWomen = [
      'Ready-to-Wear & Contemporary', 'Activewear & Athleisure', 'Streetwear & Casualwear',
      'Evening & Occasionwear', 'Swimwear & Resortwear',
    ];
    const approvedMen = [
      'Streetwear & Casualwear', 'Activewear & Performance',
      'Contemporary Ready-to-Wear', 'Tailoring & Outerwear',
    ];
    check('womenswear categories match the approved order',
      JSON.stringify(cats.women) === JSON.stringify(approvedWomen), cats.women.join(' | '));
    check('menswear categories match the approved order',
      JSON.stringify(cats.men) === JSON.stringify(approvedMen), cats.men.join(' | '));
    /* An unpublished chapter reads through the same subchapter bands as a
       published one, but offers no control that leads nowhere. */
    const menBands = await p.evaluate(() => {
      const bands = [...document.querySelectorAll('[data-world="menswear"] .pf-band')];
      return {
        count: bands.length,
        buttons: bands.filter((b) => b.tagName === 'BUTTON').length,
        labelPx: bands.map((b) => Math.round(parseFloat(getComputedStyle(b.querySelector('.pf-band__label')).fontSize))),
      };
    });
    check('menswear uses the same subchapter bands', menBands.count === 4, String(menBands.count));
    check('menswear bands are editorial, not menu type',
      menBands.labelPx.every((px) => px >= 24), menBands.labelPx.join(','));
    check('menswear offers no control that leads nowhere', menBands.buttons === 0, String(menBands.buttons));

    // Jersey / Woven are cloth, not markets: they may appear as fabric family
    // metadata but never as a category heading.
    const badTaxonomy = await p.evaluate(() => [...document.querySelectorAll('.pf-band__label, .pf-cover__name')]
      .map((e) => e.textContent.trim().toLowerCase())
      .filter((t) => t === 'jersey' || t === 'woven' || t === 'jersey & knit' || t === 'sport' || t === 'evening dresses'));
    check('no jersey/woven/sport top-level taxonomy', badTaxonomy.length === 0, badTaxonomy.join(','));

    const looks = await p.evaluate(() => (document.body.innerText.match(/\bLook\s+\d/gi) ?? []).length);
    check('no "Look 01" UI anywhere', looks === 0, `${looks} occurrences`);

    // Tech packs and 3D simulation are their own worlds, never entries in the
    // garment queue.
    const bleed = await p.evaluate(() => ({
      pdfInQueue: document.querySelectorAll('.pf-slot a[href$=".pdf"], .pf-slot iframe, .pf-slot video').length,
      mediaInQueue: document.querySelectorAll('.pf-stack video, .pf-stack iframe').length,
      sessionsOutsideMotion: [...document.querySelectorAll('[data-session]')]
        .filter((e) => e.closest('[data-world]')?.dataset.world !== '3d-simulation').length,
      docsOutsideDocs: [...document.querySelectorAll('.pf-folio, .pf-foliomark:not(.pf-cover .pf-foliomark)')]
        .filter((e) => e.closest('[data-world]')?.dataset.world !== 'tech-packs').length,
    }));
    check('no documents or video inside the garment queue', bleed.pdfInQueue === 0 && bleed.mediaInQueue === 0);
    check('simulation sessions live only in the 3D world', bleed.sessionsOutsideMotion === 0);
    check('tech pack documents live only in the Tech Packs world', bleed.docsOutsideDocs === 0);

    // Nothing must reach YouTube before an explicit play.
    const youtube = await p.evaluate(() => ({
      iframes: document.querySelectorAll('iframe').length,
      ytRefs: document.documentElement.innerHTML.includes('youtube.com/embed'),
      videos: document.querySelectorAll('video[src]').length,
    }));
    check('no iframe exists before play', youtube.iframes === 0, String(youtube.iframes));
    check('no YouTube embed URL in the served markup', youtube.ytRefs === false);
    check('no video carries a src before play', youtube.videos === 0, String(youtube.videos));

    // Missing content is omitted, never printed as a placeholder.
    const placeholders = await p.evaluate(() => (document.body.innerText.match(/\b(UNKNOWN|N\/A|TODO|LOREM|TBD)\b/gi) ?? []));
    check('no UNKNOWN / N-A / TODO on the public UI', placeholders.length === 0, placeholders.join(','));

    /* A coloured rule directly under words reads as a spell-check mark. The
       device is banned from the visual language, so it is fenced off here the
       way it already is on Contact: walk every resting computed style in the
       portfolio and fail on any signal-coloured underline or inset bottom
       rule. Hover states are exempt by construction — nothing is hovered. */
    const underlines = await p.evaluate(() => {
      const signal = getComputedStyle(document.documentElement).getPropertyValue('--signal').trim();
      const toRgb = (hex) => {
        const h = hex.replace('#', '');
        return `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
      };
      const target = toRgb(signal);
      const bad = [];
      for (const el of document.querySelectorAll('.pf *')) {
        if (!el.textContent.trim()) continue;
        const s = getComputedStyle(el);
        if (s.textDecorationLine.includes('underline') && s.textDecorationColor === target) {
          bad.push(`${el.className} text-decoration`);
        }
        /* A rule UNDER the words is the banned device — it reads as a Word
           spell-check mark. A hairline box around a stamp or a button is a
           different thing entirely and stays allowed, so the bottom rule only
           counts when the other three sides are absent. */
        const bottomOnly = s.borderBottomStyle !== 'none' && s.borderBottomWidth !== '0px'
          && s.borderTopWidth === '0px' && s.borderLeftWidth === '0px' && s.borderRightWidth === '0px';
        if (bottomOnly && s.borderBottomColor === target) {
          bad.push(`${el.className} border-bottom`);
        }
      }
      return bad.slice(0, 5);
    });
    check('no orange underline sits beneath portfolio text at rest', underlines.length === 0, underlines.join(' | '));

    /* PUBLISHING STATE. A chapter with nothing published is listed so the
       four-world architecture stays visible, but it is not a link — there is
       no empty world to walk into — and it says what it is waiting for. */
    const states = await p.evaluate(() => [...document.querySelectorAll('[data-chapter]')].map((el) => ({
      id: el.dataset.chapter,
      publication: el.dataset.publication,
      isLink: el.tagName === 'A',
      note: el.querySelector('.pf-cover__state')?.textContent.trim() ?? null,
      opensAffordance: !!el.querySelector('.pf-cover__go'),
    })));
    const byId = Object.fromEntries(states.map((c) => [c.id, c]));
    check('four chapters carry an explicit publication state',
      states.every((c) => ['published', 'reference-preview', 'unpublished'].includes(c.publication)),
      states.map((c) => `${c.id}=${c.publication}`).join(' '));
    check('menswear is unpublished', byId.menswear.publication === 'unpublished');
    check('menswear is not presented as an openable world', byId.menswear.isLink === false && byId.menswear.opensAffordance === false);
    check('menswear says what it is waiting for', /will be published here/i.test(byId.menswear.note ?? ''), byId.menswear.note ?? 'none');
    /* V7 put five DEMO packs on the table so the folio viewer could be
       designed against documents that open. They are not published work, so
       the chapter reports itself as an interface preview and says so on the
       cover; it flips to `published` the moment a pack without `demo` lands. */
    check('tech packs are an interface preview, not published work',
      byId['tech-packs'].publication === 'reference-preview', byId['tech-packs'].publication);
    check('tech packs are openable', byId['tech-packs'].isLink === true);
    check('the tech pack cover says the documents are demos',
      /demo documents for interface review/i.test(byId['tech-packs'].note ?? ''), byId['tech-packs'].note ?? 'none');
    check('tech packs promise real examples rather than refusing to publish',
      /will replace them/i.test(byId['tech-packs'].note ?? ''), byId['tech-packs'].note ?? 'none');
    check('womenswear is openable as a reference preview',
      byId.womenswear.publication === 'reference-preview' && byId.womenswear.isLink === true);
    check('the womenswear chapter is labelled as an interface preview',
      /temporary visual references/i.test(byId.womenswear.note ?? ''), byId.womenswear.note ?? 'none');

    /* The earlier "client-owned, shared only on request" policy is not the
       intended one and must not reappear. */
    const refusal = await p.evaluate(() => /shared (directly )?on request|not published on a public page/i.test(document.body.innerText));
    check('no statement that technical packs are withheld from publication', refusal === false);

    /* The CLO3D clip is a simulation sample, not a recorded working session. */
    const sim = await p.evaluate(() => {
      const kind = document.querySelector('.pf-session__kind')?.textContent.trim() ?? '';
      const body = document.body.innerText;
      return { kind, claimsFullSession: /pattern creation from start to finish|full working session/i.test(body) };
    });
    check('the CLO3D clip is labelled a simulation sample', /simulation sample/i.test(sim.kind), sim.kind);
    check('no claim that the sample shows pattern construction end to end', sim.claimsFullSession === false);

    await c.close();
  }

  // ---- overlay behaviour (migrated from the V5 collection overlay block)
  console.log('\nportfolio world overlay');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);

    await openWomenswear(p);
    const world = '[data-world="womenswear"]';
    check('world opens', await p.evaluate((s) => document.querySelector(s).hasAttribute('data-open'), world));
    check('background is inert', await p.evaluate(() => !!document.querySelector('[inert]')));
    check('focus starts inside the world', await p.evaluate((s) => document.querySelector(s).contains(document.activeElement), world));

    let escaped = false;
    for (let i = 0; i < 24; i += 1) {
      await p.keyboard.press('Tab');
      if (!(await p.evaluate((s) => document.querySelector(s).contains(document.activeElement), world))) { escaped = true; break; }
    }
    check('Tab never escapes the world', !escaped);
    for (let i = 0; i < 6; i += 1) await p.keyboard.press('Shift+Tab');
    check('Shift+Tab never escapes the world', await p.evaluate((s) => document.querySelector(s).contains(document.activeElement), world));

    await p.keyboard.press('Escape');
    await p.waitForTimeout(700);
    check('Escape closes the world', await p.evaluate((s) => !document.querySelector(s).hasAttribute('data-open'), world));
    check('background inert released', await p.evaluate(() => !document.querySelector('[inert]')));
    check('focus restored to the opening control',
      await p.evaluate(() => document.activeElement?.id === 'smoke-trigger'),
      await p.evaluate(() => document.activeElement?.id || document.activeElement?.tagName || 'none'));

    await c.close();
  }

  // ---- the project queue: counts, leading position, keyboard, bounds
  console.log('\nportfolio project queue');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openWomenswear(p);

    const desktop = await p.evaluate(() => window.__portfolioRunway.getState());
    check('desktop shows five projects at once', desktop.visibleNow === 5, `visible ${desktop.visibleNow} of ${desktop.count}`);
    check('desktop target slot count is five', desktop.visibleTarget === 5);
    /* THE DECK.
       The active image leads: it is the right-most card, it has the highest
       stacking order, and nothing covers it — so the whole photograph, front
       view and back view together, is revealed. Every card behind it is
       overlapped on its right by the card in front, and what is left showing
       is that image's own measured front fraction, so a complete front model
       stays readable. This replaces the old "active is leftmost" invariant,
       which described the wrong picture. */
    check('the active image leads the deck', desktop.activeIsLeading === true);
    check('the cards genuinely overlap', desktop.overlaps >= 4, `${desktop.overlaps} overlaps`);

    const deck = await p.evaluate(() => {
      const panel = document.querySelector('.pf-panel:not([hidden])');
      const stage = panel.querySelector('.pf-stage').getBoundingClientRect();
      const slots = [...panel.querySelectorAll('.pf-slot')].filter((s) => !s.hidden);
      const boxes = slots.map((s) => ({
        el: s,
        r: s.getBoundingClientRect(),
        front: Number(s.dataset.front) || 0.55,
        z: Number(s.style.zIndex),
      })).sort((a, b) => a.r.left - b.r.left);
      const leader = boxes[boxes.length - 1];
      /* How much of each card is left uncovered by the card in front of it. */
      const exposure = boxes.map((b, i) => (i === boxes.length - 1
        ? 1
        : (boxes[i + 1].r.left - b.r.left) / b.r.width));
      return {
        widths: boxes.map((b) => Math.round(b.r.width)),
        zOrder: boxes.map((b) => b.z),
        exposure: exposure.map((e) => +e.toFixed(3)),
        fronts: boxes.map((b) => b.front),
        insideStage: boxes.every((b) => b.r.left >= stage.left - 1 && b.r.right <= stage.right + 1),
        leaderIsWidest: leader.r.width === Math.max(...boxes.map((b) => b.r.width)),
        smallest: Math.round(Math.min(...boxes.map((b) => b.r.width))),
        /* the stack is a positioned deck, not a flex row with gaps */
        stackDisplay: getComputedStyle(panel.querySelector('[data-stack]')).display,
        slotPosition: getComputedStyle(slots[0]).position,
      };
    });
    const growing = deck.widths.every((w, i) => i === 0 || w > deck.widths[i - 1]);
    check('cards grow toward the leading edge', growing, deck.widths.join(' < '));
    /* The scale progression has to READ as depth. 82-100 across five cards did
       not: they looked like five garments of the same size in a row. Each step
       must be a visible jump, and the furthest card must be clearly smaller
       than the leading one while staying big enough to judge. */
    const ratios = deck.widths.map((w) => w / deck.widths[deck.widths.length - 1]);
    check('the furthest card is clearly farther away',
      ratios[0] <= 0.80 && ratios[0] >= 0.70, `${Math.round(ratios[0] * 100)}% of the leader`);
    check('every step of the deck is a visible change of scale',
      deck.widths.every((w, i) => i === 0 || w - deck.widths[i - 1] >= 8),
      deck.widths.join(' < '));
    check('the leading card is the largest', deck.leaderIsWidest);
    check('stacking order rises toward the leader',
      deck.zOrder.every((z, i) => i === 0 || z > deck.zOrder[i - 1]), deck.zOrder.join(','));
    check('every card is fully inside the stage', deck.insideStage);
    check('the furthest card is not a postage stamp', deck.smallest >= 180, `${deck.smallest}px`);
    check('the leading card is completely revealed',
      deck.exposure[deck.exposure.length - 1] === 1, String(deck.exposure[deck.exposure.length - 1]));
    /* The exposed strip of each covered card must be at least its measured
       front fraction, or the front model is being cut. */
    const clipped = deck.exposure.slice(0, -1)
      .map((e, i) => ({ e, need: deck.fronts[i] }))
      .filter((x) => x.e < x.need - 0.01);
    check('every covered card still shows its whole front view',
      clipped.length === 0, JSON.stringify(clipped));
    check('covered cards are partly hidden, not fully shown',
      deck.exposure.slice(0, -1).every((e) => e < 0.95), deck.exposure.join(','));
    check('the deck is a positioned stack, not a flex row',
      deck.stackDisplay !== 'flex' && deck.slotPosition === 'absolute',
      `${deck.stackDisplay} / ${deck.slotPosition}`);

    // contain, never cover: a head or a hem is never cropped off.
    const fits = await p.evaluate(() => [...document.querySelectorAll('.pf-slot img')]
      .every((img) => getComputedStyle(img).objectFit === 'contain'));
    check('garment images use object-fit: contain', fits);

    // Keyboard alone must drive the queue.
    await p.evaluate(() => document.querySelector('.pf-panel:not([hidden]) [data-stage]').focus());
    const before = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(650);
    const after = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    check('ArrowRight advances the queue', after === before + 1, `${before} -> ${after}`);
    await p.keyboard.press('ArrowLeft');
    await p.waitForTimeout(650);
    check('ArrowLeft steps back', await p.evaluate(() => window.__portfolioRunway.getState().activeIndex) === before);

    // Bounds — the assertion the V5 scrubber's max used to carry.
    const bounds = await p.evaluate(() => {
      const api = window.__portfolioRunway;
      const count = api.getState().count;
      api.goTo(count + 50);
      const high = api.getState().activeIndex;
      const nextDisabled = document.querySelector('.pf-panel:not([hidden]) [data-step="1"]').disabled;
      api.goTo(-50);
      const low = api.getState().activeIndex;
      const prevDisabled = document.querySelector('.pf-panel:not([hidden]) [data-step="-1"]').disabled;
      return { count, high, low, nextDisabled, prevDisabled };
    });
    check('index never exceeds count - 1', bounds.high === bounds.count - 1, `${bounds.high} of ${bounds.count}`);
    check('index never goes below zero', bounds.low === 0);
    check('next is disabled on the last project', bounds.nextDisabled === true);
    check('prev is disabled on the first project', bounds.prevDisabled === true);

    // Drag must follow the hand: pointer right -> stack right.
    await p.waitForTimeout(300);
    const stageBox = await p.evaluate(() => {
      const b = document.querySelector('.pf-panel:not([hidden]) .pf-stage').getBoundingClientRect();
      return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
    });
    await p.mouse.move(stageBox.x, stageBox.y);
    await p.mouse.down();
    await p.mouse.move(stageBox.x + 110, stageBox.y, { steps: 8 });
    const dragRight = await p.evaluate(() => {
      const stack = document.querySelector('.pf-panel:not([hidden]) [data-stack]');
      return new DOMMatrix(getComputedStyle(stack).transform).m41;
    });
    await p.mouse.up();
    await p.waitForTimeout(650);
    check('dragging right moves the stack right', dragRight > 0, `translateX ${Math.round(dragRight)}px`);

    await p.mouse.move(stageBox.x, stageBox.y);
    await p.mouse.down();
    await p.mouse.move(stageBox.x - 110, stageBox.y, { steps: 8 });
    const dragLeft = await p.evaluate(() => {
      const stack = document.querySelector('.pf-panel:not([hidden]) [data-stack]');
      return new DOMMatrix(getComputedStyle(stack).transform).m41;
    });
    const indexBeforeRelease = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    await p.mouse.up();
    await p.waitForTimeout(700);
    const indexAfterRelease = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    check('dragging left moves the stack left', dragLeft < 0, `translateX ${Math.round(dragLeft)}px`);
    check('releasing a leftward drag advances the project',
      indexAfterRelease === indexBeforeRelease + 1, `${indexBeforeRelease} -> ${indexAfterRelease}`);

    /* CONTENT INTEGRITY.
       The 49 photographs under public/portfolio/ are temporary visual
       references, exactly as the pre-V6 page said. They must never be
       presented as authored projects. */
    const integrity = await p.evaluate(() => {
      const world = document.querySelector('[data-world="womenswear"]');
      const panel = document.querySelector('.pf-panel:not([hidden])');
      const notice = world.querySelector('[data-reference-notice]');
      return {
        publication: world.dataset.publication,
        panelKind: panel.dataset.kind,
        noticePresent: !!notice,
        noticeText: notice?.textContent.trim() ?? '',
        noticeFontPx: notice ? parseFloat(getComputedStyle(notice).fontSize) : 0,
        noticeCount: world.querySelectorAll('[data-reference-notice]').length,
        counter: document.querySelector('.pf-panel:not([hidden]) [data-counter-current]').textContent.trim(),
        projectArticles: world.querySelectorAll('.pf-project').length,
        tagRows: world.querySelectorAll('.pf-project__tags').length,
        profileRows: world.querySelectorAll('.pf-project__profile').length,
        referencePanel: !!world.querySelector('[data-reference-panel]'),
        /* Every development plate in this state must be a demo: no image, a
           DEMO stamp and a strip note that says the real assets are pending. */
        plates: [...panel.querySelectorAll('.pf-plate')].map((el) => ({
          stage: el.dataset.plate,
          demo: el.hasAttribute('data-demo'),
          images: el.querySelectorAll('img').length,
          stamp: el.querySelector('.pf-plate__stamp')?.textContent.trim() ?? '',
          label: el.querySelector('.pf-plate__label')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
          box: (() => { const r = el.querySelector('.pf-plate__art').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })(),
        })),
        demoNote: panel.querySelector('[data-demo-note]')?.textContent.trim() ?? '',
      };
    });
    check('womenswear is a reference preview, not published work',
      integrity.publication === 'reference-preview', integrity.publication);
    check('the queue is marked as references', integrity.panelKind === 'reference', String(integrity.panelKind));
    check('items are counted as references, not projects',
      /^Reference \d\d$/.test(integrity.counter), integrity.counter);
    check('the non-authorship disclaimer is present',
      integrity.noticePresent && /no authorship of photographed garments is claimed/i.test(integrity.noticeText));
    check('the disclaimer is body size, not fine print',
      integrity.noticeFontPx >= 14, `${integrity.noticeFontPx}px`);
    check('no reference is given a project profile', integrity.profileRows === 0, String(integrity.profileRows));
    check('no reference is given project text', integrity.projectArticles === 0, String(integrity.projectArticles));
    check('no capability tags on references', integrity.tagRows === 0, String(integrity.tagRows));
    check('the reference panel explains what it is', integrity.referencePanel);
    check('the non-authorship disclaimer is stated exactly once in the chapter',
      integrity.noticeCount === 1, String(integrity.noticeCount));

    /* V7 §F. The three development stages are VISIBLE in the reference state
       rather than hidden, on one condition: a plate that holds nothing must
       say so. It carries no image, it is stamped DEMO, and the strip above it
       says the real project assets are pending — so a placeholder can never be
       read as evidence, and the panel still shows what the chapter is for.
       This replaces the earlier "hide the strip entirely" rule. */
    check('the three development stages are present, in order',
      integrity.plates.map((pl) => pl.stage).join(',') === 'sketch,pattern,simulation',
      integrity.plates.map((pl) => pl.stage).join(','));
    check('every development plate is marked as a demo',
      integrity.plates.length === 3 && integrity.plates.every((pl) => pl.demo && /demo/i.test(pl.stamp)),
      JSON.stringify(integrity.plates.map((pl) => pl.stamp)));
    check('no demo plate borrows an image',
      integrity.plates.every((pl) => pl.images === 0), JSON.stringify(integrity.plates.map((pl) => pl.images)));
    check('the strip says the real assets are pending',
      /real project assets pending/i.test(integrity.demoNote), integrity.demoNote || 'none');
    check('the plates are step-labelled sketch, 2D pattern, 3D simulation',
      integrity.plates.map((pl) => pl.label).join(' | ')
        === 'Step 01 Sketch | Step 02 2D Pattern | Step 03 3D Simulation',
      integrity.plates.map((pl) => pl.label).join(' | '));
    check('the plates are large, not thumbnails',
      integrity.plates.every((pl) => pl.box[0] >= 180 && pl.box[1] >= 140),
      JSON.stringify(integrity.plates.map((pl) => pl.box)));
    /* THREE EQUAL PLATES, ONE ABOVE THE OTHER. Three steps of one sequence
       read as three identical frames top to bottom — not two and a feature. */
    const platesGeo = await p.evaluate(() => {
      const list = [...document.querySelectorAll('.pf-panel:not([hidden]) .pf-plate')];
      const boxes = list.map((el) => el.querySelector('.pf-plate__art').getBoundingClientRect());
      return {
        widths: boxes.map((b) => Math.round(b.width)),
        heights: boxes.map((b) => Math.round(b.height)),
        lefts: boxes.map((b) => Math.round(b.left)),
        stacked: boxes.every((b, i) => i === 0 || b.top >= boxes[i - 1].bottom - 2),
        links: document.querySelectorAll('.pf-panel:not([hidden]) .pf-plate__link').length,
      };
    });
    check('the three plates are the same size',
      Math.max(...platesGeo.widths) - Math.min(...platesGeo.widths) <= 1
      && Math.max(...platesGeo.heights) - Math.min(...platesGeo.heights) <= 1,
      `${platesGeo.widths.join('/')} x ${platesGeo.heights.join('/')}`);
    check('the three plates are stacked vertically in one column',
      platesGeo.stacked && new Set(platesGeo.lefts).size === 1,
      `${platesGeo.lefts.join(',')} stacked ${platesGeo.stacked}`);
    check('the progression between steps is drawn', platesGeo.links === 2, String(platesGeo.links));

    /* V7 §H/§S. No card language on garment imagery: no shadow, no border, no
       framed white rectangle. Depth comes from overlap, scale and stacking
       order alone. */
    const cardLanguage = await p.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll('.pf-panel:not([hidden]) .pf-slot, .pf-panel:not([hidden]) .pf-slot *, .pf-cover__garment')) {
        const st = getComputedStyle(el);
        if (st.boxShadow !== 'none') bad.push(`${el.className} shadow ${st.boxShadow}`);
        if (st.borderTopWidth !== '0px' || st.borderLeftWidth !== '0px'
          || st.borderRightWidth !== '0px' || st.borderBottomWidth !== '0px') bad.push(`${el.className} border`);
        if (st.borderRadius !== '0px') bad.push(`${el.className} radius`);
      }
      return bad.slice(0, 5);
    });
    check('no shadow, border or radius anywhere on garment imagery',
      cardLanguage.length === 0, cardLanguage.join(' | '));

    /* V7 §I. The viewer sits in a white band that runs the whole width of the
       viewport — not a white rectangle inside the beige page. */
    const studio = await p.evaluate(() => {
      const band = document.querySelector('[data-world="womenswear"] .pf-studio');
      const r = band.getBoundingClientRect();
      const st = getComputedStyle(band);
      return {
        width: Math.round(r.width),
        left: Math.round(r.left),
        viewport: document.documentElement.clientWidth,
        background: st.backgroundColor,
        border: st.borderTopWidth + st.borderLeftWidth,
      };
    });
    check('the garment viewer sits in a full-bleed white band',
      studio.left === 0 && studio.width >= studio.viewport - 1
        && studio.background === 'rgb(255, 255, 255)' && studio.border === '0px0px',
      JSON.stringify(studio));

    /* V7 §E. 62-68% deck, 32-38% development panel. */
    const split = await p.evaluate(() => {
      const viewer = document.querySelector('.pf-panel:not([hidden]) .pf-viewer');
      const deck = viewer.querySelector('.pf-deck').getBoundingClientRect();
      const dev = viewer.querySelector('.pf-devcol').getBoundingClientRect();
      const total = deck.width + dev.width;
      return { deck: deck.width / total, dev: dev.width / total, sideBySide: dev.left > deck.right - 2 };
    });
    check('the deck takes 62-68% of the viewer',
      split.sideBySide && split.deck >= 0.60 && split.deck <= 0.69, `${Math.round(split.deck * 100)}%`);
    check('the development panel takes 32-38% of the viewer',
      split.dev >= 0.31 && split.dev <= 0.40, `${Math.round(split.dev * 100)}%`);

    /* V7 §L. The run bar is editorial: two arrows and a count, no boxes. */
    const runbar = await p.evaluate(() => {
      const bar = document.querySelector('.pf-panel:not([hidden]) .pf-runbar');
      const steps = [...bar.querySelectorAll('.pf-step')];
      return {
        text: bar.textContent.replace(/\s+/g, ' ').trim(),
        insideStudio: !!bar.closest('.pf-studio'),
        boxed: steps.filter((el) => {
          const st = getComputedStyle(el);
          return st.borderTopWidth !== '0px' || st.backgroundColor !== 'rgba(0, 0, 0, 0)';
        }).length,
      };
    });
    check('the run bar reads REFERENCE nn / 17', /^Reference \d\d \/ 17$/i.test(runbar.text), runbar.text);
    check('the run bar sits inside the garment band', runbar.insideStudio);
    check('the run bar arrows are not square buttons', runbar.boxed === 0, String(runbar.boxed));

    /* V7 §M. The paragraph that used to fill the right-hand panel is gone. */
    const oldPanelCopy = await p.evaluate(() => /will appear in this panel once the real/i.test(document.body.innerText));
    check('the placeholder paragraph no longer fills the development panel', oldPanelCopy === false);

    /* No construction history may be inferred from a photograph. These are the
       exact claim types an earlier pass read off the pictures. */
    const claims = await p.evaluate(() => {
      const text = document.body.innerText;
      const banned = [
        /\bbias[- ]cut\b/i, /\bgrading\b/i, /\bfit correction\b/i,
        /\bpattern development\b/i, /\bnegative ease\b/i, /\bdart\b/i,
        /\bseam placement\b/i, /\bstitch class\b/i,
      ];
      return banned.filter((re) => re.test(text)).map((re) => String(re));
    });
    check('no construction claim is inferred from the reference photographs',
      claims.length === 0, claims.join(' '));

    const projectWord = await p.evaluate(() => /\b\d+\s+projects\b/i.test(document.body.innerText));
    check('no "N projects" claim while nothing is verified', projectWord === false);

    await c.close();
  }

  // ---- the subchapter index, the folio library and the ten-session reel
  console.log('\nportfolio chapter interiors');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openWomenswear(p);

    /* V7 §D. The five categories are the first thing inside the chapter, as
       large numbered editorial bands stacked down the page — not a tab strip,
       not pills, and not a one-line menu. Exactly one carries the signal. */
    const index = await p.evaluate(() => {
      const bands = [...document.querySelectorAll('[data-world="womenswear"] .pf-band')];
      const viewer = document.querySelector('[data-world="womenswear"] .pf-studio');
      return {
        count: bands.length,
        stacked: bands.every((b, i) => i === 0
          || b.getBoundingClientRect().top >= bands[i - 1].getBoundingClientRect().bottom - 2),
        heights: bands.map((b) => Math.round(b.getBoundingClientRect().height)),
        labelPx: bands.map((b) => Math.round(parseFloat(getComputedStyle(b.querySelector('.pf-band__label')).fontSize))),
        selected: bands.filter((b) => b.getAttribute('aria-pressed') === 'true').length,
        signals: bands.filter((b) => getComputedStyle(b.querySelector('.pf-band__mark')).opacity === '1').length,
        previews: bands.filter((b) => b.querySelector('.pf-band__preview img')).length,
        beforeViewer: bands[0].getBoundingClientRect().top < viewer.getBoundingClientRect().top,
      };
    });
    check('five subchapter bands', index.count === 5, String(index.count));
    check('the bands are stacked, not a row of tabs', index.stacked, index.heights.join(','));
    check('the bands are editorial, not menu type',
      index.labelPx.every((px) => px >= 24), index.labelPx.join(','));
    check('the index comes before the viewer', index.beforeViewer);
    check('exactly one band is selected', index.selected === 1, String(index.selected));
    check('exactly one orange signal in the index', index.signals === 1, String(index.signals));
    check('each band carries one restrained preview', index.previews === 5, String(index.previews));

    /* Selecting a band swaps the deck under it. */
    const switched = await p.evaluate(async () => {
      const bands = [...document.querySelectorAll('[data-world="womenswear"] .pf-band')];
      bands[3].click();
      await new Promise((r) => setTimeout(r, 400));
      const panel = document.querySelector('[data-world="womenswear"] .pf-panel:not([hidden])');
      return {
        panel: panel.dataset.panel,
        count: Number(panel.dataset.count),
        selected: bands.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.category),
      };
    });
    check('selecting a band swaps the deck',
      switched.panel === 'evening' && switched.count === 11, JSON.stringify(switched));
    check('selection stays singular', switched.selected.length === 1, switched.selected.join(','));

    await p.keyboard.press('Escape');
    await p.waitForTimeout(700);

    // ---- Tech Packs: a folio table, not a directory
    await p.evaluate(() => document.querySelector('[data-chapter="tech-packs"]').click());
    await p.waitForTimeout(900);
    const library = await p.evaluate(() => {
      const world = document.querySelector('[data-world="tech-packs"]');
      const open = world.querySelector('.pf-folio:not([hidden])');
      const docs = [...world.querySelectorAll('[data-doc]')];
      return {
        packs: world.querySelectorAll('[data-dossier]').length,
        openFolios: world.querySelectorAll('.pf-folio:not([hidden])').length,
        edges: open.querySelectorAll('.pf-folio__edge').length,
        spine: !!open.querySelector('.pf-folio__spine'),
        scan: open.querySelector('.pf-folio__scan')?.getAttribute('src') ?? '',
        kind: open.querySelector('.pf-folio__kind')?.textContent.trim() ?? '',
        pdf: open.querySelector('[data-open-pdf]')?.getAttribute('href') ?? '',
        openLabel: open.querySelector('[data-open-pdf]')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
        indexNumbers: docs.map((d) => d.querySelector('.pf-doc__num').textContent.trim()),
        pileSheets: world.querySelectorAll('.pf-library__pile i').length,
        selected: docs.filter((d) => d.getAttribute('aria-pressed') === 'true').length,
      };
    });
    check('five dossiers on the table', library.packs === 5, String(library.packs));
    check('one folio is open at a time', library.openFolios === 1, String(library.openFolios));
    check('the open folio is a bound object with page edges',
      library.edges === 3 && library.spine, `${library.edges} edges, spine ${library.spine}`);
    check('the open folio shows the document\'s own first page',
      /^\/demo\/techpacks\/demo-\d\d-[a-z-]+-p1\.webp$/.test(library.scan), library.scan);
    check('the folio is labelled a demo pack', /demo pack/i.test(library.kind), library.kind);
    check('the rest of the library lies behind it', library.pileSheets === 3, String(library.pileSheets));
    check('the side index runs 01 to 05',
      library.indexNumbers.join(',') === '01,02,03,04,05', library.indexNumbers.join(','));
    check('exactly one dossier is selected', library.selected === 1, String(library.selected));
    check('the control opens the dossier', /open dossier/i.test(library.openLabel), library.openLabel);
    check('the dossier is a real demo PDF', /^\/demo\/techpacks\/demo-\d\d-[a-z-]+\.pdf$/.test(library.pdf), library.pdf);

    /* The demo documents must be served, not merely linked. */
    const pdf = await p.evaluate(async (href) => {
      const res = await fetch(href);
      return { status: res.status, type: res.headers.get('content-type') };
    }, library.pdf);
    check('the demo pack is actually served', pdf.status === 200 && /pdf/i.test(pdf.type ?? ''), JSON.stringify(pdf));

    const swapped = await p.evaluate(async () => {
      const docs = [...document.querySelectorAll('[data-world="tech-packs"] [data-doc]')];
      docs[2].click();
      await new Promise((r) => setTimeout(r, 350));
      const open = document.querySelector('[data-world="tech-packs"] .pf-folio:not([hidden])');
      return { id: open.dataset.dossier, pdf: open.querySelector('[data-open-pdf]').getAttribute('href') };
    });
    check('the index changes the open dossier',
      swapped.id === 'tp-03' && swapped.pdf.includes('demo-03'), JSON.stringify(swapped));

    await p.keyboard.press('Escape');
    await p.waitForTimeout(700);

    // ---- 3D: ten session slots, one recording, nothing invented
    await p.evaluate(() => document.querySelector('[data-chapter="3d-simulation"]').click());
    await p.waitForTimeout(900);
    const reel = await p.evaluate(() => {
      const world = document.querySelector('[data-world="3d-simulation"]');
      const sessions = [...world.querySelectorAll('[data-session]')];
      const frames = [...world.querySelectorAll('.pf-frame')];
      return {
        sessions: sessions.length,
        frames: frames.length,
        playable: sessions.filter((sn) => sn.querySelector('[data-play]')).length,
        pending: sessions.filter((sn) => sn.hasAttribute('data-pending')).length,
        youtubeIds: sessions.map((sn) => sn.dataset.youtube).filter(Boolean),
        pendingPlayControls: sessions
          .filter((sn) => sn.hasAttribute('data-pending'))
          .filter((sn) => sn.querySelector('[data-play]')).length,
        stripIsRow: (() => {
          const boxes = frames.map((f) => f.getBoundingClientRect());
          return boxes.every((b) => Math.abs(b.top - boxes[0].top) < 2);
        })(),
        firstKind: world.querySelector('.pf-session__kind')?.textContent.trim() ?? '',
      };
    });
    check('ten session slots exist', reel.sessions === 10, String(reel.sessions));
    check('the reel is a film strip, not a grid of cards',
      reel.frames === 10 && reel.stripIsRow, `${reel.frames} frames, one row ${reel.stripIsRow}`);
    check('exactly one session plays', reel.playable === 1, String(reel.playable));
    check('nine sessions are pending', reel.pending === 9, String(reel.pending));
    check('no YouTube id is invented', reel.youtubeIds.length === 0, reel.youtubeIds.join(','));
    check('a pending slot never offers a play control that does nothing',
      reel.pendingPlayControls === 0, String(reel.pendingPlayControls));

    /* A pending slot shows its design state, never a broken player. */
    const pendingSlot = await p.evaluate(async () => {
      const world = document.querySelector('[data-world="3d-simulation"]');
      world.querySelectorAll('[data-session-link]')[1].click();
      await new Promise((r) => setTimeout(r, 350));
      const open = world.querySelector('[data-session]:not([hidden])');
      return {
        id: open.dataset.session,
        text: (open.querySelector('.pf-pending')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        players: open.querySelectorAll('[data-player] > *').length,
        play: open.querySelectorAll('[data-play]').length,
        kind: open.querySelector('.pf-session__kind')?.textContent.trim() ?? '',
      };
    });
    check('a pending slot says which session it is waiting for',
      /video session 02/i.test(pendingSlot.text) && /youtube session pending/i.test(pendingSlot.text),
      pendingSlot.text || 'none');
    check('a pending slot renders no player and no play control',
      pendingSlot.players === 0 && pendingSlot.play === 0, JSON.stringify(pendingSlot));
    check('a pending slot is not labelled as a published working session',
      /not published/i.test(pendingSlot.kind), pendingSlot.kind);

    await c.close();
  }

  // ---- the desktop rule is five, and 1024 is a desktop
  console.log('\nportfolio queue at 1024');
  {
    const c = await browser.newContext({ viewport: { width: 1024, height: 820 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(700);
    await openWomenswear(p);

    const state = await p.evaluate(() => window.__portfolioRunway.getState());
    check('1024 shows five images at once', state.visibleNow === 5, `visible ${state.visibleNow}`);
    check('1024 target slot count is five', state.visibleTarget === 5, String(state.visibleTarget));
    check('1024 active item still leads the deck', state.activeIsLeading === true);
    check('1024 cards genuinely overlap', state.overlaps >= 4, `${state.overlaps} overlaps`);

    const geo = await p.evaluate(() => {
      const stage = document.querySelector('.pf-panel:not([hidden]) .pf-stage').getBoundingClientRect();
      const slots = [...document.querySelectorAll('.pf-panel:not([hidden]) .pf-slot')]
        .filter((s) => !s.hidden).map((s) => s.getBoundingClientRect()).sort((a, b) => a.left - b.left);
      return {
        widths: slots.map((s) => Math.round(s.width)),
        inside: slots.every((s) => s.left >= stage.left - 1 && s.right <= stage.right + 1),
      };
    });
    check('1024 keeps every image inside the stage', geo.inside, geo.widths.join(','));
    check('1024 cards still grow toward the leading edge',
      geo.widths.every((w, i) => i === 0 || w > geo.widths[i - 1]), geo.widths.join(' < '));
    check('1024 furthest card is still substantial', Math.min(...geo.widths) >= 180, `${Math.min(...geo.widths)}px`);
    check('no horizontal overflow at 1024',
      await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await c.close();
  }

  // ---- mobile: three projects, still leading-left
  console.log('\nportfolio queue at 390');
  {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(700);
    await openWomenswear(p);

    const state = await p.evaluate(() => window.__portfolioRunway.getState());
    check('mobile shows three projects at once', state.visibleNow === 3, `visible ${state.visibleNow}`);
    check('mobile target slot count is three', state.visibleTarget === 3);
    check('mobile active item still leads the deck', state.activeIsLeading === true);
    check('mobile cards genuinely overlap', state.overlaps >= 2, `${state.overlaps} overlaps`);

    check('the disclaimer survives to 390',
      await p.evaluate(() => {
        const n = document.querySelector('[data-reference-notice]');
        return !!n && parseFloat(getComputedStyle(n).fontSize) >= 14;
      }));

    const overflow = await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    check('no horizontal overflow at 390', overflow);
    await c.close();
  }

  // ---- reduced motion: everything still reachable, nothing left mid-tween
  console.log('\nreduced motion');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openWomenswear(p);

    await p.evaluate(() => document.querySelector('.pf-panel:not([hidden]) [data-stage]').focus());
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(120);
    const state = await p.evaluate(() => window.__portfolioRunway.getState());
    check('queue settles instantly under reduced motion', Number.isInteger(state.position), `position ${state.position}`);
    check('reduced motion still advances the project', state.activeIndex === 1, String(state.activeIndex));
    check('reduced motion keeps five projects visible', state.visibleNow === 5, String(state.visibleNow));

    const noTween = await p.evaluate(() => {
      const slot = document.querySelector('.pf-panel:not([hidden]) .pf-slot');
      return getComputedStyle(slot).transitionDuration === '0s';
    });
    check('no decorative transition left running', noTween);

    const revealed = await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every((e) => getComputedStyle(e).opacity === '1'));
    check('reveal blocks visible without scrolling', revealed);
    await c.close();
  }

  // ---- click-to-load video: the player is created by the click, not the page
  console.log('\n3D simulation player');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    const mediaRequests = [];
    p.on('request', (r) => { if (/youtube|ytimg|googlevideo|\.mp4$/i.test(r.url())) mediaRequests.push(r.url()); });
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(800);
    check('no video or YouTube request on page load', mediaRequests.length === 0, mediaRequests.join(','));

    await p.evaluate(() => document.querySelector('[data-chapter="3d-simulation"]').click());
    await p.waitForTimeout(700);
    check('no player element before play',
      await p.evaluate(() => document.querySelectorAll('[data-player] > *').length === 0));

    await p.evaluate(() => document.querySelector('[data-session] [data-play]').click());
    await p.waitForTimeout(600);
    const played = await p.evaluate(() => {
      const mount = document.querySelector('[data-player]');
      return { children: mount.children.length, tag: mount.firstElementChild?.tagName ?? null, hidden: mount.hidden };
    });
    check('play creates the player', played.children === 1 && !played.hidden, JSON.stringify(played));
    check('player is a real media element', played.tag === 'VIDEO' || played.tag === 'IFRAME', String(played.tag));
    await c.close();
  }

  // ---- without JavaScript the work is still there
  console.log('\nportfolio without JavaScript');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    const noJs = await p.evaluate === undefined ? null : await p.evaluate(() => 1).catch(() => null);
    const html = await p.content();
    check('all four worlds are in the served HTML',
      ['womenswear', 'menswear', 'tech-packs', '3d-simulation'].every((id) => html.includes(`data-world="${id}"`)));
    check('the non-authorship disclaimer is server-rendered', html.includes('No authorship of photographed garments is claimed'));
    check('the approved categories are server-rendered', html.includes('Evening &#38; Occasionwear') || html.includes('Evening &amp; Occasionwear') || html.includes('Evening & Occasionwear'));
    check('the unpublished chapter states its own status without the script',
      html.includes('Selected menswear work will be published here'));
    check('the demo documents are declared as demos without the script',
      html.includes('Demo documents for interface review')
      && html.includes('Demo pack — interface prototype'));
    check('the development plates are declared as demos without the script',
      html.includes('Demo layout — real project assets pending'));
    const visible = await p.evaluate(() => {
      const slots = [...document.querySelectorAll('.pf-slot')];
      const shown = slots.filter((s) => s.getBoundingClientRect().width > 20);
      return { total: slots.length, shown: shown.length };
    });
    check('garment images are laid out without the script', visible.shown > 5, `${visible.shown} of ${visible.total}`);
    void noJs;
    await c.close();
  }

  // ---- Home portrait is one transparent cut-out, never a mirrored duplicate
  console.log('\nHome portrait treatment');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const portrait = await p.evaluate(() => ({
      imageCount: document.querySelectorAll('.home-hero__portrait img').length,
      duplicateShadow: !!document.querySelector('.home-hero__shadow'),
      alt: document.querySelector('.home-hero__portrait img')?.getAttribute('alt') ?? '',
    }));
    check('Home renders one portrait image', portrait.imageCount === 1, String(portrait.imageCount));
    check('the rejected mirrored portrait shadow is absent', portrait.duplicateShadow === false);
    check('the portrait keeps meaningful alternative text', portrait.alt.includes('Soufiane Aberbach'), portrait.alt);
    await c.close();
  }

  // ---- contact form still validates without submitting
  console.log('\ncontact form validation');
  {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });
    await p.click('[data-submit]');
    await p.waitForTimeout(350);
    const form = await p.evaluate(() => ({
      errors: document.querySelectorAll('[data-err]:not([hidden])').length,
      navigated: location.pathname,
      action: document.querySelector('[data-brief-form]').getAttribute('action'),
      // unique: the five stage radios all share name="stage" by design
      names: [...new Set([...document.querySelectorAll('[data-brief-form] [name]')].map((e) => e.name))].sort().join(','),
    }));
    check('required fields report errors', form.errors >= 3, `${form.errors} shown`);
    check('did not navigate away', form.navigated === '/contact/');
    check('endpoint contract intact', form.action === '/api/brief', form.action);
    /* `file` joined the set when the upload control landed. The assertion still
       pins the EXACT set — it is a wire contract with the Worker, not a
       minimum — so an accidental rename or a dropped field still fails here. */
    check('field names match the Worker contract', form.names === 'company,email,file,link,message,name,stage,t,website', form.names);
    await c.close();
  }

  // ---- the upload control is present, usable and honestly labelled
  console.log('\nreference upload control');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });

    const up = await p.evaluate(() => {
      const input = document.getElementById('bf-file');
      const label = document.querySelector('.bf__drop-label');
      const cs = input ? getComputedStyle(input) : null;
      return {
        exists: !!input,
        type: input?.type,
        name: input?.name,
        /* Visually hidden, but never display:none — that would drop it from
           the tab order and from assistive tech. */
        notDisplayNone: cs?.display !== 'none',
        focusable: input ? input.tabIndex !== -1 : false,
        labelFor: label?.getAttribute('for'),
        describedBy: input?.getAttribute('aria-describedby') ?? '',
        accept: input?.getAttribute('accept') ?? '',
        hint: document.getElementById('bf-file-hint')?.textContent.trim() ?? '',
        chosenHidden: document.querySelector('[data-file-chosen]')?.hidden,
        chosenLive: document.querySelector('[data-file-chosen]')?.getAttribute('aria-live'),
        linkIsSecondary: !!document.querySelector('.bf__attach-alt-tag'),
        errSlot: !!document.querySelector('[data-err="file"]'),
      };
    });

    check('upload input exists and is a file input', up.exists && up.type === 'file', String(up.type));
    check('it posts as the field the Worker reads', up.name === 'file', String(up.name));
    check('it is not display:none, so it stays focusable', up.notDisplayNone && up.focusable);
    check('its label points at it', up.labelFor === 'bf-file', String(up.labelFor));
    check('it is described by the hint and the error slot', up.describedBy.includes('bf-file-hint') && up.describedBy.includes('bf-file-err'), up.describedBy);
    check('it has a file-type error slot', up.errSlot);
    check('accept lists the four launch formats', ['pdf', 'jpg', 'jpeg', 'png', 'webp'].every((e) => up.accept.includes(e)), up.accept);
    check('accept offers no Office format', !/docx?|xlsx?|pptx?/.test(up.accept), up.accept);
    check('accept offers no executable type', !/exe|\.js|sh|bat|cmd|apk|dmg/.test(up.accept), up.accept);
    check('the hint states the size limit', /10 MB/.test(up.hint), up.hint);
    check('the hint names only PDF and images', /PDF/.test(up.hint) && !/Word|Excel|PowerPoint/.test(up.hint), up.hint);
    check('nothing is shown as chosen on load', up.chosenHidden === true);
    check('the chosen row announces politely', up.chosenLive === 'polite', String(up.chosenLive));
    check('the link is presented as the alternative', up.linkIsSecondary);

    /* Selecting a real file must surface its name and size, and removing it
       must restore the empty state — the whole point for a non-technical
       visitor is that they can see what they attached. */
    await p.setInputFiles('#bf-file', {
      name: 'tech-pack.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n' + 'x'.repeat(4000)),
    });
    await p.waitForTimeout(200);
    const picked = await p.evaluate(() => ({
      shown: !document.querySelector('[data-file-chosen]').hidden,
      name: document.querySelector('[data-file-name]').textContent,
      size: document.querySelector('[data-file-size]').textContent,
      noError: document.querySelector('[data-err="file"]').hidden,
    }));
    check('the chosen filename becomes visible', picked.shown && picked.name === 'tech-pack.pdf', String(picked.name));
    check('the file size becomes visible', /KB|MB|B/.test(picked.size), String(picked.size));
    check('a valid file raises no error', picked.noError);

    await p.click('[data-file-remove]');
    await p.waitForTimeout(150);
    const removed = await p.evaluate(() => ({
      hidden: document.querySelector('[data-file-chosen]').hidden,
      empty: document.getElementById('bf-file').files.length === 0,
      focused: document.activeElement.id === 'bf-file',
    }));
    check('remove clears the selection', removed.hidden && removed.empty);
    check('remove returns focus to the control', removed.focused);

    /* An oversized file is reported here rather than after a round trip, and
       reporting it must not discard what the visitor typed. */
    await p.fill('[name="name"]', 'Test Client');
    await p.fill('[name="message"]', 'We need a fit correction on a jersey top.');
    await p.setInputFiles('#bf-file', { name: 'huge.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(11 * 1024 * 1024, 1) });
    await p.waitForTimeout(200);
    const over = await p.evaluate(() => ({
      err: document.querySelector('[data-err="file"]').textContent,
      shown: !document.querySelector('[data-err="file"]').hidden,
      nameKept: document.querySelector('[name="name"]').value,
      messageKept: document.querySelector('[name="message"]').value.length,
    }));
    check('an oversized file is refused in the page', over.shown && /10 MB/.test(over.err), over.err);
    check('and nothing typed is lost', over.nameKept === 'Test Client' && over.messageKept > 20);

    await c.close();
  }

  // ---- Turnstile token lifecycle
  //
  // Turnstile tokens are single-use and siteverify consumes one, so a failed
  // submission must leave the form with a FRESH token or the retry is rejected
  // for the wrong reason. The real widget cannot run here — it needs a site key
  // baked in at build time and a reachable challenges.cloudflare.com — so the
  // widget container and window.turnstile are stubbed and window.fetch is
  // scripted. What is under test is the page's own reset decision, which is the
  // part that regressed.
  console.log('\nTurnstile reset on failed submission');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());

    /* Installs the stubs, fills the form validly, submits, and reports how many
       times turnstile.reset was called. `outcome` scripts what the endpoint
       returns: a rejection, an error payload, or a success. */
    const submitWith = async (outcome) => {
      await p.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });
      await p.evaluate((mode) => {
        const form = document.querySelector('[data-brief-form]');
        /* The container the real api.js would have rendered into. */
        const widget = document.createElement('div');
        widget.id = 'brief-turnstile';
        widget.className = 'bf__turnstile cf-turnstile';
        widget.setAttribute('data-action', 'contact_brief');
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'cf-turnstile-response';
        hidden.value = 'stub-token';
        widget.appendChild(hidden);
        form.appendChild(widget);

        /* Recorded verbatim. The documented contract is that reset receives the
           documented CSS-selector form, not an element. */
        window.__resets = [];
        window.turnstile = { reset: (target) => { window.__resets.push(typeof target === 'string' ? target : '[non-string: ' + Object.prototype.toString.call(target) + ']'); } };

        window.fetch = () => {
          if (mode === 'network') return Promise.reject(new TypeError('fetch failed'));
          if (mode === 'error') {
            return Promise.resolve(new Response(JSON.stringify({ ok: false, error: 'The brief could not be saved.' }), {
              status: 502, headers: { 'content-type': 'application/json' },
            }));
          }
          if (mode === 'field') {
            return Promise.resolve(new Response(JSON.stringify({ ok: false, error: 'That email address does not look complete.', field: 'email' }), {
              status: 400, headers: { 'content-type': 'application/json' },
            }));
          }
          return Promise.resolve(new Response(JSON.stringify({ ok: true, id: 'smoke-test-reference' }), {
            status: 200, headers: { 'content-type': 'application/json' },
          }));
        };

        form.querySelector('[name="name"]').value = 'Smoke Test';
        form.querySelector('[name="email"]').value = 'smoke@example.com';
        form.querySelector('[name="message"]').value = 'A message long enough to pass validation.';
        form.querySelector('[name="stage"]').checked = true;
      }, outcome);

      await p.click('[data-submit]');
      await p.waitForTimeout(350);
      return p.evaluate(() => ({
        resets: window.__resets.length,
        target: window.__resets[0] ?? null,
        formHidden: document.querySelector('[data-brief-form]').hidden,
      }));
    };

    const serverError = await submitWith('error');
    check('reset exactly once after a server error', serverError.resets === 1, `${serverError.resets} resets`);
    check('reset target is exactly "#brief-turnstile"', serverError.target === '#brief-turnstile', String(serverError.target));

    const fieldError = await submitWith('field');
    check('reset exactly once after a field error', fieldError.resets === 1, `${fieldError.resets} resets`);
    check('field-error reset target is exactly "#brief-turnstile"', fieldError.target === '#brief-turnstile', String(fieldError.target));

    const networkError = await submitWith('network');
    check('reset exactly once after a network failure', networkError.resets === 1, `${networkError.resets} resets`);
    check('network-failure reset target is exactly "#brief-turnstile"', networkError.target === '#brief-turnstile', String(networkError.target));

    const ok = await submitWith('ok');
    check('NOT reset after a successful submission', ok.resets === 0, `${ok.resets} resets`);
    check('success still replaces the form', ok.formHidden === true);

    /* The guard matters as much as the call: with no site key there is no
       widget and no api.js, and the page must not throw on submit. */
    await p.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });
    const bare = await p.evaluate(async () => {
      const errors = [];
      window.addEventListener('error', (e) => errors.push(String(e.message)));
      const form = document.querySelector('[data-brief-form]');
      window.fetch = () => Promise.reject(new TypeError('fetch failed'));
      form.querySelector('[name="name"]').value = 'Smoke Test';
      form.querySelector('[name="email"]').value = 'smoke@example.com';
      form.querySelector('[name="message"]').value = 'A message long enough to pass validation.';
      form.querySelector('[name="stage"]').checked = true;
      form.querySelector('[data-submit]').click();
      await new Promise((r) => setTimeout(r, 300));
      return { errors, hasWidget: !!document.querySelector('.cf-turnstile'), alertShown: !document.querySelector('[data-alert]').hidden };
    });
    check('no Turnstile widget without a build-time site key', bare.hasWidget === false);
    check('failed submit throws nothing when Turnstile is absent', bare.errors.length === 0, JSON.stringify(bare.errors));
    check('the failure is still reported to the visitor', bare.alertShown === true);

    await c.close();
  }

  // ---- the REAL Turnstile widget markup
  //
  // The shipped dist/ is built without a site key, so it contains no widget at
  // all — which is correct, and is why the reset tests above inject a stand-in.
  // That cannot prove the widget Astro actually renders carries the id the
  // reset targets or the action the Worker requires. So this builds the site
  // once more WITH a site key into a temp directory and serves it from a
  // throwaway static server.
  //
  // The key below is Cloudflare's documented always-passes TEST site key. It
  // is used here only to make the widget render in a test build; production
  // uses a real key supplied at deploy time.
  console.log('\nreal Turnstile widget markup');
  {
    const outDir = mkdtempSync(join(tmpdir(), 'smoke-turnstile-'));
    let staticServer;
    try {
      const built = spawnSync(process.execPath, [astroCli, 'build', '--outDir', outDir], {
        env: { ...process.env, PUBLIC_TURNSTILE_SITEKEY: '1x00000000000000000000AA' },
        encoding: 'utf8',
      });
      check('site-key build succeeded', built.status === 0, (built.stderr || '').slice(-300));

      /* Smallest thing that can serve a static directory: no dependency, and
         it goes away with this block. */
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.webm': 'video/webm', '.woff2': 'font/woff2' };
      staticServer = createServer(async (req, res) => {
        const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        const file = join(outDir, path.endsWith('/') ? path + 'index.html' : path);
        try {
          const data = await readFileAsync(file);
          res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
          res.end(data);
        } catch {
          res.writeHead(404, { 'content-type': 'text/plain' });
          res.end('not found');
        }
      });
      const PORT2 = PORT + 1;
      await new Promise((resolve) => staticServer.listen(PORT2, HOST, resolve));
      const BASE2 = `http://${HOST}:${PORT2}`;

      const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await c.newPage();
      await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
      /* The real api.js is not reachable from CI and is not what is under
         test; window.turnstile is stubbed below instead. */
      await p.route('**://challenges.cloudflare.com/**', (r) => r.abort());
      await p.goto(BASE2 + '/contact/', { waitUntil: 'domcontentloaded' });

      const widget = await p.evaluate(() => {
        const el = document.getElementById('brief-turnstile');
        if (!el) return null;
        const form = document.querySelector('[data-brief-form]');
        return {
          id: el.id,
          action: el.getAttribute('data-action'),
          classes: el.className,
          hasSitekey: el.hasAttribute('data-sitekey'),
          insideForm: !!form && form.contains(el),
          /* Selector-form lookup is what resetTurnstile uses. */
          resolvesBySelector: document.querySelector('#brief-turnstile') === el,
          apiScript: !!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]'),
        };
      });

      check('widget renders when a site key is present', widget !== null);
      check('widget id is "brief-turnstile"', widget?.id === 'brief-turnstile', String(widget?.id));
      check('widget has data-action="contact_brief"', widget?.action === 'contact_brief', String(widget?.action));
      check('widget keeps the implicit-render cf-turnstile class', String(widget?.classes).split(/\s+/).includes('cf-turnstile'), String(widget?.classes));
      check('widget keeps its styling hook', String(widget?.classes).split(/\s+/).includes('bf__turnstile'), String(widget?.classes));
      check('widget carries a data-sitekey', widget?.hasSitekey === true);
      check('widget sits inside the brief form', widget?.insideForm === true);
      check('"#brief-turnstile" resolves to that widget', widget?.resolvesBySelector === true);
      check('implicit-render api.js is loaded', widget?.apiScript === true);

      /* And the reset path against the REAL widget, not an injected one. */
      const realReset = await p.evaluate(async () => {
        window.__resets = [];
        window.turnstile = { reset: (target) => { window.__resets.push(typeof target === 'string' ? target : '[non-string]'); } };
        window.fetch = () => Promise.resolve(new Response(JSON.stringify({ ok: false, error: 'The brief could not be saved.' }), {
          status: 502, headers: { 'content-type': 'application/json' },
        }));
        const form = document.querySelector('[data-brief-form]');
        form.querySelector('[name="name"]').value = 'Smoke Test';
        form.querySelector('[name="email"]').value = 'smoke@example.com';
        form.querySelector('[name="message"]').value = 'A message long enough to pass validation.';
        form.querySelector('[name="stage"]').checked = true;
        form.querySelector('[data-submit]').click();
        await new Promise((r) => setTimeout(r, 350));
        return window.__resets;
      });
      check('real widget: reset called exactly once on failure', realReset.length === 1, JSON.stringify(realReset));
      check('real widget: reset target is exactly "#brief-turnstile"', realReset[0] === '#brief-turnstile', String(realReset[0]));

      const realSuccess = await (async () => {
        await p.goto(BASE2 + '/contact/', { waitUntil: 'domcontentloaded' });
        return p.evaluate(async () => {
          window.__resets = [];
          window.turnstile = { reset: (t) => window.__resets.push(t) };
          window.fetch = () => Promise.resolve(new Response(JSON.stringify({ ok: true, id: 'smoke-test-reference' }), {
            status: 200, headers: { 'content-type': 'application/json' },
          }));
          const form = document.querySelector('[data-brief-form]');
          form.querySelector('[name="name"]').value = 'Smoke Test';
          form.querySelector('[name="email"]').value = 'smoke@example.com';
          form.querySelector('[name="message"]').value = 'A message long enough to pass validation.';
          form.querySelector('[name="stage"]').checked = true;
          form.querySelector('[data-submit]').click();
          await new Promise((r) => setTimeout(r, 350));
          return { resets: window.__resets.length, formHidden: form.hidden };
        });
      })();
      check('real widget: successful submission does NOT reset', realSuccess.resets === 0, `${realSuccess.resets} resets`);
      check('real widget: success still replaces the form', realSuccess.formHidden === true);

      await c.close();
    } finally {
      if (staticServer) await new Promise((r) => staticServer.close(r));
      rmSync(outDir, { recursive: true, force: true });
    }
  }

  // ---- direct contact dominates, and the number is readable
  console.log('\ndirect contact hierarchy');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });

    const d = await p.evaluate(() => {
      const size = (el) => (el ? parseFloat(getComputedStyle(el).fontSize) : 0);
      const reach = [...document.querySelectorAll('.ct-reach__value')];
      const actions = [...document.querySelectorAll('.ct-reach__actions a')];
      const platform = document.querySelector('.ct-platforms__list a');
      /* The number is stated ONCE as text with two small actions beside it, so
         the links live in two places now — both are collected. */
      const hrefs = [...reach, ...actions].map((a) => a.getAttribute('href')).filter(Boolean);
      return {
        count: hrefs.length,
        hrefs,
        text: reach.map((a) => a.textContent.replace(/\s+/g, ' ').trim()),
        /* Printing the same eleven digits twice at display size was the
           duplication complaint; assert it appears exactly once that big. */
        bigNumberCount: reach.filter((el) => el.textContent.includes('+212 657 872 090')).length,
        reachSize: size(reach[0]),
        platformSize: size(platform),
        /* Stated once on the page — the footer nav is separate and site-wide. */
        platformGroups: document.querySelectorAll('.ct-platforms').length,
        credentialExists: !!document.querySelector('.ct-credential'),
        credentialB2B: document.querySelector('.ct-credential__facts em')?.textContent ?? '',
        credentialHeadSize: size(document.querySelector('.ct-credential__head')),
        oldEqualGrid: !!document.querySelector('.ct-direct__grid'),
        sectionOrder: ['.ct-direct', '.ct-brief', '.ct-business', '.ct-proof', '.ct-platforms']
          .map((selector) => [...document.querySelectorAll('main > section')].indexOf(document.querySelector(selector))),
      };
    });

    check('three direct routes are offered', d.count === 3, JSON.stringify(d.hrefs));
    check('email is a mailto link', d.hrefs.some((h) => h === 'mailto:soufianeaberbach@gmail.com'), JSON.stringify(d.hrefs));
    check('phone is a tel link', d.hrefs.some((h) => h === 'tel:+212657872090'), JSON.stringify(d.hrefs));
    check('WhatsApp is a wa.me link', d.hrefs.some((h) => h === 'https://wa.me/212657872090'), JSON.stringify(d.hrefs));
    check('the number is readable text, not icon-only', d.text.some((t) => t.includes('+212 657 872 090')), JSON.stringify(d.text));
    check('and it is printed once, not as two giant rows', d.bigNumberCount === 1, String(d.bigNumberCount));
    /* The hierarchy the brief asks for, asserted rather than eyeballed. */
    check('direct contact is set larger than the platform links', d.reachSize > d.platformSize * 1.6, `${d.reachSize} vs ${d.platformSize}`);
    check('the platform group appears exactly once', d.platformGroups === 1, String(d.platformGroups));
    check('the old three-equal-column grid is gone', d.oldEqualGrid === false);
    check('the business credential is present', d.credentialExists);
    check('B2B invoicing is called out', /B2B invoicing available/.test(d.credentialB2B), d.credentialB2B);
    check('the credential headline outranks the platform links', d.credentialHeadSize > d.platformSize * 1.4, `${d.credentialHeadSize} vs ${d.platformSize}`);

    /* A coloured rule sitting directly under words reads as a spell-check
       mark. It is banned from the visual language, so it is asserted away
       rather than left to discipline. Hover states are exempt: this samples
       the resting state only. */
    const underlines = await p.evaluate(() => {
      const signal = getComputedStyle(document.documentElement).getPropertyValue('--signal').trim();
      const hits = [];
      for (const el of document.querySelectorAll('main *')) {
        const cs = getComputedStyle(el);
        const deco = cs.textDecorationLine;
        const decoColor = cs.textDecorationColor;
        if (deco.includes('underline') && decoColor && decoColor !== 'rgb(17, 17, 15)') {
          const isSignal = decoColor.includes('212') || decoColor.includes(signal);
          if (isSignal) hits.push(el.className || el.tagName);
        }
        if (/inset .*-\d/.test(cs.boxShadow) && cs.boxShadow.includes('212')) hits.push((el.className || el.tagName) + ' [box-shadow]');
      }
      return hits;
    });
    check('no orange underline sits beneath text at rest', underlines.length === 0, JSON.stringify(underlines).slice(0, 160));
    check('Contact follows direct → brief → business → proof → platforms',
      d.sectionOrder.every((value, index, values) => value >= 0 && (index === 0 || value > values[index - 1])),
      JSON.stringify(d.sectionOrder));

    await c.close();
  }

  // ---- privacy page reachable from the footer
  console.log('\nprivacy page');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    check('footer links to /privacy/', await p.evaluate(() => !!document.querySelector('.footer-meta a[href="/privacy/"]')));
    const res = await p.goto(BASE + '/privacy/', { waitUntil: 'domcontentloaded' });
    check('/privacy/ responds 200', res?.status() === 200);
    check('retention stated', (await p.content()).includes('90 days'));
    await c.close();
  }
} finally {
  await browser.close();
  stop();
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nfailures:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
