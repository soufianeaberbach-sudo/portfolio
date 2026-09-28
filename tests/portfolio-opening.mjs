/* ---------------------------------------------------------------------------
   THE OPENING, AND THE CHAPTER-COVER SEQUENCE IT HANDS OVER TO.

   Focused regression coverage for the journey only. The site-wide suites
   (smoke, director, reinvention) still own everything inside a chapter,
   including the Womenswear content this sequence is the entrance to.

   What is protected here:
     - the opening is the supplied master photograph, bright, with the practice
       statement set in its negative space and NOT a dark scrim over the picture
     - the composition survives 390 / 430 / 768 / 1024 / 1440
     - the handoff into Womenswear is a match cut: she lands on the same screen
       point, at the same size, in both plates, which is what makes it read as
       one camera move into her world rather than an image swap
     - the running order is 01 Womenswear, 02 Menswear, 03 Pattern Development,
       04 Tech Packs, everywhere it is visible
     - every chapter has its own cover, all four built to the same composition,
       and each cover is followed directly by that chapter's real contents
     - there is no chapter-list screen in the middle of the sequence
     - the Tech Packs cover is a staged FILE: a front sheet from the supplied
       document with three sheets behind it, which answers to hover and to
       keyboard focus
     - without motion every chapter still has a cover and still opens
   --------------------------------------------------------------------------- */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.PORTFOLIO_QA_URL ?? 'http://127.0.0.1:4339';
const output = '.qa-director/opening';
await mkdir(output, { recursive: true });

let passed = 0;
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) { passed++; console.log(`  ok   ${name}`); }
  else { failures.push(`${name}${detail ? ` — ${detail}` : ''}`); console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
};

/* Where she stands in each supplied plate, as a fraction of that plate's own
   frame. These are the numbers the CSS transform-origins are built from; if
   either drifts the cut stops being a cut, so the test states them itself. */
const HER = { master: [0.264, 0.4865], women: [0.7585, 0.493] };

/* The running order, stated here rather than read from the page, so the page
   cannot quietly agree with itself about the wrong sequence. */
const ORDER = [
  ['01', 'womenswear', 'Womenswear'],
  ['02', 'menswear', 'Menswear'],
  ['03', '3d-simulation', 'Pattern Development'],
  ['04', 'tech-packs', 'Tech Packs'],
];

const seek = (page, progress) => page.evaluate((p) => {
  const cinema = document.querySelector('.pf-cinema');
  scrollTo(0, cinema.offsetTop + (cinema.offsetHeight - innerHeight) * p);
}, progress);

