import libraryPkg from '../../packages/v-maplibre/package.json' with { type: 'json' };

// Bump alongside packages/v-maplibre version. Source: GitHub release date for the matching tag.
const LIBRARY_RELEASED_AT = '2026-04-07T11:12:28Z';

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/content',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    'nuxt-og-image',
    '@nuxtjs/tailwindcss',
    [
      '@nuxtjs/plausible',
      {
        domain: 'mapcn-vue.geoql.in',
        apiHost: 'https://analytics.geoql.in',
        autoOutboundTracking: true,
      },
    ],
  ],
  devtools: { enabled: true },

  // Explicit font manifest — skips @nuxt/fonts CSS auto-scanning that was
  // taking 6.8s/file × 74 files = ~41s aggregated in the build. We use exactly
  // two families (Geist + Geist Mono), both from Google. Declaring them here
  // means the font module never has to scan main.css or any SFC <style> block.
  fonts: {
    families: [
      { name: 'Geist', provider: 'google', weights: [300, 400, 500, 700, 800] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500, 700] },
    ],
    defaults: {
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
    },
    experimental: {
      processCSSVariables: false,
    },
  },

  app: {
    head: {
      title: 'mapcn-vue - Beautiful maps for Vue',
      meta: [
        {
          name: 'description',
          content:
            'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
        },
        { name: 'theme-color', content: '#000000' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  css: [
    'maplibre-gl/dist/maplibre-gl.css',
    '@geoql/v-maplibre/dist/v-maplibre.css',
    'maplibre-gl-lidar/style.css',
    '~/assets/css/main.css',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-dark',
            dark: 'github-dark',
            light: 'github-light',
          },
          langs: ['vue', 'typescript', 'bash', 'json'],
        },
      },
    },
  },

  runtimeConfig: {
    googleFloodApiKey: '',
    public: {
      mapsguruApiKey: '',
      library: {
        version: libraryPkg.version,
        releasedAt: LIBRARY_RELEASED_AT,
      },
    },
  },

  ogImage: {
    // No `defaults.component` — nuxt-og-image v6 removed that field. The
    // module auto-selects the first non-community component in
    // app/components/OgImage/ (MapcnDoc.satori.vue) as the default.
    // Per-page overrides still use `defineOgImage({ component: '...' })`.
    //
    // Skip per-request cache storage during prerender (we generate all OG
    // images at build time, no runtime regeneration needed). Saves ~1s of
    // worker bundle work and reduces peak heap by ~200MB on Cloudflare Pages.
    runtimeCacheStorage: false,
  },

  site: {
    name: 'mapcn-vue',
    description:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
    url: 'https://mapcn-vue.geoql.in',
  },

  compatibilityDate: '2025-01-06',

  vite: {
    resolve: {
      dedupe: [
        '@deck.gl/core',
        '@deck.gl/layers',
        '@deck.gl/mapbox',
        '@deck.gl/aggregation-layers',
        '@deck.gl/geo-layers',
        '@deck.gl/mesh-layers',
        '@deck.gl/extensions',
        '@luma.gl/core',
        '@luma.gl/engine',
        '@luma.gl/shadertools',
      ],
    },
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      exclude: ['@geoql/v-maplibre'],
      include: [
        'class-variance-authority',
        'clsx',
        'reka-ui',
        'shiki/bundle/web',
        'tailwind-merge',
      ],
    },
  },

  postcss: {
    plugins: {},
  },

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      // Limit concurrency to 4 (default is unlimited on local builds, which
      // pushed RSS to +9.4GB on this codebase). With 4 the build retains a
      // <4GB heap window that fits CI memory budgets without slowing wallclock.
      concurrency: 4,
      // Don't fail the build if a single prerendered route errors — we have
      // a few zarr/source.coop pages that gracefully degrade when upstream
      // is offline. They render the fallback UI as static HTML.
      failOnError: false,
    },
    cloudflare: {
      nodeCompat: true,
    },

    rollupConfig: {
      output: {
        generatedCode: {
          constBindings: true,
        },
      },
    },
    replace: {
      'process.stdout': 'undefined',
    },

    experimental: {
      openAPI: false,
    },

    // `external: [...]` (from unjs/externality) keeps @resvg/resvg-js out of
    // the worker bundle — it's a CJS-only native binary that breaks Cloudflare
    // Workers when bundled. Renamed from `packageNames` which never actually
    // existed in NodeExternalsOptions (silently no-op'd at runtime, caught by
    // TS in Nuxt 4.4.5 / Nitro 2.13).
    externals: {
      external: ['@resvg/resvg-js'],
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  hooks: {
    'vite:extendConfig'(viteInlineConfig, env) {
      if (env.isClient && viteInlineConfig.optimizeDeps?.include) {
        const dropPrefixes = ['@nuxtjs/mdc >'];
        const dropExact = new Set(['@plausible-analytics/tracker']);
        viteInlineConfig.optimizeDeps.include =
          viteInlineConfig.optimizeDeps.include.filter((entry) => {
            if (typeof entry !== 'string') return true;
            if (dropExact.has(entry)) return false;
            return !dropPrefixes.some((p) => entry.startsWith(p));
          });
      }
    },
  },
});
