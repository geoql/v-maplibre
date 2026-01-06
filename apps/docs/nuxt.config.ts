// apps/docs/nuxt.config.ts
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

  // Workaround for bun + docus rollup-plugin-inject issue
  // https://github.com/nuxt-content/docus/issues/1204
  nitro: {
    rollupConfig: {
      // @ts-expect-error - rollup plugin options
      plugins: {
        inject: false,
      },
    },
  },
});
