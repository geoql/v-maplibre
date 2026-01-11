// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';
import oxlint from 'eslint-plugin-oxlint';

export default createConfigForNuxt({
  features: {
    stylistic: {
      semi: true,
    },
    tooling: true,
    typescript: true,
  },
})
  .override('nuxt/stylistic', {
    rules: {
      '@stylistic/arrow-parens': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/operator-linebreak': 'off',
    },
  })
  .append(...oxlint.configs['flat/recommended']);
