# mapcn-vue Site

> Documentation and showcase site for mapcn-vue

Built with Nuxt 4, Tailwind CSS v4, and shadcn-nuxt.

## Setup API Keys

This project uses [Maps Guru](https://maps.guru) for map styles and the Google Flood API for flood data.

1. Get your Maps Guru API key at [maps.guru/signup](https://maps.guru/signup) and set it as `mapsguruApiKey` in `nuxt.config.ts`
2. Get your Google Flood Forecating API key from the [Google Cloud Console](https://console.cloud.google.com) and set it as `googleFloodApiKey` in `nuxt.config.ts`.
   > **Note**: This API requires prior approval. If you don't have access yet, the link [API Access](https://developers.google.com/flood-forecasting#api-access) contains instructions on how to get an API Key. Once approved, you can enable it in the Google Cloud Console.

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server
pnpm run dev:mapcn
# or from this directory
pnpm run dev
```

The site runs at `http://localhost:3000`.

## Registry API

The site serves the component registry at `/r/[name]`:

```
GET /r/map           → Map components
GET /r/map-layers    → MapLibre layer components
GET /r/map-deckgl-core → deck.gl core layers
...
```

Users install components via:

```bash
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map
```

## Structure

```
apps/mapcn-vue/
├── app/
│   ├── components/     # Site components (HeroMap, MapDemo)
│   ├── layouts/        # Default layout with header/footer
│   ├── pages/          # Routes (/, /docs/*, /examples/*)
│   └── assets/css/     # Tailwind CSS v4 styles
├── content/docs/       # Markdown documentation
├── server/routes/r/    # Registry API endpoint
└── nuxt.config.ts
```

## Build

```bash
pnpm run build
```

Output in `.output/` directory.

## Tech Stack

- [Nuxt 4](https://nuxt.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn-nuxt](https://shadcn-vue.com)
- [@nuxt/content](https://content.nuxt.com)
- [@nuxtjs/color-mode](https://color-mode.nuxtjs.org)
