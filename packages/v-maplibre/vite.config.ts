import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defineConfig, lazyPlugins } from 'vite-plus';
import Vue from 'unplugin-vue/rolldown';
import vue from '@vitejs/plugin-vue';

// The worker bundled into `dist/maplibre-worker.js` is built from whichever
// `maplibre-gl` this package resolves. `VMap` compares that version with the
// one running on the main thread and only installs the bundled worker when
// they match (see `src/utils/maplibre-worker-url.ts`). The constant is
// injected at build time so the guard cannot drift from the bundle.
const MAPLIBRE_WORKER_VERSION: string = JSON.parse(
  readFileSync(
    createRequire(import.meta.url).resolve('maplibre-gl/package.json'),
    'utf8',
  ),
).version;

const define = {
  __MAPLIBRE_WORKER_VERSION__: JSON.stringify(MAPLIBRE_WORKER_VERSION),
};

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
  '@geoql/maplibre-gl-starfield',
  '@sparkjsdev/spark',
  '@dvt3d/maplibre-three-plugin',
  '3d-tiles-renderer',
  '3d-tiles-rendererjs-3dgs-plugin',
  'gaussian-splat-lite',
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
//
// Exception: MapLibre's worker is bundled (see `src/maplibre-worker.ts` and
// `deps.alwaysBundle` below). The exception has to live here too — rolldown
// checks the `external` option BEFORE plugin resolve hooks, so marking it
// external here would short-circuit `deps.alwaysBundle` entirely.
const MAPLIBRE_WORKER_ENTRY = 'maplibre-gl/dist/maplibre-gl-worker.mjs';

function isExternal(id: string): boolean {
  if (id === MAPLIBRE_WORKER_ENTRY) return false;
  return (
    EXTERNAL_PREFIXES.includes(id) ||
    EXTERNAL_PREFIXES.some((prefix) => id.startsWith(`${prefix}/`))
  );
}

export default defineConfig({
  // Applies to vitest; `pack.define` below covers the library build.
  define,
  pack: {
    entry: [
      'src/index.ts',
      'src/deckgl.ts',
      'src/geotiff.ts',
      'src/wind.ts',
      'src/starfield.ts',
      'src/lidar.ts',
      'src/splat.ts',
      'src/3d-tiles.ts',
      // Self-contained MapLibre worker asset (see src/maplibre-worker.ts).
      'src/maplibre-worker.ts',
    ],
    format: ['esm'],
    platform: 'neutral',
    target: 'es2020',
    define,
    sourcemap: true,
    clean: true,
    minify: true,
    plugins: [Vue({ isProduction: true })],
    dts: {
      vue: true,
      tsconfig: './tsconfig.json',
    },
    // `alwaysBundle` is load-bearing: `src/maplibre-worker.ts` re-exports
    // MapLibre's worker so it can be emitted as a self-contained asset
    // (dist/maplibre-worker.js) that the native `new URL(..., import.meta.url)`
    // reference in `src/utils/maplibre-worker.ts` can load at runtime.
    deps: {
      neverBundle: isExternal,
      alwaysBundle: [MAPLIBRE_WORKER_ENTRY],
    },
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
        // Fail the build when the emitted worker is not the version the
        // runtime guard expects. MapLibre stamps its own version into the
        // license header of every file it ships.
        const worker = await fs.readFile(
          path.resolve('dist/maplibre-worker.js'),
          'utf8',
        );
        const workerVersion = /blob\/v([^/\s]+)\/LICENSE/.exec(worker)?.[1];
        if (workerVersion !== MAPLIBRE_WORKER_VERSION) {
          throw new Error(
            `dist/maplibre-worker.js is maplibre-gl ${workerVersion ?? 'unknown'}, expected ${MAPLIBRE_WORKER_VERSION}`,
          );
        }
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

  plugins: lazyPlugins(() => [vue()]),

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
    // oxfmt 0.68 stopped indenting `<script>` / `<style>` content in SFCs by
    // default; keep the house style (and avoid a 12k-line reformat diff).
    vueIndentScriptAndStyle: true,
    // Release-please owns CHANGELOG/jsr and the root vite.config.ts excludes
    // these too — `vp fmt` run here resolves this nearest config, not the root.
    ignorePatterns: [
      'dist',
      'node_modules',
      'coverage',
      '**/CHANGELOG.md',
      '**/jsr.json',
      '**/package.json',
    ],
  },
});
