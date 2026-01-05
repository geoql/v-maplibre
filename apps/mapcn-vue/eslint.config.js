// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
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
  .override('nuxt/vue/rules', {
    rules: {
      'vue/max-attributes-per-line': ['error', { singleline: 5, multiline: 1 }],
      'vue/html-indent': ['error', 2],
      'vue/html-self-closing': [
        'error',
        {
          html: { normal: 'never', void: 'always', component: 'always' },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  })
  .override('nuxt/vue/rules', {
    files: ['app/pages/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  })
  .append({
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    rules: {
      ...betterTailwindcss.configs['recommended-warn'].rules,
      'better-tailwindcss/no-unknown-classes': [
        'warn',
        {
          ignore: [
            // Color mode class (used by @nuxtjs/color-mode)
            '^dark$',
          ],
        },
      ],
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/tailwind.css',
        // Auto-detect custom component classes from CSS (e.g., @layer components)
        detectComponentClasses: true,
      },
    },
  })
  .append(...oxlint.configs['flat/recommended']);
