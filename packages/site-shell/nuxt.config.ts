import { fileURLToPath } from 'node:url';

const appDir = fileURLToPath(new URL('./app', import.meta.url));

/**
 * The design shell shared by mapcn-vue.geoql.in and v-maplibre.geoql.in
 * (Tech Utility, see .agents/skills/mapcn-vue-design/SKILL.md).
 *
 * Owns the visual stack only: fonts, color mode, Tailwind, shadcn-vue
 * primitives, icons and motion. Content collections, SEO, security headers
 * and server routes stay in each app. Styles are not added to `css` here:
 * each app's main.css starts with `@import '@geoql/site-shell/shell.css'`
 * so Tailwind compiles one stylesheet per app.
 */
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/fonts',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  alias: {
    '#shell': appDir,
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
  },

  // Explicit font manifest: skips @nuxt/fonts' CSS auto-scanning (it cost
  // ~41s per build). `global: true` registers the families app-wide;
  // nuxt-og-image v7 reads fonts through @nuxt/fonts' `fonts:resolved` hook and
  // only embeds global families, so OG templates render in Geist.
  fonts: {
    families: [
      {
        name: 'Geist',
        provider: 'google',
        weights: [300, 400, 500, 700, 800],
        global: true,
      },
      {
        name: 'Geist Mono',
        provider: 'google',
        weights: [400, 500, 700],
        global: true,
      },
    ],
    defaults: {
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
    },
    processCSSVariables: false,
  },

  shadcn: {
    prefix: '',
    componentDir: `${appDir}/components/ui`,
  },
});
