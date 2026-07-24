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
      // deployConfig writes the merged binding spec to
      // .output/server/wrangler.json at build time — the SINGLE source of
      // truth for the Worker config; there is no hand-maintained
      // wrangler.json. Deploy: wrangler deploy --config .output/server/wrangler.json
      deployConfig: true,
      wrangler: {
        name: 'v-maplibre-docs',
        compatibility_date: '2026-06-16',
        compatibility_flags: ['nodejs_compat'],
        workers_dev: false,
        routes: [
          {
            pattern: 'v-maplibre.geoql.in',
            custom_domain: true,
          },
        ],
        d1_databases: [
          {
            binding: 'DB',
            database_name: 'v-maplibre-docs-db',
            database_id: 'f10b0499-b7cc-46f4-81f4-7e8fe1194ba1',
          },
        ],
        observability: {
          enabled: true,
          traces: {
            enabled: true,
          },
        },
      },
    },
  },

  llms: {
    domain: 'v-maplibre.geoql.in',
  },
});
