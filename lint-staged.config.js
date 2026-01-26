export default {
  '*.{js,jsx,ts,tsx,vue}': ['oxlint --fix', 'oxfmt --write'],
  '*.{json,md,yml,yaml,css,html}': ['oxfmt --write'],
};
