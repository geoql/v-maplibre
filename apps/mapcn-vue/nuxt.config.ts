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
    defaults: {
      component: 'MapcnDoc',
    },
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
  },

  postcss: {
    plugins: {},
  },

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
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
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
});
