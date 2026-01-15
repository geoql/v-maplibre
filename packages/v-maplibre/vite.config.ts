import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Enable Rolldown (experimental)
    rollupOptions: {
      external: [
        'vue',
        'maplibre-gl',
        'pmtiles',
        // deck.gl packages (optional peer deps)
        '@deck.gl/core',
        '@deck.gl/layers',
        '@deck.gl/mapbox',
        '@deck.gl/aggregation-layers',
        '@deck.gl/geo-layers',
        '@deck.gl/mesh-layers',
        // luma.gl packages (deck.gl dependencies)
        '@luma.gl/core',
        '@luma.gl/engine',
        '@luma.gl/shadertools',
        // Raster packages (optional peer deps)
        '@developmentseed/deck.gl-geotiff',
        'geotiff-geokeys-to-proj4',
        // LiDAR package (optional peer dep)
        'maplibre-gl-lidar',
      ],
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
