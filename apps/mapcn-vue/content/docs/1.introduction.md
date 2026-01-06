---
title: Introduction
description: Beautiful map components for Vue. Built on @geoql/v-maplibre, styled with Tailwind CSS, works with shadcn-vue.
---

# Introduction

mapcn-vue is a collection of beautifully designed map components that you can copy and paste into your apps. Built on top of [@geoql/v-maplibre](https://github.com/geoql/v-maplibre), styled with Tailwind CSS, and designed to work seamlessly with [shadcn-vue](https://shadcn-vue.com).

## Why mapcn-vue?

- **Copy & Paste** - Add components to your project with a single CLI command
- **Theme Aware** - Dark mode support with automatic basemap switching
- **TypeScript First** - Full type safety with excellent IDE support
- **deck.gl Integration** - High-performance WebGL visualization layers
- **Composable** - Mix and match components as needed

## Features

### Core Components

- **Map** - Theme-aware map container with CARTO basemaps
- **MapMarker** - Interactive markers with custom content
- **MapPopup** - Popups and tooltips
- **MapControls** - Navigation, scale, and fullscreen controls

### MapLibre Layers

- GeoJSON, Vector, Raster layers
- Cluster layer for large point datasets
- PMTiles support for efficient tile storage
- Image, Video, and Canvas layers

### deck.gl Layers

High-performance WebGL visualization layers:

- **Core**: Scatterplot, Arc, Line, Path, Polygon, Icon, Text
- **Aggregation**: Heatmap, Hexagon, Grid, Contour
- **Geo**: Trips, MVT, Tile, Terrain, H3
- **Mesh**: SimpleMesh, Scenegraph (glTF/GLB)

## Credits

Built with:

- [MapLibre GL JS](https://maplibre.org/) - Open-source map rendering
- [deck.gl](https://deck.gl/) - Large-scale data visualization
- [@geoql/v-maplibre](https://github.com/geoql/v-maplibre) - Vue 3 components for MapLibre
- [shadcn-vue](https://shadcn-vue.com) - Component architecture inspiration
