import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/content',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    'motion-v/nuxt',
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
    public: {
      mapsguruApiKey: '',
    },
  },

  compatibilityDate: '2025-01-06',

  nitro: {
    preset: 'cloudflare-pages',
    cloudflare: {
      nodeCompat: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
});
