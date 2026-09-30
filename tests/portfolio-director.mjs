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
    /* WOMENSWEAR IS AN ACT: one screen, five movements, each a look that
       turns and then a range. So it is walked movement by movement rather
       than category card by category card, and the "viewer" to shoot is the
       movement's run. Menswear still has the category-screen architecture. */
    await open('womenswear');
    await capture('womenswear-act');
    for (const id of ['rtw', 'activewear', 'streetwear', 'evening', 'swimwear']) {
      await open(`womenswear/${id}`);
      await page.waitForTimeout(500);
      await capture(`womenswear-${id}-look`);
      const look = page.locator(`[data-movement="${id}"] .pf-mv__look`).first();
      /* The look arrives pinned and filling the frame — no composition under
         the fold, which is the whole reason the reveal block exists. */
      assert.equal(await look.evaluate((el) => {
        const box = el.getBoundingClientRect();
        return box.top <= 2 && box.bottom >= window.innerHeight - 1;
      }), true, `${width} womenswear/${id}: the look is not whole in the frame`);
      checks++;
      const run = page.locator(`[data-movement="${id}"] .pf-mv__run`);
      if (await run.count() > 0) {
        await page.evaluate((mv) => {
          const world = document.querySelector('[data-world="womenswear"]');
          const box = world.querySelector(`[data-movement="${mv}"] .pf-mv__run`).getBoundingClientRect();
          world.scrollTo({ top: Math.round(world.scrollTop + box.top - (innerHeight - box.height) / 2), behavior: 'instant' });
        }, id);
        await capture(`womenswear-${id}-run`);
        assert.equal(await page.locator(`[data-movement="${id}"] .pf-slot[data-depth="0"]`).count(), 1);
        checks++;
      }
    }
    /* And the ending, which is the last thing the chapter says. */
    await page.evaluate(() => {
      const world = document.querySelector('[data-world="womenswear"]');
      world.scrollTo({ top: world.scrollHeight, behavior: 'instant' });
    });
    await capture('womenswear-payoff');
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
