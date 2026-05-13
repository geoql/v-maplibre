# v-maplibre

> Vue 3 components for MapLibre GL - Monorepo for @geoql/v-maplibre and mapcn-vue

[![npm version](https://badge.fury.io/js/%40geoql%2Fv-maplibre.svg)](https://www.npmjs.com/package/@geoql/v-maplibre)
[![JSR](https://jsr.io/badges/@geoql/v-maplibre)](https://jsr.io/@geoql/v-maplibre)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Packages

| Package                                    | Description                             |
| ------------------------------------------ | --------------------------------------- |
| [@geoql/v-maplibre](./packages/v-maplibre) | Vue 3 components for MapLibre GL        |
| [mapcn-vue](./packages/mapcn-vue)          | shadcn-vue style map component registry |

## Apps

| App                           | Description                      |
| ----------------------------- | -------------------------------- |
| [docs](./apps/docs)           | API documentation (Docus)        |
| [mapcn-vue](./apps/mapcn-vue) | mapcn-vue showcase site (Nuxt 4) |

## For AI Coding Assistants

If you're using Claude Code, Cursor, Copilot, OpenCode, or any AGENTS.md-compatible assistant, start with [`AGENTS.md`](./AGENTS.md) (`CLAUDE.md` is a symlink to the same file). It documents the project-pinned skills under [`.agents/skills/`](./.agents/skills/), the per-package skill matrix, and the hard constraints that apply everywhere.

---

## Quick Start

### Option 1: Install the library

```bash
pnpm add @geoql/v-maplibre maplibre-gl @deck.gl/core @deck.gl/layers @deck.gl/mapbox @deck.gl/aggregation-layers @deck.gl/geo-layers @deck.gl/mesh-layers maplibre-gl-wind
```

> **Note:** All packages above are required peer dependencies. See the [package README](./packages/v-maplibre/README.md#installation) for details.

```vue
<script setup lang="ts">
  import { VMap, VMarker } from '@geoql/v-maplibre';
  import 'maplibre-gl/dist/maplibre-gl.css';

  const mapOptions = {
    container: 'my-map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [-74.5, 40],
    zoom: 9,
  };
</script>

<template>
  <VMap :options="mapOptions" style="height: 500px">
    <VMarker :lng-lat="[-74.5, 40]"></VMarker>
  </VMap>
</template>
```

### Option 2: Use mapcn-vue (shadcn-vue style)

```bash
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map
```

This copies theme-aware map components directly into your project.

## Development

This monorepo uses [pnpm v11](https://pnpm.io) workspaces. All four projects (`packages/v-maplibre`, `packages/mapcn-vue`, `apps/mapcn-vue`, `apps/docs`) live in a single workspace with a single `pnpm-lock.yaml`.

```bash
# Install all dependencies in one go
pnpm install

# Development
pnpm run dev:lib      # Watch mode for library
pnpm run dev:docs     # Docus documentation
pnpm run dev:mapcn    # mapcn-vue site

# Build
pnpm run build        # Build all packages
pnpm run build:docs   # Build docs
pnpm run build:mapcn  # Build mapcn-vue

# Test
pnpm run test         # Run tests
pnpm run test:coverage

# Lint & Format
pnpm run lint
pnpm run format

# Release (from packages/v-maplibre)
pnpm run release
```

## Monorepo Structure

```
v-maplibre/
├── packages/
│   ├── v-maplibre/        # Main library (npm: @geoql/v-maplibre)
│   └── mapcn-vue/         # shadcn-vue registry components
│       ├── components.json           # shadcn-vue standard config
│       ├── scripts/build-registry.ts # Custom registry builder
│       ├── registry/new-york/        # Source components (one folder per component)
│       └── public/r/                 # Generated registry JSONs
├── apps/
│   ├── docs/              # Docus documentation (workspace member, own catalog)
│   └── mapcn-vue/         # Nuxt 4 showcase site
├── package.json           # pnpm workspaces root
├── pnpm-workspace.yaml    # Workspace packages + catalogs
└── pnpm-lock.yaml
```

## License

MIT License - see [LICENSE](./packages/v-maplibre/LICENSE) for details

## Highlights

- **50+ Layer Components** - deck.gl core, aggregation, geo, mesh, and raster layers
- **LiDAR Viewer** - LAS/LAZ/COPC point cloud visualization with streaming
- **COG/GeoTIFF** - GPU-accelerated Cloud-Optimized GeoTIFF layers
- **COG Mosaic** - Client-side mosaicking of multiple COGs from STAC APIs (no server required)
- **Spatial Indexing** - H3, S2, Geohash, Quadkey tile system layers

Check out the [live examples](https://mapcn-vue.geoql.in/examples) for interactive demos.

## Credits

Built with [MapLibre GL JS](https://maplibre.org/), [deck.gl](https://deck.gl/), [Vue 3](https://vuejs.org/), and [Vite](https://vitejs.dev/).

---

Made with ❤️ by [GeoQL](https://github.com/geoql)
