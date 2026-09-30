import { chromium } from 'playwright';
import { installFonts } from './fixtures/fonts.mjs';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.PORTFOLIO_QA_URL ?? 'http://127.0.0.1:4339';
const output = '.qa-director/final';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
/* Every context in this file renders with the site's real faces — see
   fixtures/fonts.mjs for why that is not a detail. */
const ctxWithFonts = async (options) => {
  const context = await browser.newContext(options);
  await installFonts(context);
  return context;
};
const pageWithFonts = async (options) => {
  const context = await ctxWithFonts(options);
  return context.newPage();
};

let checks = 0;
try {
  for (const width of [1440, 390, 1024, 768, 430]) {
    const page = await pageWithFonts({ viewport: { width, height: 900 }, hasTouch: width < 900 });
    const capture = async (name) => {
      await page.waitForTimeout(550);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} ${name}: page overflow`);
      assert(await page.evaluate(() => [...document.querySelectorAll('[data-world][data-open]')].every((e) => e.scrollWidth <= e.clientWidth + 1)), `${width} ${name}: world overflow`);
      checks += 2;
      await page.screenshot({ path: `${output}/${width}-${name}.png` });
    };
    const open = async (hash) => { await page.evaluate((value) => { location.hash = value; }, hash); await page.waitForTimeout(600); };
    await page.goto(`${base}/portfolio/`);
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    for (const cover of await page.locator('.pf-cover__still').all()) {
      await cover.scrollIntoViewIfNeeded();
      await cover.evaluate((image) => image.decode());
    }
    await page.evaluate(() => scrollTo(0, 0));
    await capture('landing');
    await page.screenshot({ path: `${output}/${width}-landing-full.png`, fullPage: true });
    /* WOMENSWEAR IS ONE AUTHORED ACT IN FIVE TERRITORIES, told in beats, so
       it is walked SCENE BY SCENE and every scrubbed scene is shot at three
       positions — start, midpoint and payoff. A random frame in the middle of
       a pinned sequence is not evidence of a final design. */
    await open('womenswear');
    await capture('womenswear-01-overture-START');
    const scene = async (selector, fraction) => page.evaluate(([sel, f]) => {
      const world = document.querySelector('[data-world="womenswear"]');
      const el = world.querySelector(sel);
      if (!el) return false;
      const reveal = el.closest('[data-reveal]');
      if (reveal && f !== null) {
        const rb = reveal.getBoundingClientRect();
        world.scrollTo({ top: Math.round(world.scrollTop + rb.top + (rb.height - innerHeight) * f), behavior: 'instant' });
        return true;
      }
      const box = el.getBoundingClientRect();
      world.scrollTo({ top: Math.round(world.scrollTop + box.top - Math.max(0, (innerHeight - box.height) / 2)), behavior: 'instant' });
      return true;
    }, [selector, fraction]);

    /* SET PIECE 01 — the studio field closing around the garment, then the
       back of it. Three frames out of one photograph. */
    await scene('[data-scene="overture"] [data-ov-field]', 0.34);
    await capture('womenswear-02-overture-MID-composition');
    await scene('[data-scene="overture"] [data-turn]', 0.8);
    await capture('womenswear-03-overture-PAYOFF-back');
    await scene('[data-scene="sheet"]', null);
    await capture('womenswear-04-rtw-sheet');
    /* Every territory's slate, every supporting mechanism, every set piece. */
    await scene('[data-territory="activewear"] .pf-tr__slate', null);
    await capture('womenswear-05-activewear-slate');
    await scene('[data-scene="deck"]', null);
    await capture('womenswear-06-activewear-deck');
    assert.equal(await page.locator('[data-scene="deck"] .pf-slot[data-depth="0"]').count(), 1);
    checks++;
    /* SET PIECE 02 — no motion at all: two frames, unequal, asymmetric. */
    await scene('[data-territory="streetwear"] .pf-tr__slate', null);
    await capture('womenswear-07-streetwear-slate-loud');
    await scene('[data-scene="pair"]', null);
    await capture('womenswear-08-streetwear-pair-SETPIECE');
    await scene('[data-territory="evening"] .pf-tr__slate', null);
    await capture('womenswear-09-occasion-slate');
    /* SET PIECE 03 — the turn, used for the second and last time. */
    for (const [f, label] of [[0.02, 'START'], [0.45, 'MID'], [0.85, 'PAYOFF']]) {
      await scene('[data-scene="turn"] [data-turn]', f);
      await capture(`womenswear-10-occasion-turn-${label}`);
    }
    await scene('[data-scene="evidence"]', null);
    await capture('womenswear-11-occasion-evidence');
    /* The proof beat carries no fabricated work: with nothing verified it is
       three declared stages and a sentence saying so. */
    assert.equal(await page.locator('[data-scene="evidence"] img').count(), 0);
    assert.equal(await page.locator('[data-evidence-empty]').count(), 1);
    checks += 2;
    await scene('[data-scene="rail"]', null);
    await capture('womenswear-12-occasion-rail');
    await scene('[data-territory="swimwear"] .pf-tr__slate', null);
    await capture('womenswear-13-swim-slate');
    /* SET PIECE 04 — scale, and nothing else. */
    for (const [f, label] of [[0.02, 'START'], [0.45, 'MID'], [0.9, 'PAYOFF']]) {
      await scene('[data-scene="approach"] [data-approach]', f);
      await capture(`womenswear-14-swim-approach-${label}`);
    }
    await scene('[data-scene="line"]', null);
    await capture('womenswear-15-swim-line');
    /* Every territory is arrived at by name, and lands on its own frame. */
    for (const id of ['rtw', 'activewear', 'streetwear', 'evening', 'swimwear']) {
      await open(`womenswear/${id}`);
      await page.waitForTimeout(400);
      assert.equal(await page.locator(`[data-territory="${id}"]`).evaluate((el) => {
        const box = el.getBoundingClientRect();
        return box.top >= -2 && box.top < 120;
      }), true, `${width} womenswear/${id}: the territory does not arrive in the frame`);
      checks++;
    }
    /* And the ending, which is the last thing the chapter says. */
    await page.evaluate(() => {
      const world = document.querySelector('[data-world="womenswear"]');
      world.scrollTo({ top: world.scrollHeight, behavior: 'instant' });
    });
    await capture('womenswear-16-close-handoff');
    for (const [world, category] of [['menswear', 'm-streetwear']]) {
      await open(world);
      await capture(`${world}-categories`);
      if (width === 1440 || width === 390) {
        for (const card of await page.locator(`[data-world="${world}"] .pf-cat`).all()) {
          await card.scrollIntoViewIfNeeded();
          await capture(`${world}-${await card.getAttribute('data-category')}-index`);
        }
      }
      await open(`${world}/${category}`);
      await capture(`${world}-viewer`);
      const active = page.locator(`[data-world="${world}"] [data-screen="category"]:not([hidden])`);
      assert.equal(await active.locator('.pf-slot[data-depth="0"]').count(), 1);
      checks++;
    }
    await open('tech-packs');
    await capture('tech-packs');
    if (width === 1440) {
      await page.locator('[data-world="tech-packs"] [data-open-pdf]').first().click();
      await capture('pdf-reader');
      await page.keyboard.press('Escape');
    }
    await open('3d-simulation');
    await capture('pattern');
    const posters = page.locator('.pf-video__poster');
    for (let i = 0; i < await posters.count(); i++) {
      await posters.nth(i).scrollIntoViewIfNeeded();
      await posters.nth(i).evaluate((img) => img.decode());
      checks++;
      if (width === 1440 || width === 390) await capture(`pattern-session-${i + 1}`);
    }
    assert.equal(await page.locator('iframe').count(), 0);
    checks++;
    await page.close();
  }
  console.log(`${checks} Portfolio visual checks passed. Screenshots: ${output}`);
} finally { await browser.close(); }
