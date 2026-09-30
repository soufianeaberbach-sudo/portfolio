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
import { installFonts } from './fixtures/fonts.mjs';

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
/* Every context renders with the site's real faces — see fixtures/fonts.mjs
   for why that is not a detail. */
const ctxWithFonts = async (options) => {
  const context = await browser.newContext(options);
  await installFonts(context);
  return context;
};

try {
  // ---- routes load, and no horizontal document overflow at any width
  console.log('\nroutes and overflow');
  const ctx = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
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
    const c = await ctxWithFonts({ viewport: { width: 390, height: 844 } });
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
     PORTFOLIO V8

     The presentation was rebuilt around a three-level hierarchy — portfolio
     index, chapter category index, category viewer — so the assertions that
     described the V7 single-screen chapter (the folio table, the film strip,
     the 2+1 development panel, the subchapter bands sitting above a viewer)
     are gone with the interface they protected. Every factual-integrity rule
     they carried alongside is kept and re-asserted here against the new
     architecture.
     ------------------------------------------------------------------------ */
  /* A chapter is opened from its own cover. Womenswear's cover is the frame
     the opening's match cut lands on, so getting to it means running the
     opening out; the other three are sections of their own. With motion off
     there is no camera move to land, and Womenswear takes the same still
     cover the other three have — either way the way in is a .pf-cover__action
     and everything after this point is identical. */
  const openChapter = async (p, id) => {
    let trigger;
    if (id === 'womenswear') {
      const still = p.locator('.pf-cover--still .pf-cover__action');
      if (await still.count() > 0 && await still.isVisible()) {
        trigger = still;
        await trigger.scrollIntoViewIfNeeded();
      } else {
        trigger = p.locator('.pf-women-threshold__action');
        await p.evaluate(() => {
          const cinema = document.querySelector('.pf-cinema');
          scrollTo(0, cinema.offsetTop + cinema.offsetHeight - innerHeight);
        });
      }
    } else {
      trigger = p.locator(`[data-cover="${id}"] .pf-cover__action`);
      await trigger.scrollIntoViewIfNeeded();
    }
    await p.waitForTimeout(900);
    await trigger.evaluate((link) => { link.id = 'smoke-trigger'; });
    await trigger.click();
    await p.waitForTimeout(800);
  };
  const openCategory = async (p, world, category) => {
    await p.evaluate(([w, c]) => {
      document.querySelector(`[data-world="${w}"] a.pf-cat[data-category="${c}"]`).click();
    }, [world, category]);
    await p.waitForTimeout(800);
  };
  /* WOMENSWEAR IS AN ACT, NOT A CATEGORY INDEX.
     Its five territories are movements on one screen, so there is no category
     screen to open: travelling to a territory's range means scrolling its run
     into the middle of the frame. Menswear, Development and Tech Packs still
     have category screens, and openCategory is still how those are entered. */
  /* The deck is ONE of the act's supporting-work mechanisms, and it belongs to
     Activewear — the territory whose whole scene is the range. Ready-to-Wear
     hands its depth over as a contact sheet, Occasion as a rail and Swim as a
     single line, so there is exactly one deck in the chapter and this is where
     it is. */
  const ACT_DECK = '[data-territory="activewear"]';
  const openScene = async (p, selector) => {
    await p.evaluate((sel) => {
      const world = document.querySelector('[data-world="womenswear"]');
      const el = world.querySelector(sel);
      const box = el.getBoundingClientRect();
      world.scrollTo({
        top: Math.round(world.scrollTop + box.top - Math.max(0, (window.innerHeight - box.height) / 2)),
        behavior: 'instant',
      });
    }, selector);
    await p.waitForTimeout(900);
  };

  // ---- structure: four chapters, each arriving as its own cover
  console.log('\nportfolio sequence');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);

    const worlds = await p.evaluate(() => [...document.querySelectorAll('[data-world]')].map((e) => e.dataset.world));
    check('exactly four top-level chapters', worlds.length === 4, worlds.join(','));
    for (const id of ['womenswear', 'menswear', 'tech-packs', '3d-simulation']) {
      check(`chapter "${id}" exists`, worlds.includes(id));
    }

    /* THE JOURNEY. Four covers and nothing between them: the chapter's own
       name is the headline, one sentence carries one coloured word, and one
       control carries the position. The oversized chapter-list screen, the
       per-cover register, the edge rail and the four contents rails are all
       gone, and every factual-integrity rule they used to carry is
       re-asserted here against what replaced them. */
    const sequence = await p.evaluate(() => {
      const shown = (el) => getComputedStyle(el).display !== 'none';
      const covers = [...document.querySelectorAll('.pf-cover')].filter(shown).map((el) => {
        const plate = el.querySelector('.pf-cover__plate')
          ?? (el.hasAttribute('data-women-threshold') ? document.querySelector('.pf-scene--women') : null);
        const st = plate ? getComputedStyle(plate) : null;
        const name = el.querySelector('.pf-cover__name');
        const em = el.querySelector('.pf-cover__statement em');
        const copy = el.querySelector('.pf-cover__copy').getBoundingClientRect();
        const nameBox = name.getBoundingClientRect();
        return {
          id: el.dataset.cover ?? (el.hasAttribute('data-women-threshold') ? 'womenswear' : ''),
          name: name.textContent.replace(/\s+/g, " ").trim(),
          nameSize: parseFloat(getComputedStyle(name).fontSize),
          statement: el.querySelector('.pf-cover__statement').textContent.replace(/\s+/g, ' ').trim(),
          word: em?.textContent.trim() ?? '',
          wordColour: em ? getComputedStyle(em).color : '',
          wordSize: em ? parseFloat(getComputedStyle(em).fontSize) : 0,
          statementSize: parseFloat(getComputedStyle(el.querySelector('.pf-cover__statement')).fontSize),
          action: el.querySelector('.pf-cover__action').textContent.replace(/\s+/g, ' ').trim(),
          href: el.querySelector('.pf-cover__action').getAttribute('href'),
          images: plate ? plate.querySelectorAll('img').length : 0,
          source: plate?.dataset.imageSource
            ?? el.querySelector('[data-image-source]')?.dataset.imageSource ?? '',
          boxed: st ? (st.borderRadius !== '0px' || st.boxShadow !== 'none') : true,
          copyLeft: Math.round(copy.left),
          /* Nothing may be cut by the frame. A name is allowed to run past its
             own column into the plate's negative space, so what is measured is
             where its glyphs actually stop. */
          namePainted: Math.round(nameBox.left + Math.max(name.scrollWidth, nameBox.width)),
          /* AND the name's own box has to hold its own glyphs. A cover clips
             its name's box as it arrives, so a box narrower than its text is
             not a harmless overflow — it cuts the word. A stale `max-width`
             from a cover system that no longer exists once turned MENSWEAR
             into MENSWEA on a phone exactly this way. */
          nameFits: (() => {
            /* The glyphs, measured with a range: Development's name carries an
               outlined echo as a pseudo-element, which a scrollWidth counts. */
            const range = document.createRange();
            range.selectNodeContents(name.firstChild);
            return range.getBoundingClientRect().right <= nameBox.right + 2;
          })(),
          accent: getComputedStyle(el).getPropertyValue('--accent').trim(),
        };
      });
      const flow = [...document.querySelectorAll('.pf-cinema, [data-cover], .pf-outro')]
        .filter(shown)
        .map((el) => (el.classList.contains('pf-cinema') ? 'opening'
          : el.classList.contains('pf-outro') ? 'ending' : `cover:${el.dataset.cover}`));
      const control = document.querySelector('[data-where]');
      return {
        covers,
        flow,
        width: innerWidth,
        /* The navigation systems that were removed. */
        leftovers: {
          livingIndex: document.querySelectorAll('[data-living-index]').length,
          contents: document.querySelectorAll('[data-contents]').length,
          rail: document.querySelectorAll('[data-rail]').length,
          register: document.querySelectorAll('.pf-cover__register').length,
        },
        control: control ? {
          count: control.querySelector('[data-where-count]').textContent.trim(),
          links: [...control.querySelectorAll('[data-where-link]')].map((a) => a.dataset.whereLink),
          expanded: control.querySelector('[data-where-toggle]').getAttribute('aria-expanded'),
        } : null,
        /* Every number printed anywhere in the sequence. */
        numbered: [...document.querySelectorAll('.pf-cover, .pf-outro')]
          .filter(shown)
          .filter((el) => /\b0[1-4]\b/.test(el.textContent)).length,
      };
    });

    check('the journey is four covers and an ending, with no screen between them',
      sequence.flow.join(' ') === 'opening cover:menswear cover:3d-simulation cover:tech-packs ending',
      sequence.flow.join(' '));
    check('four chapter covers, in the running order',
      sequence.covers.map((cv) => cv.id).join(' ') === 'womenswear menswear 3d-simulation tech-packs',
      sequence.covers.map((cv) => cv.id).join(' '));
    check('Development comes before Tech Packs',
      sequence.covers.findIndex((cv) => cv.id === '3d-simulation')
        < sequence.covers.findIndex((cv) => cv.id === 'tech-packs'));

    /* THE HIERARCHY. The chapter's own name is the headline — it used to be a
       number-sized label beside a generic line. */
    check('every cover is headlined by its chapter name',
      sequence.covers.map((cv) => cv.name).join('|') === 'Womenswear|Menswear|Development|Tech Packs',
      sequence.covers.map((cv) => cv.name).join('|'));
    check("the chapter name is the cover's largest type, by a clear margin",
      sequence.covers.every((cv) => cv.nameSize >= cv.statementSize * 3),
      sequence.covers.map((cv) => `${cv.name} ${cv.nameSize}/${cv.statementSize}`).join(' · '));
    /* One word, the same weight of name as the two beside it. The craft is
       named in the sentence under it, and in the chapter's own content. */
    check('chapter 03 is named Development on its cover',
      sequence.covers.find((cv) => cv.id === '3d-simulation').name === 'Development');
    check('no name is cut off by the frame',
      sequence.covers.every((cv) => cv.namePainted <= sequence.width + 1),
      sequence.covers.map((cv) => `${cv.name}:${cv.namePainted}`).join(' '));
    check("and no name is cut off by its own box, which a cover's clip follows",
      sequence.covers.every((cv) => cv.nameFits),
      sequence.covers.filter((cv) => !cv.nameFits).map((cv) => cv.name).join(' ') || 'all hold their text');

    /* ONE COLOURED WORD PER CHAPTER, and it is the capability being sold. */
    check('each chapter states what it sells in one sentence',
      sequence.covers.map((cv) => cv.statement).join('|') === [
        'A strong silhouette starts with proportion, movement and a clear point of view.',
        'Strong proportion gives tailoring its structure, balance and presence.',
        'Pattern development resolves fit, balance and construction before sampling.',
        'Clear specifications turn approved design decisions into instructions a factory can follow.',
      ].join('|'), sequence.covers.map((cv) => cv.statement).join(' | '));
    check('exactly one word of each statement is coloured, and it is the capability',
      sequence.covers.map((cv) => cv.word).join(' ') === 'silhouette proportion fit specifications',
      sequence.covers.map((cv) => cv.word).join(' '));
    check('every chapter colours that word with its own token',
      new Set(sequence.covers.map((cv) => cv.wordColour)).size === 4,
      sequence.covers.map((cv) => cv.wordColour).join(' '));
    /* A garment's own colour is whatever the garment is, and there are no
       darker variants of these tokens — so the word has to be large text,
       where 3:1 is the threshold, for the sampled colours to be usable. */
    check('the coloured word is large text, so a faithful garment colour can carry it',
      sequence.covers.every((cv) => cv.wordSize >= 18.66),
      sequence.covers.map((cv) => cv.wordSize).join(' '));
    check('every cover offers one way in, into its own chapter',
      sequence.covers.every((cv) => cv.href === `#${cv.id}`) && new Set(sequence.covers.map((cv) => cv.action)).size === 4,
      sequence.covers.map((cv) => `${cv.action} ${cv.href}`).join(' | '));

    /* SAME GRAMMAR. */
    check('every cover is image-led', sequence.covers.every((cv) => cv.images === 1),
      sequence.covers.map((cv) => cv.images).join(','));
    check('every cover records its image source', sequence.covers.every((cv) => cv.source.length > 0),
      sequence.covers.map((cv) => cv.source).join(' | '));
    check('no cover is drawn as a card', sequence.covers.every((cv) => !cv.boxed));
    check('every cover sets its type in the same place',
      new Set(sequence.covers.map((cv) => cv.copyLeft)).size === 1,
      sequence.covers.map((cv) => cv.copyLeft).join(' '));

    /* ONE NAVIGATION, AND ONE ONLY. */
    check('the oversized chapter index is gone', sequence.leftovers.livingIndex === 0);
    check('the four contents rails are gone', sequence.leftovers.contents === 0);
    check('the edge position rail is gone', sequence.leftovers.rail === 0);
    check("the per-cover register is gone", sequence.leftovers.register === 0);
    check('one control carries the position, and lists the four chapters',
      sequence.control !== null && sequence.control.links.join(' ') === 'womenswear menswear 3d-simulation tech-packs',
      JSON.stringify(sequence.control));
    check('it is closed until it is asked for', sequence.control.expanded === 'false');
    check('nothing else in the journey numbers a chapter',
      sequence.numbered === 0, `${sequence.numbered} sections print a chapter number`);

    check('the old narrower name is gone from the sequence',
      await p.evaluate(() => !/\b3D Simulation\b/.test(
        [...document.querySelectorAll('.pf-cover, .pf-outro')].map((e) => e.textContent).join(' '))));
    check('the reference disclaimer never appears on a cover',
      await p.evaluate(() => ![...document.querySelectorAll('.pf-cover')]
        .some((el) => /no authorship of photographed garments/i.test(el.textContent))));

    /* A chapter's colour is a signal — a word, a rule, an arrow — never a
       surface. This replaces the registration-mark assertion that guarded the
       same rule on the interface the covers took over from. */
    const surfaces = await p.evaluate(() => {
      const accents = [...document.querySelectorAll('.pf-cover')]
        .map((el) => getComputedStyle(el).getPropertyValue('--accent').trim().toLowerCase());
      const bad = [];
      for (const el of document.querySelectorAll('.pf-cover *, .pf-outro *')) {
        /* The site's own filled primary CTA is a component, not chapter
           paint: Home and Contact both end on exactly this button. What this
           guards is a chapter turning its colour into a surface. */
        if (el.closest('.button')) continue;
        const bg = getComputedStyle(el).backgroundColor;
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
        const hex = `#${bg.match(/\d+/g).slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`;
        if (!accents.includes(hex)) continue;
        const r = el.getBoundingClientRect();
        if (r.width * r.height > 2400) bad.push(`${el.className}:${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      return bad;
    });
    check('a chapter colour is a signal, never a surface', surfaces.length === 0, surfaces.join(' '));

    /* THE ENDING resolves the journey instead of repeating it. */
    const ending = await p.evaluate(() => {
      const el = document.querySelector('.pf-outro');
      return {
        title: el.querySelector('.pf-outro__title').textContent.replace(/\s+/g, ' ').trim(),
        word: el.querySelector('.pf-outro__title em')?.textContent.trim() ?? '',
        links: [...el.querySelectorAll('a')].map((a) => a.getAttribute('href')),
        chapterLinks: el.querySelectorAll('[data-chapter], [data-index-row]').length,
      };
    });
    check('the ending resolves the story in one line', ending.title === 'One practice.From design to production.',
      ending.title);
    check("it carries the site's one coloured word", ending.word === 'production', ending.word);
    check('it is not another chapter directory', ending.chapterLinks === 0 && ending.links.length === 1,
      `${ending.chapterLinks} chapter links, ${ending.links.length} links`);
    check('and it offers the brief', ending.links[0] === '/contact/', ending.links.join(' '));

    /* Nothing heavy is fetched to render the index. */
    const eager = await p.evaluate(() => ({
      iframes: document.querySelectorAll('iframe').length,
      objects: document.querySelectorAll('object').length,
      videos: document.querySelectorAll('video[src]').length,
      ytRefs: document.documentElement.innerHTML.includes('youtube.com/embed'),
    }));
    check('no iframe or object exists before anything is asked for',
      eager.iframes === 0 && eager.objects === 0, JSON.stringify(eager));
    check('no YouTube embed URL in the served markup', eager.ytRefs === false);
    check('no video carries a src before play', eager.videos === 0);

    const placeholders = await p.evaluate(() => (document.body.innerText.match(/\b(UNKNOWN|N\/A|TODO|LOREM|TBD)\b/gi) ?? []));
    check('no UNKNOWN / N-A / TODO on the public UI', placeholders.length === 0, placeholders.join(','));

    /* A coloured rule directly under words reads as a spell-check mark, and is
       banned from the visual language. A hairline box around a stamp is a
       different device and stays allowed, so only a bottom-only rule counts. */
    const underlines = await p.evaluate(() => {
      const signal = getComputedStyle(document.documentElement).getPropertyValue('--signal').trim();
      const h = signal.replace('#', '');
      const target = `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
      const bad = [];
      for (const el of document.querySelectorAll('.pf *')) {
        if (!el.textContent.trim()) continue;
        const st = getComputedStyle(el);
        if (st.textDecorationLine.includes('underline') && st.textDecorationColor === target) bad.push(`${el.className} text-decoration`);
        const bottomOnly = st.borderBottomStyle !== 'none' && st.borderBottomWidth !== '0px'
          && st.borderTopWidth === '0px' && st.borderLeftWidth === '0px' && st.borderRightWidth === '0px';
        if (bottomOnly && st.borderBottomColor === target) bad.push(`${el.className} border-bottom`);
      }
      return bad.slice(0, 5);
    });
    check('no orange underline sits beneath portfolio text at rest', underlines.length === 0, underlines.join(' | '));

    await c.close();
  }

  for (const width of [390, 430]) {
    console.log(`\nportfolio chapter covers at ${width}`);
    const c = await ctxWithFonts({ viewport: { width, height: width === 390 ? 844 : 932 }, isMobile: true, hasTouch: true });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);

    /* A phone cannot hold a full-length figure inside a 16:9 frame at any
       useful size, so each cover zooms its plate and pans it until the
       chapter's subject is centred, and stands the type underneath it. What
       is asserted here is that it IS underneath: the two ways this
       composition breaks on a phone are the subject cropped out of the frame
       and the type set across the garment. */
    for (const chapter of ['menswear', '3d-simulation', 'tech-packs']) {
      await p.locator(`[data-cover="${chapter}"]`).scrollIntoViewIfNeeded();
      await p.waitForTimeout(800);
      const cover = await p.evaluate((id) => {
        const el = document.querySelector(`[data-cover="${id}"]`);
        const box = (node) => { const r = node.getBoundingClientRect(); return {
          left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
        const plate = box(el.querySelector('.pf-cover__plate'));
        const copy = box(el.querySelector('.pf-cover__copy'));
        return { plate, copy, gutter: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) };
      }, chapter);
      check(`${width}: the ${chapter} cover keeps its type inside the gutters`,
        cover.copy.left >= 16 && cover.copy.right <= width - 16, JSON.stringify(cover.copy));
      check(`${width}: the ${chapter} cover sets its type clear of the plate`,
        cover.copy.top >= cover.plate.bottom - 2,
        `copy from ${cover.copy.top}, plate ends ${cover.plate.bottom}`);
      check(`${width}: the ${chapter} cover fills the frame edge to edge`,
        cover.plate.left <= 18 && cover.plate.right >= width - 18, JSON.stringify(cover.plate));
    }

    check(`no horizontal overflow in the ${width} chapter index`,
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await c.close();
  }

  // ---- the hierarchy: chapter -> categories -> viewer -> back again
  console.log('\nportfolio navigation hierarchy');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);

    await openChapter(p, 'womenswear');
    const world = '[data-world="womenswear"]';
    check('the chapter opens', await p.evaluate((sel) => document.querySelector(sel).hasAttribute('data-open'), world));
    check('background is inert', await p.evaluate(() => !!document.querySelector('[inert]')));
    check('focus starts inside the chapter',
      await p.evaluate((sel) => document.querySelector(sel).contains(document.activeElement), world));

    /* WOMENSWEAR IS ONE AUTHORED ACT IN FIVE TERRITORIES, told in BEATS.
       A beat is a scene with its own composition and pacing, and the point of
       the architecture is that no two territories play the same shape — so
       what is checked here is the SCORE: the five real category names, in the
       approved order, each with a different sequence of scenes, one hero
       scene each, one supporting-work mechanism each, and no repetition of
       the front-to-back turn as a grammar. */
    const act = await p.evaluate((sel) => {
      const w = document.querySelector(sel);
      const shown = [...w.querySelectorAll('[data-screen]')].filter((e) => !e.hidden);
      const visible = (el) => el.getBoundingClientRect().width > 0 && !el.closest('[hidden]');
      const territories = [...w.querySelectorAll('[data-territory]')];
      return {
        screens: shown.map((e) => e.dataset.screen),
        hash: location.hash,
        isAct: w.hasAttribute('data-act'),
        ids: territories.map((t) => t.dataset.territory),
        beats: territories.map((t) => t.dataset.beats),
        names: territories.map((t) => t.dataset.actTitle),
        /* The approved full category label is printed with every territory,
           whether the name arrives on a slate or over the opening picture. */
        labels: territories.map((t) => (
          t.querySelector('.pf-tr__meta span') ?? t.querySelector('.pf-ov__meta span')
        )?.textContent.trim()),
        scenes: [...w.querySelectorAll('[data-scene]')].map((el) => el.dataset.scene),
        turns: [...w.querySelectorAll('[data-scene="turn"], [data-scene="overture"]')].length,
        heroes: territories.map((t) => t.querySelectorAll('[data-hero]').length),
        support: territories.map((t) => [...t.querySelectorAll('[data-support]')].map((s) => s.dataset.scene).join('+')),
        garments: [...w.querySelectorAll('[data-hero] img')].filter(visible).length,
        /* Only photographs that really hold two views are ever shown half a
           frame at a time. */
        halves: [...w.querySelectorAll('[data-scene="overture"] [data-views], [data-scene="turn"] [data-views]')]
          .map((el) => el.dataset.views),
        plates: [...w.querySelectorAll('.pf-plate')].filter(visible).length,
        /* THE FOURTH LEVEL: portfolio, chapter, territory, GARMENT. Every
           garment the chapter shows is a door into its own story, so a range
           is a way into the work rather than the end of it. */
        doors: w.querySelectorAll('[data-open-subject]').length,
        readers: w.querySelectorAll('.pf-rd__subject').length,
        readersOpen: [...w.querySelectorAll('.pf-rd__subject')].filter((e) => !e.hidden).length,
        /* Evidence belongs to the PROJECT that produced it, never to a
           category: there is no category-level proof band anywhere. */
        categoryEvidence: w.querySelectorAll('[data-scene="evidence"]').length,
        /* And nothing is invented for a photograph: with no verified project
           the story stages are absent and the reader says so instead. */
        inventedStages: w.querySelectorAll('.pf-rd__stage-item').length,
        pending: w.querySelectorAll('[data-subject-pending]').length,
        /* Five territories, five gestures for giving up a garment's views. */
        reveals: [...new Set([...w.querySelectorAll('.pf-rd__subject')].map((e) => e.dataset.reveal))].sort(),
        control: [...w.querySelectorAll('[data-act-link]')].map((a) => a.dataset.actLink),
        controlNames: [...w.querySelectorAll('[data-act-link] .pf-act__label')].map((e) => e.textContent.trim()),
        controlOpen: !!w.querySelector('[data-act-where][data-open]'),
        disclaimers: [...w.querySelectorAll('[data-reference-notice]')].filter(visible).length,
      };
    }, world);
    check('the chapter is one screen, not a category index',
      act.isAct && act.screens.join(',') === 'index', `${act.isAct} / ${act.screens.join(',')}`);
    check('the URL names the chapter', act.hash === '#womenswear', act.hash);
    check('the five approved territories are there, in order',
      act.ids.join(',') === 'rtw,activewear,streetwear,evening,swimwear', act.ids.join(','));
    check('the five approved category names are printed in order',
      JSON.stringify(act.labels) === JSON.stringify([
        'Ready-to-Wear & Contemporary', 'Activewear & Athleisure', 'Streetwear & Casualwear',
        'Evening & Occasionwear', 'Swimwear & Resortwear',
      ]), act.labels.join(' | '));
    /* The visitor must not have to decode an abstraction before they know what
       they are looking at: a territory is called what the category is called. */
    check('every territory is named by its real category, not by an abstraction',
      act.names.join(',') === 'Ready-to-Wear,Activewear,Streetwear,Occasion,Swim', act.names.join(','));
    check('and the control uses those same names',
      act.controlNames.join(',') === act.names.join(','), act.controlNames.join(','));
    check('NO TWO TERRITORIES PLAY THE SAME SHAPE',
      new Set(act.beats).size === act.beats.length, act.beats.join(' | '));
    /* Stronger than counting beats: EVERY SCENE KIND in the act belongs to
       exactly one territory. A mechanism reused across territories is the
       template problem coming back one level down. */
    check('and no scene mechanism is used by more than one territory',
      (() => {
        const kinds = act.beats.flatMap((b) => b.split(' '));
        return new Set(kinds).size === kinds.length && kinds.length >= 6;
      })(), act.beats.join(' | '));
    check('each territory leads with exactly one hero scene',
      act.heroes.join(',') === '1,0,1,1,1', act.heroes.join(','));
    /* Four territories hand their depth over, and each does it differently:
       a contact sheet, a deck, a rail, a single line. */
    check('supporting work uses a different mechanism in every territory',
      act.support.join(',') === 'sheet,deck,,rail,line', act.support.join(','));
    check('the front-to-back turn is a DEVICE, used twice, not the grammar',
      act.turns === 2, `${act.turns} scenes turn`);
    check('and only two-view photographs ever turn',
      act.halves.every((v) => v === '2'), act.halves.join(','));
    check('the garment is on screen from the first frame', act.garments >= 1, String(act.garments));
    check('no development demo rail is anywhere in the act', act.plates === 0, String(act.plates));
    /* ---- THE GARMENT IS THE STORY ------------------------------------
       A category is the atmosphere; a project is the story. Every garment in
       every range can be entered, and what it contains when entered is what
       it actually has — never a stage nobody supplied. */
    check('every garment in the chapter is a door into its own story',
      act.doors === act.readers && act.doors > 40, `${act.doors} doors / ${act.readers} readers`);
    check('and none of them is open until it is chosen', act.readersOpen === 0, String(act.readersOpen));
    check('evidence belongs to a project, so no category carries a proof band',
      act.categoryEvidence === 0, String(act.categoryEvidence));
    check('no sketch, pattern or 3D state is invented for a photograph',
      act.inventedStages === 0, String(act.inventedStages));
    check('instead every unverified garment says what is not there yet',
      act.pending === act.readers, `${act.pending} of ${act.readers}`);
    check('the five territories give up their views five different ways',
      act.reveals.length === 5, act.reveals.join(','));
    check('the act carries the reference disclaimer exactly once',
      act.disclaimers === 1, String(act.disclaimers));
    check('the act has one control, and it reaches all five territories',
      act.control.join(',') === 'rtw,activewear,streetwear,evening,swimwear', act.control.join(','));
    check('the control is closed until it is asked for', act.controlOpen === false);

    // ---- a territory is reached by name, and the URL says where you are
    await p.evaluate((sel) => document.querySelector(`${sel} [data-act-toggle]`).click(), world);
    await p.waitForTimeout(400);
    check('the control opens the five territories',
      await p.evaluate((sel) => !!document.querySelector(`${sel} [data-act-where][data-open]`), world));
    await p.evaluate((sel) => document.querySelector(`${sel} [data-act-link="evening"]`).click(), world);
    await p.waitForTimeout(1400);
    const travelled = await p.evaluate((sel) => {
      const w = document.querySelector(sel);
      /* A territory is arrived at on its SLATE — the band that names it —
         which is a transition the visitor crosses rather than a menu. */
      const slate = w.querySelector('[data-territory="evening"] .pf-tr__slate');
      const box = slate.getBoundingClientRect();
      const bar = w.querySelector('.pf-act__bar').getBoundingClientRect();
      return {
        hash: location.hash,
        controlOpen: !!w.querySelector('[data-act-where][data-open]'),
        slateTop: Math.round(box.top),
        clearsBar: box.bottom > bar.bottom,
        naming: w.querySelector('[data-act-name]').textContent.trim(),
        counting: w.querySelector('[data-act-count]').textContent.trim(),
        screens: [...w.querySelectorAll('[data-screen]')].filter((e) => !e.hidden).map((e) => e.dataset.screen),
      };
    }, world);
    check('choosing a territory names it in the URL', travelled.hash === '#womenswear/evening', travelled.hash);
    check('choosing a territory closes the control', travelled.controlOpen === false);
    check('the act stays one screen', travelled.screens.join(',') === 'index', travelled.screens.join(','));
    check('the territory arrives on its own slate, in the frame',
      travelled.slateTop >= -2 && travelled.slateTop < 80 && travelled.clearsBar,
      `slate top ${travelled.slateTop}`);
    check('the control reports which territory is being read',
      /occasion/i.test(travelled.naming) && travelled.counting === '04 / 05',
      `${travelled.naming} ${travelled.counting}`);

    // ---- Escape steps back one level at a time
    await p.evaluate((sel) => document.querySelector(`${sel} [data-act-toggle]`).click(), world);
    await p.waitForTimeout(350);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    check('Escape closes the territory list and leaves the chapter open',
      await p.evaluate((sel) => {
        const w = document.querySelector(sel);
        return !w.querySelector('[data-act-where][data-open]') && w.hasAttribute('data-open');
      }, world));

    await p.keyboard.press('Escape');
    await p.waitForTimeout(700);
    check('Escape from a territory steps up to the portfolio index',
      await p.evaluate(() => location.hash === '#womenswear'), await p.evaluate(() => location.hash));

    await p.keyboard.press('Escape');
    await p.waitForTimeout(700);
    check('Escape from the act leaves the chapter',
      await p.evaluate((sel) => !document.querySelector(sel).hasAttribute('data-open'), world));
    check('background inert released', await p.evaluate(() => !document.querySelector('[inert]')));
    check('focus restored to the cover that opened it',
      await p.evaluate(() => document.activeElement?.id === 'smoke-trigger'),
      await p.evaluate(() => document.activeElement?.id || document.activeElement?.tagName || 'none'));

    // ---- menswear has the same image-led, working reference-preview interface
    await openChapter(p, 'menswear');
    await p.locator('[data-world="menswear"] > .pf-continuity a[href="#tech-packs"]').click();
    check('world navigation moves directly to another world',
      await p.locator('[data-world="tech-packs"]').evaluate((el) => el.hasAttribute('data-open')));
    check('all four worlds remain accessible inside a chapter',
      await p.locator('[data-world="tech-packs"] > .pf-continuity a:not(.pf-continuity__index)').count() === 4);
    await p.locator('[data-world="tech-packs"] > .pf-continuity a[href="#menswear"]').click();
    check('world navigation marks the current chapter',
      await p.locator('[data-world="menswear"] > .pf-continuity a[aria-current="page"]').getAttribute('href') === '#menswear');
    const men = await p.evaluate(() => {
      const w = document.querySelector('[data-world="menswear"]');
      return {
        cats: [...w.querySelectorAll('.pf-cat__label')].map((e) => e.textContent.trim()),
        links: w.querySelectorAll('a.pf-cat').length,
        pending: [...w.querySelectorAll('.pf-cat__count')].filter((e) => /pending/i.test(e.textContent)).length,
        garments: w.querySelectorAll('.pf-slot').length,
        publication: w.dataset.publication,
      };
    });
    check('menswear categories match the approved order',
      JSON.stringify(men.cats) === JSON.stringify([
        'Streetwear & Casualwear', 'Activewear & Performance',
        'Contemporary Ready-to-Wear', 'Tailoring & Outerwear',
      ]), men.cats.join(' | '));
    check('menswear is explicitly a reference preview', men.publication === 'reference-preview', men.publication);
    check('menswear has a working visual gallery behind every category',
      men.garments >= 8 && men.links === 4, `${men.garments} references / ${men.links} links`);
    check('no menswear category is left as a dead pending row', men.pending === 0, String(men.pending));

    await c.close();
  }

  // ---- the garment deck: depth, occlusion, keyboard, drag, integrity
  console.log('\nportfolio garment viewer');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openChapter(p, 'womenswear');
    /* The deck lives inside a movement's RUN now, and the act's Range is the
       longest queue on the site — seventeen — so it is still where the deck's
       depth, occlusion, keyboard, drag and wheel are proved. */
    await openScene(p, '[data-scene="deck"]');

    const state = await p.evaluate(() => window.__portfolioRunway.getState());
    check('desktop shows four garments at once', state.visibleNow === 4, `visible ${state.visibleNow} of ${state.count}`);
    check('the active garment leads the deck', state.activeIsLeading === true);
    check('the garments genuinely overlap', state.overlaps >= 3, `${state.overlaps} overlaps`);

    const deck = await p.evaluate(() => {
      const panel = document.querySelector('[data-scene="deck"] .pf-panel');
      const stage = panel.querySelector('.pf-stage').getBoundingClientRect();
      const boxes = [...panel.querySelectorAll('.pf-slot')].filter((s) => !s.hidden).map((s) => ({
        r: s.getBoundingClientRect(),
        front: Number(s.dataset.front) || 0.55,
        z: Number(s.style.zIndex),
        filter: getComputedStyle(s.querySelector('img')).filter,
      })).sort((a, b) => a.r.left - b.r.left);
      const exposure = boxes.map((b, i) => (i === boxes.length - 1 ? 1 : (boxes[i + 1].r.left - b.r.left) / b.r.width));
      return {
        widths: boxes.map((b) => Math.round(b.r.width)),
        bottoms: boxes.map((b) => Math.round(b.r.bottom)),
        zOrder: boxes.map((b) => b.z),
        exposure: exposure.map((e) => +e.toFixed(3)),
        fronts: boxes.map((b) => b.front),
        filters: boxes.map((b) => b.filter),
        insideStage: boxes.every((b) => b.r.left >= stage.left - 1 && b.r.right <= stage.right + 1),
        smallest: Math.round(Math.min(...boxes.map((b) => b.r.width))),
        stackDisplay: getComputedStyle(panel.querySelector('[data-stack]')).display,
        slotPosition: getComputedStyle(panel.querySelector('.pf-slot')).position,
      };
    });
    check('garments grow toward the leading edge',
      deck.widths.every((w, i) => i === 0 || w > deck.widths[i - 1]), deck.widths.join(' < '));
    check('stacking order rises toward the leader',
      deck.zOrder.every((z, i) => i === 0 || z > deck.zOrder[i - 1]), deck.zOrder.join(','));
    check('every garment is fully inside the stage', deck.insideStage);
    check('the deck is a positioned stack, not a flex row',
      deck.stackDisplay !== 'flex' && deck.slotPosition === 'absolute',
      `${deck.stackDisplay} / ${deck.slotPosition}`);

    /* THE DEPTH MUST BE OBVIOUS.
       Each garment behind the active one is markedly smaller, not marginally:
       every step is at least a sixth, and the furthest is around half the
       leader — while staying large enough to be judged as a garment. */
    const ratios = deck.widths.map((w) => w / deck.widths[deck.widths.length - 1]);
    check('the furthest garment is about half the active one',
      ratios[0] <= 0.60 && ratios[0] >= 0.42, `${Math.round(ratios[0] * 100)}% of the leader`);
    check('every step of the deck is a large change of scale',
      deck.widths.every((w, i) => i === 0 || w / deck.widths[i - 1] >= 1.15),
      deck.widths.join(' < '));
    check('the furthest garment is still readable', deck.smallest >= 190, `${deck.smallest}px`);
    check('only the farthest desktop garment carries atmospheric blur',
      /blur\(/.test(deck.filters[0]) && deck.filters.slice(1).every((value) => !/blur\(/.test(value)),
      deck.filters.join(' | '));
    check('far garment blur remains restrained and identifiable',
      /blur\(0\.55px\)/.test(deck.filters[0]), deck.filters[0]);

    /* ONE RECEDING FLOOR: the garments share a floor plane rather than a flat
       baseline — each step back stands a little higher, the way objects rise
       toward a horizon — so four sizes in a row read as one presentation seen
       from a distance rather than as four unrelated photographs. */
    const rising = deck.bottoms.every((b, i) => i === 0 || b > deck.bottoms[i - 1]);
    const lift = deck.bottoms[deck.bottoms.length - 1] - deck.bottoms[0];
    check('the garments stand on one receding floor plane',
      rising && lift >= 20 && lift <= deck.widths[deck.widths.length - 1] * 0.25,
      `${deck.bottoms.join(',')} (rise ${lift}px)`);

    /* Front/back: the leader is whole, everything behind it keeps its complete
       front model showing. */
    check('the leading garment is completely revealed',
      deck.exposure[deck.exposure.length - 1] === 1, String(deck.exposure[deck.exposure.length - 1]));
    const clipped = deck.exposure.slice(0, -1)
      .map((e, i) => ({ e, need: deck.fronts[i] })).filter((x) => x.e < x.need - 0.01);
    check('every covered garment still shows its whole front view',
      clipped.length === 0, JSON.stringify(clipped));
    check('covered garments are partly hidden, not fully shown',
      deck.exposure.slice(0, -1).every((e) => e < 0.95), deck.exposure.join(','));
    check('garment images use object-fit: contain',
      await p.evaluate(() => [...document.querySelectorAll('.pf-slot img')]
        .every((img) => getComputedStyle(img).objectFit === 'contain')));

    /* NO CARD LANGUAGE. */
    const cardish = await p.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll('[data-scene="deck"] .pf-slot, [data-scene="deck"] .pf-slot *')) {
        const st = getComputedStyle(el);
        if (st.boxShadow !== 'none') bad.push(`${el.className} shadow`);
        if (st.filter.includes('drop-shadow')) bad.push(`${el.className} drop-shadow`);
        if (st.borderTopWidth !== '0px' || st.borderLeftWidth !== '0px'
          || st.borderRightWidth !== '0px' || st.borderBottomWidth !== '0px') bad.push(`${el.className} border`);
        if (st.borderRadius !== '0px') bad.push(`${el.className} radius`);
      }
      return bad.slice(0, 5);
    });
    check('no shadow, border or radius anywhere on garment imagery', cardish.length === 0, cardish.join(' | '));

    /* THE ACT'S GROUND IS BONE, NOT A WHITE BAND.
       Womenswear's white is the studio white inside each photograph, and it
       only reads as a field because the page behind it is not white too. (The
       full-width white band is still Menswear's, and is checked there.) */
    const ground = await p.evaluate(() => {
      const act = document.querySelector('[data-world="womenswear"]');
      const white = (el) => getComputedStyle(el).backgroundColor === 'rgb(255, 255, 255)';
      return {
        act: getComputedStyle(act).backgroundColor,
        /* Every scene stands its garment on a pure white studio field: the
           overture's is a layer of its own, because it closes; the other
           scenes carry it on the plate. */
        field: white(act.querySelector('.pf-ov__field')),
        turn: white(act.querySelector('.pf-tn__plate')),
        pair: white(act.querySelector('.pf-pr__plate')),
        approach: white(act.querySelector('.pf-ap__plate')),
        bands: act.querySelectorAll('.pf-studio').length,
      };
    });
    check('the act stands the photographs on bone, so their own white reads as a field',
      ground.field && ground.turn && ground.pair && ground.approach
      && ground.act !== 'rgb(255, 255, 255)' && ground.bands === 0,
      JSON.stringify(ground));

    // Keyboard alone must drive the deck.
    await p.evaluate(() => document.querySelector('[data-scene="deck"] [data-stage]').focus());
    const before = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(650);
    const after = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    check('ArrowRight advances the deck', after === before + 1, `${before} -> ${after}`);
    await p.keyboard.press('ArrowLeft');
    await p.waitForTimeout(650);
    check('ArrowLeft steps back', await p.evaluate(() => window.__portfolioRunway.getState().activeIndex) === before);

    const bounds = await p.evaluate(() => {
      const api = window.__portfolioRunway;
      const count = api.getState().count;
      api.goTo(count + 50);
      const high = api.getState().activeIndex;
      const nextDisabled = document.querySelector('[data-scene="deck"] [data-step="1"]').disabled;
      api.goTo(-50);
      const low = api.getState().activeIndex;
      const prevDisabled = document.querySelector('[data-scene="deck"] [data-step="-1"]').disabled;
      return { count, high, low, nextDisabled, prevDisabled };
    });
    check('out-of-range forward navigation wraps by modulo', bounds.high === (bounds.count + 50) % bounds.count, `${bounds.high} of ${bounds.count}`);
    check('out-of-range backward navigation wraps by modulo', bounds.low === ((-50 % bounds.count) + bounds.count) % bounds.count, String(bounds.low));
    check('circular controls stay available at every item', !bounds.nextDisabled && !bounds.prevDisabled);
    const loop = await p.evaluate(() => {
      const api = window.__portfolioRunway;
      const count = api.getState().count;
      api.goTo(count - 1);
      document.querySelector('[data-scene="deck"] [data-step="1"]').click();
      const forward = api.getState().activeIndex;
      document.querySelector('[data-scene="deck"] [data-step="-1"]').click();
      const backward = api.getState().activeIndex;
      api.goTo(0);
      return { count, forward, backward };
    });
    check('next loops from the last garment to the first', loop.forward === 0, JSON.stringify(loop));
    check('previous loops from the first garment to the last', loop.backward === loop.count - 1, JSON.stringify(loop));
    await p.waitForTimeout(600);
    const wheel = await p.evaluate(async () => {
      const panel = document.querySelector('[data-scene="deck"]');
      const nodes = [...panel.querySelectorAll('.pf-slot')];
      panel.querySelector('[data-step="-1"]').click();
      const animated = nodes.filter((node) => node.getAnimations().length > 0).length;
      await new Promise((resolve) => setTimeout(resolve, 750));
      return {
        animated,
        sameNodes: nodes.every((node, i) => panel.querySelectorAll('.pf-slot')[i] === node),
        visible: nodes.filter((node) => !node.hidden).length,
        remaining: nodes.flatMap((node) => node.getAnimations()).length,
      };
    });
    check('circular wrap animates existing depth positions', wheel.animated >= 4 && wheel.sameNodes, JSON.stringify(wheel));
    check('wheel settles with four garments and no abandoned animation', wheel.visible === 4 && wheel.remaining === 0, JSON.stringify(wheel));
    await p.evaluate(() => window.__portfolioRunway.goTo(0));
    await p.waitForTimeout(600);

    // Drag must follow the hand: pointer right -> stack right.
    await p.waitForTimeout(300);
    const box = await p.evaluate(() => {
      const b = document.querySelector('[data-scene="deck"] .pf-stage').getBoundingClientRect();
      return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
    });
    await p.mouse.move(box.x, box.y);
    const beforeDrag = await p.evaluate(() => document.querySelector('[data-scene="deck"] [data-depth="1"]').getBoundingClientRect().left);
    const movingItem = await p.evaluate(() => document.querySelector('[data-scene="deck"] [data-depth="1"]').dataset.item);
    await p.mouse.down();
    await p.mouse.move(box.x + 110, box.y, { steps: 8 });
    const dragRight = await p.evaluate(item => document.querySelector('[data-scene="deck"] [data-item="'+item+'"]:not([data-wheel-ghost])').getBoundingClientRect().left, movingItem) - beforeDrag;
    await p.mouse.up();
    await p.waitForTimeout(650);
    check('dragging right moves the stack right', dragRight > 0, `translateX ${Math.round(dragRight)}px`);

    await p.mouse.move(box.x, box.y);
    await p.mouse.down();
    await p.mouse.move(box.x - 130, box.y, { steps: 8 });
    const indexBefore = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    await p.mouse.up();
    await p.waitForTimeout(700);
    check('releasing a leftward drag continues left around the wheel',
      await p.evaluate(() => window.__portfolioRunway.getState().activeIndex)
        === (indexBefore - 1 + (await p.evaluate(() => window.__portfolioRunway.getState().count))) % (await p.evaluate(() => window.__portfolioRunway.getState().count)));

    /* CONTENT INTEGRITY. The 49 photographs are temporary visual references
       and must never be presented as authored projects. */
    const integrity = await p.evaluate(() => {
      const w = document.querySelector('[data-world="womenswear"]');
      const panel = w.querySelector('[data-scene="deck"] .pf-panel');
      const notice = w.querySelector('[data-reference-notice]');
      return {
        publication: w.dataset.publication,
        panelKind: panel.dataset.kind,
        noticeText: notice?.textContent.trim() ?? '',
        noticePx: notice ? Math.round(parseFloat(getComputedStyle(notice.querySelector('span')).fontSize)) : 0,
        counter: panel.querySelector('[data-counter-current]').textContent.trim(),
        projectArticles: w.querySelectorAll('.pf-project').length,
        profileRows: w.querySelectorAll('.pf-project__profile').length,
        tagRows: w.querySelectorAll('.pf-project__tags').length,
        /* The act does not carry the development evidence panel: Development
           is its own chapter, and Womenswear's job is the garment. What it
           does carry is the provenance, said once, at the end. */
        referencePanel: !!panel.querySelector('[data-reference-panel]'),
        provenanceInPayoff: !!w.querySelector('.pf-act__end [data-reference-notice]'),
      };
    });
    check('womenswear is a reference preview, not published work',
      integrity.publication === 'reference-preview', integrity.publication);
    check('the deck is marked as references', integrity.panelKind === 'reference', String(integrity.panelKind));
    check('items are counted as references, not projects',
      /^Reference \d\d$/.test(integrity.counter), integrity.counter);
    check('the non-authorship disclaimer is present',
      /no authorship of photographed garments is claimed/i.test(integrity.noticeText));
    check('the disclaimer is readable, not fine print', integrity.noticePx >= 14, `${integrity.noticePx}px`);
    check('no reference is given a project profile', integrity.profileRows === 0, String(integrity.profileRows));
    check('no reference is given project text', integrity.projectArticles === 0, String(integrity.projectArticles));
    check('no capability tags on references', integrity.tagRows === 0, String(integrity.tagRows));
    check('the act carries no development evidence panel', integrity.referencePanel === false);
    check('the provenance is stated where the act ends', integrity.provenanceInPayoff);

    /* No construction history may be inferred from a photograph. */
    const claims = await p.evaluate(() => {
      // Audit the entire visible reference screen, not global chapter names.
      const text = document.querySelector('.pf-world[data-open] [data-screen]:not([hidden])').innerText;
      return [
        /\bbias[- ]cut\b/i, /\bgrading\b/i, /\bfit correction\b/i, /\bpattern development\b/i,
        /\bnegative ease\b/i, /\bdart\b/i, /\bseam placement\b/i, /\bstitch class\b/i,
      ].filter((re) => re.test(text)).map((re) => String(re));
    });
    check('no construction claim is inferred from the reference photographs', claims.length === 0, claims.join(' '));
    check('no "N projects" claim while nothing is verified',
      await p.evaluate(() => /\b\d+\s+projects\b/i.test(document.body.innerText)) === false);
    check('no "Look 01" UI anywhere',
      await p.evaluate(() => (document.body.innerText.match(/\bLook\s+\d/gi) ?? []).length) === 0);

    await c.close();
  }

  /* ---- THE GARMENT: entering one, looking at it, leaving it ------------
     The concrete complaint this layer answers is that a range of small
     pictures is not portfolio content. So what is checked is the thing that
     matters: is the garment BIGGER once it is entered, can it be inspected,
     does the story show only what exists, and does leaving put the visitor
     back where they were. */
  console.log('\nwomenswear — the garment');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openChapter(p, 'womenswear');
    await openScene(p, '[data-scene="sheet"]');

    const before = await p.evaluate(() => {
      const door = document.querySelector('[data-scene="sheet"] .pf-sh__door');
      return {
        id: door.dataset.openSubject,
        href: door.getAttribute('href'),
        thumb: Math.round(door.querySelector('img').getBoundingClientRect().height),
      };
    });
    check('a cell in the range is a real link to that garment',
      /^#womenswear\/rtw\/rtw-ref-\d\d$/.test(before.href), before.href);

    await p.evaluate(() => document.querySelector('[data-scene="sheet"] .pf-sh__door').click());
    await p.waitForTimeout(900);
    const entered = await p.evaluate((id) => {
      const rd = document.querySelector(`[data-subject="${id}"]`);
      const view = rd.querySelector('.pf-rd__view');
      const img = view.querySelector('img');
      return {
        open: !rd.hidden,
        hash: location.hash,
        focusInside: rd.contains(document.activeElement),
        /* The chapter is still the chapter: the same ground, and the way back
           to the territory rather than to a different website. */
        ground: getComputedStyle(rd).backgroundColor,
        backTo: rd.querySelector('[data-subject-close]').getAttribute('href'),
        garment: Math.round(img.getBoundingClientRect().height),
        views: rd.querySelectorAll('.pf-rd__view, [data-rd-travel]').length,
        travel: rd.hasAttribute('data-travel'),
        stages: rd.querySelectorAll('.pf-rd__stage-item').length,
        pending: !!rd.querySelector('[data-subject-pending]'),
        verified: rd.dataset.verified,
      };
    }, before.id);
    check('choosing it opens that garment, and the URL says which',
      entered.open && entered.hash === `#womenswear/rtw/${before.id}`, entered.hash);
    check('focus moves into the garment', entered.focusInside);
    check('THE GARMENT IS ACTUALLY BIGGER than the cell it came from',
      entered.garment > before.thumb * 1.8 && entered.garment > 450,
      `${before.thumb}px in the range, ${entered.garment}px entered`);
    check('it is still Womenswear, on the chapter\'s own ground',
      entered.ground === 'rgb(243, 240, 233)', entered.ground);
    check('and the way out goes back to the territory, not to the portfolio',
      entered.backTo === '#womenswear/rtw', entered.backTo);
    check('a two-view photograph is shown as one frame that travels',
      entered.travel && entered.views === 1, JSON.stringify({ travel: entered.travel, views: entered.views }));
    check('no development stage is invented for an unverified frame',
      entered.verified === 'no' && entered.stages === 0 && entered.pending,
      JSON.stringify(entered));

    /* THE TURN, inside the garment: the frame travels, and it is the hand
       that moves it. */
    const box = await p.evaluate((id) => {
      const r = document.querySelector(`[data-subject="${id}"] [data-rd-travel]`).getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    }, before.id);
    const secondAt = async (fraction) => {
      await p.mouse.move(box.x + box.w * fraction, box.y + box.h / 2);
      await p.waitForTimeout(200);
      return p.evaluate((id) => Number(getComputedStyle(
        document.querySelector(`[data-subject="${id}"] [data-rd-travel]`)).getPropertyValue('--second')), before.id);
    };
    const atFront = await secondAt(0.02);
    const atBack = await secondAt(0.98);
    check('moving across the garment turns it from front to back',
      atFront < 0.1 && atBack > 0.9, `${atFront} → ${atBack}`);

    /* LOOKING CLOSER: the same pixels, larger. */
    await p.evaluate((id) => document.querySelector(`[data-subject="${id}"] [data-rd-inspect]`).click(), before.id);
    await p.waitForTimeout(500);
    const closer = await p.evaluate((id) => {
      const rd = document.querySelector(`[data-subject="${id}"]`);
      const img = rd.querySelector('.pf-rd__window img');
      return {
        on: rd.hasAttribute('data-inspect'),
        pressed: rd.querySelector('[data-rd-inspect]').getAttribute('aria-pressed'),
        scale: new DOMMatrixReadOnly(getComputedStyle(img).transform).a,
        height: Math.round(rd.querySelector('.pf-rd__view').getBoundingClientRect().height),
      };
    }, before.id);
    check('the garment can be inspected closer than life size',
      closer.on && closer.pressed === 'true' && closer.scale >= 1.7, JSON.stringify(closer));

    /* ESCAPE GIVES BACK ONE THING AT A TIME: inspection, the garment, the
       territory, the chapter. */
    await p.keyboard.press('Escape');
    await p.waitForTimeout(400);
    check('Escape releases the inspection first',
      await p.evaluate((id) => !document.querySelector(`[data-subject="${id}"]`).hasAttribute('data-inspect'), before.id));
    await p.keyboard.press('Escape');
    await p.waitForTimeout(700);
    const left = await p.evaluate((id) => ({
      hash: location.hash,
      readerOpen: !document.querySelector(`[data-subject="${id}"]`).hidden,
      chapterOpen: document.querySelector('[data-world="womenswear"]').hasAttribute('data-open'),
      focusBackOnDoor: document.activeElement?.dataset?.openSubject === id,
    }), before.id);
    check('then the garment, landing back in the territory it came from',
      left.hash === '#womenswear/rtw' && !left.readerOpen && left.chapterOpen, JSON.stringify(left));
    check('and the focus is back on the frame the visitor chose', left.focusBackOnDoor);

    /* EVERY MECHANISM IS A WAY IN, not a dead end. */
    const everyDoor = await p.evaluate(() => {
      const w = document.querySelector('[data-world="womenswear"]');
      const per = {};
      for (const scene of w.querySelectorAll('[data-support], [data-scene="pair"]')) {
        per[scene.dataset.scene] = scene.querySelectorAll('[data-open-subject]').length;
      }
      return per;
    });
    check('the sheet, the deck, the pair, the rail and the line are all ways in',
      ['sheet', 'deck', 'pair', 'rail', 'line'].every((k) => (everyDoor[k] ?? 0) > 0),
      JSON.stringify(everyDoor));

    /* A GARMENT IS ADDRESSABLE: reloading its URL opens it. */
    await p.goto(BASE + `/portfolio/#womenswear/evening/evening-ref-03`, { waitUntil: 'load' });
    await p.waitForTimeout(1400);
    const deep = await p.evaluate(() => {
      const rd = [...document.querySelectorAll('.pf-rd__subject')].find((e) => !e.hidden);
      return { id: rd?.dataset.subject, reveal: rd?.dataset.reveal, chapter: document.querySelector('[data-world="womenswear"]').hasAttribute('data-open') };
    });
    check('a garment can be linked to and reloaded straight into',
      deep.id === 'evening-ref-03' && deep.chapter, JSON.stringify(deep));
    check('and it keeps its own territory\'s gesture', deep.reveal === 'foreground', String(deep.reveal));
    await c.close();
  }

  // ---- the development evidence rail, on a chapter that still has one
  console.log('\nportfolio evidence rail');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    /* Womenswear is an act and deliberately carries no evidence rail — the
       three development stages are Development's chapter. Menswear still has
       the category-screen architecture, so the rail, the white studio band
       and the garment-to-evidence balance are proved there. */
    await openChapter(p, 'menswear');
    await openCategory(p, 'menswear', 'm-rtw');

    const studio = await p.evaluate(() => {
      const band = document.querySelector('[data-screen="category"]:not([hidden]) .pf-studio');
      const r = band.getBoundingClientRect();
      const st = getComputedStyle(band);
      return { left: Math.round(r.left), width: Math.round(r.width), vw: document.documentElement.clientWidth, bg: st.backgroundColor };
    });
    check('the viewer sits in one full-width white field',
      studio.left === 0 && studio.width >= studio.vw - 1 && studio.bg === 'rgb(255, 255, 255)',
      JSON.stringify(studio));

    /* THREE EQUAL DEVELOPMENT PLATES, ONE ABOVE THE OTHER. */
    const plates = await p.evaluate(() => {
      const panel = document.querySelector('[data-screen="category"]:not([hidden]) .pf-panel');
      const list = [...panel.querySelectorAll('.pf-plate')];
      const boxes = list.map((el) => el.querySelector('.pf-plate__art').getBoundingClientRect());
      return {
        stages: list.map((el) => el.dataset.plate),
        labels: list.map((el) => el.querySelector('.pf-plate__label').textContent.replace(/\s+/g, ' ').trim()),
        demo: list.filter((el) => el.hasAttribute('data-demo')).length,
        images: list.reduce((n, el) => n + el.querySelectorAll('img').length, 0),
        widths: boxes.map((b) => Math.round(b.width)),
        heights: boxes.map((b) => Math.round(b.height)),
        lefts: boxes.map((b) => Math.round(b.left)),
        stacked: boxes.every((b, i) => i === 0 || b.top >= boxes[i - 1].bottom - 2),
        links: panel.querySelectorAll('.pf-plate__link').length,
        note: panel.querySelector('[data-demo-note]')?.textContent.trim() ?? '',
      };
    });
    check('exactly three development stages, in order',
      plates.stages.join(',') === 'sketch,pattern,simulation', plates.stages.join(','));
    check('the stages are labelled sketch, 2D pattern, 3D simulation',
      plates.labels.join(' | ') === 'Step 01 Sketch | Step 02 2D Pattern | Step 03 3D Simulation',
      plates.labels.join(' | '));
    check('the three plates are exactly the same size',
      Math.max(...plates.widths) - Math.min(...plates.widths) <= 1
      && Math.max(...plates.heights) - Math.min(...plates.heights) <= 1,
      `${plates.widths.join('/')} x ${plates.heights.join('/')}`);
    check('the three plates are stacked one above another in one column',
      plates.stacked && new Set(plates.lefts).size === 1, `${plates.lefts.join(',')} stacked ${plates.stacked}`);
    check('stage numbering replaces provisional connector arrows', plates.links === 0, String(plates.links));

    /* THE GARMENT IS THE HERO. The result carries the argument; the three
       development stages are the proof behind it and are sized to say so. */
    const weight = await p.evaluate(() => {
      const viewer = document.querySelector('[data-screen="category"]:not([hidden]) .pf-viewer');
      const deck = viewer.querySelector('.pf-deck').getBoundingClientRect();
      const rail = viewer.querySelector('.pf-devcol').getBoundingClientRect();
      const stage = viewer.querySelector('.pf-stage').getBoundingClientRect();
      const dev = viewer.querySelector('.pf-dev').getBoundingClientRect();
      const plate = viewer.querySelector('.pf-plate__art').getBoundingClientRect();
      const total = deck.width + rail.width;
      return {
        deckShare: deck.width / total,
        railShare: rail.width / total,
        sideBySide: rail.left > deck.right - 2,
        plateWidth: Math.round(plate.width),
        stageHeight: Math.round(stage.height),
        deckHeight: Math.round(deck.height),
        railHeight: Math.round(dev.height),
        deckSticky: getComputedStyle(viewer.querySelector('.pf-deck')).position,
      };
    });
    check('the garment remains dominant at 70-74% of the viewer',
      weight.sideBySide && weight.deckShare >= 0.70 && weight.deckShare <= 0.74,
      `${Math.round(weight.deckShare * 100)}%`);
    check('the evidence rail uses 26-30% of the viewer',
      weight.railShare >= 0.26 && weight.railShare <= 0.30, `${Math.round(weight.railShare * 100)}%`);
    /* RECALIBRATED, and worth saying why. These proportions used to be read
       off Womenswear's category screen, whose photographs are two-ups that
       overlap by about 45% — so four of them solved to a tall stage. Menswear
       carries single-view editorial frames with nothing to occlude, so the
       same four cards spread out and the stage comes out at about two thirds
       of that height. That is the SMALLEST garment stage on the site and so
       the hardest case for the rail: the plate still has to read as a
       fraction of the garment, and the three of them still have to stand no
       taller than the deck they sit beside. */
    check('a development plate is a fraction of the garment stage',
      weight.plateWidth >= 220 && weight.plateWidth <= weight.stageHeight * 0.7,
      `plate ${weight.plateWidth}px against a ${weight.stageHeight}px stage`);
    check('all three plates fit beside the garments without a sticky deck',
      weight.railHeight <= weight.deckHeight + 2 && weight.deckSticky !== 'sticky',
      `rail ${weight.railHeight}px vs deck ${weight.deckHeight}px, deck ${weight.deckSticky}`);
    check('every plate is marked as a demo and borrows no image',
      plates.demo === 3 && plates.images === 0, `${plates.demo} demo / ${plates.images} images`);
    check('the strip says the real assets are pending',
      /real project assets pending/i.test(plates.note), plates.note || 'none');

    await c.close();
  }

  /* ---- the deck at 1024 and at 390 ---------------------------------------
     Womenswear's deck lives in a movement's run now. Below 768 the act's deck
     carries TWO cards rather than three: the run has a screen to itself here,
     the leading card is solved from the stage's width, and three of them on a
     390px screen came out at 266px of model in an 844px frame. Two cards
     still read as depth and the garment is a quarter bigger. Every other deck
     on the site keeps three, which is checked straight after. */
  for (const [width, height, want, maxRatio, mobile] of [
    [1024, 820, 4, 0.62, false],
    [390, 844, 2, 0.72, true],
  ]) {
    console.log(`\nportfolio deck at ${width}`);
    const c = await ctxWithFonts({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(700);
    await openChapter(p, 'womenswear');
    await openScene(p, '[data-scene="deck"]');

    const st = await p.evaluate(() => window.__portfolioRunway.getState());
    check(`${width} shows ${want} garments at once`, st.visibleNow === want, `visible ${st.visibleNow}`);
    check(`${width} active garment still leads`, st.activeIsLeading === true);
    check(`${width} garments genuinely overlap`, st.overlaps >= want - 1, `${st.overlaps} overlaps`);

    const geo = await p.evaluate((sel) => {
      const stage = document.querySelector(`${sel} .pf-stage`).getBoundingClientRect();
      const boxes = [...document.querySelectorAll(`${sel} .pf-slot`)]
        .filter((s) => !s.hidden).map((s) => s.getBoundingClientRect()).sort((a, b) => a.left - b.left);
      return {
        widths: boxes.map((b) => Math.round(b.width)),
        inside: boxes.every((b) => b.left >= stage.left - 1 && b.right <= stage.right + 1),
      };
    }, ACT_DECK);
    check(`${width} keeps every garment inside the stage`, geo.inside, geo.widths.join(','));
    const ratio = geo.widths[0] / geo.widths[geo.widths.length - 1];
    check(`${width} depth is immediately visible`, ratio <= maxRatio, `${Math.round(ratio * 100)}% of the leader`);
    /* The run is deliberately a third of the look's scale — that contrast is
       the hierarchy — but the leading card still has to be a garment you can
       judge, not a thumbnail. Measured floors: 289px at 1024, 251px at 390. */
    check(`${width} the leading garment is worth looking at`,
      geo.widths[geo.widths.length - 1] >= (width < 768 ? 230 : 270),
      `${geo.widths[geo.widths.length - 1]}px`);
    check(`no horizontal overflow at ${width}`,
      await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await c.close();
  }

  /* ---- every other deck keeps three cards on a phone --------------------- */
  for (const [width, height, want] of [[1024, 820, 4], [390, 844, 3]]) {
    console.log(`\nportfolio menswear deck and plates at ${width}`);
    const c = await ctxWithFonts({ viewport: { width, height }, isMobile: width < 768, hasTouch: width < 768 });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(700);
    await openChapter(p, 'menswear');
    await openCategory(p, 'menswear', 'm-rtw');

    const st = await p.evaluate(() => window.__portfolioRunway.getState());
    check(`${width} menswear shows ${want} garments at once`, st.visibleNow === want, `visible ${st.visibleNow}`);
    check(`${width} menswear active garment still leads`, st.activeIsLeading === true);

    /* Plates stay equal-size and stacked on every screen: equal at every
       width; a column beside the deck on a desktop and a compact row under it
       on a phone, so three plates never take over a screen the garment should
       own. */
    const eq = await p.evaluate(() => {
      const boxes = [...document.querySelectorAll('[data-screen="category"]:not([hidden]) .pf-plate__art')]
        .map((el) => el.getBoundingClientRect());
      return {
        w: boxes.map((b) => Math.round(b.width)),
        h: boxes.map((b) => Math.round(b.height)),
        stacked: boxes.every((b, i) => i === 0 || b.top >= boxes[i - 1].bottom - 2),
      };
    });
    check(`${width} keeps the three plates exactly equal`,
      eq.w.length === 3 && new Set(eq.w).size === 1 && new Set(eq.h).size === 1,
      `${eq.w.join('/')} x ${eq.h.join('/')}`);
    check(`${width} arranges the plates as a ${width >= 1024 ? 'column' : 'compact row'}`,
      width >= 1024 ? eq.stacked : (!eq.stacked && eq.w[0] <= 160),
      `stacked ${eq.stacked}, plate ${eq.w[0]}px`);
    check(`no horizontal overflow at ${width} in menswear`,
      await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await c.close();
  }

  // ---- Tech Packs: five documents in a column, and a reader
  console.log('\nportfolio tech packs');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    const pdfRequests = [];
    p.on('request', (r) => { if (/\.pdf(\?|$)/i.test(r.url())) pdfRequests.push(r.url()); });
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openChapter(p, 'tech-packs');

    const docs = await p.evaluate(() => {
      const w = document.querySelector('[data-world="tech-packs"]');
      const list = [...w.querySelectorAll('.pf-doc')];
      const boxes = list.map((el) => el.getBoundingClientRect());
      return {
        count: list.length,
        stacked: boxes.every((b, i) => i === 0 || b.top >= boxes[i - 1].bottom - 2),
        lefts: boxes.map((b) => Math.round(b.left)),
        previews: list.map((el) => el.querySelector('.pf-doc__page img')?.getAttribute('src') ?? ''),
        previewLinks: list.map((el) => el.querySelector('.pf-doc__page')?.getAttribute('href') ?? ''),
        previewWidths: list.map((el) => Math.round(el.querySelector('.pf-doc__page').getBoundingClientRect().width)),
        numbers: list.map((el) => el.querySelector('.pf-doc__num').textContent.trim()),
        opens: list.map((el) => el.querySelector('[data-open-pdf]')?.getAttribute('href') ?? ''),
        stamps: list.filter((el) => /demo/i.test(el.querySelector('.pf-doc__stamp')?.textContent ?? '')).length,
        carousel: w.querySelectorAll('.pf-folio, .pf-library__pile, [data-dossier]').length,
      };
    });
    check('five demo documents', docs.count === 5, String(docs.count));
    check('the documents run one below another',
      docs.stacked && new Set(docs.lefts).size === 1, `${docs.lefts.join(',')} stacked ${docs.stacked}`);
    check('the numbering runs 01 to 05', docs.numbers.join(',') === '01,02,03,04,05', docs.numbers.join(','));
    check('each shows its own first page, large',
      docs.previews.every((src) => /\/demo\/techpacks\/demo-\d\d-[a-z-]+-p1\.webp$/.test(src))
      && docs.previewWidths.every((w) => w >= 400),
      `${docs.previews.map((s) => s.split('/').pop()).join(' ')} @ ${docs.previewWidths.join(',')}`);
    check('each is marked a demo', docs.stamps === 5, String(docs.stamps));
    check('each offers its own PDF',
      docs.opens.every((href) => /^\/demo\/techpacks\/demo-\d\d-[a-z-]+\.pdf$/.test(href)), docs.opens.join(' '));
    check('every document preview is itself clickable',
      docs.previewLinks.every((href) => /^\/demo\/techpacks\/demo-\d\d-[a-z-]+\.pdf$/.test(href)), docs.previewLinks.join(' '));
    check('the rejected folio/carousel interface is gone', docs.carousel === 0, String(docs.carousel));

    check('no PDF byte is fetched when the chapter opens', pdfRequests.length === 0, pdfRequests.join(','));

    await p.evaluate(() => document.querySelector('[data-world="tech-packs"] [data-open-pdf]').click());
    await p.waitForTimeout(900);
    const reader = await p.evaluate(() => {
      const r = document.querySelector('[data-reader]');
      const obj = r.querySelector('object');
      return {
        open: !r.hidden,
        embeds: r.querySelectorAll('object, iframe').length,
        data: obj?.getAttribute('data') ?? '',
        type: obj?.getAttribute('type') ?? '',
        fallback: !!obj?.querySelector('a[href$=".pdf"]'),
        title: r.querySelector('[data-reader-title]')?.textContent.trim() ?? '',
        closes: r.querySelectorAll('[data-reader-close]').length,
        covers: Math.round(r.getBoundingClientRect().height) >= 890,
      };
    });
    check('clicking a document opens the reader', reader.open && reader.embeds === 1, JSON.stringify(reader));
    check('the reader holds the real PDF', /\.pdf$/.test(reader.data) && reader.type === 'application/pdf', reader.data);
    check('the reader offers a fallback for browsers without a PDF viewer', reader.fallback);
    check('the reader names the document', reader.title.length > 0, reader.title);
    check('the reader fills the screen and can be closed', reader.covers && reader.closes === 1);
    /* Only the pre-click assertion is a real one. Headless Chromium ships no
       PDF viewer, so it does not fetch a document it cannot render; whether
       the bytes arrive after the click is a property of the browser, not of
       this page. What this page controls — that nothing is requested until the
       click, and that the embed points at the real document — is asserted
       above. */
    check('no document was fetched beyond the one that was opened',
      pdfRequests.every((url) => /demo-01/.test(url)), pdfRequests.join(','));

    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    check('Escape closes the reader and tears the embed down',
      await p.evaluate(() => {
        const r = document.querySelector('[data-reader]');
        return r.hidden && r.querySelectorAll('object, iframe').length === 0;
      }));
    check('and the chapter is still open',
      await p.evaluate(() => document.querySelector('[data-world="tech-packs"]').hasAttribute('data-open')));

    const refusal = await p.evaluate(() => /shared (directly )?on request|not published on a public page/i.test(document.body.innerText));
    check('no statement that technical packs are withheld from publication', refusal === false);
    await c.close();
  }

  // ---- Pattern & 3D Development: five supplied click-to-load recordings
  console.log('\nportfolio 3D simulation');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    const media = [];
    p.on('request', (r) => { if (/youtube|ytimg|googlevideo|\.mp4$/i.test(r.url())) media.push(r.url()); });
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openChapter(p, '3d-simulation');

    /* All five supplied recordings render as equal poster-led rows. No iframe
       exists until one deliberate play click. */
    const reel = await p.evaluate(() => {
      const w = document.querySelector('[data-world="3d-simulation"]');
      const items = [...w.querySelectorAll('[data-video]')];
      return {
        rendered: items.length,
        ids: items.map((item) => item.dataset.youtube),
        posters: items.map((item) => item.querySelector('img')?.getAttribute('src') ?? ''),
        capacity: Number(w.querySelector('[data-capacity]')?.dataset.capacity ?? 0),
        players: w.querySelectorAll('[data-player] > *').length,
        playControls: w.querySelectorAll('[data-play]').length,
        localVideo: w.innerHTML.includes('CLO3D.mp4') || w.querySelectorAll('video').length,
        strip: w.querySelectorAll('.pf-strip, .pf-frame, .pf-reel__stage').length,
      };
    });
    const suppliedIds = ['dfbUl82h8Ck', 'iOyhNjVEe_U', 'UToex4DCeZ8', 'TDfFjjnbPq4', 'ure0EK4gq3k'];
    check('exactly five supplied recordings are published', reel.rendered === 5 && reel.capacity === 5, `${reel.rendered}/${reel.capacity}`);
    check('the exact five supplied YouTube ids are used in order', JSON.stringify(reel.ids) === JSON.stringify(suppliedIds), reel.ids.join(','));
    check('every recording has its localized YouTube poster', reel.posters.every((src, index) => src === `/portfolio/posters/${suppliedIds[index]}.jpg`), reel.posters.join(' | '));
    check('no player exists before a click, while all play controls do',
      reel.players === 0 && reel.playControls === 5, `${reel.players}/${reel.playControls}`);
    check('the local home-page clip is not used as a library video',
      reel.localVideo === false || reel.localVideo === 0, String(reel.localVideo));
    check('the rejected hero-plus-film-strip interface is gone', reel.strip === 0, String(reel.strip));

    check('no privacy-enhanced player is requested before play', media.every((url) => !/youtube-nocookie\.com\/embed/i.test(url)), media.join(' | '));
    await p.evaluate(() => document.querySelector('[data-world="3d-simulation"] [data-play]').click());
    await p.waitForTimeout(300);
    const played = await p.evaluate(() => {
      const frames = [...document.querySelectorAll('[data-world="3d-simulation"] iframe')];
      return { count: frames.length, src: frames[0]?.getAttribute('src') ?? '' };
    });
    check('a click creates exactly one privacy-enhanced iframe',
      played.count === 1 && played.src.includes(`youtube-nocookie.com/embed/${suppliedIds[0]}`), JSON.stringify(played));

    /* A published session renders in the same 16:9 frame the empty state
       promises. The rule is in the stylesheet whether or not a session exists
       yet, so it is asserted directly. */
    const frameRule = await p.evaluate(() => {
      const probe = document.createElement('div');
      probe.className = 'pf-video__frame';
      probe.style.width = '320px';
      document.querySelector('[data-world="3d-simulation"]').append(probe);
      const r = probe.getBoundingClientRect();
      const ratio = r.width / r.height;
      probe.remove();
      return +ratio.toFixed(2);
    });
    check('a published session frame is 16:9', Math.abs(frameRule - 16 / 9) < 0.02, String(frameRule));

    /* THE WHOLE WORLD IS INK — bar, header, list and the gaps between the
       videos — not a paper page with black rectangles punched into it. */
    const dark = await p.evaluate(() => {
      const w = document.querySelector('[data-world="3d-simulation"]');
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
      const h = ink.replace('#', '');
      const inkRgb = `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
      const bg = (sel) => getComputedStyle(w.querySelector(sel)).backgroundColor;
      const lum = (c) => {
        const m = c.match(/\d+/g) ?? [];
        return (Number(m[0]) * 299 + Number(m[1]) * 587 + Number(m[2]) * 114) / 1000;
      };
      const signal = getComputedStyle(document.documentElement).getPropertyValue('--signal').trim();
      const sh = signal.replace('#', '');
      const signalRgb = `rgb(${parseInt(sh.slice(0, 2), 16)}, ${parseInt(sh.slice(2, 4), 16)}, ${parseInt(sh.slice(4, 6), 16)})`;
      return {
        world: getComputedStyle(w).backgroundColor,
        inkRgb,
        bar: bg('.pf-bar'),
        title: getComputedStyle(w.querySelector('.pf-head h2')).color,
        titleLum: lum(getComputedStyle(w.querySelector('.pf-head h2')).color),
        gapLum: lum(getComputedStyle(w.querySelector('[data-screen]')).backgroundColor === 'rgba(0, 0, 0, 0)'
          ? getComputedStyle(w).backgroundColor
          : getComputedStyle(w.querySelector('[data-screen]')).backgroundColor),
        leadLum: lum(getComputedStyle(w.querySelector('.pf-video__head h3')).color),
        /* Orange is a signal, never a surface. A hairline mark carries it —
           the last step of the progression signature is a 2px rule — so this
           counts painted AREA rather than any use of the colour at all. */
        orangeFills: [...w.querySelectorAll('*')]
          .filter((el) => {
            if (getComputedStyle(el).backgroundColor !== signalRgb) return false;
            const r = el.getBoundingClientRect();
            return r.width * r.height > 400;
          }).length,
        /* Nothing is a card. */
        rounded: [...w.querySelectorAll('.pf-video, .pf-video__frame, .pf-soon')]
          .filter((el) => getComputedStyle(el).borderRadius !== '0px'
            || getComputedStyle(el).boxShadow !== 'none').length,
      };
    });
    check('the whole chapter is ink', dark.world === dark.inkRgb, `${dark.world} vs ${dark.inkRgb}`);
    check('the top bar belongs to the dark world', dark.bar === dark.inkRgb, dark.bar);
    check('the type is paper on ink', dark.titleLum > 200, `${Math.round(dark.titleLum)}`);
    check('there is no paper gap between the videos', dark.gapLum < 40, `${Math.round(dark.gapLum)}`);
    check('the chapter type is paper throughout', dark.leadLum > 200, `${Math.round(dark.leadLum)}`);
    check('orange is a signal, never a surface', dark.orangeFills === 0, String(dark.orangeFills));
    check('nothing in the dark world is drawn as a card', dark.rounded === 0, String(dark.rounded));

    /* The chapter is named for what the recordings actually cover. */
    const naming = await p.evaluate(() => {
      const w = document.querySelector('[data-world="3d-simulation"]');
      return {
        heading: w.querySelector('.pf-head h2').textContent.trim(),
        bar: w.querySelector('.pf-bar__tag').textContent.replace(/\s+/g, ' ').trim(),
        descriptor: w.querySelector('.pf-head__descriptor').textContent.replace(/\s+/g, ' ').trim(),
      };
    });
    check('the chapter heading is Pattern Development',
      naming.heading === 'Pattern Development', naming.heading);
    check('the navigation label matches', naming.bar === '03 Pattern Development', naming.bar);
    check('the descriptor names the whole development arc',
      /first pattern lines/i.test(naming.descriptor) && /CLO3D validation/i.test(naming.descriptor)
      && /fit decisions/i.test(naming.descriptor), naming.descriptor);
    await c.close();
  }

  // ---- reduced motion: everything still reachable, nothing left mid-tween
  console.log('\nreduced motion');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openChapter(p, 'womenswear');
    await openScene(p, '[data-scene="deck"]');

    await p.evaluate((sel) => document.querySelector(`${sel} [data-stage]`).focus(), ACT_DECK);
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(120);
    const state = await p.evaluate(() => window.__portfolioRunway.getState());
    check('deck settles instantly under reduced motion', Number.isInteger(state.position), `position ${state.position}`);
    check('reduced motion still advances the deck', state.activeIndex === 1, String(state.activeIndex));
    check('reduced motion keeps four garments visible', state.visibleNow === 4, String(state.visibleNow));
    check('no decorative transition left running',
      await p.evaluate((sel) => getComputedStyle(
        document.querySelector(`${sel} .pf-slot`)).transitionDuration === '0s', ACT_DECK));
    check('reveal blocks visible without scrolling',
      await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every((e) => getComputedStyle(e).opacity === '1')));
    /* EVERY REVEAL IN THIS ACT IS INFORMATION, NOT DECORATION, so without
       motion it is delivered rather than withheld: the two turn scenes open
       onto the whole photograph, Swim's approach sits at full size, and no
       scroll distance is reserved anywhere for a move that will not happen. */
    const still = await p.evaluate(() => {
      const read = (scene) => {
        const host = document.querySelector(`[data-scene="${scene}"]`);
        const plate = host.querySelector('[data-views]');
        const win = plate.querySelector('span');
        const img = win.querySelector('img');
        const reveal = plate.closest('[data-reveal]');
        return {
          half: getComputedStyle(plate).getPropertyValue('--half').trim(),
          transform: getComputedStyle(img).transform,
          shows: Math.round(win.getBoundingClientRect().width / img.getBoundingClientRect().width * 100),
          reserved: Math.round(reveal.getBoundingClientRect().height - window.innerHeight),
        };
      };
      const approach = document.querySelector('[data-approach]');
      return {
        overture: read('overture'),
        turn: read('turn'),
        approachScale: getComputedStyle(approach).transform,
      };
    });
    for (const scene of ['overture', 'turn']) {
      const it = still[scene];
      check(`without motion the ${scene} shows the whole photograph, both views`,
        it.half === '1' && it.shows >= 99, JSON.stringify(it));
      check(`without motion the ${scene}'s photograph does not travel`,
        it.transform === 'none' || it.transform === 'matrix(1, 0, 0, 1, 0, 0)', it.transform);
      check(`without motion the ${scene} reserves no scroll for its move`,
        Math.abs(it.reserved) <= 2, `${it.reserved}px`);
    }
    check('without motion Swim arrives at full size rather than growing into it',
      still.approachScale === 'none' || still.approachScale === 'matrix(1, 0, 0, 1, 0, 0)',
      still.approachScale);
    await c.close();
  }

  // ---- without JavaScript the work is still there
  console.log('\nportfolio without JavaScript');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    const html = await p.content();
    check('all four chapters are in the served HTML',
      ['womenswear', 'menswear', 'tech-packs', '3d-simulation'].every((id) => html.includes(`data-world="${id}"`)));
    check('the non-authorship disclaimer is server-rendered',
      html.includes('No authorship of photographed garments is claimed'));
    check('the approved categories are server-rendered',
      html.includes('Evening &#38; Occasionwear') || html.includes('Evening &amp; Occasionwear') || html.includes('Evening & Occasionwear'));
    check('the demo documents are declared as demos without the script',
      html.includes('Demo — interface prototype') || html.includes('Demo &#8212; interface prototype'));
    check('the development plates are declared as demos without the script',
      html.includes('Demo layout — real project assets pending') || html.includes('Demo layout &#8212; real project assets pending'));
    check('all five supplied development recordings are server-rendered without players',
      ['dfbUl82h8Ck', 'iOyhNjVEe_U', 'UToex4DCeZ8', 'TDfFjjnbPq4', 'ure0EK4gq3k']
        .every((id) => html.includes(`data-youtube="${id}"`))
      && !html.includes('youtube-nocookie.com/embed/'));
    const visible = await p.evaluate(() => {
      const slots = [...document.querySelectorAll('.pf-slot')];
      return { total: slots.length, shown: slots.filter((s) => s.getBoundingClientRect().width > 20).length };
    });
    check('garment images are laid out without the script', visible.shown > 5, `${visible.shown} of ${visible.total}`);
    await c.close();
  }

  // ---- Home portrait is one transparent cut-out, never a mirrored duplicate
  console.log('\nHome portrait treatment');
  {
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
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
    const c = await ctxWithFonts({ viewport: { width: 390, height: 844 } });
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
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
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
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
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

      const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
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
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
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
    const c = await ctxWithFonts({ viewport: { width: 1440, height: 900 } });
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
