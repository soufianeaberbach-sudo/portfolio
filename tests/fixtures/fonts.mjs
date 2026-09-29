/* THE REAL FACES, IN A TEST RUN.
   aberbach.co asks Google Fonts for Archivo — as a VARIABLE font with a width
   axis of 75..125 — plus Inter and JetBrains Mono. A test machine without a
   route to fonts.googleapis.com renders every page in a fallback grotesque
   instead, which is not a cosmetic difference: the Portfolio's masthead and
   its four chapter titles are FITTED to their measures, and a fit measured
   against the wrong metrics is not a fit. Screenshots taken that way look
   plausible and are wrong.

   So the latin subsets the site actually uses are committed beside these
   tests and served to the browser from disk. Nothing about the site changes;
   this only makes what the tests look at the same thing a visitor sees.

   Subsets other than latin are never requested for this page's text, so they
   are not shipped; a request for one simply falls through to the network. */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const DIR = new URL('./fonts/', import.meta.url);

export async function installFonts(context) {
  const css = await readFile(new URL('fonts.css', DIR), 'utf8');
  await context.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await context.route('https://fonts.gstatic.com/**', async (route) => {
    try {
      const file = basename(new URL(route.request().url()).pathname);
      await route.fulfill({ status: 200, contentType: 'font/woff2', body: await readFile(new URL(file, DIR)) });
    } catch {
      await route.continue();
    }
  });
}

/* Every face the page asked for has arrived and been applied. */
export const fontsReady = (page) => page.evaluate(() => document.fonts.ready.then(() => undefined));
