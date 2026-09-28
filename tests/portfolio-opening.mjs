/* ---------------------------------------------------------------------------
   THE PORTFOLIO INTERFACE: the opening, the four chapter covers, the one
   control, and the ending.

   Focused coverage for the journey only. The site-wide suites (smoke,
   director, reinvention) own everything inside a chapter.

   What is protected here:
     - BETWEEN INSTINCT & CONSTRUCTION is set as the thing it describes: a
       register mark, a solid word and a drawn one
     - the statement NEVER crosses a face, at any reviewed viewport, and
       nothing is silently cut by the frame's overflow
     - the handoff into Womenswear is still a match cut
     - each chapter is headlined by its own NAME, with one sentence and one
       word in that chapter's own sampled colour
     - the four worlds share a grammar and differ in dialect: a grid, a drawn
       echo, a file of paper
     - ONE control carries the position, and nothing else numbers a chapter
     - the ending resolves the journey instead of repeating it
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

/* The running order and what each chapter sells, stated here rather than read
   from the page, so the page cannot quietly agree with itself about the wrong
   sequence or the wrong word. */
const ORDER = [
  ['womenswear', 'Womenswear', 'silhouettes'],
  ['menswear', 'Menswear', 'proportion'],
  ['3d-simulation', 'Development', 'patterns'],
  ['tech-packs', 'Tech Packs', 'specifications'],
];

/* Every viewport the art direction is reviewed at. 1366x768 is the one the
   statement used to fail on: a laptop is wide without being tall. */
const VIEWPORTS = [[1440, 900], [1366, 768], [1024, 768], [768, 1024], [430, 932], [390, 844]];

/* THE DEFECT, MEASURED IN PIXELS RATHER THAN IN BOXES.
   A box test cannot tell the difference between type set over a floor and type
   set over a face: both are "inside the plate". So the type is hidden, the
   band each line of it occupies is photographed, and the photograph is read —
   the studio ground is bone (luminance ~227), a garment or a face is not. A
   line passes only when nothing behind it is darker than the ground. */
const inkBehindType = async (page, width, height) => {
  const lines = await page.evaluate(() => {
    const boxes = [];
    for (const selector of ['[data-cinema-title]', '[data-cinema-thesis]']) {
      const el = document.querySelector(selector);
      if (!el || getComputedStyle(el).display === 'none') continue;
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walk.nextNode())) {
        if (!node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        /* One rect per rendered line, tight to the glyphs — not the block. */
        for (const r of range.getClientRects()) {
          if (r.width < 2 || r.height < 2) continue;
          boxes.push({ what: selector.includes('thesis') ? 'the supporting line' : 'the statement', x: r.x, y: r.y, width: r.width, height: r.height });
        }
      }
    }
    const style = document.createElement('style');
    style.id = 'qa-hide-type';
    style.textContent = '.pf-cinema__title,.pf-cinema__thesis,.pf-cinema__folio,.pf-cinema__scroll,.pf-where{visibility:hidden!important}';
    document.head.appendChild(style);
    return boxes;
  });
  const read = [];
  for (const line of lines) {
    const clip = {
      x: Math.max(0, line.x), y: Math.max(0, line.y),
      width: Math.min(line.width, width - Math.max(0, line.x)),
      height: Math.min(line.height, height - Math.max(0, line.y)),
    };
    if (clip.width < 2 || clip.height < 2) continue;
    const shot = await page.screenshot({ clip });
    const stat = await page.evaluate((url) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let dark = 0, min = 255;
        for (let i = 0; i < data.length; i += 4) {
          const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          if (l < 190) dark += 1;
          if (l < min) min = l;
        }
        resolve({ darkPct: (100 * dark) / (canvas.width * canvas.height), min: Math.round(min) });
      };
      img.src = url;
    }), `data:image/png;base64,${shot.toString('base64')}`);
    read.push({ ...line, ...stat });
  }
  await page.evaluate(() => document.getElementById('qa-hide-type')?.remove());
  return read;
};

const seek = (page, progress) => page.evaluate((p) => {
  const cinema = document.querySelector('.pf-cinema');
  scrollTo(0, cinema.offsetTop + (cinema.offsetHeight - innerHeight) * p);
}, progress);

