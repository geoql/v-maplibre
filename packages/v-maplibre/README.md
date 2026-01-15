# @geoql/v-maplibre

> Vue 3 components for MapLibre GL - Build beautiful, reactive map applications

[![npm version](https://badge.fury.io/js/%40geoql%2Fv-maplibre.svg)](https://www.npmjs.com/package/@geoql/v-maplibre)
[![JSR](https://jsr.io/badges/@geoql/v-maplibre)](https://jsr.io/@geoql/v-maplibre)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Using shadcn-vue?** Check out [mapcn-vue](https://mapcn-vue.geoql.in) for copy-paste map components styled with Tailwind CSS.

## Features

- 🗺️ **Full MapLibre GL Support** - Complete wrapper around MapLibre GL JS
- 🔥 **Vue 3 Composition API** - Built with modern Vue 3 patterns
- 📦 **TypeScript First** - Fully typed with excellent IDE support
- 🎨 **Reactive Components** - Reactive and composable map components
- 🚀 **Nuxt 4 Ready** - Seamlessly works with Nuxt 4 and SSR
- 🎯 **PMTiles Built-in** - Native support for PMTiles protocol
- 🌐 **deck.gl Integration** - High-performance WebGL visualization layers
- 🛰️ **COG/GeoTIFF Support** - GPU-accelerated Cloud-Optimized GeoTIFF layers
- 📡 **LiDAR Viewer** - LAS/LAZ/COPC point cloud visualization with streaming

## Installation

```bash
# bun
bun add @geoql/v-maplibre maplibre-gl

# npm
npm install @geoql/v-maplibre maplibre-gl

# yarn
yarn add @geoql/v-maplibre maplibre-gl

# pnpm
pnpm add @geoql/v-maplibre maplibre-gl
```

### deck.gl Layers (Optional)

For deck.gl visualization layers, install the required packages:

```bash
# Core deck.gl packages
bun add @deck.gl/core @deck.gl/layers @deck.gl/mapbox

# Additional layer packages (as needed)
bun add @deck.gl/aggregation-layers  # Heatmap, Hexagon, Grid
bun add @deck.gl/geo-layers          # Trips, MVT, Tile, H3
bun add @deck.gl/mesh-layers         # SimpleMesh, Scenegraph

# Raster layers (COG/GeoTIFF)
bun add @developmentseed/deck.gl-raster geotiff-geokeys-to-proj4

# LiDAR viewer control
bun add maplibre-gl-lidar

# IDW interpolation heatmap (optional)
bun add maplibre-gl-interpolate-heatmap

# Wind particle visualization
bun add maplibre-gl-wind
```

## Quick Start

```vue
<script setup lang="ts">
  import { VMap, VMarker } from '@geoql/v-maplibre';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import '@geoql/v-maplibre/dist/v-maplibre.css';

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

### MapLibre Layer Components

- **`VLayerMaplibreGeojson`** - GeoJSON layers
- **`VLayerMaplibreVector`** - Vector tile layers
- **`VLayerMaplibreRaster`** - Raster tile layers
- **`VLayerMaplibreImage`** - Image layers
- **`VLayerMaplibreVideo`** - Video layers
- **`VLayerMaplibreCanvas`** - Canvas layers
- **`VLayerMaplibreCluster`** - Clustered point layers
- **`VLayerMaplibrePmtile`** - PMTiles layers
- **`VLayerMaplibreRoute`** - Route/delivery tracking visualization

### deck.gl Layer Components

High-performance WebGL visualization layers powered by deck.gl:

**Core Layers**

- `VLayerDeckglScatterplot` - Circles/points
- `VLayerDeckglArc` - Origin-destination arcs
- `VLayerDeckglLine` - Flat lines
- `VLayerDeckglPath` - Polylines/routes
- `VLayerDeckglPolygon` - Filled polygons
- `VLayerDeckglGeojson` - GeoJSON features
- `VLayerDeckglIcon` - Custom markers
- `VLayerDeckglText` - Text labels
- `VLayerDeckglColumn` - 3D columns
- `VLayerDeckglBitmap` - Georeferenced images

**Aggregation Layers**

- `VLayerDeckglHeatmap` - Density heatmap
- `VLayerDeckglHexagon` - Hexagonal binning
- `VLayerDeckglGrid` - Square grid aggregation
- `VLayerDeckglContour` - Contour/isolines
- `VLayerDeckglScreenGrid` - Screen-space grid

**Geo Layers**

- `VLayerDeckglTrips` - Animated paths
- `VLayerDeckglMVT` - Mapbox Vector Tiles
- `VLayerDeckglTile` - Generic tiles
- `VLayerDeckglTile3D` - 3D Tiles (Cesium)
- `VLayerDeckglTerrain` - Terrain mesh
- `VLayerDeckglH3Hexagon` - H3 hexagons
- `VLayerDeckglH3Cluster` - Clustered H3 hexagon regions
- `VLayerDeckglGreatCircle` - Great circle arcs
- `VLayerDeckglWMS` - Web Map Service tiles

**Tile System Layers**

- `VLayerDeckglS2` - Google S2 geometry cells
- `VLayerDeckglGeohash` - Geohash spatial indexing
- `VLayerDeckglQuadkey` - Bing Maps Quadkey tiles
- `VLayerDeckglGridCell` - Pre-aggregated grid cells

**Mesh Layers**

- `VLayerDeckglSimpleMesh` - 3D meshes
- `VLayerDeckglScenegraph` - glTF/GLB models

**Point Cloud Layers**

- `VLayerDeckglPointCloud` - LiDAR/photogrammetry point clouds
- `VLayerDeckglSolidPolygon` - 3D extruded solid polygons

**Raster Layers** (requires `@developmentseed/deck.gl-raster`)

- `VLayerDeckglCOG` - Cloud-Optimized GeoTIFF visualization (GPU-accelerated, auto-reprojection)

**Wind Visualization** (requires `maplibre-gl-wind`)

- `VLayerDeckglWindParticle` - Animated wind particle flow with speed-based color ramps

**Generic Layer**

- `VLayerDeckgl` - Use any deck.gl layer class directly

### Control Components

- **`VControlNavigation`** - Navigation controls (zoom, rotate)
- **`VControlScale`** - Scale indicator
- **`VControlGeolocate`** - Geolocation control
- **`VControlFullscreen`** - Fullscreen toggle
- **`VControlAttribution`** - Attribution control
- **`VControlLidar`** - LiDAR point cloud viewer (LAS/LAZ/COPC support, streaming, color schemes)

## deck.gl Example

```vue
<script setup lang="ts">
  import { VMap, VLayerDeckglScatterplot } from '@geoql/v-maplibre';

  const mapOptions = {
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-122.4, 37.8],
    zoom: 11,
  };

  const data = [
    { coordinates: [-122.4, 37.8], size: 100 },
    { coordinates: [-122.5, 37.7], size: 200 },
  ];
</script>

<template>
  <VMap :options="mapOptions" style="height: 500px">
    <VLayerDeckglScatterplot
      id="points"
      :data="data"
      :get-position="(d) => d.coordinates"
      :get-radius="(d) => d.size"
      :get-fill-color="[255, 140, 0]"
      :radius-min-pixels="5"
      :pickable="true"
      @click="(info) => console.log('Clicked:', info.object)"
    ></VLayerDeckglScatterplot>
  </VMap>
</template>
```

## Wind Visualization Example

```vue
<script setup lang="ts">
  import { VMap, VLayerDeckglWindParticle } from '@geoql/v-maplibre';

  const mapOptions = {
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [0, 20],
    zoom: 2,
  };

  // Wind data points with speed (m/s) and direction (degrees, 0=North)
  const windData = [
    { lat: 40.7, lon: -74.0, speed: 5.2, direction: 180 },
    { lat: 34.0, lon: -118.2, speed: 3.1, direction: 270 },
    // ... more points
  ];
</script>

<template>
  <VMap :options="mapOptions" style="height: 500px">
    <VLayerDeckglWindParticle
      id="wind"
      :wind-data="windData"
      :num-particles="8192"
      :speed-factor="50"
      :color-ramp="[
        [0.0, [59, 130, 189, 255]],
        [0.5, [253, 174, 97, 255]],
        [1.0, [213, 62, 79, 255]],
      ]"
      :speed-range="[0, 30]"
    ></VLayerDeckglWindParticle>
  </VMap>
</template>
```

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

Add styles to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  css: [
    'maplibre-gl/dist/maplibre-gl.css',
    '@geoql/v-maplibre/dist/v-maplibre.css',
  ],
});
```

## TypeScript Support

All components are fully typed. Import types as needed:

```typescript
import type { MapOptions, LngLatLike } from 'maplibre-gl';
import type { Color, PickingInfo } from '@deck.gl/core';
```

## Development

This package is part of the [v-maplibre monorepo](https://github.com/geoql/v-maplibre).

```bash
# Clone and install (from monorepo root)
git clone https://github.com/geoql/v-maplibre.git
cd v-maplibre
bun install

# Build this package
bun run --cwd packages/v-maplibre build

# Run tests
bun run test

# Watch mode
bun run dev:lib
```

## License

MIT License - see [LICENSE](LICENSE) for details

## Credits

Built with:

- [MapLibre GL JS](https://maplibre.org/)
- [deck.gl](https://deck.gl/)
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [PMTiles](https://github.com/protomaps/PMTiles)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by GeoQL
