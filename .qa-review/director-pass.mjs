import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.QA_BASE ?? 'http://127.0.0.1:4360/portfolio/';
const out = process.env.QA_OUT ?? '.qa-review/final-brief';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();

const clean = async (page) => {
  await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
  await page.waitForTimeout(300);
};
const shot = async (page, name) => {
  await page.waitForTimeout(250);
  const fit = await page.evaluate(() => ({ w: innerWidth, sw: document.documentElement.scrollWidth }));
  if (fit.sw > fit.w + 1) throw new Error(`${name}: horizontal overflow ${fit.sw - fit.w}px`);
  await page.screenshot({ path: `${out}/${name}.png`, scale: 'css' });
};
const moveOpening = async (page, target) => {
  for (let i = 0; i < 16; i += 1) {
    const t = await page.locator('[data-lay]').evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--t')));
    if (t >= target) return;
    await page.mouse.wheel(0, 220);
    await page.waitForTimeout(70);
  }
};
const clickWorld = async (page, id) => {
  await page.locator(`[data-chapter="${id}"]`).click();
  await page.waitForTimeout(350);
};

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(base, { waitUntil: 'networkidle' });
await clean(desktop);
await shot(desktop, '01-desktop-opening');
await moveOpening(desktop, .22); await shot(desktop, '02-desktop-early');
await moveOpening(desktop, .54); await shot(desktop, '03-desktop-mid');
await moveOpening(desktop, .98); await shot(desktop, '04-desktop-worlds');
await desktop.locator('[data-chapter="tech-packs"]').hover(); await shot(desktop, '05-desktop-world-focus');

await clickWorld(desktop, 'womenswear');
await shot(desktop, '06-desktop-womenswear-arrival');
await desktop.mouse.wheel(0, 650); await desktop.waitForTimeout(250); await shot(desktop, '07-desktop-category-discovery');
await desktop.locator('.pf-cat[data-category="rtw"]').click(); await desktop.waitForTimeout(350);
await shot(desktop, '08-desktop-garment-viewer');
await desktop.locator('[data-screen="category"]:not([hidden]) [data-stage]').press('ArrowRight'); await desktop.waitForTimeout(500);
await shot(desktop, '09-desktop-garment-viewer-advanced');

await desktop.keyboard.press('Escape'); await desktop.keyboard.press('Escape');
await clickWorld(desktop, 'tech-packs'); await shot(desktop, '10-desktop-tech-packs');
await desktop.mouse.wheel(0, 760); await desktop.waitForTimeout(250); await shot(desktop, '10a-desktop-document-room');
await desktop.locator('[data-doc-select]').nth(2).click(); await desktop.waitForTimeout(350); await shot(desktop, '10b-desktop-document-selected');
await desktop.locator('[data-open-pdf]:visible').click(); await desktop.waitForTimeout(850); await shot(desktop, '11-desktop-pdf-open');
await desktop.keyboard.press('Escape'); await desktop.keyboard.press('Escape');

await clickWorld(desktop, '3d-simulation');
await shot(desktop, '12-desktop-pattern-state-a');
await desktop.mouse.wheel(0, 650); await desktop.waitForTimeout(250); await shot(desktop, '13-desktop-pattern-state-b');
await desktop.mouse.wheel(0, 850); await desktop.waitForTimeout(250); await shot(desktop, '14-desktop-pattern-state-c');
await desktop.keyboard.press('Escape');
await desktop.keyboard.press('End'); await desktop.waitForTimeout(500); await shot(desktop, '15-desktop-ending');

const tablet = await browser.newPage({ viewport: { width: 834, height: 1112 }, hasTouch: true });
await tablet.goto(base, { waitUntil: 'networkidle' }); await clean(tablet);
await shot(tablet, '16-tablet-opening');
await moveOpening(tablet, .98); await shot(tablet, '17-tablet-worlds');
await clickWorld(tablet, 'womenswear'); await tablet.mouse.wheel(0, 720); await tablet.waitForTimeout(250); await shot(tablet, '18-tablet-category-discovery');

const transition = await browser.newPage({ viewport: { width: 1024, height: 768 } });
await transition.goto(base, { waitUntil: 'networkidle' }); await clean(transition);
await shot(transition, '18a-1024-opening');
await moveOpening(transition, .98); await shot(transition, '18b-1024-worlds');

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await mobile.goto(base, { waitUntil: 'networkidle' }); await clean(mobile);
await shot(mobile, '19-mobile-opening');
await moveOpening(mobile, .48); await shot(mobile, '20-mobile-transformation');
await moveOpening(mobile, .98); await shot(mobile, '21-mobile-worlds');
await clickWorld(mobile, 'womenswear'); await mobile.mouse.wheel(0, 620); await mobile.waitForTimeout(250); await shot(mobile, '22-mobile-category-discovery');
await mobile.locator('.pf-cat[data-category="rtw"]').click(); await mobile.waitForTimeout(350); await shot(mobile, '23-mobile-viewer');
await mobile.keyboard.press('Escape'); await mobile.keyboard.press('Escape');
await clickWorld(mobile, 'tech-packs'); await shot(mobile, '23a-mobile-tech-packs');
await mobile.mouse.wheel(0, 620); await mobile.waitForTimeout(250); await shot(mobile, '23b-mobile-document-room');
await mobile.keyboard.press('Escape');
await clickWorld(mobile, '3d-simulation'); await mobile.mouse.wheel(0, 700); await mobile.waitForTimeout(250); await shot(mobile, '24-mobile-pattern');

const narrow = await browser.newPage({ viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true });
await narrow.goto(base, { waitUntil: 'networkidle' }); await clean(narrow);
await shot(narrow, '25-narrow-opening');
await moveOpening(narrow, .98); await shot(narrow, '26-narrow-worlds');

await browser.close();
console.log(`screenshots: ${out}`);
