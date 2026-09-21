import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const out = new URL('./screens/', import.meta.url).pathname.slice(1);
const base = process.env.QA_BASE ?? 'http://127.0.0.1:4360';
const prefix = process.env.QA_PREFIX ?? 'after';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await desktop.goto(`${base}/portfolio/`, { waitUntil: 'networkidle' });
await desktop.screenshot({ path: `${out}/${prefix}-01-opening-desktop.png` });
await desktop.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; const track = document.querySelector('[data-lay-track]'); scrollTo(0, track.offsetTop + track.scrollHeight - innerHeight - 8); });
await desktop.waitForTimeout(350);
await desktop.screenshot({ path: `${out}/${prefix}-02-worlds-desktop.png` });
await desktop.locator('[data-chapter="womenswear"]').click();
await desktop.waitForTimeout(350);
await desktop.screenshot({ path: `${out}/${prefix}-03-womenswear-desktop.png` });
await desktop.evaluate(() => document.querySelector('[data-world="womenswear"]').scrollTop = 320);
await desktop.waitForTimeout(200);
await desktop.screenshot({ path: `${out}/${prefix}-04-categories-desktop.png` });
await desktop.locator('[data-world="womenswear"] .pf-cat[data-category="rtw"]').click();
await desktop.waitForTimeout(350);
await desktop.screenshot({ path: `${out}/${prefix}-05-viewer-desktop.png` });
await desktop.keyboard.press('Escape'); await desktop.keyboard.press('Escape');
await desktop.locator('[data-chapter="tech-packs"]').click();
await desktop.waitForTimeout(350);
await desktop.screenshot({ path: `${out}/${prefix}-06-techpacks-desktop.png` });
await desktop.keyboard.press('Escape');
await desktop.locator('[data-chapter="3d-simulation"]').click();
await desktop.waitForTimeout(350);
await desktop.screenshot({ path: `${out}/${prefix}-07-pattern-desktop.png` });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
await mobile.goto(`${base}/portfolio/`, { waitUntil: 'networkidle' });
await mobile.screenshot({ path: `${out}/${prefix}-08-opening-mobile.png` });
await mobile.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; const track = document.querySelector('[data-lay-track]'); scrollTo(0, track.offsetTop + track.scrollHeight - innerHeight - 8); });
await mobile.waitForTimeout(350);
await mobile.screenshot({ path: `${out}/${prefix}-09-worlds-mobile.png` });
await mobile.locator('[data-chapter="womenswear"]').click();
await mobile.waitForTimeout(350);
await mobile.screenshot({ path: `${out}/${prefix}-10-category-mobile.png` });

for (const page of [desktop, mobile]) {
  const state = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (state.scrollWidth > state.width + 1) throw new Error(`horizontal overflow ${state.width} -> ${state.scrollWidth}`);
}

await browser.close();
console.log(out);
