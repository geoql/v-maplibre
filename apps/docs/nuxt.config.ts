export default defineNuxtConfig({
  extends: ['docus'],
  modules: [
    [
      '@nuxtjs/plausible',
      {
        domain: 'v-maplibre.geoql.in',
        apiHost: 'https://analytics.geoql.in',
        autoOutboundTracking: true,
      },
    ],
  ],
  site: {
    name: 'v-maplibre',
    description: 'Vue 3 components for MapLibre GL',
    url: 'https://v-maplibre.geoql.io',
  },
  compatibilityDate: '2025-07-18',
  nitro: {
    preset: 'cloudflare-pages',
  },
  content: {
    database: {
      type: 'd1',
      binding: 'DB',
    },
  },
});
