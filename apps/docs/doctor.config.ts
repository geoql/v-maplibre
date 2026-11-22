// Configuration for `@geoql/nuxt-doctor` (https://docs.the-doctor.report).
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
    '.data',
    '.wrangler',
    'coverage',
    'doctor.config.ts',
  ],
  rules: {
    // Nuxt's generated .nuxt/tsconfig.json sets `strict: true` (checked); the
    // rule reads the root tsconfig literally and misses the value inherited
    // via `extends`. Same false positive, same setting, as apps/mapcn-vue.
    'vue-doctor/build-quality/tsconfig-strict-required': 'off',
  },
};
