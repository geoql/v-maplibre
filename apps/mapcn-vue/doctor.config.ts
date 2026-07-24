// Configuration for `@geoql/nuxt-doctor` (https://docs.the-doctor.report).
//
// NOTE: `exclude` REPLACES the built-in default ignore list rather than
// extending it, so the defaults (node_modules, dist, .nuxt, .output, coverage)
// are re-listed here explicitly. Drop any of them and the audit will start
// walking build output.
//
// Authored as a plain default export (no `defineConfig` import) because this
// file is loaded by the doctor CLI via c12 — the package is not a local
// dependency of this app, so an import would not resolve in CI.
export default {
  exclude: [
    'node_modules',
    'dist',
    '.nuxt',
    '.output',
    '.data',
    '.wrangler',
    'coverage',
    // This config file itself: consumed by the doctor CLI via c12, never
    // imported by app code, so knip's dead-code pass flags it as unused.
    'doctor.config.ts',
    // Vendored shadcn-vue primitives — generated/owned by the shadcn-vue CLI
    // (`pnpm dlx shadcn-vue add ...`), not hand-authored app code. Excluded so
    // upgrades stay clean and their upstream patterns (props destructure in a
    // `computed()`, explicit reka-ui imports) are not counted as our slop.
    'app/components/ui/**',
  ],
  rules: {
    // Nuxt's generated .nuxt/tsconfig.json already sets `strict: true`; the
    // rule reads the root tsconfig literally and misses the value inherited
    // via `extends`, so it is a false positive here.
    'vue-doctor/build-quality/tsconfig-strict-required': 'off',
    // knip can't see CLI-invoked binaries: vue-tsc backs `nuxt typecheck` and
    // wrangler backs the Cloudflare deploy — both real, neither imported.
    'dead-code/unused-dependency': 'off',
    // Every v-html in this app renders shiki-generated highlight markup from
    // our own build-time code snippets — never user input, so no XSS sink.
    'vue-doctor/security/no-v-html': 'off',
    // mapsguruApiKey is a domain-restricted public map-tile key (like a
    // Mapbox/MapTiler public token): it MUST reach the client to fetch styles.
    'nuxt-doctor/security/no-secret-in-public-runtime-config': 'off',
  },
};
