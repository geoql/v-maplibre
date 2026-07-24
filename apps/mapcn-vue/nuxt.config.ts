import libraryPkg from '../../packages/v-maplibre/package.json' with { type: 'json' };

// Bump alongside packages/v-maplibre version. Source: GitHub release date for the matching tag.
const LIBRARY_RELEASED_AT = '2026-06-10T16:13:11Z';

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
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
    'nuxt-llms',
    'nuxt-security',
    '@nuxtjs/tailwindcss',
    [
      '@nuxtjs/plausible',
      {
        domain: 'mapcn-vue.geoql.in',
        apiHost: 'https://analytics.geoql.in',
        autoOutboundTracking: true,
      },
    ],
    // OpenPanel product analytics (self-hosted at events.geoql.in), alongside
    // Plausible. The module bundles the SDK into the app's own nonce'd module
    // script (no external op1.js), so only connect-src needs events.geoql.in
    // for the /track POST. The module copies every option below into
    // runtimeConfig.public (browser-exposed), so clientSecret is absent here —
    // it lives in the private runtimeConfig.openpanel block.
    '@openpanel/nuxt',
  ],

  openpanel: {
    clientId: process.env.NUXT_PUBLIC_OPENPANEL_CLIENT_ID ?? '',
    apiUrl: 'https://events.geoql.in/api',
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
    // proxy: false — a proxy handler hardcodes api.openpanel.dev and would
    // bypass the self-hosted apiUrl; direct client POST is correct here.
    proxy: false,
  },

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
    // Server-only: never exposed to the client bundle. Used by
    // server/utils/openpanel.ts to authenticate server-side track calls.
    openpanel: {
      clientId: process.env.NUXT_PUBLIC_OPENPANEL_CLIENT_ID ?? '',
      clientSecret: process.env.NUXT_OPENPANEL_CLIENT_SECRET ?? '',
    },
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
    // worker bundle work and reduces peak heap by ~200MB on Cloudflare Workers.
    runtimeCacheStorage: false,
  },

  site: {
    name: 'mapcn-vue',
    description:
      'Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.',
    url: 'https://mapcn-vue.geoql.in',
  },

  // AI-crawler allowlist per nuxt-geo-best-practices rule ai-robots-allowlist.
  // Refusing AI crawlers blocks brand from ChatGPT/Perplexity/Gemini citations entirely.
  robots: {
    groups: [
      {
        // Content Signals (contentsignals.org): declare AI usage preferences.
        // mapcn-vue is open source and WANTS to be cited/used by AI systems.
        userAgent: ['*'],
        allow: ['/'],
        disallow: ['/api/', '/__nuxt_content/', '/__og-image__/'],
        contentSignal: ['search=yes', 'ai-input=yes', 'ai-train=yes'],
      },
      {
        userAgent: [
          'GPTBot', // OpenAI training crawler
          'ChatGPT-User', // OpenAI user-driven browse
          'OAI-SearchBot', // OpenAI search index
          'ClaudeBot', // Anthropic crawler
          'anthropic-ai', // Anthropic older identifier
          'Claude-Web', // Anthropic web fetcher
          'PerplexityBot', // Perplexity index crawler
          'Perplexity-User', // Perplexity user-driven browse
          'Google-Extended', // Gemini training
          'Applebot-Extended', // Apple Intelligence training
          'cohere-ai', // Cohere crawler
          'FacebookBot', // Meta AI
          'Meta-ExternalAgent', // Meta AI alternate
          'Bytespider', // ByteDance/TikTok AI
          'CCBot', // Common Crawl (used by many LLMs)
          'Amazonbot', // Amazon Alexa AI
          'omgilibot', // Webz.io AI training
          'Diffbot', // knowledge graph
        ],
        allow: ['/'],
      },
    ],
    sitemap: '/sitemap.xml',
  },

  // Generated at build time, served from Cloudflare Workers static assets. Discovered automatically
  // by @nuxt/content + Nuxt pages router.
  sitemap: {
    xsl: false, // Skip XSL stylesheet to keep CF Workers bundle small
    defaults: {
      changefreq: 'weekly',
      priority: 0.8,
    },
  },

  // Site-wide identity for nuxt-schema-org. Per-page schemas (FAQPage, WebPage,
  // SoftwareApplication) added via useSchemaOrg in app.vue and composables.
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'GeoQL',
      url: 'https://mapcn-vue.geoql.in',
      logo: 'https://mapcn-vue.geoql.in/favicon.svg',
      sameAs: [
        'https://github.com/geoql',
        'https://www.npmjs.com/package/@geoql/v-maplibre',
        'https://x.com/geoql',
      ],
    },
  },

  // nuxt-llms auto-generates /llms.txt + /llms-full.txt at build time by
  // reading from registered @nuxt/content collections (docs + faq).
  // Canonical replacement for our prior hand-rolled server/routes/llms*.ts.
  llms: {
    domain: 'https://mapcn-vue.geoql.in',
    title: 'mapcn-vue',
    description:
      'Beautiful, theme-aware map components for Vue 3 powered by MapLibre GL and deck.gl. shadcn-vue compatible — copy components directly into your project, no black-box package.',
    full: {
      title: 'mapcn-vue full documentation',
      description:
        'Complete documentation, FAQ, and component catalog inlined for AI agent ingestion.',
    },
    sections: [
      {
        title: 'Documentation',
        contentCollection: 'docs',
      },
      {
        title: 'FAQ',
        contentCollection: 'faq',
      },
    ],
  },

  // securityheaders.com A+: nonce-based CSP + the core six headers, applied
  // at runtime by the worker (assets.run_worker_first below sends prose HTML
  // through the worker, dodging the _headers file's 100-rule cap).
  security: {
    headers: {
      contentSecurityPolicy: {
        'base-uri': ["'none'"],
        // Map tiles (maps.guru, cartocdn), demo APIs (valhalla, overpass,
        // source.coop COGs), OpenPanel (events.geoql.in) + Plausible
        // (analytics.geoql.in) event POSTs. blob:/data: for Arrow/COG loaders
        // reading object URLs.
        'connect-src': ["'self'", 'https:', 'data:', 'blob:'],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'frame-src': ["'self'"],
        // Map sprites/glyphs + demo imagery over https; canvas exports as
        // data/blob URLs.
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        'media-src': ["'self'", 'data:', 'blob:'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'script-src': [
          "'self'",
          'https:',
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
          // shiki highlights client-side via the oniguruma WASM engine
          "'wasm-unsafe-eval'",
        ],
        // MapLibre + deck.gl + LiDAR spawn workers from blob: URLs
        'worker-src': ["'self'", 'blob:'],
        'upgrade-insecure-requests': true,
      },
      // require-corp would block CORP-less cross-origin tiles and demo data;
      // COEP is not graded by securityheaders.com.
      crossOriginEmbedderPolicy: 'unsafe-none',
      permissionsPolicy: {
        camera: [],
        'display-capture': [],
        fullscreen: ['self'],
        geolocation: [],
        microphone: [],
      },
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
        preload: true,
      },
    },
    // In-memory rate limiting is meaningless on stateless Workers isolates
    // (each isolate keeps its own counter) and crashed on Pages
    // (nuxt-security#137).
    rateLimiter: false,
    // Registry JSON + og assets are fetched cross-origin by external tools
    // (shadcn-vue CLI, social crawlers); locking CORS to the site URL breaks
    // them.
    corsHandler: false,
    // MCP tool-call bodies legitimately contain component source snippets
    // ("<script setup>") that the XSS validator would reject with a 400.
    xssValidator: false,
    // Prose HTML is worker-routed (assets.run_worker_first below), so runtime
    // nonce CSP covers scanned pages; SSG hash CSP would conflict with the
    // per-request nonces and blow Cloudflare's 100-rule _headers cap.
    ssg: false,
    // SRI breaks hydration behind Cloudflare's immutable edge cache: Vite
    // injects __vite__mapDeps after content-hash naming, so a chunk filename
    // can carry different bytes across deploys and the stale cached variant
    // fails the integrity check (resource blocked, app init fails).
    sri: false,
  },

  // Static-layer security headers: Nitro bakes routeRules headers into the
  // _headers file, which Workers static assets apply to asset-served
  // responses (prerendered example pages, _nuxt chunks, registry JSON).
  // Worker-served HTML gets its CSP replaced at runtime by nuxt-security's
  // per-request nonce version; static files keep this 'unsafe-inline' CSP
  // since their build-time inline scripts cannot carry a per-request nonce.
  routeRules: {
    // /docs has no index page — send crawlers and humans to the first doc.
    '/docs': { redirect: { to: '/docs/introduction', statusCode: 301 } },
    '/**': {
      headers: {
        'Content-Security-Policy':
          "base-uri 'none'; connect-src 'self' https: data: blob:; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; frame-src 'self'; img-src 'self' data: blob: https:; media-src 'self' data: blob:; object-src 'none'; script-src 'self' https: 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' https: 'unsafe-inline'; worker-src 'self' blob:; upgrade-insecure-requests",
        'Permissions-Policy':
          'camera=(), display-capture=(), fullscreen=(self), geolocation=(), microphone=()',
      },
    },
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
        'apache-arrow',
      ],
    },
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      exclude: ['@geoql/v-maplibre'],
      include: [
        '@deck.gl/mapbox',
        'apache-arrow',
        'class-variance-authority',
        'clsx',
        'reka-ui',
        'shiki/bundle/web',
        'tailwind-merge',
      ],
    },
  },

  nitro: {
    preset: 'cloudflare_module',
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
      // deployConfig writes the merged binding spec to
      // .output/server/wrangler.json at build time — the SINGLE source of
      // truth for the Worker config; there is no hand-maintained
      // wrangler.json. Deploy: wrangler deploy --config .output/server/wrangler.json
      deployConfig: true,
      wrangler: {
        name: 'mapcn-vue',
        compatibility_date: '2026-06-16',
        compatibility_flags: ['nodejs_compat'],
        workers_dev: false,
        routes: [
          {
            pattern: 'mapcn-vue.geoql.in',
            custom_domain: true,
          },
        ],
        d1_databases: [
          {
            binding: 'DB',
            database_name: 'mapcn-vue-db',
            database_id: 'bca564a0-d024-4ae9-91ee-4d92e7e81402',
          },
        ],
        observability: {
          enabled: true,
          traces: {
            enabled: true,
          },
        },
        assets: {
          // Worker Assets serve matching files BEFORE the worker by default
          // (registry JSON, _nuxt chunks, og images — all get _headers
          // applied). Worker-first paths: prose pages need the per-request
          // nonce CSP (securityheaders.com A+; the static 'unsafe-inline'
          // fallback grades A), Link header, and Accept: text/markdown
          // negotiation from server middleware. Other dynamic routes (/mcp,
          // /a2a, /.well-known handlers) reach the worker anyway as asset
          // misses.
          run_worker_first: [
            '/',
            '/faq',
            '/docs',
            '/docs/*',
            '/examples',
            '/examples/*',
          ],
        },
      },
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
});
