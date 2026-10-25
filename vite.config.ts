import { defineConfig } from 'vite-plus';

export default defineConfig({
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
    ignorePatterns: [
      '.nuxt',
      '.output',
      'dist',
      'node_modules',
      '.wrangler',
      'coverage',
      '*.min.js',
      '*.min.css',
      'pnpm-lock.yaml',
      'apps/docs',
      '**/CHANGELOG.md',
      '**/jsr.json',
      '**/package.json',
      // MDC syntax (::component, ---frontmatter---) parses incorrectly under
      // oxfmt's markdown rules — keep @nuxt/content collections hand-formatted.
      'apps/mapcn-vue/content/**/*.md',
      // Browser-served map data assets (Köppen zones, boundaries) are kept
      // minified for payload size — pretty-printing bloats them 60–80%.
      'apps/mapcn-vue/public/data/**',
    ],
  },
  lint: {
    plugins: ['typescript', 'vue', 'import'],
    ignorePatterns: [
      '.nuxt',
      '.output',
      'dist',
      'node_modules',
      '.wrangler',
      'coverage',
      '*.min.js',
      '*.min.css',
    ],
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
});
