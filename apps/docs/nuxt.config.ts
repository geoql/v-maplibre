export default defineNuxtConfig({
  extends: ['docus'],

  modules: [
    // GA4 through useScriptGoogleAnalytics (app/plugins/google-analytics.client.ts).
    // Plausible loads from app/plugins/plausible.client.ts, not a module: the
    // pa-*.js tracker needs the official init snippet, which neither
    // @nuxtjs/plausible nor the @nuxt/scripts Plausible helper runs.
    '@nuxt/scripts',
    // OpenPanel product analytics (self-hosted at events.geoql.in). Client-side
    // only, so no client secret.
    '@openpanel/nuxt',
  ],

  openpanel: {
    // Public client ID of the `v-maplibre` project (NUXT_PUBLIC_OPENPANEL_CLIENT_ID).
    clientId:
      process.env.NUXT_PUBLIC_OPENPANEL_CLIENT_ID ??
      '74326598-6f2c-455c-af48-1e053bbcc822',
    apiUrl: 'https://events.geoql.in/api',
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
    // A proxy handler hardcodes api.openpanel.dev and would bypass the
    // self-hosted apiUrl; direct client POST is correct here.
    proxy: false,
  },

  // Public analytics IDs for v-maplibre.geoql.in (they ship in the HTML, so
  // they are not secrets). Each is overridable with its NUXT_PUBLIC_* env.
  runtimeConfig: {
    public: {
      gtagId: 'G-1WRHSNZ1DR',
      plausibleScriptId: 'pa-AvvzJZ2ZG-CPBbjeo6GDb',
      plausibleApiHost: 'https://analytics.geoql.in',
    },
  },

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
