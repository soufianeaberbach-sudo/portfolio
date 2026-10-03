import { defineConfig } from 'astro/config';

export default defineConfig({
  /* Declared canonical origin, used by page metadata, sitemap and robots.txt.
     The intended www/HTTP redirects require external Cloudflare activation;
     this value does not configure DNS or enforce HTTPS. See
     docs/PRODUCTION-STATE.md for dated observations. */
  site: 'https://aberbach.co',
  output: 'static',
  vite: {
    css: {
      // Keep this project isolated from unrelated PostCSS files higher up the
      // local directory tree. The site does not use a PostCSS pipeline.
      postcss: { plugins: [] },
    },
  },
});
