export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  compatibilityDate: '2025-11-25',

  nitro: {
    preset: 'cloudflare-pages',
  },

  app: {
    head: {
      title: 'v-maplibre - Vue 3 MapLibre Components',
      meta: [
        {
          name: 'description',
          content:
            'Vue 3 components for MapLibre GL - reactive map components with full TypeScript support',
        },
      ],
    },
  },

  content: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
      preload: ['vue', 'typescript', 'javascript', 'json', 'bash'],
    },
  },
});
