/* Contact-only regression QA, shared by CI smoke and optional browser/evidence
 * runs. All API requests are blocked: layout QA must never submit a real brief.
 * A reduced viewport tests focus/reflow; it does not emulate an iOS keyboard.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { devices } from 'playwright';

export async function contactResponsive({ browser, base, check, installFonts, evidenceDir }) {
  if (evidenceDir) mkdirSync(evidenceDir, { recursive: true });
  const results = [];
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    const mobile = width <= 430;
    const tablet = width === 768;
    const context = await browser.newContext({
      ...(mobile ? devices['iPhone 13'] : tablet ? devices['iPad Mini'] : {}),
      viewport: { width, height: ({ 320: 568, 375: 812, 390: 844, 430: 932, 768: 1024, 1024: 768, 1440: 900 })[width] },
    });
    try {
      await installFonts(context);
      await context.route('**/api/**', (route) => route.abort());
      // This is positioning QA, independent of external widget availability.
      await context.route('**://challenges.cloudflare.com/**', (route) => route.abort());
      const page = await context.newPage();
      await page.goto(base + '/contact/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.documentElement.style.scrollBehavior = 'auto';
      });
      await page.locator('.ct-brief__intro').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      const geometry = () => page.evaluate(() => {
        const intro = document.querySelector('.ct-brief__intro');
        const form = document.querySelector('.ct-brief__form');
        const rect = (node) => {
          const r = node.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
        };
        const a = rect(intro), b = rect(form);
        const intersects = (r, s) => Math.min(r.right, s.right) - Math.max(r.left, s.left) > 1 &&
          Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top) > 1;
        const parts = [intro, intro.querySelector('h2'), ...intro.querySelectorAll('li')].filter(Boolean);
        return {
          scrollY, intro: a, form: b,
          position: getComputedStyle(intro).position,
          gap: b.top - a.bottom,
          intersections: parts.filter((node) => intersects(rect(node), b)).length,
          steps: intro.querySelectorAll('li').length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          titleFits: [...intro.querySelector('h2').getClientRects()].every((r) => r.left >= 0 && r.right <= innerWidth),
          uploadWidth: document.querySelector('#bf-file').getBoundingClientRect().width,
        };
      });
      const start = await geometry();
      // Sample the approach, column transition, first controls and upload area.
      const targets = [start.intro.top + start.scrollY - 110, start.intro.bottom + start.scrollY - 250,
        start.form.top + start.scrollY - 110, start.form.top + start.scrollY + 300,
        await page.locator('.bf__attach').evaluate((el) => el.getBoundingClientRect().top + scrollY - 110)];
      const samples = [];
      for (const [index, y] of targets.entries()) {
        await page.evaluate((top) => scrollTo(0, Math.max(0, top)), y);
        // Observe after actual browser layout/scroll events, not in the same JS task.
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.waitForTimeout(1000);
        const sample = await geometry();
        samples.push(sample);
        if (evidenceDir && [0, 2, 4].includes(index)) {
          await page.screenshot({ path: join(evidenceDir, `contact-${width}-${['before-scroll', '', 'after-scroll', '', 'upload'][index]}.png`), scale: 'css' });
        }
      }
      const label = `Contact ${width}px`;
      check(`${label} preserves ${width <= 900 ? 'normal flow' : 'desktop sticky columns'}`,
        samples.every((s) => s.position === (width <= 900 ? 'static' : 'sticky')));
      check(`${label} intro, heading and three steps never intersect form`,
        samples.every((s) => s.steps === 3 && s.intersections === 0), JSON.stringify(samples));
      check(`${label} has no overflow or clipped heading`, samples.every((s) => s.overflow === 0 && s.titleFits), JSON.stringify(samples));
      check(`${label} upload input remains a focusable one-pixel control`, samples.every((s) => s.uploadWidth === 1));
      if (width <= 900) {
        check(`${label} keeps readable separation throughout scrolling`, samples.every((s) => s.gap >= 24));
        check(`${label} intro moves with document scrolling`, samples.every((s) =>
          Math.abs((s.intro.top - start.intro.top) + (s.scrollY - start.scrollY)) < 2), JSON.stringify({ start, samples }));
      }
      // Reflow/focus coverage for the reduced visible area when a keyboard opens.
      // Native Safari keyboard behavior still requires a physical-device check.
      if (mobile || tablet) {
        await page.setViewportSize({ width, height: 360 });
        for (const selector of ['#bf-name', '#bf-email', '#bf-message', '#bf-link']) {
          await page.locator(selector).tap();
          await page.waitForTimeout(150);
          const focus = await page.locator(selector).evaluate((el) => {
            const r = el.getBoundingClientRect();
            const header = document.querySelector('.site-header, header');
            const top = header?.getBoundingClientRect().bottom ?? 0;
            return { active: document.activeElement === el, visible: r.top >= Math.max(0, top) && r.bottom <= innerHeight,
              size: parseFloat(getComputedStyle(el).fontSize) };
          });
          check(`${label} ${selector} is focusable and visible in reduced viewport`, focus.active && focus.visible && focus.size >= 16, JSON.stringify(focus));
        }
        // The actual validation path moves focus programmatically. Safari's
        // default focus scroll used to put the first error behind the header.
        await page.locator('[data-submit]').tap();
        await page.waitForTimeout(250);
        const errorFocus = await page.locator('#bf-name').evaluate((el) => {
          const r = el.getBoundingClientRect();
          const header = document.querySelector('header').getBoundingClientRect();
          return { active: document.activeElement === el, top: r.top, bottom: r.bottom,
            headerBottom: header.bottom, height: innerHeight, invalid: el.getAttribute('aria-invalid') };
        });
        check(`${label} validation error clears the fixed header`, errorFocus.active && errorFocus.invalid === 'true' &&
          errorFocus.top >= Math.max(0, errorFocus.headerBottom) && errorFocus.bottom <= errorFocus.height, JSON.stringify(errorFocus));
        if (evidenceDir) await page.screenshot({ path: join(evidenceDir, `contact-${width}-validation.png`), scale: 'css' });
      }
      results.push({ width, engine: browser.browserType().name(), samples });
    } finally {
      await context.close();
    }
  }
  if (evidenceDir) writeFileSync(join(evidenceDir, 'contact-geometry.json'), JSON.stringify(results, null, 2) + '\n');
  return results;
}
