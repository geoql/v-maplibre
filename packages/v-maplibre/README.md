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

The library has **two required dependencies**. Everything else is opt-in per feature.

```bash
# pnpm (recommended)
pnpm add @geoql/v-maplibre maplibre-gl

# npm
npm install @geoql/v-maplibre maplibre-gl

# yarn
yarn add @geoql/v-maplibre maplibre-gl
```

That covers `VMap`, `VMarker`, `VPopup`, all controls (`VControl*`), and every MapLibre-native layer (`VLayerMaplibre*`).

### Optional peer dependencies

Add these **only** for the layers you actually use — picking what you need keeps your bundle lean. Since **v2.0.0**, each group is imported from a dedicated subpath (`@geoql/v-maplibre/deck.gl`, `/geotiff`, `/wind`, `/lidar`, `/starfield`) so the core entry never references deck.gl — see [Migrating to v2.0.0](#migrating-to-v200).

```bash
# deck.gl base — import from '@geoql/v-maplibre/deck.gl'
# VLayerDeckgl, VLayerDeckglScatterplot, VLayerDeckglArc,
# VLayerDeckglLine, VLayerDeckglPath, VLayerDeckglPolygon, VLayerDeckglSolidPolygon,
# VLayerDeckglGeojson, VLayerDeckglIcon, VLayerDeckglText, VLayerDeckglColumn,
# VLayerDeckglBitmap, VLayerDeckglPointCloud
pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox

# Aggregation — VLayerDeckglHeatmap, VLayerDeckglHexagon, VLayerDeckglGrid,
# VLayerDeckglGridCell, VLayerDeckglContour, VLayerDeckglScreenGrid
pnpm add @deck.gl/aggregation-layers

# Geo / tiles — VLayerDeckglTrips, VLayerDeckglMVT, VLayerDeckglTile,
# VLayerDeckglTile3D, VLayerDeckglTerrain, VLayerDeckglH3Hexagon,
# VLayerDeckglH3Cluster, VLayerDeckglS2, VLayerDeckglGeohash,
# VLayerDeckglQuadkey, VLayerDeckglGreatCircle, VLayerDeckglWMS
pnpm add @deck.gl/geo-layers

# 3D mesh — VLayerDeckglSimpleMesh, VLayerDeckglScenegraph
pnpm add @deck.gl/mesh-layers

# Cloud-Optimized GeoTIFF — import from '@geoql/v-maplibre/geotiff'
# VLayerCog, VLayerMultiCog, VLayerMosaic
pnpm add @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj

# Zarr — import from '@geoql/v-maplibre/geotiff'
# VLayerZarr
pnpm add @developmentseed/deck.gl-zarr zarrita

# GeoArrow — import from '@geoql/v-maplibre/deck.gl'
# VLayerDeckglGeoArrowScatterplot, VLayerDeckglGeoArrowPath,
# VLayerDeckglGeoArrowPolygon, VLayerDeckglGeoArrowSolidPolygon,
# VLayerDeckglGeoArrowText, VLayerDeckglGeoArrowTrips
# (Trips additionally needs @deck.gl/geo-layers — already covered by the
#  deck.gl tile/route line above.)
pnpm add apache-arrow

# Wind particles — import from '@geoql/v-maplibre/wind'
# VLayerWindParticle
# (Wind-data helpers — createWindDataFromOpenWeatherMap, generateWindTexture,
# WindParticleLayer — must be imported directly from 'maplibre-gl-wind'.)
pnpm add maplibre-gl-wind

# LiDAR point cloud viewer — import from '@geoql/v-maplibre/lidar'
# VControlLidar
pnpm add maplibre-gl-lidar

# Three.js starfield skybox for globe projections — import from '@geoql/v-maplibre/starfield'
# VLayerStarfield
pnpm add @geoql/maplibre-gl-starfield three
```

If you import a layer without its peer deps installed, your bundler will surface a `Cannot find module '...'` error — install the missing package(s) from the table above to resolve it.

## Migrating to v2.0.0

v2.0.0 moves the optional-peer layers off the root entry onto dedicated subpaths so a core-only install no longer transitively references deck.gl / lidar / wind (fixes [#114](https://github.com/geoql/v-maplibre/issues/114)). Core components are unchanged — keep importing `VMap`, `VMarker`, `VPopup`, every `VControl*` (except `VControlLidar`), and every `VLayerMaplibre*` (except `VLayerStarfield`) from `@geoql/v-maplibre`. Only update the optional-peer components:

| Components                                                   | New import                    |
| ------------------------------------------------------------ | ----------------------------- |
| All `VLayerDeckgl*` (base, aggregation, geo, mesh, GeoArrow) | `@geoql/v-maplibre/deck.gl`   |
| `VLayerCog`/`MultiCog`/`Mosaic`/`Zarr`                       | `@geoql/v-maplibre/geotiff`   |
| `VLayerWindParticle`                                         | `@geoql/v-maplibre/wind`      |
| `VLayerStarfield`                                            | `@geoql/v-maplibre/starfield` |
| `VControlLidar`                                              | `@geoql/v-maplibre/lidar`     |

```diff
- import { VMap, VLayerDeckglScatterplot } from '@geoql/v-maplibre';
+ import { VMap } from '@geoql/v-maplibre';
+ import { VLayerDeckglScatterplot } from '@geoql/v-maplibre/deck.gl';
```

Component-specific TypeScript types (e.g. `MosaicSource`, `WindDataPoint`, `LidarControlOptions`) move to the same subpath as their component.

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
    <VMarker :coordinates="[-74.5, 40]"></VMarker>
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
- **`VLayerMaplibreHillshade`** - Hillshade relief from a raster-dem source
- **`VTerrain`** - Native MapLibre 3D terrain (`map.setTerrain`)
- **`VSky`** - Sky, horizon and fog for pitched 3D views (`map.setSky`)
- **`VLayerMaplibreRoute`** - Route/delivery tracking visualization
- **`VLayerStarfield`** - Three.js starfield skybox for globe projections (requires `@geoql/maplibre-gl-starfield`, `three`)

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

**Raster Layers** (requires `@developmentseed/deck.gl-raster` and `@developmentseed/deck.gl-geotiff`)

- `VLayerCog` - Cloud-Optimized GeoTIFF visualization (GPU-accelerated, auto-reprojection)
- `VLayerMosaic` - Client-side COG mosaic from STAC items (requires `flatbush`, `proj4`)

**GeoArrow Layers** (requires `@deck.gl/layers` + `apache-arrow`; trips also needs `@deck.gl/geo-layers`)

Render Apache Arrow `Table` / `RecordBatch` data with GeoArrow extension types directly — no GeoJSON parsing. Ideal for GeoParquet / Arrow IPC sources and very large point/polygon datasets. The wrappers extract GeoArrow geometry columns inside the Vue wrapper and feed flat-buffer attributes to stock deck.gl layers — no `@geoarrow/deck.gl-geoarrow` runtime dependency.

- `VLayerDeckglGeoArrowScatterplot` - Points from a GeoArrow point / multipoint column
- `VLayerDeckglGeoArrowPath` - Polylines from a GeoArrow linestring / multilinestring column
- `VLayerDeckglGeoArrowPolygon` - Filled + stroked polygons from a GeoArrow polygon / multipolygon column
- `VLayerDeckglGeoArrowSolidPolygon` - 3D extruded polygons (height-mapped choropleths, building footprints)
- `VLayerDeckglGeoArrowText` - Text labels at GeoArrow point positions
- `VLayerDeckglGeoArrowTrips` - Animated trips along GeoArrow linestrings with per-vertex timestamps

**Wind Visualization** (requires `maplibre-gl-wind`)

- `VLayerWindParticle` - Animated wind particle flow with speed-based color ramps

> The wind-data helpers (`createWindDataFromOpenWeatherMap`, `generateWindTexture`, `WindParticleLayer`, `windUniforms`) are **not** re-exported from `@geoql/v-maplibre`. Import them directly from `maplibre-gl-wind`:
>
> ```ts
> import { createWindDataFromOpenWeatherMap } from 'maplibre-gl-wind';
> ```

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
  import { VMap, VLayerWindParticle } from '@geoql/v-maplibre';

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
    <VLayerWindParticle
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
    ></VLayerWindParticle>
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
pnpm install

# Build this package
pnpm --filter @geoql/v-maplibre run build

# Run tests
pnpm run test

# Watch mode
pnpm run dev:lib
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
