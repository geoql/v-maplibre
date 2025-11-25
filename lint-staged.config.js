export default {
  '*.{js,jsx,ts,tsx,vue}': ['oxlint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
