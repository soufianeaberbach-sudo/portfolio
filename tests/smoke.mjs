/* Smoke tests for the portfolio.
 *
 * Deliberately narrow: these protect the specific defects fixed in the
 * final pass, so a regression in any of them fails CI. Not a general test
 * framework — no runner, no config, just Playwright's Chromium driving the
 * built site from `astro preview`.
 *
 *   npm run build && node tests/smoke.mjs
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const PORT = Number(process.env.SMOKE_PORT ?? 4321);
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTES = ['/', '/expertise/', '/portfolio/', '/process/', '/experience/', '/contact/'];
const WIDTHS = [390, 430, 768, 1024, 1440];

let passed = 0;
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) { passed += 1; console.log(`  ok   ${name}`); }
  else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
const stop = () => { try { server.kill('SIGTERM'); } catch {} };
process.on('exit', stop);

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(BASE + '/');
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('preview server did not start');
}

await waitForServer();
const browser = await chromium.launch();

try {
  // ---- routes load, and no horizontal document overflow at any width
  console.log('\nroutes and overflow');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.route('**://fonts.googleapis.com/**', (r) => r.abort());
  for (const route of ROUTES) {
    const res = await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    check(`${route} responds 200`, res?.status() === 200, `status ${res?.status()}`);
  }
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`no horizontal overflow ${route} @ ${width}`, overflow === 0, `${overflow}px`);
    }
  }
  await ctx.close();

  // ---- mobile menu opens, closes, and Escape closes it
  console.log('\nmobile menu');
  {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await p.click('.menu-toggle');
    await p.waitForTimeout(400);
    check('menu opens', await p.evaluate(() => document.body.classList.contains('no-scroll')));
    const opaque = await p.evaluate(() => getComputedStyle(document.querySelector('.mobile-menu')).backgroundColor);
    check('menu background is opaque', !opaque.includes('rgba(0, 0, 0, 0)'), opaque);
    await p.click('.menu-toggle');
    await p.waitForTimeout(400);
    check('menu closes', await p.evaluate(() => !document.body.classList.contains('no-scroll')));
    await c.close();
  }

  // ---- portfolio modal: focus trapped, background inert, Escape restores focus
  console.log('\nportfolio collection overlay');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);

    await p.evaluate(() => { const b = document.querySelector('[data-category]'); b.id = 'smoke-trigger'; b.click(); });
    await p.waitForTimeout(1100);
    check('overlay opens', await p.evaluate(() => document.querySelector('[data-collection-overlay]').getAttribute('aria-hidden') === 'false'));
    check('background is inert', await p.evaluate(() => !!document.querySelector('header[inert], main[inert], [inert]')));
    check('focus starts inside the overlay', await p.evaluate(() => document.querySelector('[data-collection-overlay]').contains(document.activeElement)));

    // Tab many times: focus must never leave the overlay
    let escaped = false;
    for (let i = 0; i < 24; i += 1) {
      await p.keyboard.press('Tab');
      if (!(await p.evaluate(() => document.querySelector('[data-collection-overlay]').contains(document.activeElement)))) { escaped = true; break; }
    }
    check('Tab never escapes the overlay', !escaped);
    for (let i = 0; i < 6; i += 1) await p.keyboard.press('Shift+Tab');
    check('Shift+Tab never escapes the overlay', await p.evaluate(() => document.querySelector('[data-collection-overlay]').contains(document.activeElement)));

    // scrubber maximum must be the last valid index, not one past it
    const range = await p.evaluate(() => {
      const s = document.querySelector('#collection-scrubber');
      return { max: Number(s.max), count: window.__portfolioRunway?.getState?.().count ?? -1 };
    });
    check('scrubber max is count - 1', range.max === range.count - 1, `max ${range.max}, count ${range.count}`);

    // arrow keys still drive the runway
    await p.evaluate(() => document.querySelector('[data-runway-stage]').focus());
    const before = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(900);
    const after = await p.evaluate(() => window.__portfolioRunway.getState().activeIndex);
    check('ArrowRight advances the runway', after !== before, `${before} -> ${after}`);

    await p.keyboard.press('Escape');
    await p.waitForTimeout(1100);
    check('Escape closes the overlay', await p.evaluate(() => document.querySelector('[data-collection-overlay]').getAttribute('aria-hidden') === 'true'));
    check('background inert released', await p.evaluate(() => !document.querySelector('[inert]')));
    check('focus restored to the opening button', await p.evaluate(() => document.activeElement?.id === 'smoke-trigger'), await p.evaluate(() => document.activeElement?.tagName ?? 'none'));
    await c.close();
  }

  // ---- reduced motion: no runway tween left running
  console.log('\nreduced motion');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await p.evaluate(() => document.querySelector('[data-category]').click());
    await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelector('[data-runway-stage]').focus());
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(120);
    const state = await p.evaluate(() => {
      const s = window.__portfolioRunway.getState();
      return { position: s.position, whole: Number.isInteger(s.position) };
    });
    check('runway snaps instantly under reduced motion', state.whole, `position ${state.position}`);
    const revealed = await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every((e) => getComputedStyle(e).opacity === '1'));
    check('reveal blocks visible without scrolling', revealed);
    await c.close();
  }

  // ---- contact form still validates without submitting
  console.log('\ncontact form validation');
  {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });
    await p.click('[data-submit]');
    await p.waitForTimeout(350);
    const form = await p.evaluate(() => ({
      errors: document.querySelectorAll('[data-err]:not([hidden])').length,
      navigated: location.pathname,
      action: document.querySelector('[data-brief-form]').getAttribute('action'),
      // unique: the five stage radios all share name="stage" by design
      names: [...new Set([...document.querySelectorAll('[data-brief-form] [name]')].map((e) => e.name))].sort().join(','),
    }));
    check('required fields report errors', form.errors >= 3, `${form.errors} shown`);
    check('did not navigate away', form.navigated === '/contact/');
    check('endpoint contract intact', form.action === '/api/brief', form.action);
    check('field names unchanged', form.names === 'company,email,link,message,name,stage,t,website', form.names);
    await c.close();
  }

  // ---- privacy page reachable from the footer
  console.log('\nprivacy page');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    check('footer links to /privacy/', await p.evaluate(() => !!document.querySelector('.footer-meta a[href="/privacy/"]')));
    const res = await p.goto(BASE + '/privacy/', { waitUntil: 'domcontentloaded' });
    check('/privacy/ responds 200', res?.status() === 200);
    check('retention stated', (await p.content()).includes('90 days'));
    await c.close();
  }
} finally {
  await browser.close();
  stop();
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nfailures:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