const browser = await chromium.launch();
try {
  // ---- the opening reads as a photograph, not a poster laid over one -------
  console.log('\nthe opening');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(900);

    check('the opening is the supplied master photograph',
      await page.locator('[data-scene="master"] img').getAttribute('src').then((s) => /\/portfolio\/master\/master-scene/.test(s)));
    check('it is fetched at high priority, being the first thing seen',
      await page.locator('[data-scene="master"] img').getAttribute('fetchpriority') === 'high');
    check('the primary title is the practice, not the chapter',
      (await page.locator('[data-cinema-title]').innerText()).replace(/\s+/g, ' ').trim().toUpperCase()
        .replace(' ', ' ') === 'BETWEEN INSTINCT & CONSTRUCTION');

    const tone = await page.evaluate(() => {
      const cinema = document.querySelector('.pf-cinema');
      const title = document.querySelector('[data-cinema-title]');
      const lum = (c) => { const [r, g, b] = c.match(/\d+/g).map(Number); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      return { ground: lum(getComputedStyle(cinema).backgroundColor), ink: lum(getComputedStyle(title).color) };
    });
    check('the bright bone environment is preserved', tone.ground > 200, `luminance ${tone.ground.toFixed(0)}`);
    check('the title is ink, not reversed out of a dark scrim', tone.ink < 70, `luminance ${tone.ink.toFixed(0)}`);

    /* No dark overlay anywhere in the sequence, not just over the opening. */
    const scrim = await page.evaluate(() => [...document.querySelectorAll('.pf-cinema *, .pf-cover *, .pf-contents *, .pf-outro *')]
      .filter((el) => {
        const s = getComputedStyle(el);
        if (s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none') return false;
        const bg = s.backgroundColor.match(/[\d.]+/g);
        if (!bg || (bg[3] !== undefined && Number(bg[3]) < 0.25)) return false;
        const lum = 0.2126 * +bg[0] + 0.7152 * +bg[1] + 0.0722 * +bg[2];
        if (lum > 120) return false;
        const r = el.getBoundingClientRect();
        return r.width * r.height > innerWidth * innerHeight * 0.25;
      }).length);
    check('no large dark overlay anywhere in the sequence', scrim === 0, `${scrim} found`);
    check('the opening raised no script error', errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: `${output}/1440-opening.png` });
    await context.close();
  }

  // ---- the sequence: four covers, in order, each followed by its contents --
  console.log('\nthe chapter sequence');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(700);

    const flow = await page.evaluate(() => [...document.querySelectorAll(
      '.pf-cinema, [data-cover], [data-contents], .pf-outro',
    )].filter((el) => getComputedStyle(el).display !== 'none').map((el) => (
      el.classList.contains('pf-cinema') ? 'opening'
        : el.classList.contains('pf-outro') ? 'ending'
          : el.dataset.cover ? `cover:${el.dataset.cover}` : `contents:${el.dataset.contents}`
    )));
    check('the journey is opening → cover → contents, four times, then the ending',
      flow.join(' ') === [
        'opening',
        'contents:womenswear',
        'cover:menswear', 'contents:menswear',
        'cover:3d-simulation', 'contents:3d-simulation',
        'cover:tech-packs', 'contents:tech-packs',
        'ending',
      ].join(' '), flow.join(' '));

    /* The Womenswear cover is the opening's landing frame rather than a
       section, so the sequence holds four covers even though only three are
       sections of their own. */
    check('Womenswear\'s cover is the frame the opening cuts to',
      await page.locator('.pf-women-threshold.pf-cover .pf-cover__line').count() === 1);

    const covers = await page.evaluate(() => [...document.querySelectorAll('.pf-cover')]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .map((el) => ({
        /* The landing frame is a cover without being a cover SECTION, so it
           carries no data-cover; it is identified by what it is. */
        id: el.dataset.cover ?? (el.hasAttribute('data-women-threshold') ? 'womenswear' : ''),
        eyebrow: el.querySelector('.pf-cover__eyebrow').textContent.replace(/\s+/g, ' ').trim(),
        number: el.querySelector('.pf-cover__eyebrow span').textContent.trim(),
        line: el.querySelector('.pf-cover__line').textContent.replace(/\s+/g, ' ').trim(),
        descriptor: el.querySelector('.pf-cover__descriptor').textContent.trim().length,
        action: el.querySelector('.pf-cover__action').getAttribute('href'),
        accent: getComputedStyle(el.querySelector('.pf-cover__eyebrow span')).color,
        /* The landing frame's plate is the opening's own second scene — the
           one the match cut hands over — rather than a plate of its own. */
        hasPlate: !!el.querySelector('.pf-cover__plate')
          || (el.hasAttribute('data-women-threshold') && !!document.querySelector('.pf-scene--women')),
        copyLeft: Math.round(el.querySelector('.pf-cover__copy').getBoundingClientRect().left),
      })));
    check('four covers, in the running order',
      covers.map((c) => `${c.number}:${c.id}`).join(' ')
        === ORDER.map(([n, id]) => `${n}:${id}`).join(' '),
      covers.map((c) => `${c.number}:${c.id}`).join(' '));
    check('every cover names its chapter beside the number, not by colour alone',
      ORDER.every(([n, , title], i) => covers[i].eyebrow === `${n}${title}` || covers[i].eyebrow === `${n} ${title}`),
      covers.map((c) => c.eyebrow).join(' | '));
    check('every cover carries one line, a descriptor and a way in',
      covers.every((c) => c.line.length > 0 && c.descriptor > 0 && c.action?.startsWith('#')),
      covers.map((c) => `${c.line}/${c.action}`).join(' | '));
    check('every cover line is the chapter\'s own',
      new Set(covers.map((c) => c.line)).size === 4, covers.map((c) => c.line).join(' | '));
    check('every chapter has its own signal colour',
      new Set(covers.map((c) => c.accent)).size === 4, covers.map((c) => c.accent).join(' '));
    check('every cover is image-led', covers.every((c) => c.hasPlate));
    check('every cover sets its type in the same place',
      new Set(covers.map((c) => c.copyLeft)).size === 1, covers.map((c) => c.copyLeft).join(' '));

    /* THE MAIN DESIGN RULE. No chapter list is allowed to become the middle
       of the journey: the only one on the page is the ending's. */
    const indexes = await page.evaluate(() => [...document.querySelectorAll('[data-living-index]')].map((el) => ({
      inOutro: !!el.closest('.pf-outro'),
      top: el.getBoundingClientRect().top + scrollY,
      docHeight: document.documentElement.scrollHeight,
    })));
    check('there is exactly one chapter list on the page', indexes.length === 1, String(indexes.length));
    check('and it is the ending, not a stop in the middle',
      indexes[0].inOutro && indexes[0].top > indexes[0].docHeight * 0.75,
      `at ${(indexes[0].top / indexes[0].docHeight * 100).toFixed(0)}% of the page`);
    check('the opening carries no chapter list at all',
      await page.evaluate(() => document.querySelectorAll('.pf-cinema [data-living-index]').length === 0));

    const contents = await page.evaluate(() => [...document.querySelectorAll('[data-contents]')].map((el) => ({
      id: el.dataset.contents,
      items: [...el.querySelectorAll('.pf-contents__list a')].map((a) => ({
        href: a.getAttribute('href'),
        text: a.textContent.replace(/\s+/g, ' ').trim(),
      })),
    })));
    check('each chapter\'s contents follow its cover, and name real sections',
      contents.length === 4 && contents.every((c) => c.items.length >= 4 && c.items.every((i) => i.href.startsWith('#') && i.text)),
      contents.map((c) => `${c.id}:${c.items.length}`).join(' '));
    check('the garment chapters address their categories one level deep',
      contents[0].items.every((i) => i.href.startsWith('#womenswear/'))
      && contents[1].items.every((i) => i.href.startsWith('#menswear/')),
      contents[0].items.map((i) => i.href).join(' '));
    check('the reference disclaimer never appears in a contents rail',
      await page.evaluate(() => ![...document.querySelectorAll('.pf-contents__list')]
        .some((el) => /no authorship of photographed garments/i.test(el.textContent))));
    check('the sequence raised no script error', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- the Tech Packs cover is a file, and it answers to attention --------
  console.log('\nthe Tech Packs file');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.locator('[data-cover="tech-packs"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    const file = await page.evaluate(() => {
      const cover = document.querySelector('[data-cover="tech-packs"]');
      const front = cover.querySelector('.pf-file__front img');
      const stack = cover.querySelector('.pf-file');
      const copy = cover.querySelector('.pf-cover__copy').getBoundingClientRect();
      const plate = cover.querySelector('.pf-cover__plate--file').getBoundingClientRect();
      const other = document.querySelector('[data-cover="menswear"] .pf-cover__plate').getBoundingClientRect();
      return {
        src: front.getAttribute('src'),
        sheets: cover.querySelectorAll('.pf-file__sheet').length,
        framed: getComputedStyle(cover.querySelector('.pf-file__front')).borderTopWidth !== '0px'
          && getComputedStyle(cover.querySelector('.pf-file__front')).boxShadow !== 'none',
        stackRect: stack.getBoundingClientRect(),
        copyRight: copy.right,
        plateLeft: plate.left,
        /* The file has to stand in the same half of the frame the photographic
           plates put their subject in, or it stops belonging to the family. */
        onTheSameSide: plate.left + plate.width / 2 > innerWidth * 0.5
          && other.left + other.width * 0.76 > innerWidth * 0.5,
      };
    });
    check('the front sheet is the supplied tech pack document',
      /\/portfolio\/master\/tech-pack-sheet/.test(file.src), file.src);
    check('three more sheets stand behind it', file.sheets === 3, String(file.sheets));
    check('the front sheet is a sheet, not a flat screenshot: it has an edge and a shadow', file.framed);
    check('the file stands in the same zone the other covers give their subject', file.onTheSameSide);
    check('the type block and the file do not collide',
      file.copyRight <= file.plateLeft + 1,
      `copy ends ${file.copyRight.toFixed(0)}, file starts ${file.plateLeft.toFixed(0)}`);

    /* Hover: the sheets step apart and the front page lifts off them. */
    /* The fan runs straight up, so what moves is `top`, and it moves further
       the further back the sheet is. */
    const rest = await page.evaluate(() => [...document.querySelectorAll('[data-cover="tech-packs"] .pf-file__sheet')]
      .map((el) => el.getBoundingClientRect().top));
    await page.locator('[data-cover="tech-packs"] .pf-file').hover();
    await page.waitForTimeout(900);
    const open = await page.evaluate(() => ({
      sheets: [...document.querySelectorAll('[data-cover="tech-packs"] .pf-file__sheet')].map((el) => el.getBoundingClientRect().top),
      tab: getComputedStyle(document.querySelector('[data-cover="tech-packs"] .pf-file__tab')).opacity,
    }));
    check('hovering the file steps the sheets apart, furthest one furthest',
      open.sheets.every((x, i) => rest[i] - x > 3) && rest[0] - open.sheets[0] > rest[2] - open.sheets[2],
      open.sheets.map((x, i) => (rest[i] - x).toFixed(1)).join(' '));
    check('and brings the file\'s tab out from behind the page', Number(open.tab) > 0.5, open.tab);

    /* Keyboard focus gets the same state, not a lesser one. */
    await page.mouse.move(10, 10);
    await page.waitForTimeout(800);
    await page.locator('[data-cover="tech-packs"] .pf-cover__action').focus();
    await page.waitForTimeout(900);
    const focused = await page.evaluate(() => [...document.querySelectorAll('[data-cover="tech-packs"] .pf-file__sheet')]
      .map((el) => el.getBoundingClientRect().top));
    check('keyboard focus on the way in opens the file too',
      focused.every((x, i) => rest[i] - x > 3),
      focused.map((x, i) => (rest[i] - x).toFixed(1)).join(' '));
    await page.screenshot({ path: `${output}/1440-tech-packs-cover.png` });
    await context.close();
  }

  // ---- every reviewed width is its own composition ------------------------
  for (const [width, height] of [[390, 844], [430, 844], [768, 1024], [1024, 900], [1440, 900]]) {
    console.log(`\nthe sequence at ${width}`);
    const context = await browser.newContext({
      viewport: { width, height }, isMobile: width < 768, hasTouch: width < 768, deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(900);

    const frame = await page.evaluate(() => {
      const title = document.querySelector('[data-cinema-title]').getBoundingClientRect();
      const scene = document.querySelector('[data-scene="master"]').getBoundingClientRect();
      const field = document.querySelector('[data-cinema-media]').getBoundingClientRect();
      const caption = document.querySelector('[data-cinema-thesis]').getBoundingClientRect();
      const cue = document.querySelector('[data-cinema-scroll]').getBoundingClientRect();
      return { title, scene, field, caption, cue, overflow: document.documentElement.scrollWidth - innerWidth };
    });

    check(`${width}: no horizontal overflow`, frame.overflow <= 0, `${frame.overflow}px`);
    check(`${width}: the title stays inside the measure`,
      frame.title.left >= -0.5 && frame.title.right <= width + 0.5,
      `${frame.title.left.toFixed(0)}…${frame.title.right.toFixed(0)}`);
    check(`${width}: the plate covers the field, so it has no vertical seam`,
      frame.scene.left <= frame.field.left + 0.5 && frame.scene.right >= frame.field.right - 0.5);

    /* The figures occupy roughly the lower 92% of the plate. Their heads must
       be below the top of the screen and their feet above the caption band —
       the two ways this composition has actually broken. */
    const heads = frame.scene.top + frame.scene.height * 0.08;
    const feet = frame.scene.top + frame.scene.height * 0.83;
    check(`${width}: no head is cropped by the top of the screen`, heads > 0, `heads at ${heads.toFixed(0)}`);
    check(`${width}: the figures are not cut off by the foot of the screen`, feet < height, `feet at ${feet.toFixed(0)}`);
    /* The title's box carries descender space below its last baseline, so it
       is allowed to reach a little past the crown of the tallest head; what
       it may never do is sit over a face. */
    check(`${width}: the title clears the faces`, frame.title.bottom <= heads + frame.scene.height * 0.03,
      `title ends ${frame.title.bottom.toFixed(0)}, heads ${heads.toFixed(0)}`);
    check(`${width}: the caption band sits off the figures`,
      frame.caption.bottom <= heads + 8 || frame.caption.top >= feet - 8,
      `caption ${frame.caption.top.toFixed(0)}…${frame.caption.bottom.toFixed(0)}`);
    check(`${width}: the scroll cue sits off the figures`,
      frame.cue.bottom <= heads + 8 || frame.cue.top >= feet - 8,
      `cue ${frame.cue.top.toFixed(0)}…${frame.cue.bottom.toFixed(0)}`);

    // ---- two scroll-linked states, and nothing in between -----------------
    const phaseAt = async (p) => { await seek(page, p); await page.waitForTimeout(700);
      return page.evaluate(() => document.querySelector('.pf-cinema').dataset.phase); };
    check(`${width}: it opens on the master scene`, await phaseAt(0) === 'opening');
    check(`${width}: it arrives in Womenswear`, await phaseAt(0.95) === 'womenswear');

    // ---- the match cut ----------------------------------------------------
    await seek(page, 0.47);
    await page.waitForTimeout(800);
    const cut = await page.evaluate((her) => {
      const at = (selector, [fx, fy]) => {
        const el = document.querySelector(selector);
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        /* Under a scale about its own transform-origin, that origin is the
           one point the transform leaves alone — so her position on screen is
           simply the untransformed origin plus the translation. */
        return { x: el.offsetLeft + fx * el.offsetWidth + m.e, y: el.offsetTop + fy * el.offsetHeight + m.f, scale: m.a };
      };
      return { master: at('.pf-scene--master', her.master), women: at('.pf-scene--women', her.women) };
    }, HER);
    check(`${width}: both plates are pushed in by the same amount`,
      Math.abs(cut.master.scale - cut.women.scale) < 0.01, `${cut.master.scale} vs ${cut.women.scale}`);
    check(`${width}: she is at the same point on screen in both plates`,
      Math.abs(cut.master.x - cut.women.x) < 6 && Math.abs(cut.master.y - cut.women.y) < 6,
      `dx ${(cut.women.x - cut.master.x).toFixed(1)} dy ${(cut.women.y - cut.master.y).toFixed(1)}`);

    // ---- the Womenswear cover it lands on ---------------------------------
    await seek(page, 0.97);
    await page.waitForTimeout(900);
    const entrance = await page.evaluate(() => {
      const action = document.querySelector('.pf-women-threshold__action');
      const r = action.getBoundingClientRect();
      const women = document.querySelector('.pf-scene--women').getBoundingClientRect();
      return {
        href: action.getAttribute('href'),
        inert: !!action.closest('[inert]'),
        onScreen: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight,
        hit: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.pf-women-threshold__action') !== null,
        headTop: women.top + women.height * 0.08,
      };
    });
    check(`${width}: the cover is the door to the existing chapter`, entrance.href === '#womenswear');
    check(`${width}: it is reachable once it is reached`, !entrance.inert && entrance.onScreen && entrance.hit);
    check(`${width}: her face is inside the frame on the cover`, entrance.headTop > 0, `head at ${entrance.headTop.toFixed(0)}`);
    await page.screenshot({ path: `${output}/${width}-womenswear-cover.png` });

    // ---- the three cover sections below it --------------------------------
    for (const [, id] of ORDER.slice(1)) {
      await page.locator(`[data-cover="${id}"]`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(950);
      const cover = await page.evaluate((chapter) => {
        const el = document.querySelector(`[data-cover="${chapter}"]`);
        const copy = el.querySelector('.pf-cover__copy').getBoundingClientRect();
        const line = el.querySelector('.pf-cover__line').getBoundingClientRect();
        const action = el.querySelector('.pf-cover__action').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          inside: copy.left >= -0.5 && copy.right <= innerWidth + 0.5
            && line.top >= 0 && action.bottom <= innerHeight + 1,
          visible: Number(getComputedStyle(el.querySelector('.pf-cover__copy')).opacity),
          aperture: Number(getComputedStyle(el.querySelector('.pf-cover__plate')).getPropertyValue('--aperture')),
        };
      }, id);
      check(`${width}: the ${id} cover has no horizontal overflow`, cover.overflow <= 0, `${cover.overflow}px`);
      check(`${width}: the ${id} cover keeps its type inside the frame`, cover.inside);
      check(`${width}: the ${id} cover's copy has arrived`, cover.visible > 0.85, cover.visible.toFixed(2));
      check(`${width}: the ${id} cover's frame has opened`, cover.aperture < 4, String(cover.aperture));
      await page.screenshot({ path: `${output}/${width}-cover-${id}.png` });
    }
    check(`${width}: no script error through the whole sequence`, errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- the landing frame never steals a click from what is under it -------
  console.log('\nthe landing frame stays out of the way until it is reached');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    check('it is inert over the opening',
      await page.evaluate(() => document.querySelector('[data-women-threshold]').hasAttribute('inert')));
    await seek(page, 0.3);
    await page.waitForTimeout(700);
    check('it is still inert through the push',
      await page.evaluate(() => document.querySelector('[data-women-threshold]').hasAttribute('inert')));
    await context.close();
  }

  // ---- without motion ------------------------------------------------------
  console.log('\nwithout motion');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    check('the opening resolves to the master scene with no scroll',
      await page.evaluate(() => getComputedStyle(document.querySelector('.pf-scene--master')).opacity === '1'));
    check('the landing frame that will never be reached leaves the page',
      await page.evaluate(() => {
        const el = document.querySelector('[data-women-threshold]');
        return getComputedStyle(el).display === 'none' && el.hasAttribute('inert');
      }));
    check('Womenswear still gets a cover of its own',
      await page.evaluate(() => getComputedStyle(document.querySelector('.pf-cover--still')).display !== 'none'));
    const stillCovers = await page.evaluate(() => [...document.querySelectorAll('[data-cover]')]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .map((el) => el.querySelector('.pf-cover__eyebrow').textContent.replace(/\s+/g, ' ').trim()));
    check('all four covers are present, in order', stillCovers.length === 4
      && ORDER.every(([n, , title], i) => stillCovers[i].startsWith(n) && stillCovers[i].includes(title)),
      stillCovers.join(' | '));
    check('every frame is open: nothing waits for a scrub that will not run',
      await page.evaluate(() => [...document.querySelectorAll('.pf-cover__plate')]
        .every((el) => Number(getComputedStyle(el).getPropertyValue('--aperture') || 0) === 0)));

    await page.locator('.pf-cover--still .pf-cover__action').click();
    await page.waitForTimeout(800);
    check('the Womenswear cover still opens the existing chapter',
      await page.evaluate(() => location.hash === '#womenswear'
        && !document.querySelector('[data-world="womenswear"]').hasAttribute('hidden')));
    check('and the chapter still carries its categories',
      await page.locator('[data-world="womenswear"] .pf-cat').count() >= 5);
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { for (const f of failures) console.log(`  - ${f}`); process.exit(1); }
