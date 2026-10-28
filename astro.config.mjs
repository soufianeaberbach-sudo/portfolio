import { defineConfig } from 'astro/config';
import { existsSync, renameSync, rmdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* Cloudflare's not_found_handling "404-page" serves the NEAREST 404.html to a
   missing path, so /fr/anything-missing gets /fr/404.html. Astro special-cases
   only the root src/pages/404.astro into a flat file; the localized 404s come
   out as /<locale>/404/index.html and are moved into place here. */
const localizedNotFound = {
  name: 'aberbach-localized-404',
  hooks: {
    'astro:build:done': ({ dir }) => {
      for (const locale of ['fr', 'es']) {
        const folder = fileURLToPath(new URL(`${locale}/404/`, dir));
        if (!existsSync(`${folder}index.html`)) continue;
        renameSync(`${folder}index.html`, fileURLToPath(new URL(`${locale}/404.html`, dir)));
        rmdirSync(folder);
      }
    },
  },
};

export default defineConfig({
  /* Declared canonical origin, used by page metadata, sitemap and robots.txt.
     The intended www/HTTP redirects require external Cloudflare activation;
     this value does not configure DNS or enforce HTTPS. See
     docs/PRODUCTION-STATE.md for dated observations. */
  site: 'https://aberbach.co',
  output: 'static',
  integrations: [localizedNotFound],
  vite: {
    css: {
      // Keep this project isolated from unrelated PostCSS files higher up the
      // local directory tree. The site does not use a PostCSS pipeline.
      postcss: { plugins: [] },
    },
  },
});
