export default defineAppConfig({
  docus: {
    title: 'v-maplibre',
    description: 'Vue 3 components for MapLibre GL',
    image: '/social-card.png',
    socials: {
      github: 'geoql/v-maplibre',
    },
    github: {
      owner: 'geoql',
      repo: 'v-maplibre',
      branch: 'main',
      dir: 'docs/content',
      edit: true,
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    header: {
      title: 'v-maplibre',
      logo: false,
      showLinkIcon: true,
      exclude: [],
      fluid: true,
    },
    footer: {
      credits: {
        icon: 'IconDocus',
        text: 'Powered by Docus',
        href: 'https://docus.dev',
      },
    },
  },
});
