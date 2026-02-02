export default {
  'apps/mapcn-vue/**/*.{js,jsx,ts,tsx,vue}': [
    'bun run --cwd apps/mapcn-vue format',
    'bun run --cwd apps/mapcn-vue lint:fix',
  ],
  '*.{js,jsx,ts,tsx,vue}': ['oxlint --fix', 'oxfmt --write'],
};
