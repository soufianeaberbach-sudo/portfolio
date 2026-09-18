import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

import { startPreview } from './preview.mjs';

/* Starts its own server on its own port, so `npm run test:portfolio` needs
   nothing running first. PORTFOLIO_QA_URL still overrides it. */
const { base, stop } = await startPreview(Number(process.env.PORTFOLIO_QA_PORT ?? 4322));
const output = '.qa-director/final';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
let checks = 0;
try {
  for (const width of [1440, 390, 1024, 768, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 900 });
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
    for (const [world, category] of [['womenswear', 'rtw'], ['menswear', 'm-streetwear']]) {
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
} finally { await browser.close(); stop(); }
