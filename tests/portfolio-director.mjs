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
    /* Walk the shared exhibition, not an obsolete mechanism-specific score. */
    await open('womenswear');
    const scene = async (selector) => page.evaluate((sel) => {
      const world = document.querySelector('[data-world="womenswear"]');
      const el = world.querySelector(sel);
      if (!el) return false;
      world.scrollTo({ top: Math.round(world.scrollTop + el.getBoundingClientRect().top - 52), behavior: 'instant' });
      return true;
    }, selector);
    for (const id of ['rtw', 'activewear', 'streetwear', 'evening', 'swimwear']) {
      await scene(`[data-territory="${id}"]`);
      await capture(`womenswear-${id}-opening`);
      await scene(`[data-territory="${id}"] [data-selection="featured"]`);
      await capture(`womenswear-${id}-selected`);
      if (await scene(`[data-territory="${id}"] [data-support]`)) {
        await capture(`womenswear-${id}-supporting`);
      }
    }
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
    await open('womenswear');
    await page.evaluate(() => {
      const world = document.querySelector('[data-world="womenswear"]');
      world.scrollTo({ top: world.scrollHeight, behavior: 'instant' });
    });
    await capture('womenswear-16-close-handoff');

    /* ---- THE GARMENT. A category is the atmosphere; a project is the story.
       Every range is a way into the work, so the reader is shot for each
       territory — one per reveal gesture — and the proof that it is not a
       larger JPEG is measured, not assumed. */
    for (const [cat, reveal] of [
      ['rtw', 'turn'], ['activewear', 'together'], ['streetwear', 'drag'],
      ['evening', 'foreground'], ['swimwear', 'single'],
    ]) {
      await open(`womenswear/${cat}/${cat}-ref-02`);
      await page.waitForTimeout(500);
      await capture(`womenswear-17-${cat}-garment-${reveal}`);
      const read = await page.evaluate(() => {
        const rd = [...document.querySelectorAll('.pf-rd__subject')].find((e) => !e.hidden);
        if (!rd) return null;
        const img = rd.querySelector('.pf-rd__window img');
        return {
          reveal: rd.dataset.rdReveal,
          garment: Math.round(img.getBoundingClientRect().height),
          stages: rd.querySelectorAll('.pf-rd__stage-item').length,
          pending: !!rd.querySelector('[data-subject-pending]'),
          frame: window.innerHeight,
        };
      });
      assert.equal(read?.reveal, reveal, `${width} ${cat}: wrong reveal gesture`);
      /* The garment has to be worth entering: at least half the frame tall. */
      assert.ok(read.garment > read.frame * 0.45,
        `${width} ${cat}: entered garment is only ${read.garment}px of a ${read.frame}px frame`);
      /* And nothing is fabricated for a reference. */
      assert.equal(read.stages, 0, `${width} ${cat}: invented development stages`);
      assert.equal(read.pending, true, `${width} ${cat}: silent about the missing story`);
      checks += 4;
      /* Looking closer, which is the whole reason a garment can be entered. */
      await page.evaluate(() => {
        const rd = [...document.querySelectorAll('.pf-rd__subject')].find((e) => !e.hidden);
        rd.querySelector('[data-rd-inspect]').click();
      });
      await capture(`womenswear-18-${cat}-garment-inspect`);
      await page.evaluate(() => {
        const rd = [...document.querySelectorAll('.pf-rd__subject')].find((e) => !e.hidden);
        rd.querySelector('[data-rd-inspect]').click();
      });
    }
    await open('womenswear');
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
