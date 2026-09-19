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
     PORTFOLIO V8

     The presentation was rebuilt around a three-level hierarchy — portfolio
     index, chapter category index, category viewer — so the assertions that
     described the V7 single-screen chapter (the folio table, the film strip,
     the 2+1 development panel, the subchapter bands sitting above a viewer)
     are gone with the interface they protected. Every factual-integrity rule
     they carried alongside is kept and re-asserted here against the new
     architecture.
     ------------------------------------------------------------------------ */
  const openChapter = async (p, id) => {
    await p.evaluate((chapter) => {
      const link = document.querySelector(`[data-chapter="${chapter}"]`);
      link.id = 'smoke-trigger';
      link.click();
    }, id);
    await p.waitForTimeout(800);
  };
  const openCategory = async (p, world, category) => {
    await p.evaluate(([w, c]) => {
      document.querySelector(`[data-world="${w}"] a.pf-lay__piece[data-category="${c}"]`).click();
    }, [world, category]);
    await p.waitForTimeout(800);
  };

  // ---- structure: four chapters in one asymmetric editorial cover gallery
  console.log('\nportfolio index');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(500);

    const worlds = await p.evaluate(() => [...document.querySelectorAll('[data-world]')].map((e) => e.dataset.world));
    check('exactly four top-level chapters', worlds.length === 4, worlds.join(','));
    for (const id of ['womenswear', 'menswear', 'tech-packs', '3d-simulation']) {
      check(`chapter "${id}" exists`, worlds.includes(id));
    }

    /* THE LAY: FOUR PIECES CUT FROM ONE FIELD.
       Rewritten for the third direction. The first assumed the four chapters
       were deliberately unequal (they read as a ranking). The second assumed
       they were four equal cards with gaps between them (they read as a
       template). They are now four pieces of one field: equal in width and
       height, TOUCHING, divided by three cuts, and differing in what each one
       holds rather than in how much room it gets. */
    const pieces = await p.evaluate(() => {
      const list = [...document.querySelectorAll('.pf-piece')];
      return list.map((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return {
          chapter: el.dataset.chapter,
          top: Math.round(r.top + window.scrollY),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          height: Math.round(r.height),
          isLink: el.tagName === 'A',
          boxed: s.borderRadius !== '0px' || s.boxShadow !== 'none',
          namePx: Math.round(parseFloat(getComputedStyle(el.querySelector('.pf-piece__name')).fontSize)),
          name: el.querySelector('.pf-piece__name').textContent.trim(),
          intent: el.querySelector('.pf-piece__intent').textContent.trim(),
          enter: el.querySelector('.pf-piece__enter').textContent.trim(),
          source: el.dataset.imageSource ?? '',
          text: el.textContent.replace(/\s+/g, ' ').trim(),
        };
      });
    });
    check('four chapter pieces on the landing', pieces.length === 4, String(pieces.length));
    check('the four chapters are equal in width and height',
      new Set(pieces.map((q) => q.width)).size === 1 && new Set(pieces.map((q) => q.height)).size === 1,
      pieces.map((q) => `${q.width}x${q.height}`).join(' '));
    /* ONE FIELD, CUT — which is now literally true and so is tested
       literally: all four layers occupy the SAME box, the field's, and what
       separates them is a clip path each. Four boxes side by side with no gap
       was the previous implementation; it is what "four cards, touching"
       looks like, and this is not that. */
    const field = await p.evaluate(() => {
      const f = document.querySelector('[data-cut-field]').getBoundingClientRect();
      return { left: Math.round(f.left), right: Math.round(f.right), width: Math.round(f.width) };
    });
    check('the four pieces are one field, each with its own cut',
      pieces.every((q) => Math.abs(q.left - field.left) <= 1 && Math.abs(q.right - field.right) <= 1),
      pieces.map((q) => `${q.left}..${q.right}`).join(' '));
    /* AT ARRIVAL the field is entirely chapter 01 and the other three are cut
       to nothing — which is the storyboard's first state stated as geometry
       rather than as a screenshot. Every layer is clipped; three are empty. */
    check('at arrival the whole field is chapter 01 and the rest are cut to nothing',
      await p.evaluate(() => {
        const list = [...document.querySelectorAll('.pf-piece')];
        const clips = list.map((e) => getComputedStyle(e).clipPath);
        const collapsed = clips.filter((c) => /inset\(0(px)? 100%/.test(c)).length;
        return clips.every((c) => c && c !== 'none')
          && collapsed === 3
          && !/inset\(0(px)? 100%/.test(clips[0])
          && list[0].dataset.chapter === 'womenswear';
      }));
    check('the field runs edge to edge',
      field.left <= 1 && field.right >= (await p.evaluate(() => document.documentElement.clientWidth)) - 1,
      `${field.left} .. ${field.right}`);
    check('no piece is drawn as a card', pieces.every((q) => !q.boxed));
    check('every chapter is openable', pieces.every((q) => q.isLink));
    check('every chapter records its image source', pieces.every((q) => q.source.length > 0));

    /* THREE CUTS, AND NOTHING ELSE RULED. The cuts are the only rules on the
       screen, and they are scored by the scroll rather than drawn at rest. */
    const cuts = await p.evaluate(() => {
      const list = [...document.querySelectorAll('[data-cut-seams] [data-seam]')];
      return {
        count: list.length,
        drawn: list.filter((el) => (el.getAttribute('d') ?? '').length > 10).length,
        /* Generated geometry, not three copies of one line. */
        distinct: new Set(list.map((el) => el.getAttribute('d'))).size,
      };
    });
    check('three cuts divide the four pieces', cuts.count === 3, String(cuts.count));
    check('each cut is a real curve, and no two are the same curve',
      cuts.drawn === 3 && cuts.distinct === 3, `${cuts.drawn} drawn / ${cuts.distinct} distinct`);

    /* EQUAL VALUE, DIFFERENT NATURE. The pieces do not differ in area — they
       differ in what is in them: a photograph, a photograph, a typeset
       document and a moving simulation. That is how four things are made
       distinct without any of them being ranked. */
    const natures = await p.evaluate(() => ({
      photographs: document.querySelectorAll('.pf-piece[data-chapter="womenswear"] .pf-piece__img, .pf-piece[data-chapter="menswear"] .pf-piece__img').length,
      typeset: document.querySelectorAll('.pf-piece[data-chapter="tech-packs"] .pf-piece__doc span').length,
      motion: document.querySelectorAll('.pf-piece[data-chapter="3d-simulation"] video source').length,
      grounds: new Set([...document.querySelectorAll('.pf-piece')].map((e) => getComputedStyle(e).backgroundColor)).size,
    }));
    check('two chapters are photographs', natures.photographs === 2, String(natures.photographs));
    check('the documentation chapter is typeset from its real contents',
      natures.typeset >= 5, `${natures.typeset} sections`);
    check('the transformation chapter moves, with a fallback codec',
      natures.motion === 2, `${natures.motion} sources`);
    check('one chapter stands on ink', natures.grounds === 2, `${natures.grounds} grounds`);

    /* Four identical "Enter world" labels told a visitor nothing. Each chapter
       names its own way in, in the body face and in sentence case — not
       tracked-out caps with an arrow stuck on the end. */
    check('every chapter has a distinct intent and its own way in',
      pieces.every((q) => q.intent && q.enter)
        && new Set(pieces.map((q) => q.intent)).size === 4
        && new Set(pieces.map((q) => q.enter)).size === 4,
      pieces.map((q) => q.enter).join(' | '));
    check('the way in is never four repetitions of one label',
      !pieces.some((q) => /enter world/i.test(q.enter)));
    check('no way in has an arrow glyph appended',
      pieces.every((q) => !/[→↗➔]/.test(q.enter)), pieces.map((q) => q.enter).join(' | '));
    check('chapter names are set as display type',
      pieces.every((q) => q.namePx >= 22), pieces.map((q) => q.namePx).join(','));

    /* The public name of chapter 04 is wider than its last step. */
    check('chapter 04 is published as Pattern Development',
      pieces.find((q) => q.chapter === '3d-simulation').name === 'Pattern Development');
    check('the old narrower name is gone from the landing',
      await p.evaluate(() => !/\b3D Simulation\b/.test(
        [...document.querySelectorAll('.pf-piece')].map((e) => e.textContent).join(' '))));
    check('no category list appears on any piece',
      await p.evaluate(() => document.querySelectorAll('.pf-piece .pf-lay, .pf-piece ol, .pf-piece ul').length === 0));
    check('the reference disclaimer never appears on a piece',
      await p.evaluate(() => !/no authorship of photographed garments/i
        .test([...document.querySelectorAll('.pf-piece')].map((e) => e.textContent).join(' '))));

    /* THE OPENING IS FASHION AND NOTHING ELSE. No rule, no number, no label,
       and no chapter UI either — not even the first chapter's own name. A
       visitor who does not know what a notch is has nothing to decode on the
       first screen: a garment, a statement, one sentence.

       WHAT CHANGED SINCE THIS WAS WRITTEN. The opening is no longer a section
       of its own above the chapters; it is the first state of the field the
       chapters are cut out of, so it is measured on the field and on the
       layer that holds the opening rendition. The contract is the same one. */
    const opening = await p.evaluate(() => {
      const cut = document.querySelector('[data-cut]');
      const f = document.querySelector('[data-cut-field]');
      const fig = document.querySelector('.pf-piece__img--opening');
      const title = document.querySelector('.pf-cut__statement');
      const fr = fig.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      const lines = [...title.querySelectorAll('.pf-cut__line')];
      return {
        progress: Number(getComputedStyle(cut).getPropertyValue('--p')),
        fieldHeight: Math.round(f.getBoundingClientRect().height),
        viewport: window.innerHeight,
        fit: getComputedStyle(fig).objectFit,
        garmentArea: Math.round(fr.width * fr.height),
        /* The statement's own ink, not the box it is positioned in: the
           statement spans the field so it can be set across the garment. */
        titleArea: Math.round(lines.reduce((sum, el) => {
          const r = el.getBoundingClientRect();
          return sum + r.width * r.height;
        }, 0)),
        /* At arrival there is no chapter name on the field at all. */
        chapterType: [...document.querySelectorAll('.pf-piece__type')]
          .filter((el) => Number(getComputedStyle(el).opacity) > 0.02).length,
        labels: f.querySelectorAll('.label, .pf-notch').length,
        titleLines: lines.length,
        titleText: title.textContent.replace(/\s+/g, ' ').trim(),
        note: (document.querySelector('.pf-cut__note')?.textContent ?? '').trim(),
      };
    });
    check('the transformation starts at its first state', opening.progress <= 0.02,
      String(opening.progress));
    check('the opening is one screen', opening.fieldHeight <= opening.viewport + 1,
      `${opening.fieldHeight} in ${opening.viewport}`);
    check('the opening garment is whole, never cropped', opening.fit === 'contain', opening.fit);
    check('the garment is the largest thing in the first frame',
      opening.garmentArea > opening.titleArea, `${opening.garmentArea} vs ${opening.titleArea}`);
    check('no chapter name is on the field at arrival',
      opening.chapterType === 0, `${opening.chapterType} visible`);
    check('the first screen carries no label, rule or mark',
      opening.labels === 0, `${opening.labels} found`);
    check('the statement is set on two lines and reads whole',
      opening.titleLines === 2 && /Between instinct & construction\./.test(opening.titleText),
      opening.titleText);
    check('one sentence stands with the statement and no more',
      opening.note.length > 20 && opening.note.length < 200, opening.note);

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
    console.log(`\nportfolio cover gallery at ${width}`);
    const c = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 932 }, isMobile: true, hasTouch: true });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    const mobileCovers = await p.evaluate(() => [...document.querySelectorAll('.pf-cover')].map((el) => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top + scrollY), height: Math.round(r.height) };
    }));
    /* On a hand the nested field unfolds into one column. A horizontal rail
       hid three of four chapters behind a gesture nothing announced, so the
       leaves now stack: each one substantial, each one in the gutter, each one
       below the last. */
    check(`${width} stacks substantial chapter leaves in one column`,
      mobileCovers.every((cover, index) => cover.height >= 380
        && cover.left >= 16 && cover.right - cover.left <= width - 16
        && (index === 0 || cover.top >= mobileCovers[index - 1].top + mobileCovers[index - 1].height - 1)),
      JSON.stringify(mobileCovers));
    check(`no horizontal overflow in the ${width} cover gallery`,
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await c.close();
  }

  // ---- the hierarchy: chapter -> categories -> viewer -> back again
  console.log('\nportfolio navigation hierarchy');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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

    /* SCREEN 1 IS THE IMAGE-LED CATEGORY INDEX. The deeper garment runway and
       development evidence stay hidden until a category is selected. */
    const first = await p.evaluate((sel) => {
      const w = document.querySelector(sel);
      const shown = [...w.querySelectorAll('[data-screen]')].filter((e) => !e.hidden);
      const visible = (el) => el.getBoundingClientRect().width > 0 && !el.closest('[hidden]');
      return {
        screens: shown.map((e) => e.dataset.screen),
        cats: [...w.querySelectorAll('[data-screen="index"] .pf-lay__label')].map((e) => e.textContent.trim()),
        catLinks: w.querySelectorAll('[data-screen="index"] a.pf-lay__piece').length,
        labelPx: [...w.querySelectorAll('[data-screen="index"] .pf-lay__label')]
          .map((e) => Math.round(parseFloat(getComputedStyle(e).fontSize))),
        categoryCovers: [...w.querySelectorAll('[data-screen="index"] .pf-lay__media img')].filter(visible).length,
        garments: [...w.querySelectorAll('.pf-slot img')].filter(visible).length,
        stages: [...w.querySelectorAll('[data-stage]')].filter(visible).length,
        plates: [...w.querySelectorAll('.pf-plate')].filter(visible).length,
        disclaimers: [...w.querySelectorAll('[data-reference-notice]')].filter(visible).length,
        hash: location.hash,
      };
    }, world);
    check('the chapter opens on its category index',
      first.screens.join(',') === 'index', first.screens.join(','));
    check('the URL names the chapter', first.hash === '#womenswear', first.hash);
    check('the five approved categories are listed',
      JSON.stringify(first.cats) === JSON.stringify([
        'Ready-to-Wear & Contemporary', 'Activewear & Athleisure', 'Streetwear & Casualwear',
        'Evening & Occasionwear', 'Swimwear & Resortwear',
      ]), first.cats.join(' | '));
    check('the categories use large editorial typography',
      first.labelPx.every((px) => px >= 26), first.labelPx.join(','));
    check('all five womenswear categories are image-led', first.categoryCovers === 5, String(first.categoryCovers));
    check('NO garment image is visible before a category is chosen',
      first.garments === 0, String(first.garments));
    check('no garment viewer is visible before a category is chosen',
      first.stages === 0, String(first.stages));
    check('no development panel is visible before a category is chosen',
      first.plates === 0, String(first.plates));
    check('the reference disclaimer is not on the category screen',
      first.disclaimers === 0, String(first.disclaimers));

    // ---- entering a category
    await openCategory(p, 'womenswear', 'rtw');
    const second = await p.evaluate((sel) => {
      const w = document.querySelector(sel);
      const shown = [...w.querySelectorAll('[data-screen]')].filter((e) => !e.hidden);
      const visible = (el) => el.getBoundingClientRect().width > 0 && !el.closest('[hidden]');
      return {
        screen: shown[0]?.dataset.screen ?? null,
        category: shown[0]?.dataset.category ?? null,
        count: shown.length,
        hash: location.hash,
        stages: [...w.querySelectorAll('[data-stage]')].filter(visible).length,
        garments: [...w.querySelectorAll('.pf-slot img')].filter(visible).length,
        back: w.querySelector('[data-screen="category"]:not([hidden]) .pf-back')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
        disclaimers: [...w.querySelectorAll('[data-reference-notice]')].filter(visible).length,
      };
    }, world);
    check('choosing a category opens its viewer',
      second.screen === 'category' && second.category === 'rtw', JSON.stringify(second));
    check('exactly one screen is shown at a time', second.count === 1, String(second.count));
    check('the URL names chapter and category', second.hash === '#womenswear/rtw', second.hash);
    check('the garment viewer is now visible', second.stages === 1 && second.garments > 0,
      `${second.stages} stages, ${second.garments} garments`);
    check('the back control returns to the category index, not the portfolio index',
      /womenswear categories/i.test(second.back), second.back);
    check('the reference disclaimer appears exactly once, beside the photographs',
      second.disclaimers === 1, String(second.disclaimers));

    // ---- back steps one level at a time
    await p.evaluate((sel) => document.querySelector(`${sel} [data-screen="category"]:not([hidden]) .pf-back`).click(), world);
    await p.waitForTimeout(700);
    check('back from the viewer returns to the category index',
      await p.evaluate((sel) => {
        const shown = [...document.querySelector(sel).querySelectorAll('[data-screen]')].filter((e) => !e.hidden);
        return shown.length === 1 && shown[0].dataset.screen === 'index' && location.hash === '#womenswear';
      }, world));

    await p.keyboard.press('Escape');
    await p.waitForTimeout(700);
    check('Escape from the category index leaves the chapter',
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
        cats: [...w.querySelectorAll('.pf-lay__label')].map((e) => e.textContent.trim()),
        links: w.querySelectorAll('a.pf-lay__piece').length,
        pending: [...w.querySelectorAll('.pf-lay__count')].filter((e) => /pending/i.test(e.textContent)).length,
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
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await openChapter(p, 'womenswear');
    await openCategory(p, 'womenswear', 'rtw');

    const state = await p.evaluate(() => window.__portfolioRunway.getState());
    /* FIVE positions, not four: the composition reads as a rail of garments
       seen in depth rather than a small group, and five is the number the
       stage geometry is solved for. */
    check('desktop shows five garments at once', state.visibleNow === 5, `visible ${state.visibleNow} of ${state.count}`);
    check('the active garment leads the deck', state.activeIsLeading === true);
    check('the garments genuinely overlap', state.overlaps >= 3, `${state.overlaps} overlaps`);

    const deck = await p.evaluate(() => {
      const panel = document.querySelector('[data-screen="category"]:not([hidden]) .pf-panel');
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

    /* THE DEPTH MUST BE LEGIBLE, AND EVERY GARMENT MUST STAY JUDGEABLE.
       Five positions inside one stage cannot each be a sixth smaller than the
       next and still leave the furthest large enough to read as a garment, so
       the ladder is even rather than steep: every step is a visible change,
       and the span from furthest to leader is substantial. */
    const ratios = deck.widths.map((w) => w / deck.widths[deck.widths.length - 1]);
    check('the furthest garment is clearly behind but still a garment',
      ratios[0] <= 0.68 && ratios[0] >= 0.55, `${Math.round(ratios[0] * 100)}% of the leader`);
    check('every step of the deck is a visible change of scale',
      deck.widths.every((w, i) => i === 0 || w / deck.widths[i - 1] >= 1.08)
        && deck.widths[deck.widths.length - 1] / deck.widths[0] >= 1.45,
      deck.widths.join(' < '));
    check('the furthest garment is still readable', deck.smallest >= 190, `${deck.smallest}px`);
    /* Blur belongs to the two furthest positions only. The active garment and
       the two nearest it are never blurred: they are the ones being judged. */
    const blurs = deck.filters.map((value) => {
      const m = /blur\(([\d.]+)px\)/.exec(value);
      return m ? Number(m[1]) : 0;
    });
    check('only the two furthest desktop garments carry atmospheric blur',
      blurs[0] > 0 && blurs[1] > 0 && blurs.slice(2).every((value) => value === 0),
      deck.filters.join(' | '));
    check('far garment blur remains restrained and identifiable',
      blurs[0] <= 1.2 && blurs[1] < blurs[0], `${blurs[0]}px / ${blurs[1]}px`);

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
      for (const el of document.querySelectorAll('[data-screen="category"]:not([hidden]) .pf-slot, [data-screen="category"]:not([hidden]) .pf-slot *')) {
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

    const studio = await p.evaluate(() => {
      const band = document.querySelector('[data-screen="category"]:not([hidden]) .pf-studio');
      const r = band.getBoundingClientRect();
      const st = getComputedStyle(band);
      return { left: Math.round(r.left), width: Math.round(r.width), vw: document.documentElement.clientWidth, bg: st.backgroundColor };
    });
    /* BRIGHT PAPER, NOT WHITE AND NEVER BLACK. The field was pinned to pure
       white while the renditions were opaque white on white; the design value
       is one step up from the page, and the final transparent assets are made
       for it. */
    check('the viewer sits in one full-width field of bright paper',
      studio.left === 0 && studio.width >= studio.vw - 1 && studio.bg === 'rgb(251, 250, 246)',
      JSON.stringify(studio));

    // Keyboard alone must drive the deck.
    await p.evaluate(() => document.querySelector('[data-screen="category"]:not([hidden]) [data-stage]').focus());
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
      const nextDisabled = document.querySelector('[data-screen="category"]:not([hidden]) [data-step="1"]').disabled;
      api.goTo(-50);
      const low = api.getState().activeIndex;
      const prevDisabled = document.querySelector('[data-screen="category"]:not([hidden]) [data-step="-1"]').disabled;
      return { count, high, low, nextDisabled, prevDisabled };
    });
    check('out-of-range forward navigation wraps by modulo', bounds.high === (bounds.count + 50) % bounds.count, `${bounds.high} of ${bounds.count}`);
    check('out-of-range backward navigation wraps by modulo', bounds.low === ((-50 % bounds.count) + bounds.count) % bounds.count, String(bounds.low));
    check('circular controls stay available at every item', !bounds.nextDisabled && !bounds.prevDisabled);
    const loop = await p.evaluate(() => {
      const api = window.__portfolioRunway;
      const count = api.getState().count;
      api.goTo(count - 1);
      document.querySelector('[data-screen="category"]:not([hidden]) [data-step="1"]').click();
      const forward = api.getState().activeIndex;
      document.querySelector('[data-screen="category"]:not([hidden]) [data-step="-1"]').click();
      const backward = api.getState().activeIndex;
      api.goTo(0);
      return { count, forward, backward };
    });
    check('next loops from the last garment to the first', loop.forward === 0, JSON.stringify(loop));
    check('previous loops from the first garment to the last', loop.backward === loop.count - 1, JSON.stringify(loop));
    await p.waitForTimeout(600);
    const wheel = await p.evaluate(async () => {
      const panel = document.querySelector('[data-screen="category"]:not([hidden])');
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
    check('circular wrap animates existing depth positions', wheel.animated >= 5 && wheel.sameNodes, JSON.stringify(wheel));
    check('wheel settles with five garments and no abandoned animation', wheel.visible === 5 && wheel.remaining === 0, JSON.stringify(wheel));
    await p.evaluate(() => window.__portfolioRunway.goTo(0));
    await p.waitForTimeout(600);

    // Drag must follow the hand: pointer right -> stack right.
    await p.waitForTimeout(300);
    const box = await p.evaluate(() => {
      const b = document.querySelector('[data-screen="category"]:not([hidden]) .pf-stage').getBoundingClientRect();
      return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
    });
    await p.mouse.move(box.x, box.y);
    const beforeDrag = await p.evaluate(() => document.querySelector('[data-screen="category"]:not([hidden]) [data-depth="1"]').getBoundingClientRect().left);
    const movingItem = await p.evaluate(() => document.querySelector('[data-screen="category"]:not([hidden]) [data-depth="1"]').dataset.item);
    await p.mouse.down();
    await p.mouse.move(box.x + 110, box.y, { steps: 8 });
    const dragRight = await p.evaluate(item => document.querySelector('[data-screen="category"]:not([hidden]) [data-item="'+item+'"]:not([data-wheel-ghost])').getBoundingClientRect().left, movingItem) - beforeDrag;
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
      const panel = document.querySelector('[data-screen="category"]:not([hidden]) .pf-panel');
      const notice = w.querySelector('[data-screen="category"]:not([hidden]) [data-reference-notice]');
      return {
        publication: w.dataset.publication,
        panelKind: panel.dataset.kind,
        noticeText: notice?.textContent.trim() ?? '',
        noticePx: notice ? Math.round(parseFloat(getComputedStyle(notice.querySelector('span')).fontSize)) : 0,
        counter: panel.querySelector('[data-counter-current]').textContent.trim(),
        projectArticles: w.querySelectorAll('.pf-project').length,
        profileRows: w.querySelectorAll('.pf-project__profile').length,
        tagRows: w.querySelectorAll('.pf-project__tags').length,
        referencePanel: !!panel.querySelector('[data-reference-notice]'),
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
    check('the reference panel explains what it is', integrity.referencePanel);

    /* No construction history may be inferred from a photograph. */
    const claims = await p.evaluate(() => {
      // Audit the entire visible reference screen, not global chapter names.
      const text = document.querySelector('.pf-world[data-open] [data-screen="category"]:not([hidden])').innerText;
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

    /* EVIDENCE: A LAYER THE VISITOR OPENS.

       Three contracts have stood here and the first two were each half right.
       A permanent column beside the deck showed three stamped stand-ins next
       to every garment — a third of the best screen spent on a promise.
       Drawing nothing was honest but gave up the one thing the interface has
       to demonstrate: that the three surfaces belong to the garment in FRONT
       and change when it changes.

       So: closed by default, because fashion keeps the screen; opened, the
       three surfaces for the active garment; and every stand-in stamped on its
       face and described as a stand-in in its alt text, because an unmarked
       borrowed photograph is fabricated evidence. */
    const evidence = await p.evaluate(() => {
      const panel = document.querySelector('[data-screen="category"]:not([hidden]) .pf-panel');
      const block = panel.querySelector('.pf-dev:not([hidden])');
      const viewer = document.querySelector('[data-screen="category"]:not([hidden]) .pf-viewer');
      const plates = [...block.querySelectorAll('.pf-plate')];
      return {
        blocks: panel.querySelectorAll('.pf-dev').length,
        shownBlocks: panel.querySelectorAll('.pf-dev:not([hidden])').length,
        forIndex: block.dataset.evidenceFor,
        /* A <details>, so the state is the element's and needs no script. */
        tag: block.tagName,
        closedByDefault: block.open === false,
        summary: block.querySelector('summary') ? true : false,
        stages: plates.map((el) => el.dataset.plate),
        labels: plates.map((el) => el.querySelector('.pf-plate__label').textContent.trim()),
        previews: plates.filter((el) => el.hasAttribute('data-preview')).length,
        stamped: plates.filter((el) => el.querySelector('.pf-plate__stamp')).length,
        stampPx: plates[0].querySelector('.pf-plate__stamp')
          ? Math.round(parseFloat(getComputedStyle(plates[0].querySelector('.pf-plate__stamp')).fontSize))
          : 0,
        honestAlts: plates.filter((el) => !el.hasAttribute('data-preview')
          || /temporary preview/i.test(el.querySelector('img')?.alt ?? '')).length,
        /* Closed, the whole layer costs one line. */
        closedHeight: Math.round(block.getBoundingClientRect().height),
        deckHeight: Math.round(viewer.querySelector('.pf-deck').getBoundingClientRect().height),
        columns: getComputedStyle(viewer).gridTemplateColumns.split(' ').length,
        stageInViewport: viewer.querySelector('.pf-stage').getBoundingClientRect().height <= window.innerHeight,
      };
    });
    check('one development block exists per garment and only one is shown',
      evidence.blocks === 17 && evidence.shownBlocks === 1 && evidence.forIndex === '0',
      `${evidence.blocks} blocks / ${evidence.shownBlocks} shown / for ${evidence.forIndex}`);
    check('the layer is a disclosure that needs no script',
      evidence.tag === 'DETAILS' && evidence.summary, evidence.tag);
    check('it is closed until the visitor asks for it', evidence.closedByDefault);
    check('closed, it costs the garment one line',
      evidence.closedHeight <= evidence.deckHeight * 0.18,
      `${evidence.closedHeight}px against a ${evidence.deckHeight}px deck`);
    check('the garment keeps the full width of the viewer',
      evidence.columns === 1 && evidence.stageInViewport, `${evidence.columns} column(s)`);
    check('exactly three surfaces, in order',
      evidence.stages.join(',') === 'sketch,pattern,simulation', evidence.stages.join(','));
    check('the surfaces are named, not numbered',
      evidence.labels.join(' | ') === 'Sketch | 2D Pattern | 3D Simulation', evidence.labels.join(' | '));
    /* No authored asset exists yet, so all three stand in — and every one of
       them must say so twice: on its face, and to a screen reader. */
    check('every stand-in is stamped on its face',
      evidence.previews === 3 && evidence.stamped === 3,
      `${evidence.previews} stand-ins / ${evidence.stamped} stamped`);
    check('the stamp is not fine print', evidence.stampPx >= 10, `${evidence.stampPx}px`);
    check('no stand-in borrows the name of the surface it stands in for',
      evidence.honestAlts === 3, `${evidence.honestAlts} of 3 honest`);

    /* AND IT FOLLOWS THE GARMENT. Opening the layer and advancing the deck
       must leave the layer open on the NEXT garment's surfaces — that is the
       whole reason the stand-ins are allowed to exist. */
    const follows = await p.evaluate(async () => {
      const panel = document.querySelector('[data-screen="category"]:not([hidden]) .pf-panel');
      const first = panel.querySelector('.pf-dev:not([hidden])');
      first.open = true;
      const api = window.__portfolioRunway;
      api.goTo(1);
      await new Promise((r) => setTimeout(r, 700));
      const now = panel.querySelector('.pf-dev:not([hidden])');
      const out = {
        movedTo: now.dataset.evidenceFor,
        stillOpen: now.open === true,
        differentBlock: now !== first,
        firstClosedAway: first.hidden === true,
      };
      api.goTo(0);
      return out;
    });
    check('advancing the garment advances the surfaces',
      follows.movedTo === '1' && follows.differentBlock && follows.firstClosedAway,
      JSON.stringify(follows));
    check('the layer stays open across the change', follows.stillOpen, JSON.stringify(follows));

    await c.close();
  }

  // ---- the deck at 1024 and at 390
  for (const [width, height, want, mobile] of [[1024, 820, 5, false], [390, 844, 3, true]]) {
    console.log(`\nportfolio deck at ${width}`);
    const c = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(700);
    await openChapter(p, 'womenswear');
    await openCategory(p, 'womenswear', 'rtw');

    const st = await p.evaluate(() => window.__portfolioRunway.getState());
    check(`${width} shows ${want} garments at once`, st.visibleNow === want, `visible ${st.visibleNow}`);
    check(`${width} active garment still leads`, st.activeIsLeading === true);
    check(`${width} garments genuinely overlap`, st.overlaps >= want - 1, `${st.overlaps} overlaps`);

    const geo = await p.evaluate(() => {
      const stage = document.querySelector('[data-screen="category"]:not([hidden]) .pf-stage').getBoundingClientRect();
      const boxes = [...document.querySelectorAll('[data-screen="category"]:not([hidden]) .pf-slot')]
        .filter((s) => !s.hidden).map((s) => s.getBoundingClientRect()).sort((a, b) => a.left - b.left);
      return {
        widths: boxes.map((b) => Math.round(b.width)),
        inside: boxes.every((b) => b.left >= stage.left - 1 && b.right <= stage.right + 1),
      };
    });
    check(`${width} keeps every garment inside the stage`, geo.inside, geo.widths.join(','));
    const ratio = geo.widths[0] / geo.widths[geo.widths.length - 1];
    /* Five positions on the desk and three on a phone, so the ladder is
       necessarily shallower where there are more of them. What has to hold is
       that the furthest is unmistakably behind the leader. */
    check(`${width} depth is immediately visible`, ratio <= 0.75,
      `${Math.round(ratio * 100)}% of the leader across ${geo.widths.length} positions`);
    check(`no horizontal overflow at ${width}`,
      await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    /* At every width the layer is closed until asked for, and the garment has
       the whole viewer. */
    const ev = await p.evaluate(() => {
      const block = document.querySelector('[data-screen="category"]:not([hidden]) .pf-dev:not([hidden])');
      const viewer = document.querySelector('[data-screen="category"]:not([hidden]) .pf-viewer');
      return {
        closed: block.open === false,
        plates: block.querySelectorAll('.pf-plate').length,
        stamped: block.querySelectorAll('.pf-plate__stamp').length,
        columns: getComputedStyle(viewer).gridTemplateColumns.split(' ').length,
      };
    });
    check(`${width} keeps the development layer closed until it is asked for`, ev.closed);
    check(`${width} stamps every stand-in it holds`,
      ev.plates === 3 && ev.stamped === 3, `${ev.plates} plates / ${ev.stamped} stamped`);
    check(`${width} gives the garment the whole width`, ev.columns === 1, `${ev.columns} column(s)`);
    await c.close();
  }

  // ---- Tech Packs: five documents in a column, and a reader
  console.log('\nportfolio tech packs');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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
        titles: list.map((el) => el.querySelector('.pf-doc__title').textContent.trim()),
        /* The set overlaps: a cascade of sheets on a surface, not five
           separate items in a column. */
        overlaps: boxes.slice(1).filter((b, i) => b.top < boxes[i].bottom - 2).length,
        zOrder: list.map((el) => Number(getComputedStyle(el).zIndex) || 0),
        opens: list.map((el) => el.querySelector('[data-open-pdf]')?.getAttribute('href') ?? ''),
        stamps: list.filter((el) => /demo/i.test(el.querySelector('.pf-doc__stamp')?.textContent ?? '')).length,
        carousel: w.querySelectorAll('.pf-folio, .pf-library__pile, [data-dossier]').length,
      };
    });
    check('five demo documents', docs.count === 5, String(docs.count));
    /* THE ROOM IS A CASCADE, NOT A LIST. Two earlier versions were a column
       of five full pages (five screens of a deliberately blank form) and then
       a ruled register (honest, legible, and completely ordinary). Documents
       in a room lie on a surface, overlapping, every head readable, one of
       them pulled clear when you want it. */
    check('the set overlaps as a cascade', docs.overlaps === 4, `${docs.overlaps} of 4 overlap`);
    check('the later sheets lie in front',
      docs.zOrder.every((z, i) => i === 0 || z > docs.zOrder[i - 1]), docs.zOrder.join(','));
    check('every document is named', docs.titles.every((t) => t.length > 2), docs.titles.join(' | '));
    check('each shows its own first page at a readable size',
      docs.previews.every((src) => /\/demo\/techpacks\/demo-\d\d-[a-z-]+-p1\.webp$/.test(src))
      && docs.previewWidths.every((w) => w >= 300),
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
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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
    /* The clip is not one of the five recorded sessions — it is a different
       kind of thing, and passing it off as a library entry would misrepresent
       both. It opens the chapter as the transformation itself instead, which
       is checked below. */
    check('the local clip is not passed off as one of the recorded sessions',
      await p.evaluate(() => ![...document.querySelectorAll('[data-video]')]
        .some((e) => /CLO3D\.(mp4|webm)/.test(e.innerHTML))));
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
        /* The sticky element is the continuity nav; it is the one that must
           carry an opaque ink ground, because it is the one content passes
           behind. The chapter bar below it scrolls with the content on the
           chapter's own ground. */
        bar: bg('.pf-continuity'),
        barSticky: getComputedStyle(w.querySelector('.pf-continuity')).position,
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
    check('the way out of the dark world stays on screen',
      dark.barSticky === 'sticky', dark.barSticky);
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
    check('the navigation label matches', naming.bar === '04 Pattern Development', naming.bar);
    /* THE ARC IS SHOWN, NOT LISTED.
       Five words set large beside a video were a caption, and this chapter's
       subject is one thing becoming another. There is now ONE stage carrying
       ONE garment, and one word names the state that stage is actually in.
       So what is asserted is the sequence the stage can reach — every state,
       in order, from the read position — rather than five labels being
       present on the screen at once. */
    const arc = await p.evaluate(async () => {
      const world = document.querySelector('[data-world="3d-simulation"]');
      const make = world.querySelector('[data-make]');
      const track = world.querySelector('[data-make-track]');
      const word = world.querySelector('[data-make-word]');
      const seen = [];
      const top = track.getBoundingClientRect().top + world.scrollTop;
      const span = track.offsetHeight;
      for (let i = 0; i <= 24; i += 1) {
        world.scrollTop = top + (span * i) / 24;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const name = word.textContent.trim();
        if (seen[seen.length - 1] !== name) seen.push(name);
      }
      world.scrollTop = 0;
      /* The stage paints on a frame, so the value is read after one. */
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { seen, states: seen.length, progress: Number(getComputedStyle(make).getPropertyValue('--q')) };
    });
    check('the stage passes through the whole development arc, in order',
      arc.seen.join(' → ') === 'Idea → 2D → Construction → 3D → Fit → Product',
      arc.seen.join(' → '));
    check('reading back up returns the stage to its first state',
      arc.progress <= 0.02, String(arc.progress));
    check('the arc is one changing word, not six labels on screen at once',
      await p.evaluate(() => document.querySelectorAll('[data-make] [data-make-word]').length === 1
        && document.querySelectorAll('[data-make] .pf-make__state').length === 1));

    /* THE CONSTRUCTION LINES ARE DRAWN GEOMETRY, and the chapter says so in
       words next to them. Three panels, generated — not three copies of one
       shape, and not a photograph of a pattern. */
    const drawn = await p.evaluate(() => {
      const paths = [...document.querySelectorAll('[data-make] [data-panel-p]')];
      return {
        count: paths.length,
        distinct: new Set(paths.map((e) => e.getAttribute('d'))).size,
        closed: paths.every((e) => /Z\s*$/.test(e.getAttribute('d') ?? '')),
        note: (document.querySelector('.pf-make__note')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      };
    });
    check('three construction panels, each its own geometry',
      drawn.count === 3 && drawn.distinct === 3 && drawn.closed,
      `${drawn.count}/${drawn.distinct} closed:${drawn.closed}`);
    check('the stage says which part of it is a recording and which is drawn',
      /recording/i.test(drawn.note) && /drawn/i.test(drawn.note)
        && /not this garment/i.test(drawn.note), drawn.note);

    check('the descriptor stays to one line', naming.descriptor.length <= 110, naming.descriptor);
    /* NAMING THE STAGES IS NOT SHOWING THE CHANGE. The chapter opens on a real
       recording of a garment simulating — the one thing on the route that
       shows 2D becoming 3D instead of claiming it — and it is muted, looping,
       controlless and does not fetch a byte until it is on screen. */
    const change = await p.evaluate(() => {
      const v = document.querySelector('[data-world="3d-simulation"] [data-make-clip]');
      if (!v) return null;
      const r = v.getBoundingClientRect();
      return {
        sources: [...v.querySelectorAll('source')].map((sc) => sc.type),
        muted: v.muted, loop: v.loop, controls: v.controls,
        autoplayAttr: v.hasAttribute('autoplay'),
        labelled: (v.getAttribute('aria-label') ?? '').length > 20,
        area: Math.round(r.width * r.height),
      };
    });
    check('the chapter shows the change, with a real recording',
      change && change.area > 100000, change ? `${change.area}px²` : 'missing');
    check('the recording is muted, looping and has no controls',
      change.muted && change.loop && !change.controls && change.labelled);
    check('it never autoplays by attribute — the runtime decides, in view only',
      change.autoplayAttr === false);
    check('it offers a licence-free codec first',
      change.sources.join(',') === 'video/webm,video/mp4', change.sources.join(','));
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
    await openChapter(p, 'womenswear');
    await openCategory(p, 'womenswear', 'rtw');

    await p.evaluate(() => document.querySelector('[data-screen="category"]:not([hidden]) [data-stage]').focus());
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(120);
    const state = await p.evaluate(() => window.__portfolioRunway.getState());
    check('deck settles instantly under reduced motion', Number.isInteger(state.position), `position ${state.position}`);
    check('reduced motion still advances the deck', state.activeIndex === 1, String(state.activeIndex));
    check('reduced motion keeps five garments visible', state.visibleNow === 5, String(state.visibleNow));
    check('no decorative transition left running',
      await p.evaluate(() => getComputedStyle(
        document.querySelector('[data-screen="category"]:not([hidden]) .pf-slot')).transitionDuration === '0s'));
    check('reveal blocks visible without scrolling',
      await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every((e) => getComputedStyle(e).opacity === '1')));
    await c.close();
  }

  // ---- without JavaScript the work is still there
  console.log('\nportfolio without JavaScript');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
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
    /* The register row carries a Demo chip and the chapter states once, above
       the register, exactly what "demo" means here. Both are server-rendered,
       so the disclosure never depends on a script. */
    check('the demo documents are declared as demos without the script',
      html.includes('Interface prototype')
      && html.includes('stamped on every page')
      && (html.match(/>Demo</g) ?? []).length >= 5);
    /* WITHOUT A SCRIPT the stand-ins are still served — so their honesty
       cannot depend on JavaScript. Both marks must be in the HTML: the stamp
       on the face of every borrowed image, and the same statement in its alt
       text. The layer is a <details>, so it is closed without a script too. */
    check('every stand-in is stamped in the served HTML',
      (html.match(/pf-plate__stamp/g) ?? []).length >= 3 && html.includes('Temp preview'));
    check('every stand-in says so in its alt text in the served HTML',
      (html.match(/Temporary preview: the active garment/g) ?? []).length >= 3);
    check('the development layer is a disclosure, closed, without a script',
      /<details[^>]*class="pf-dev"/.test(html) && !/<details[^>]*class="pf-dev"[^>]*\sopen/.test(html));

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
