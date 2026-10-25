import { fileURLToPath } from 'node:url';
import { defineConfig, lazyPlugins } from 'vite-plus';
import vue from '@vitejs/plugin-vue';

// `vp` resolves the nearest vite.config.ts, so this package repeats the
// root lint and fmt settings next to its test setup.
export default defineConfig({
  plugins: lazyPlugins(() => [vue()]),

  test: {
    environment: 'happy-dom',
    alias: {
      '@geoql/v-maplibre': fileURLToPath(
        new URL('./tests/v-maplibre-stub.ts', import.meta.url),
      ),
    },
    include: ['tests/**/*.test.ts'],
  },

  lint: {
    plugins: ['typescript', 'vue', 'import'],
    ignorePatterns: ['dist', 'node_modules', 'coverage'],
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
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
    vueIndentScriptAndStyle: true,
    // The registry build writes public/r/*.json; package.json is hand-kept.
    ignorePatterns: ['dist', 'node_modules', 'coverage', '**/package.json'],
  },
});
