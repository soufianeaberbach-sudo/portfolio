/* ---------------------------------------------------------------------------
   THE MASTER OPENING, AND ITS HANDOFF INTO WOMENSWEAR.

   Focused regression coverage for the new opening only. The site-wide suites
   (smoke, director, reinvention) still own everything below it, including the
   Womenswear chapter this opening is the entrance to.

   What is protected here:
     - the opening is the supplied master photograph, bright, with the title
       set in its negative space and NOT a dark scrim over the picture
     - the composition survives 390 / 430 / 768 / 1024 / 1440: no overflow,
       nothing clipped out of frame, the caption band off the figures
     - the scroll-linked states run opening -> index -> womenswear
     - the handoff is a match cut: she lands on the same screen point, at the
       same size, in both plates, which is what makes it read as one camera
       move into her world rather than an image swap
     - the entrance is the door to the EXISTING chapter, and while it is not
       on screen it takes neither the pointer nor the focus order
     - without motion the opening resolves to the chapter index and every
       chapter, Womenswear included, still opens
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
        .replace(' ', ' ') === 'BETWEEN INSTINCT & CONSTRUCTION');

    const tone = await page.evaluate(() => {
      const cinema = document.querySelector('.pf-cinema');
      const title = document.querySelector('[data-cinema-title]');
      const lum = (c) => { const [r, g, b] = c.match(/\d+/g).map(Number); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      return { ground: lum(getComputedStyle(cinema).backgroundColor), ink: lum(getComputedStyle(title).color) };
    });
    check('the bright bone environment is preserved', tone.ground > 200, `luminance ${tone.ground.toFixed(0)}`);
    check('the title is ink, not reversed out of a dark scrim', tone.ink < 70, `luminance ${tone.ink.toFixed(0)}`);

    const scrim = await page.evaluate(() => {
      const media = document.querySelector('[data-cinema-media]');
      const field = media.getBoundingClientRect();
      return [...document.querySelectorAll('.pf-cinema *')].filter((el) => {
        const s = getComputedStyle(el);
        if (s.opacity === '0' || s.visibility === 'hidden') return false;
        const bg = s.backgroundColor.match(/[\d.]+/g);
        if (!bg || (bg[3] !== undefined && Number(bg[3]) < 0.25)) return false;
        const lum = 0.2126 * +bg[0] + 0.7152 * +bg[1] + 0.0722 * +bg[2];
        if (lum > 120) return false;
        const r = el.getBoundingClientRect();
        return r.width * r.height > field.width * field.height * 0.25;
      }).length;
    });
    check('no large dark overlay is laid over the photograph', scrim === 0, `${scrim} found`);
    check('the opening raised no script error', errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: `${output}/1440-opening.png` });
    await context.close();
  }

  // ---- every reviewed width is its own composition ------------------------
  for (const [width, height] of [[390, 844], [430, 844], [768, 1024], [1024, 900], [1440, 900]]) {
    console.log(`\nthe opening at ${width}`);
    const context = await browser.newContext({
      viewport: { width, height }, isMobile: width < 768, hasTouch: width < 768, deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(900);

    const frame = await page.evaluate(() => {
      const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter'));
      const title = document.querySelector('[data-cinema-title]').getBoundingClientRect();
      const scene = document.querySelector('[data-scene="master"]').getBoundingClientRect();
      const field = document.querySelector('[data-cinema-media]').getBoundingClientRect();
      const caption = document.querySelector('[data-cinema-thesis]').getBoundingClientRect();
      const cue = document.querySelector('[data-cinema-scroll]').getBoundingClientRect();
      return { gutter, title, scene, field, caption, cue, overflow: document.documentElement.scrollWidth - innerWidth };
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

    // ---- the three scroll-linked states ----------------------------------
    const phaseAt = async (p) => { await seek(page, p); await page.waitForTimeout(700);
      return page.evaluate(() => document.querySelector('.pf-cinema').dataset.phase); };
    check(`${width}: it opens on the master scene`, await phaseAt(0) === 'opening');
    check(`${width}: it becomes the chapter index`, await phaseAt(0.42) === 'index');

    /* The index's preview field shows the WHOLE plate: a plate still cropped
       to the viewport lost the figures' heads when the field shrank. */
    const framed = await page.evaluate(() => {
      const f = document.querySelector('[data-cinema-media]').getBoundingClientRect();
      const s = document.querySelector('[data-scene="master"]').getBoundingClientRect();
      return { dw: s.width - f.width, dh: s.height - f.height };
    });
    check(`${width}: the preview field frames the whole plate`,
      Math.abs(framed.dw) < 2 && Math.abs(framed.dh) < 2,
      `${framed.dw.toFixed(1)} x ${framed.dh.toFixed(1)}`);

    check(`${width}: it arrives in Womenswear`, await phaseAt(0.97) === 'womenswear');

    // ---- the match cut ----------------------------------------------------
    await seek(page, 0.77);
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

    // ---- the entrance -----------------------------------------------------
    await seek(page, 0.97);
    await page.waitForTimeout(800);
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
    check(`${width}: the entrance is the door to the existing chapter`, entrance.href === '#womenswear');
    check(`${width}: the entrance is reachable once it is reached`, !entrance.inert && entrance.onScreen && entrance.hit);
    check(`${width}: her face is inside the frame at the entrance`, entrance.headTop > 0, `head at ${entrance.headTop.toFixed(0)}`);
    check(`${width}: no script error through the whole move`, errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: `${output}/${width}-entrance.png` });
    await context.close();
  }

  // ---- the entrance never steals the index's clicks or its focus order -----
  console.log('\nthe entrance stays out of the way until it is reached');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    check('it is inert over the opening',
      await page.evaluate(() => document.querySelector('[data-women-threshold]').hasAttribute('inert')));
    await seek(page, 0.42);
    await page.waitForTimeout(700);
    check('it is inert over the chapter index',
      await page.evaluate(() => document.querySelector('[data-women-threshold]').hasAttribute('inert')));
    const reachable = await page.evaluate(() => [...document.querySelectorAll('[data-index-row]')].every((row) => {
      const r = row.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('[data-index-row]') === row;
    }));
    check('every chapter row still takes its own click', reachable);
    await context.close();
  }

  // ---- without motion ------------------------------------------------------
  console.log('\nwithout motion');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    check('the opening resolves to the chapter index with no scroll',
      await page.evaluate(() => getComputedStyle(document.querySelector('[data-living-index]')).opacity === '1'));
    check('the unreachable entrance is taken out of the page',
      await page.evaluate(() => document.querySelector('[data-women-threshold]').hasAttribute('inert')));
    await page.locator('[data-index-row][data-chapter="womenswear"]').click();
    await page.waitForTimeout(800);
    check('the Womenswear row still opens the existing chapter',
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
