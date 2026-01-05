# mapcn-vue Site

> Documentation and showcase site for mapcn-vue

Built with Nuxt 4, Tailwind CSS v4, and shadcn-nuxt.

## Development

```bash
# Install dependencies (from monorepo root)
bun install

# Start development server
bun run dev:mapcn
# or from this directory
bun run dev
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
bun run build
```

Output in `.output/` directory.

## Tech Stack

- [Nuxt 4](https://nuxt.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn-nuxt](https://shadcn-vue.com)
- [@nuxt/content](https://content.nuxt.com)
- [@nuxtjs/color-mode](https://color-mode.nuxtjs.org)
