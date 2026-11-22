import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import autoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [
    vue(),
    // Components rely on Nuxt's auto-imported Vue APIs (ref, computed, ...);
    // the tests run outside Nuxt, so provide the same imports here.
    autoImport({ imports: ['vue'], dts: false }),
  ],
  resolve: {
    alias: { '#shell': fileURLToPath(new URL('./app', import.meta.url)) },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
  },
});
