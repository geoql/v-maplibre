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
    url: 'https://v-maplibre.geoql.in',
  },

  content: {
    database: {
      type: 'd1',
      bindingName: 'DB',
    },
  },

  compatibilityDate: '2025-07-18',

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
      wrangler: {
        workers_dev: false,
        routes: [
          {
            pattern: 'v-maplibre.geoql.in',
            custom_domain: true,
          },
        ],
        observability: {
          enabled: true,
        },
      },
    },
  },

  llms: {
    domain: 'v-maplibre.geoql.in',
  },
});
