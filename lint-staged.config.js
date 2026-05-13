export default {
  'apps/mapcn-vue/**/*.{js,jsx,ts,tsx,vue}': [
    'pnpm --filter @geoql/mapcn-vue-app run format',
    'pnpm --filter @geoql/mapcn-vue-app run lint:fix',
  ],
  '*.{js,jsx,ts,tsx,vue}': ['oxlint --fix', 'oxfmt --write'],
  '*.{json,md,yml,yaml,css,html}': [
    'oxfmt --write --no-error-on-unmatched-pattern',
  ],
};
