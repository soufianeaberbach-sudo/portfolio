/* Full-page QA screenshots of the Portfolio at the five review widths.
 *
 *   node .devtools/qa-shots.mjs [outDir]
 *
 * Requires a built site; starts `astro preview` itself and shuts it down.
 *
 * The four chapters are fixed, independently scrolling layers, so a browser
 * full-page capture records the landing behind them instead. Each chapter is
 * therefore captured as a series of viewport frames stepped through the
 * layer's own scrollTop and stitched back into one tall image — which is what
 * a full-page screenshot of a fixed overlay actually means.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sharp = require('sharp');

const PORT = Number(process.env.QA_PORT ?? 4399);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = process.argv[2] ?? '/tmp/pf-qa';
const WIDTHS = [1440, 1024, 768, 430, 390];
const HEIGHT = 900;

const server = spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', String(PORT)], {
  stdio: 'ignore', detached: true,
});
const stop = () => { try { process.kill(-server.pid); } catch { /* gone */ } };
process.on('exit', stop);

const wait = async () => {
  for (let i = 0; i < 60; i += 1) {
    try { const r = await fetch(BASE + '/portfolio/'); if (r.ok) return; } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('preview server did not start');
};
await wait();

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

/* Scroll the whole document once so every [data-reveal] block has entered the
   viewport; otherwise a capture records covers mid-fade. */
const settle = async (p) => {
  await p.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await p.waitForTimeout(600);
};

/* Step a chapter layer through its own scroll and stitch the frames. */
const captureWorld = async (p, id, file) => {
  const total = await p.evaluate((world) => {
    const el = document.querySelector(`[data-world="${world}"]`);
    el.scrollTop = 0;
    return el.scrollHeight;
  }, id);
  const frames = [];
  const step = HEIGHT;
  const shots = Math.max(1, Math.ceil(total / step));
  for (let i = 0; i < shots; i += 1) {
    const top = Math.min(i * step, Math.max(0, total - HEIGHT));
    await p.evaluate(([world, y]) => {
      document.querySelector(`[data-world="${world}"]`).scrollTop = y;
    }, [id, top]);
    await p.waitForTimeout(320);
    frames.push({ buffer: await p.screenshot(), top });
  }
  const width = p.viewportSize().width;
  const height = Math.max(HEIGHT, Math.min(total, frames[frames.length - 1].top + HEIGHT));
  const composite = frames.map((f) => ({ input: f.buffer, top: f.top, left: 0 }));
  await sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite(composite).png().toFile(file);
  await p.evaluate((world) => { document.querySelector(`[data-world="${world}"]`).scrollTop = 0; }, id);
};

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: HEIGHT }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.route('**://fonts.googleapis.com/**', (r) => r.abort());
  await p.goto(BASE + '/portfolio/', { waitUntil: 'load' });
  await p.waitForTimeout(500);
  await settle(p);
  await p.screenshot({ path: path.join(OUT, `${width}-01-index.png`), fullPage: true });

  const nav = async (hash) => {
    await p.evaluate((h) => {
      window.scrollTo(0, 0);
      const link = document.querySelector(`a[href="${h}"][data-nav]`)
        ?? document.querySelector(`[data-chapter="${h.slice(1)}"]`);
      link.click();
    }, hash);
    await p.waitForTimeout(900);
  };

  await nav('#womenswear');
  await captureWorld(p, 'womenswear', path.join(OUT, `${width}-02-women-categories.png`));

  await nav('#womenswear/rtw');
  await captureWorld(p, 'womenswear', path.join(OUT, `${width}-03-women-viewer.png`));
  await p.evaluate(() => {
    const world = document.querySelector('[data-world="womenswear"]');
    world.scrollTop = world.querySelector('.pf-studio').offsetTop - 70;
  });
  await p.waitForTimeout(450);
  await p.screenshot({ path: path.join(OUT, `${width}-04-women-development.png`) });

  await p.keyboard.press('Escape');
  await p.waitForTimeout(650);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(650);

  await nav('#menswear');
  await captureWorld(p, 'menswear', path.join(OUT, `${width}-05-men-categories.png`));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(650);

  await nav('#tech-packs');
  await captureWorld(p, 'tech-packs', path.join(OUT, `${width}-06-techpacks.png`));
  /* The reader, with a real document in it. */
  await p.evaluate(() => document.querySelector('[data-world="tech-packs"] [data-open-pdf]').click());
  await p.waitForTimeout(1600);
  await p.screenshot({ path: path.join(OUT, `${width}-07-pdf-reader.png`) });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(650);

  await nav('#3d-simulation');
  await captureWorld(p, '3d-simulation', path.join(OUT, `${width}-08-simulation.png`));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(650);

  await ctx.close();
  console.log(`${width} captured`);
}

await browser.close();
stop();
console.log(`\nscreenshots in ${OUT}`);
process.exit(0);
