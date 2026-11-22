// Configuration for `@geoql/vue-doctor` (https://docs.the-doctor.report).
//
// `exclude` REPLACES the built-in ignore list, so the defaults are re-listed.
// Authored as a plain default export: the doctor CLI loads it via c12 and is
// not a local dependency.
export default {
  exclude: [
    'node_modules',
    'dist',
    '.nuxt',
    '.output',
    'coverage',
    'doctor.config.ts',
    // Vendored shadcn-vue primitives, generated and owned by the shadcn-vue
    // CLI (`pnpm dlx shadcn-vue add ...`), not hand-written code. Excluded so
    // upgrades stay clean (mapcn-vue excluded them the same way before they
    // moved into this layer).
    'app/components/ui/**',
  ],
};
