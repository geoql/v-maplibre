import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REGISTRY_BASE_URL = 'https://mapcn-vue.geoql.in';
const REGISTRY_PATH = resolve(
  process.cwd(),
  '../../packages/mapcn-vue/src/registry/ui',
);

interface RegistryFile {
  path: string;
  type: string;
  content?: string;
  target?: string;
}

interface RegistryItem {
  $schema: string;
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

const registry: Record<string, RegistryItem> = {
  map: {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'map',
    type: 'registry:ui',
    title: 'Map',
    description:
      'A theme-aware MapLibre map component with built-in controls, markers, and popups.',
    dependencies: ['@geoql/v-maplibre', 'maplibre-gl', '@vueuse/core'],
    files: [
      {
        path: 'map/Map.vue',
        type: 'registry:ui',
        target: 'components/ui/map/Map.vue',
      },
      {
        path: 'map/MapMarker.vue',
        type: 'registry:ui',
        target: 'components/ui/map/MapMarker.vue',
      },
      {
        path: 'map/MapPopup.vue',
        type: 'registry:ui',
        target: 'components/ui/map/MapPopup.vue',
      },
      {
        path: 'map/MapControls.vue',
        type: 'registry:ui',
        target: 'components/ui/map/MapControls.vue',
      },
      {
        path: 'map/index.ts',
        type: 'registry:ui',
        target: 'components/ui/map/index.ts',
      },
    ],
  },
  'map-layers': {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'map-layers',
    type: 'registry:ui',
    title: 'Map Layers',
    description:
      'MapLibre native layer components: GeoJSON, Vector, Raster, Cluster, PMTiles, Route.',
    dependencies: ['@geoql/v-maplibre', 'maplibre-gl'],
    registryDependencies: [`${REGISTRY_BASE_URL}/r/map.json`],
    files: [
      {
        path: 'map-layers/MapLayerGeojson.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerGeojson.vue',
      },
      {
        path: 'map-layers/MapLayerVector.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerVector.vue',
      },
      {
        path: 'map-layers/MapLayerRaster.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerRaster.vue',
      },
      {
        path: 'map-layers/MapLayerCluster.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerCluster.vue',
      },
      {
        path: 'map-layers/MapLayerPmtiles.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerPmtiles.vue',
      },
      {
        path: 'map-layers/MapLayerImage.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerImage.vue',
      },
      {
        path: 'map-layers/MapLayerVideo.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerVideo.vue',
      },
      {
        path: 'map-layers/MapLayerCanvas.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerCanvas.vue',
      },
      {
        path: 'map-layers/MapLayerRoute.vue',
        type: 'registry:ui',
        target: 'components/ui/map/layers/MapLayerRoute.vue',
      },
      {
        path: 'map-layers/index.ts',
        type: 'registry:ui',
        target: 'components/ui/map/layers/index.ts',
      },
    ],
  },
  'map-deckgl-core': {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'map-deckgl-core',
    type: 'registry:ui',
    title: 'deck.gl Core Layers',
    description:
      'High-performance visualization layers: Scatterplot, Arc, Line, Path, Polygon, GeoJSON, Icon, Text, Column, Bitmap.',
    dependencies: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/layers',
      '@deck.gl/mapbox',
    ],
    registryDependencies: [`${REGISTRY_BASE_URL}/r/map.json`],
    files: [
      {
        path: 'map-deckgl-core/MapLayerScatterplot.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerScatterplot.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerArc.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerArc.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerLine.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerLine.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerPath.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerPath.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerPolygon.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerPolygon.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerGeojson.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerGeojson.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerIcon.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerIcon.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerText.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerText.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerColumn.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerColumn.vue',
      },
      {
        path: 'map-deckgl-core/MapLayerBitmap.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerBitmap.vue',
      },
      {
        path: 'map-deckgl-core/index.ts',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/core/index.ts',
      },
    ],
  },
  'map-deckgl-aggregation': {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'map-deckgl-aggregation',
    type: 'registry:ui',
    title: 'deck.gl Aggregation Layers',
    description:
      'Data aggregation layers: Heatmap, Hexagon, Grid, Contour, ScreenGrid.',
    dependencies: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/aggregation-layers',
      '@deck.gl/mapbox',
    ],
    registryDependencies: [`${REGISTRY_BASE_URL}/r/map.json`],
    files: [
      {
        path: 'map-deckgl-aggregation/MapLayerHeatmap.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerHeatmap.vue',
      },
      {
        path: 'map-deckgl-aggregation/MapLayerHexagon.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerHexagon.vue',
      },
      {
        path: 'map-deckgl-aggregation/MapLayerGrid.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerGrid.vue',
      },
      {
        path: 'map-deckgl-aggregation/MapLayerContour.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerContour.vue',
      },
      {
        path: 'map-deckgl-aggregation/MapLayerScreenGrid.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerScreenGrid.vue',
      },
      {
        path: 'map-deckgl-aggregation/index.ts',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/aggregation/index.ts',
      },
    ],
  },
  'map-deckgl-geo': {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'map-deckgl-geo',
    type: 'registry:ui',
    title: 'deck.gl Geo Layers',
    description:
      'Geospatial layers: Trips, MVT, Tile, Tile3D, Terrain, H3, GreatCircle.',
    dependencies: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/geo-layers',
      '@deck.gl/mapbox',
    ],
    registryDependencies: [`${REGISTRY_BASE_URL}/r/map.json`],
    files: [
      {
        path: 'map-deckgl-geo/MapLayerTrips.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerTrips.vue',
      },
      {
        path: 'map-deckgl-geo/MapLayerMVT.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerMVT.vue',
      },
      {
        path: 'map-deckgl-geo/MapLayerTile.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerTile.vue',
      },
      {
        path: 'map-deckgl-geo/MapLayerTile3D.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerTile3D.vue',
      },
      {
        path: 'map-deckgl-geo/MapLayerTerrain.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerTerrain.vue',
      },
      {
        path: 'map-deckgl-geo/MapLayerH3Hexagon.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerH3Hexagon.vue',
      },
      {
        path: 'map-deckgl-geo/MapLayerGreatCircle.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerGreatCircle.vue',
      },
      {
        path: 'map-deckgl-geo/index.ts',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/geo/index.ts',
      },
    ],
  },
  'map-deckgl-mesh': {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'map-deckgl-mesh',
    type: 'registry:ui',
    title: 'deck.gl Mesh Layers',
    description: '3D mesh layers: SimpleMesh, Scenegraph (glTF/GLB models).',
    dependencies: [
      '@geoql/v-maplibre',
      'maplibre-gl',
      '@deck.gl/core',
      '@deck.gl/mesh-layers',
      '@deck.gl/mapbox',
    ],
    registryDependencies: [`${REGISTRY_BASE_URL}/r/map.json`],
    files: [
      {
        path: 'map-deckgl-mesh/MapLayerSimpleMesh.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerSimpleMesh.vue',
      },
      {
        path: 'map-deckgl-mesh/MapLayerScenegraph.vue',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/MapLayerScenegraph.vue',
      },
      {
        path: 'map-deckgl-mesh/index.ts',
        type: 'registry:ui',
        target: 'components/ui/map/deckgl/mesh/index.ts',
      },
    ],
  },
  'map-control-lidar': {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'map-control-lidar',
    type: 'registry:ui',
    title: 'LiDAR Control',
    description:
      'LiDAR point cloud visualization with LAS/LAZ/COPC support, dynamic streaming, classification filtering, and interactive controls.',
    dependencies: ['@geoql/v-maplibre', 'maplibre-gl', 'maplibre-gl-lidar'],
    registryDependencies: [`${REGISTRY_BASE_URL}/r/map.json`],
    files: [
      {
        path: 'map-control-lidar/MapControlLidar.vue',
        type: 'registry:ui',
        target: 'components/ui/map/controls/MapControlLidar.vue',
      },
      {
        path: 'map-control-lidar/index.ts',
        type: 'registry:ui',
        target: 'components/ui/map/controls/index.ts',
      },
    ],
  },
};

function readFileContent(relativePath: string): string {
  const fullPath = join(REGISTRY_PATH, relativePath);
  if (existsSync(fullPath)) {
    return readFileSync(fullPath, 'utf-8');
  }
  return '';
}

export default defineEventHandler((event) => {
  const rawName = getRouterParam(event, 'name');
  const name = rawName?.replace(/\.json$/, '');

  if (!name || !registry[name]) {
    throw createError({
      statusCode: 404,
      message: `Registry item "${name}" not found`,
    });
  }

  const item = registry[name];
  const filesWithContent = item.files.map((file) => ({
    ...file,
    content: readFileContent(file.path),
  }));

  return {
    ...item,
    files: filesWithContent,
  };
});
