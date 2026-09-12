import { defineConfig } from 'astro/config';

export default defineConfig({
  /* The canonical website origin. Apex only — www.aberbach.co is a permanent
     redirect to this host and must never be independently indexable. This one
     value drives the canonical link, og:url, the sitemap and robots.txt, so it
     is the only place the website domain is written. */
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
