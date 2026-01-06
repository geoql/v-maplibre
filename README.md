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

## Quick Start

### Option 1: Install the library

```bash
bun add @geoql/v-maplibre maplibre-gl
```

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

This monorepo uses [Bun](https://bun.sh) workspaces for everything, except `apps/docs` which uses pnpm (due to [docus#1204](https://github.com/nuxt-content/docus/issues/1204)).

```bash
# Install dependencies
bun install
bun run setup:docs   # Required: installs docs deps with pnpm

# Development
bun run dev:lib      # Watch mode for library
bun run dev:docs     # Docus documentation (uses pnpm)
bun run dev:mapcn    # mapcn-vue site

# Build
bun run build        # Build all packages
bun run build:docs   # Build docs (uses pnpm)
bun run build:mapcn  # Build mapcn-vue

# Test
bun run test         # Run tests
bun run test:coverage

# Lint & Format
bun run lint
bun run format

# Release (from packages/v-maplibre)
bun run release
```

## Monorepo Structure

```
v-maplibre/
├── packages/
│   ├── v-maplibre/        # Main library (npm: @geoql/v-maplibre)
│   └── mapcn-vue/         # shadcn-vue registry components
├── apps/
│   ├── docs/              # Docus documentation (uses pnpm)
│   └── mapcn-vue/         # Nuxt 4 showcase site (uses bun)
├── package.json           # Bun workspaces root
└── bun.lock
```

## License

MIT License - see [LICENSE](./packages/v-maplibre/LICENSE) for details

## Credits

Built with [MapLibre GL JS](https://maplibre.org/), [deck.gl](https://deck.gl/), [Vue 3](https://vuejs.org/), and [Vite](https://vitejs.dev/).

---

Made with ❤️ by [GeoQL](https://github.com/geoql)
