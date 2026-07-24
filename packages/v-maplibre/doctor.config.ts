// Configuration for `@geoql/vue-doctor` (https://docs.the-doctor.report).
//
// NOTE: `exclude` REPLACES the built-in default ignore list rather than
// extending it, so the defaults (node_modules, dist, coverage) are re-listed
// here explicitly. Drop any of them and the audit will start walking build
// output.
//
// Authored as a plain default export (no `defineConfig` import) because this
// file is loaded by the doctor CLI via c12 — the package is not a local
// dependency of this library, so an import would not resolve in CI.
export default {
  exclude: [
    'node_modules',
    'dist',
    'coverage',
    // This config file itself: consumed by the doctor CLI via c12, never
    // imported by library code, so knip's dead-code pass flags it as unused.
    'doctor.config.ts',
    // Vitest files stub globals themselves and run outside any auto-import
    // context, so explicit imports there are required, not slop.
    'test/**',
  ],
  rules: {
    // Library components deliberately use manual MapLibre lifecycle management
    // (onMounted/onUnmounted + shallowRef) — the map instance is an imperative
    // external object, not Vue state. See packages/v-maplibre/AGENTS.md.
    'dead-code/unused-dependency': 'off',
  },
};
