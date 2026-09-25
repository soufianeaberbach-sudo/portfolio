import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.PORTFOLIO_QA_URL ?? 'http://127.0.0.1:4365/portfolio/';
const output = process.env.PORTFOLIO_QA_OUT ?? '.qa-opening/final';
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
let checks = 0;
const check = (value, message) => { assert(value, message); checks += 1; };

const prepare = async (viewport, options = {}) => {
  const page = await browser.newPage({ viewport, ...options });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      errors.push(message.text());
    }
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(new URL(base).origin)) {
      errors.push(`${request.failure()?.errorText ?? 'request failed'} ${request.url()}`);
    }
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  return { page, errors };
};

const progress = async (page, value) => {
  await page.evaluate((target) => {
    const track = document.querySelector('[data-lay-track]');
    const field = document.querySelector('[data-lay-field]');
    const travel = Math.max(1, track.offsetHeight - field.getBoundingClientRect().height);
    window.scrollTo({ top: track.offsetTop + target * travel * .8, behavior: 'instant' });
  }, value);
  await page.waitForTimeout(180);
};

const capture = async (page, name) => {
  const fit = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  check(fit.document <= fit.viewport + 1, `${name}: horizontal overflow ${fit.document - fit.viewport}px`);
  await page.screenshot({ path: `${output}/${name}.png`, scale: 'css' });
};

try {
  const desktop = await prepare({ width: 1440, height: 900 });
  await capture(desktop.page, '01-desktop-opening');
  await progress(desktop.page, .18); await capture(desktop.page, '02-desktop-early');
  await progress(desktop.page, .52); await capture(desktop.page, '03-desktop-middle');
  await progress(desktop.page, 1); await capture(desktop.page, '04-desktop-worlds');
  const focusWorld = desktop.page.locator('[data-chapter="3d-simulation"]');
  await focusWorld.focus();
  check(await focusWorld.evaluate((element) => document.activeElement === element), 'world is keyboard focusable');
  await capture(desktop.page, '05-desktop-world-focus');
  check(desktop.errors.length === 0, `desktop console errors: ${desktop.errors.join(' | ')}`);
  await desktop.page.close();

  const tablet = await prepare({ width: 834, height: 1112 }, { hasTouch: true });
  await capture(tablet.page, '06-tablet-opening');
  await progress(tablet.page, 1); await capture(tablet.page, '07-tablet-worlds');
  check(tablet.errors.length === 0, `tablet console errors: ${tablet.errors.join(' | ')}`);
  await tablet.page.close();

  const mobile = await prepare({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await capture(mobile.page, '08-mobile-opening');
  await progress(mobile.page, .52); await capture(mobile.page, '09-mobile-middle');
  await progress(mobile.page, 1); await capture(mobile.page, '10-mobile-worlds');
  check(mobile.errors.length === 0, `mobile console errors: ${mobile.errors.join(' | ')}`);
  await mobile.page.close();

  const reduced = await prepare({ width: 1024, height: 768 }, { reducedMotion: 'reduce' });
  const reducedState = await reduced.page.evaluate(() => ({
    t: Number(getComputedStyle(document.querySelector('[data-lay]')).getPropertyValue('--t')),
    visible: [...document.querySelectorAll('[data-chapter]')]
      .every((element) => Number(getComputedStyle(element).opacity) > .99),
  }));
  check(reducedState.t >= .99 && reducedState.visible, 'reduced-motion renders the complete destination field');
  check(reduced.errors.length === 0, `reduced-motion console errors: ${reduced.errors.join(' | ')}`);
  await reduced.page.close();

  console.log(`${checks} opening checks passed; screenshots: ${output}`);
} finally {
  await browser.close();
}
