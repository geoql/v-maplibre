import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Enable Rolldown (experimental)
    rollupOptions: {
      external: ['vue', 'maplibre-gl', 'pmtiles'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'maplibre-gl': 'maplibregl',
          pmtiles: 'pmtiles',
        },
      },
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VMaplibre',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    cssCodeSplit: false,
    sourcemap: true,
    // Optimize dependencies
    minify: 'esbuild',
    target: 'es2020',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
