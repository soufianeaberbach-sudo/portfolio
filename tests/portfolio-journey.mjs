import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const HOST = '127.0.0.1';
const PORT = 4349;
const BASE = `http://${HOST}:${PORT}`;
const astroCli = fileURLToPath(new URL('../node_modules/astro/astro.js', import.meta.url));
const server = spawn(process.execPath, [astroCli, 'preview', '--host', HOST, '--port', String(PORT)], {
  stdio: 'ignore',
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/portfolio/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Portfolio preview did not start');
};

const browser = await chromium.launch();
let checks = 0;
const check = (condition, message) => { assert(condition, message); checks += 1; };

try {
  await waitForServer();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/portfolio/`, { waitUntil: 'networkidle' });

  const scenes = page.locator('[data-journey-scene]');
  check(await scenes.count() === 5, 'all five journey scenes render');
  check(await scenes.evaluateAll((items) => items.every((item) => item.getAttribute('aria-hidden') === 'false')),
    'every visible reduced-motion scene is exposed to accessibility APIs');

  const menswear = page.locator('[data-journey-index="menswear"]');
  await menswear.tap();
  await page.waitForTimeout(120);
  check(await page.locator('[data-journey]').getAttribute('data-active-chapter') === 'menswear',
    'touch navigation updates the active chapter');
  check(await menswear.getAttribute('aria-current') === 'step', 'active reduced-motion link is announced');
  check(await scenes.evaluateAll((items) => items.every((item) => item.getAttribute('aria-hidden') === 'false')),
    'navigation never hides visible reduced-motion scenes from accessibility APIs');

  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await page.locator('[data-journey-index="tech-packs"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  check(await page.locator('[data-journey]').getAttribute('data-active-chapter') === 'tech-packs',
    'keyboard navigation updates the active chapter');
  check(await page.locator('[data-journey-index="tech-packs"]').getAttribute('aria-current') === 'step',
    'keyboard-selected chapter is announced');

  await context.close();
  console.log(`${checks} reduced-motion journey checks passed.`);
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
