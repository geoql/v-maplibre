# @geoql/v-maplibre Documentation

> API documentation for @geoql/v-maplibre

Built with [Docus](https://docus.dev) - a Nuxt-based documentation theme.

**Note:** This app uses pnpm (not bun) due to [docus#1204](https://github.com/nuxt-content/docus/issues/1204).

## Development

```bash
# From monorepo root (recommended)
bun run dev:docs

# Or from this directory (requires pnpm)
pnpm run dev
```

The documentation site runs at `http://localhost:3000`.

## Content Structure

```
apps/docs/
├── content/
│   ├── index.md                    # Homepage
│   ├── 1.guide/                    # Getting started guides
│   ├── 2.components/               # Component documentation
│   └── 3.layers/                   # Layer documentation
└── nuxt.config.ts
```

## Writing Documentation

Add or edit Markdown files in the `content/` directory. Files are automatically:

- Sorted by numeric prefix (`1.guide`, `2.components`)
- Converted to navigation entries
- Rendered with syntax highlighting

## Build

```bash
# From monorepo root
bun run build:docs

# Or from this directory
pnpm run build
```

## Tech Stack

- [Nuxt](https://nuxt.com)
- [Docus](https://docus.dev)
- [@nuxt/content](https://content.nuxt.com)
