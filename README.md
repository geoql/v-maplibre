# @geoql/v-maplibre

> Vue 3 components for MapLibre GL - Build beautiful, reactive map applications

[![npm version](https://badge.fury.io/js/%40geoql%2Fv-maplibre.svg)](https://www.npmjs.com/package/@geoql/v-maplibre)
[![JSR](https://jsr.io/badges/@geoql/v-maplibre)](https://jsr.io/@geoql/v-maplibre)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🗺️ **Full MapLibre GL Support** - Complete wrapper around MapLibre GL JS
- 🔥 **Vue 3 Composition API** - Built with modern Vue 3 patterns
- 📦 **TypeScript First** - Fully typed with excellent IDE support
- 🎨 **Reactive Components** - Reactive and composable map components
- 🚀 **Nuxt 4 Ready** - Seamlessly works with Nuxt 4 and SSR
- 🎯 **PMTiles Built-in** - Native support for PMTiles protocol

## Installation

### From npm

```bash
# pnpm
pnpm add @geoql/v-maplibre maplibre-gl

# npm
npm install @geoql/v-maplibre maplibre-gl

# yarn
yarn add @geoql/v-maplibre maplibre-gl
```

### From JSR

```bash
# deno
deno add @geoql/v-maplibre

# npm (using JSR)
npx jsr add @geoql/v-maplibre

# yarn
yarn dlx jsr add @geoql/v-maplibre

# pnpm
pnpm dlx jsr add @geoql/v-maplibre
```

## Quick Start

```vue
<script setup lang="ts">
  import { VMap, VMarker } from '@geoql/v-maplibre';
  import 'maplibre-gl/dist/maplibre-gl.css';

  const mapOptions = {
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

## Components

### Core Components

- **`VMap`** - Main map component
- **`VMarker`** - Interactive markers
- **`VPopup`** - Popups and tooltips

### Layer Components

- **`VLayerMaplibreGeojson`** - GeoJSON layers
- **`VLayerMaplibreVector`** - Vector tile layers
- **`VLayerMaplibreRaster`** - Raster tile layers
- **`VLayerMaplibreImage`** - Image layers
- **`VLayerMaplibreVideo`** - Video layers
- **`VLayerMaplibreCanvas`** - Canvas layers
- **`VLayerMaplibreCluster`** - Clustered point layers
- **`VLayerMaplibrePmtile`** - PMTiles layers

### Control Components

- **`VControlNavigation`** - Navigation controls (zoom, rotate)
- **`VControlScale`** - Scale indicator
- **`VControlGeolocate`** - Geolocation control
- **`VControlFullscreen`** - Fullscreen toggle
- **`VControlAttribution`** - Attribution control

## Usage with Nuxt

For Nuxt applications, wrap the map component with `ClientOnly`:

```vue
<script setup lang="ts">
  import { VMap } from '@geoql/v-maplibre';

  const mapOptions = {
    style: 'https://demotiles.maplibre.org/style.json',
    center: [-74.5, 40],
    zoom: 9,
  };
</script>

<template>
  <ClientOnly>
    <VMap :options="mapOptions" style="height: 500px"></VMap>
  </ClientOnly>
</template>
```

Create a Nuxt plugin to import styles globally:

```typescript
// plugins/maplibre.client.ts
import 'maplibre-gl/dist/maplibre-gl.css';

export default defineNuxtPlugin(() => {
  // Plugin loaded
});
```

## Examples

### GeoJSON Layer

```vue
<script setup lang="ts">
  import { VMap, VLayerMaplibreGeojson } from '@geoql/v-maplibre';
  import type { GeoJSONSourceSpecification } from 'maplibre-gl';

  const geojsonSource: GeoJSONSourceSpecification = {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-74.5, 40],
          },
          properties: { name: 'Example Point' },
        },
      ],
    },
  };

  const layerOptions = {
    id: 'points',
    type: 'circle' as const,
    paint: {
      'circle-radius': 8,
      'circle-color': '#007cbf',
    },
  };
</script>

<template>
  <VMap :options="mapOptions" style="height: 500px">
    <VLayerMaplibreGeojson
      :source="geojsonSource"
      :layer="layerOptions"
    ></VLayerMaplibreGeojson>
  </VMap>
</template>
```

### PMTiles Support

```vue
<script setup lang="ts">
  import { VMap, VLayerMaplibrePmtile } from '@geoql/v-maplibre';

  const pmtilesUrl = 'https://example.com/tiles.pmtiles';

  const layerOptions = {
    id: 'pmtiles-layer',
    type: 'fill' as const,
    paint: {
      'fill-color': '#088',
      'fill-opacity': 0.5,
    },
  };
</script>

<template>
  <VMap :options="mapOptions" support-pmtiles style="height: 500px">
    <VLayerMaplibrePmtile
      :url="pmtilesUrl"
      :layer="layerOptions"
    ></VLayerMaplibrePmtile>
  </VMap>
</template>
```

## Documentation

Visit our [documentation site](#) for:

- Complete API reference
- Detailed component guides
- Interactive examples
- Migration guides

## TypeScript Support

All components are fully typed. Import types from `maplibre-gl`:

```typescript
import type { MapOptions, LngLatLike, GeoJSONSource } from 'maplibre-gl';
```

## Development

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run documentation
pnpm docs:dev

# Build documentation
pnpm docs:build
```

## License

MIT License - see [LICENSE](LICENSE) for details

## Credits

Built with:

- [MapLibre GL JS](https://maplibre.org/)
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [PMTiles](https://github.com/protomaps/PMTiles)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by GeoQL
