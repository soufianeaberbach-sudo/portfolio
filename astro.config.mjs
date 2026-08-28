import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    css: {
      // Keep this project isolated from unrelated PostCSS files higher up the
      // local directory tree. The site does not use a PostCSS pipeline.
      postcss: { plugins: [] },
    },
  },
});
