import { defineConfig } from 'vite-plus';
import Vue from 'unplugin-vue/rolldown';
import vue from '@vitejs/plugin-vue';

const EXTERNAL_PREFIXES = [
  'vue',
  'maplibre-gl',
  'pmtiles',
  '@deck.gl/core',
  '@deck.gl/layers',
  '@deck.gl/mapbox',
  '@deck.gl/aggregation-layers',
  '@deck.gl/geo-layers',
  '@deck.gl/mesh-layers',
  '@luma.gl/core',
  '@luma.gl/engine',
  '@luma.gl/shadertools',
  '@developmentseed/deck.gl-geotiff',
  '@developmentseed/deck.gl-raster',
  '@developmentseed/deck.gl-zarr',
  '@developmentseed/geotiff',
  '@developmentseed/proj',
  '@geoarrow/deck.gl-geoarrow',
  '@geoql/maplibre-gl-starfield',
  '@math.gl/polygon',
  'apache-arrow',
  'maplibre-gl-lidar',
  'maplibre-gl-wind',
  'three',
  'zarrita',
];

// Externalize bare specifiers from the list above, including subpath imports
// (e.g. `@developmentseed/deck.gl-raster/gpu-modules` and
// `vue/dist/foo`). All deck.gl / luma.gl / map libs are peer-deps; consumers
// install their own copies, so bundling them here would create duplicate
// versions at runtime.
function isExternal(id: string): boolean {
  return (
    EXTERNAL_PREFIXES.includes(id) ||
    EXTERNAL_PREFIXES.some((prefix) => id.startsWith(`${prefix}/`))
  );
}

export default defineConfig({
  pack: {
    entry: ['src/index.ts'],
    format: ['esm'],
    platform: 'neutral',
    target: 'es2020',
    sourcemap: true,
    clean: true,
    minify: true,
    plugins: [Vue({ isProduction: true })],
    dts: {
      vue: true,
      tsconfig: './tsconfig.json',
    },
    deps: { neverBundle: isExternal },
    outDir: 'dist',
    outExtensions: () => ({ js: '.js' }),
    loader: { '.css': 'css' },
    hooks: {
      // tsdown emits `dist/style.css` by default. Rename to `v-maplibre.css`
      // so the long-standing `import '@geoql/v-maplibre/dist/v-maplibre.css'`
      // path (used by every consumer) keeps working without a breaking change.
      'build:done': async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const from = path.resolve('dist/style.css');
        const to = path.resolve('dist/v-maplibre.css');
        try {
          await fs.rename(from, to);
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
        }
      },
    },
  },

  plugins: [vue()],

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.nuxt', '.output', 'docs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'docs/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types.ts',
        'coverage/**',
        'test/',
        '**/__tests__/**',
      ],
      thresholds: {
        lines: 14,
        functions: 13,
        branches: 9,
        statements: 13,
      },
    },
  },

  lint: {
    plugins: ['typescript', 'vue', 'import'],
    ignorePatterns: ['dist', 'node_modules', 'coverage'],
  },

  fmt: {
    printWidth: 80,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf',
    ignorePatterns: ['dist', 'node_modules', 'coverage'],
  },
});
