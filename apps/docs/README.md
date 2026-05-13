# @geoql/v-maplibre Documentation

> API documentation for @geoql/v-maplibre

Built with [Docus](https://docus.dev) - a Nuxt-based documentation theme.

**Note:** This app is a member of the root pnpm workspace and uses the `app:docs` catalog in `pnpm-workspace.yaml` for its Docus-specific dependencies. Run `pnpm install` at the repo root to install everything.

## Development

```bash
# From monorepo root (recommended)
pnpm run dev:docs

# Or from this directory
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
pnpm run build:docs

# Or from this directory
pnpm run build
```

## Tech Stack

- [Nuxt](https://nuxt.com)
- [Docus](https://docus.dev)
- [@nuxt/content](https://content.nuxt.com)
