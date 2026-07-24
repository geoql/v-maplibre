# Install a mapcn-vue map component

mapcn-vue is a shadcn-vue compatible registry of theme-aware Vue 3 map
components built on MapLibre GL, deck.gl, and LiDAR. Components are installed
with the shadcn-vue CLI — you copy the source into your project and own the
code, no black-box package.

## Install

```bash
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/<component-name>.json
```

Example:

```bash
npx shadcn-vue@latest add https://mapcn-vue.geoql.in/r/map.json
```

## Available components

The registry ships nine items:

- `map` — theme-aware MapLibre map with controls, markers, and popups.
- `map-layers` — MapLibre native layers (GeoJSON, Vector, Raster, Cluster, PMTiles, Image, Video, Canvas, Route).
- `map-deckgl-core` — deck.gl core layers (Scatterplot, Arc, Line, Path, Polygon, GeoJSON, Icon, Text, Column, Bitmap, PointCloud).
- `map-deckgl-aggregation` — deck.gl aggregation layers (Heatmap, Hexagon, Grid, Contour, ScreenGrid).
- `map-deckgl-geo` — deck.gl geo layers (Trips, MVT, Tile, Tile3D, Terrain, H3, GreatCircle, WMS, S2, Geohash, Quadkey).
- `map-deckgl-mesh` — deck.gl 3D mesh layers (SimpleMesh, Scenegraph).
- `map-deckgl-raster` — Cloud-Optimized GeoTIFF (COG) visualization.
- `map-deckgl-wind` — animated wind particle flow visualization.
- `map-control-lidar` — LiDAR point cloud viewer (LAS/LAZ/COPC).

## Discover component names

- Registry index (JSON): `GET https://mapcn-vue.geoql.in/r/registry.json` —
  every item with `name`, `title`, `description`.
- Per-component payload: `GET https://mapcn-vue.geoql.in/r/<name>.json` — full
  Vue source in `files[].content`, npm deps in `dependencies`.
- Docs: https://mapcn-vue.geoql.in/docs/components

## Requirements

The target project needs Vue 3 + Tailwind CSS v4, with shadcn-vue initialized
(`npx shadcn-vue@latest init`), plus `@geoql/v-maplibre` and `maplibre-gl`. The
CLI installs npm dependencies automatically; deck.gl and LiDAR layers pull
their optional peers from the matching `@geoql/v-maplibre` subpath.
