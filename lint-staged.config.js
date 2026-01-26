export default {
  'apps/mapcn-vue/**/*.{js,jsx,ts,tsx,vue}': [
    'oxlint --fix',
    'oxfmt --write',
    'bun run --cwd apps/mapcn-vue lint:fix',
  ],
  '*.{js,jsx,ts,tsx,vue}': ['oxlint --fix', 'oxfmt --write'],
  '*.{json,md,yml,yaml,css,html}': ['oxfmt --write'],
};
