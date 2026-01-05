# mapcn-vue

> Beautiful map components for Vue - shadcn-vue style

Copy-paste map components built on [@geoql/v-maplibre](https://github.com/geoql/v-maplibre). Styled with Tailwind CSS, works with [shadcn-vue](https://shadcn-vue.com).

## Installation

Use the shadcn-vue CLI to add components to your project:

```bash
# Add the base map component
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map

# Add layer components
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map-layers

# Add deck.gl visualization layers
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map-deckgl-core
```

### Dependencies

The components require these peer dependencies:

```bash
bun add @geoql/v-maplibre maplibre-gl @vueuse/core
```

## Available Components

### map

Core map components with dark mode support.

- `Map` - Theme-aware MapLibre map
- `MapMarker` - Interactive markers
- `MapPopup` - Styled popups
- `MapControls` - Navigation, scale, geolocate, fullscreen

### map-layers

MapLibre native layer components.

- `MapLayerGeojson` - GeoJSON data
- `MapLayerVector` - Vector tiles
- `MapLayerRaster` - Raster tiles
- `MapLayerCluster` - Clustered points
- `MapLayerPmtiles` - PMTiles
- `MapLayerImage` - Georeferenced images
- `MapLayerVideo` - Video overlays
- `MapLayerCanvas` - Custom canvas

### map-deckgl-core

High-performance deck.gl visualization layers.

- `MapLayerScatterplot` - Points/circles
- `MapLayerArc` - Origin-destination arcs
- `MapLayerLine` - Flat lines
- `MapLayerPath` - Polylines/routes
- `MapLayerPolygon` - Filled polygons
- `MapLayerGeojson` - GeoJSON features
- `MapLayerIcon` - Custom icons
- `MapLayerText` - Text labels
- `MapLayerColumn` - 3D columns
- `MapLayerBitmap` - Bitmap images

### map-deckgl-aggregation

Data aggregation layers.

- `MapLayerHeatmap` - Density heatmaps
- `MapLayerHexagon` - Hexagonal binning
- `MapLayerGrid` - Square grid
- `MapLayerContour` - Contour lines
- `MapLayerScreenGrid` - Screen-space grid

### map-deckgl-geo

Geospatial layers.

- `MapLayerTrips` - Animated paths
- `MapLayerMVT` - Mapbox Vector Tiles
- `MapLayerTile` - Generic tiles
- `MapLayerTile3D` - 3D Tiles (Cesium)
- `MapLayerTerrain` - Terrain mesh
- `MapLayerH3Hexagon` - H3 hexagons
- `MapLayerGreatCircle` - Great circle arcs

### map-deckgl-mesh

3D mesh layers.

- `MapLayerSimpleMesh` - 3D meshes
- `MapLayerScenegraph` - glTF/GLB models

## Usage Example

```vue
<script setup lang="ts">
  import Map from '@/components/ui/map/Map.vue';
  import MapMarker from '@/components/ui/map/MapMarker.vue';
  import MapControls from '@/components/ui/map/MapControls.vue';
</script>

<template>
  <Map :center="[-74.006, 40.7128]" :zoom="12" class="h-[500px] rounded-lg">
    <MapControls show-navigation show-scale></MapControls>
    <MapMarker :lng-lat="[-74.006, 40.7128]"></MapMarker>
  </Map>
</template>
```

## Dark Mode

Components automatically switch between light and dark basemaps based on your app's color mode. Override with the `styles` prop:

```vue
<Map
  :styles="{
    light: 'https://your-light-style.json',
    dark: 'https://your-dark-style.json',
  }"
></Map>
```

## License

MIT