const browser = await chromium.launch();
try {
  // ---- the statement, set as the thing it says ----------------------------
  console.log('\nbetween instinct & construction');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    check('the opening is the supplied master photograph',
      await page.locator('[data-scene="master"] img').getAttribute('src').then((s) => /\/portfolio\/master\/master-scene/.test(s)));
    check('it is fetched at high priority, being the first thing seen',
      await page.locator('[data-scene="master"] img').getAttribute('fetchpriority') === 'high');

    const type = await page.evaluate(() => {
      const t = document.querySelector('[data-cinema-title]');
      const between = t.querySelector('.pf-cinema__between');
      const solid = t.querySelector('.pf-cinema__word--solid');
      const drawn = t.querySelector('.pf-cinema__word--drawn');
      const amp = drawn.querySelector('b');
      const cs = (el) => getComputedStyle(el);
      return {
        text: t.textContent.replace(/\s+/g, ' ').trim().toUpperCase(),
        register: { text: between.textContent.trim(), family: cs(between).fontFamily, size: parseFloat(cs(between).fontSize) },
        solid: { text: solid.textContent.trim(), fill: cs(solid).color, stroke: cs(solid).webkitTextStrokeWidth, size: parseFloat(cs(solid).fontSize) },
        drawn: { fill: cs(drawn).color, stroke: cs(drawn).webkitTextStrokeWidth, size: parseFloat(cs(drawn).fontSize) },
        amp: { fill: cs(amp).color, stroke: cs(amp).webkitTextStrokeWidth },
        thesis: document.querySelector('[data-cinema-thesis]').textContent.replace(/\s+/g, ' ').trim(),
      };
    });
    check('the statement is BETWEEN INSTINCT & CONSTRUCTION',
      type.text.replace(/ /g, ' ') === 'BETWEEN INSTINCT & CONSTRUCTION', type.text);
    /* BETWEEN is a register, not a word of the headline: it is mono and small,
       the device the rest of the site frames a statement with. */
    check('BETWEEN behaves as a register mark, not as headline type',
      /Mono/i.test(type.register.family) && type.register.size < type.solid.size / 4,
      `${type.register.family} at ${type.register.size}px against ${type.solid.size}px`);
    /* The concept, in the type: INSTINCT is filled, CONSTRUCTION is drawn. */
    check('INSTINCT is solid ink',
      type.solid.fill === 'rgb(17, 17, 15)' && parseFloat(type.solid.stroke || '0') === 0,
      `${type.solid.fill} stroke ${type.solid.stroke}`);
    check('CONSTRUCTION is drawn, not filled',
      type.drawn.fill === 'rgba(0, 0, 0, 0)' && parseFloat(type.drawn.stroke) > 0,
      `${type.drawn.fill} stroke ${type.drawn.stroke}`);
    check('the two halves are set at the same size, so neither outranks the other',
      Math.abs(type.solid.size - type.drawn.size) < 0.5, `${type.solid.size} vs ${type.drawn.size}`);
    check('the ampersand stays solid, holding the two together',
      type.amp.fill === 'rgb(17, 17, 15)' && parseFloat(type.amp.stroke || '0') === 0,
      `${type.amp.fill} stroke ${type.amp.stroke}`);
    check('the supporting line says fashion AND product, not generic freelancing',
      type.thesis === 'Fashion design, pattern development and technical product work — connected from first idea to production.',
      type.thesis);

    const tone = await page.evaluate(() => {
      const lum = (c) => { const [r, g, b] = c.match(/\d+/g).map(Number); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      return {
        ground: lum(getComputedStyle(document.querySelector('.pf-cinema')).backgroundColor),
        scrim: [...document.querySelectorAll('.pf-cinema *, .pf-cover *, .pf-outro *')].filter((el) => {
          const s = getComputedStyle(el);
          if (s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none') return false;
          const bg = s.backgroundColor.match(/[\d.]+/g);
          if (!bg || (bg[3] !== undefined && Number(bg[3]) < 0.25)) return false;
          if (0.2126 * +bg[0] + 0.7152 * +bg[1] + 0.0722 * +bg[2] > 120) return false;
          const r = el.getBoundingClientRect();
          return r.width * r.height > innerWidth * innerHeight * 0.25;
        }).length,
      };
    });
    check('the bright bone environment is preserved', tone.ground > 200, `luminance ${tone.ground.toFixed(0)}`);
    check('no large dark overlay anywhere in the sequence', tone.scrim === 0, `${tone.scrim} found`);
    check('the opening raised no script error', errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: `${output}/1440x900-statement.png` });
    await context.close();
  }

  // ---- THE DEFECT THIS PASS EXISTS TO FIX --------------------------------
  console.log('\nthe statement never crosses a face');
  for (const [width, height] of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width, height }, isMobile: width < 768, hasTouch: width < 768, deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    const frame = await page.evaluate(() => {
      const title = document.querySelector('[data-cinema-title]').getBoundingClientRect();
      const scene = document.querySelector('[data-scene="master"]').getBoundingClientRect();
      const thesis = document.querySelector('[data-cinema-thesis]').getBoundingClientRect();
      /* Nothing may be cut by the sticky field's `overflow: clip`. */
      const painted = [...document.querySelectorAll('.pf-cinema__word')].map((el) => {
        const r = el.getBoundingClientRect();
        return Math.round(r.left + Math.max(el.scrollWidth, r.width));
      });
      return {
        titleBottom: title.bottom, titleLeft: title.left, titleRight: title.right,
        crowns: scene.top + scene.height * 0.08,
        feet: scene.top + scene.height * 0.83,
        thesisTop: thesis.top, thesisBottom: thesis.bottom,
        painted, overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });

    /* The crown of the tallest figure. The statement's box may not reach it:
       at 1366x768 the headline used to be set straight across three faces. */
    const clearance = frame.crowns - frame.titleBottom;
    check(`${width}x${height}: the statement clears the figures' heads`,
      clearance > 8, `${clearance > 0 ? '+' : ''}${clearance.toFixed(0)}px of air`);
    check(`${width}x${height}: no word is cut off by the frame`,
      frame.painted.every((x) => x <= width + 1), `painted to ${frame.painted.join(', ')} of ${width}`);
    check(`${width}x${height}: the statement stays inside the gutters`,
      frame.titleLeft >= -0.5 && frame.titleRight <= width + 0.5,
      `${frame.titleLeft.toFixed(0)}…${frame.titleRight.toFixed(0)}`);
    /* Nothing of the photograph behind ANY line of the hero's type: not a
       face, not a head, not a hem. Measured off the rendered page. */
    const behind = await inkBehindType(page, width, height);
    const over = behind.filter((l) => l.darkPct > 0.05 || l.min < 200);
    check(`${width}x${height}: no line of type has a garment or a figure behind it`,
      behind.length >= 4 && over.length === 0,
      over.length
        ? over.map((l) => `${l.what} at y${Math.round(l.y)}: ${l.darkPct.toFixed(2)}% ink, darkest ${l.min}`).join('; ')
        : `${behind.length} lines, all on the studio ground`);
    check(`${width}x${height}: no horizontal overflow`, frame.overflow <= 0, `${frame.overflow}px`);
    await page.screenshot({ path: `${output}/${width}x${height}-statement.png` });

    // ---- the match cut is preserved ---------------------------------------
    await seek(page, 0.47);
    await page.waitForTimeout(900);
    const cut = await page.evaluate((her) => {
      const at = (selector, [fx, fy]) => {
        const el = document.querySelector(selector);
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        /* Under a scale about its own transform-origin, that origin is the one
           point the transform leaves alone — so her position on screen is the
           untransformed origin plus the translation. */
        return { x: el.offsetLeft + fx * el.offsetWidth + m.e, y: el.offsetTop + fy * el.offsetHeight + m.f, scale: m.a };
      };
      return { master: at('.pf-scene--master', her.master), women: at('.pf-scene--women', her.women) };
    }, HER);
    check(`${width}x${height}: both plates are pushed in by the same amount`,
      Math.abs(cut.master.scale - cut.women.scale) < 0.01, `${cut.master.scale} vs ${cut.women.scale}`);
    check(`${width}x${height}: she is at the same point on screen in both plates`,
      Math.abs(cut.master.x - cut.women.x) < 6 && Math.abs(cut.master.y - cut.women.y) < 6,
      `dx ${(cut.women.x - cut.master.x).toFixed(1)} dy ${(cut.women.y - cut.master.y).toFixed(1)}`);
    check(`${width}x${height}: no script error through the cut`, errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- four worlds, one site ---------------------------------------------
  console.log('\nsame grammar, different dialect');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(800);

    const covers = await page.evaluate(() => [...document.querySelectorAll('.pf-cover')]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .map((el) => {
        const name = el.querySelector('.pf-cover__name');
        const em = el.querySelector('.pf-cover__statement em');
        return {
          id: el.dataset.cover ?? (el.hasAttribute('data-women-threshold') ? 'womenswear' : ''),
          name: name.textContent.trim(),
          nameSize: parseFloat(getComputedStyle(name).fontSize),
          statementSize: parseFloat(getComputedStyle(el.querySelector('.pf-cover__statement')).fontSize),
          word: em.textContent.trim(),
          colour: getComputedStyle(em).color,
          accent: getComputedStyle(el).getPropertyValue('--accent').trim(),
          rulePaint: (() => {
            const cs = getComputedStyle(el.querySelector('.pf-cover__rule'));
            return `${cs.backgroundColor} ${cs.backgroundImage}`;
          })(),
          /* The dialects. */
          grid: el.querySelectorAll('.pf-cover__grid i').length,
          echo: name.dataset.echo ?? '',
          sheets: el.querySelectorAll('.pf-file__sheet').length,
        };
      }));

    check('four covers, in the running order, each headlined by its own name',
      covers.map((c) => `${c.id}:${c.name}`).join(' ')
        === ORDER.map(([id, name]) => `${id}:${name}`).join(' '),
      covers.map((c) => `${c.id}:${c.name}`).join(' '));
    check('the chapter name outranks everything else on its cover',
      covers.every((c) => c.nameSize >= c.statementSize * 3),
      covers.map((c) => `${c.name} ${c.nameSize}/${c.statementSize}`).join(' · '));
    check('one word of each statement is coloured, and it is the capability sold',
      covers.map((c) => c.word).join(' ') === ORDER.map(([, , w]) => w).join(' '),
      covers.map((c) => c.word).join(' '));
    /* Development's rule is a row of registration ticks, so its paint is a
       gradient rather than a fill — the token is read off whichever paint the
       rule uses, and it still has to be the one the word is set in. */
    check("each chapter's word and rule take the same single token",
      covers.every((c) => c.rulePaint.includes(c.colour)),
      covers.map((c) => `${c.colour} / ${c.rulePaint}`).join(' | '));
    check('the four tokens are four different colours',
      new Set(covers.map((c) => c.colour)).size === 4, covers.map((c) => c.colour).join(' '));

    /* SAME GRAMMAR, DIFFERENT DIALECT: exactly one world carries each device,
       so the covers cannot collapse back into four recolours of one layout. */
    const by = (id) => covers.find((c) => c.id === id);
    check('Menswear is the one built on a visible grid',
      by('menswear').grid === 3 && covers.filter((c) => c.grid > 0).length === 1,
      covers.map((c) => `${c.id}:${c.grid}`).join(' '));
    check('Development is the one whose name is drawn before it is filled',
      by('3d-simulation').echo === 'Development' && covers.filter((c) => c.echo).length === 1,
      covers.map((c) => `${c.id}:${c.echo || '-'}`).join(' '));
    check('Tech Packs is the one made of paper — a front sheet and three behind',
      by('tech-packs').sheets === 3 && covers.filter((c) => c.sheets > 0).length === 1,
      covers.map((c) => `${c.id}:${c.sheets}`).join(' '));

    /* The file still answers to attention, by pointer and by keyboard. */
    await page.locator('[data-cover="tech-packs"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const sheetTops = () => page.evaluate(() => [...document.querySelectorAll('[data-cover="tech-packs"] .pf-file__sheet')]
      .map((el) => el.getBoundingClientRect().top));
    const rest = await sheetTops();
    await page.locator('[data-cover="tech-packs"] .pf-file__front').hover();
    await page.waitForTimeout(900);
    const hovered = await sheetTops();
    check('hovering the file steps its sheets apart, furthest one furthest',
      hovered.every((t, i) => rest[i] - t > 3) && rest[0] - hovered[0] > rest[2] - hovered[2],
      hovered.map((t, i) => (rest[i] - t).toFixed(1)).join(' '));
    await page.mouse.move(8, 8);
    await page.waitForTimeout(800);
    await page.locator('[data-cover="tech-packs"] .pf-cover__action').focus();
    await page.waitForTimeout(900);
    const focused = await sheetTops();
    check('keyboard focus on the way in opens the file too',
      focused.every((t, i) => rest[i] - t > 3), focused.map((t, i) => (rest[i] - t).toFixed(1)).join(' '));
    await page.screenshot({ path: `${output}/1440x900-tech-packs.png` });
    await context.close();
  }

  /* EVERY NAME HOLDS ITS OWN GLYPHS, AT EVERY WIDTH.
     A cover clips its name's box as it arrives, so a box narrower than the
     word does not overflow harmlessly — it cuts the word. This is checked at
     the narrow widths because that is where it happened: a `max-width: 9ch`
     left behind by a cover system that no longer exists cut MENSWEAR to
     MENSWEA on a phone. */
  console.log('\nno name is cut by its own box');
  for (const [width, height] of [[768, 1024], [430, 932], [390, 844]]) {
    const context = await browser.newContext({
      viewport: { width, height }, isMobile: width < 768, hasTouch: width < 768, deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const names = await page.evaluate(() => [...document.querySelectorAll('.pf-cover')]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .map((el) => {
        const name = el.querySelector('.pf-cover__name');
        const box = name.getBoundingClientRect();
        /* The glyphs themselves, not the block: Development's name carries an
           outlined echo as a pseudo-element, which a scrollWidth would count. */
        const range = document.createRange();
        range.selectNodeContents(name.firstChild);
        const glyphs = range.getBoundingClientRect();
        return {
          name: name.textContent.trim(),
          fits: glyphs.right <= box.right + 2,
          inside: Math.max(glyphs.right, box.right) <= innerWidth + 1,
          over: Math.round(glyphs.right - box.right),
          size: Math.round(parseFloat(getComputedStyle(name).fontSize)),
        };
      }));
    check(`${width}x${height}: every chapter name fits inside its own box`,
      names.length === 4 && names.every((n) => n.fits),
      names.filter((n) => !n.fits).map((n) => `${n.name} over by ${n.over}px`).join(' ') || names.map((n) => `${n.name} ${n.size}px`).join(' · '));
    check(`${width}x${height}: and inside the frame`,
      names.every((n) => n.inside), names.filter((n) => !n.inside).map((n) => n.name).join(' ') || 'all inside');
    await context.close();
  }

  // ---- one control, and nothing else that numbers ------------------------
  console.log('\none control');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await page.waitForTimeout(800);

    const control = page.locator('[data-where]');
    check('it is out of the way over the opening, which is not a chapter',
      await page.evaluate(() => getComputedStyle(document.querySelector('[data-where]')).opacity === '0'));

    await page.locator('[data-cover="menswear"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1400);
    const now = await page.evaluate(() => ({
      live: document.querySelector('[data-where]').dataset.live,
      count: document.querySelector('[data-where-count]').textContent.trim(),
      name: document.querySelector('[data-where-name]').textContent.trim(),
      current: document.querySelector('[data-where-link][aria-current]')?.dataset.whereLink,
      expanded: document.querySelector('[data-where-toggle]').getAttribute('aria-expanded'),
    }));
    check('it says where you are', now.live === 'true' && now.count === '02 / 04' && now.name === 'Menswear',
      JSON.stringify(now));
    check('it marks the chapter being read', now.current === 'menswear', String(now.current));
    check('it is closed until it is asked for', now.expanded === 'false');

    /* Keyboard: the button opens it, Escape closes it. */
    await page.locator('[data-where-toggle]').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    check('a keyboard opens it',
      await page.locator('[data-where-toggle]').getAttribute('aria-expanded') === 'true');
    check('and it lists the four chapters, in order',
      (await page.locator('[data-where-link]').evaluateAll((els) => els.map((e) => e.dataset.whereLink))).join(' ')
        === ORDER.map(([id]) => id).join(' '));
    await page.screenshot({ path: `${output}/1440x900-control.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    check('Escape closes it again',
      await page.locator('[data-where-toggle]').getAttribute('aria-expanded') === 'false');

    /* A touch control, not a hover affordance. */
    await context.close();
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const small = await phone.newPage();
    await small.goto(`${base}/portfolio/`, { waitUntil: 'load' });
    await small.locator('[data-cover="menswear"]').scrollIntoViewIfNeeded();
    await small.waitForTimeout(1400);
    await small.locator('[data-where-toggle]').click();
    await small.waitForTimeout(500);
    check('on a phone a tap opens it and leaves it open',
      await small.locator('[data-where-toggle]').getAttribute('aria-expanded') === 'true');
    const target = await small.locator('[data-where-toggle]').boundingBox();
    check('and it is a touch target, not a hairline',
      target.height >= 44, `${Math.round(target.height)}px tall`);
    await phone.close();
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
    const stillCovers = await page.evaluate(() => [...document.querySelectorAll('[data-cover]')]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .map((el) => el.querySelector('.pf-cover__name').textContent.trim()));
    check('all four chapters still have a cover, in order',
      stillCovers.join('|') === ORDER.map(([, name]) => name).join('|'), stillCovers.join('|'));
    check('every frame is open: nothing waits for a scrub that will not run',
      await page.evaluate(() => [...document.querySelectorAll('.pf-cover__plate')]
        .every((el) => Number(getComputedStyle(el).getPropertyValue('--aperture') || 0) === 0)));
    check('and no name is left drawn but unfilled',
      await page.evaluate(() => [...document.querySelectorAll('.pf-cover__name[data-echo]')]
        .every((el) => Number(getComputedStyle(el).getPropertyValue('--echo-o') || 0) === 0)));

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
