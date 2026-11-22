import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

// Unit tests import app code that uses the site-shell layer's `#shell`
// alias, which Nuxt provides at build time but plain Vitest does not.
export default defineConfig({
  resolve: {
    alias: {
      '#shell': fileURLToPath(
        new URL('../../packages/site-shell/app', import.meta.url),
      ),
    },
  },
});
