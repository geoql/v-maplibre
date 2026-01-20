import type { ExampleCategory } from '~/types/examples';

export function useExamplesData() {
  const categories: ExampleCategory[] = [
    {
      id: 'core',
      title: 'MapLibre Core',
      description: 'Essential map components and interactions',
      icon: 'lucide:map',
      examples: [
        {
          title: 'Basic Map',
          description:
            'A simple map with navigation controls and dark mode support.',
          href: '/examples/basic',
          icon: 'lucide:map',
        },
        {
          title: 'Markers & Popups',
          description:
            'Interactive markers with customizable popup information.',
          href: '/examples/markers',
          icon: 'lucide:map-pin',
        },
        {
          title: 'GeoJSON Layer',
          description: 'Render GeoJSON data with styling and interactivity.',
          href: '/examples/geojson',
          icon: 'lucide:shapes',
        },
        {
          title: 'Clustered Points',
          description:
            'Cluster large datasets of points for better performance.',
          href: '/examples/cluster',
          icon: 'lucide:circle-dot',
        },
        {
          title: 'Raster Layer',
          description: 'Display raster tile layers from tile servers.',
          href: '/examples/maplibre-raster',
          icon: 'lucide:image',
        },
        {
          title: 'Image Overlay',
          description: 'Overlay georeferenced images on the map.',
          href: '/examples/maplibre-image',
          icon: 'lucide:image-plus',
        },
        {
          title: 'Video Overlay',
          description: 'Overlay georeferenced video on the map.',
          href: '/examples/maplibre-video',
          icon: 'lucide:video',
          badge: 'Media',
        },
        {
          title: 'Interpolate Heatmap',
          description:
            'IDW interpolated heatmap showing weighted averages, not density.',
          href: '/examples/maplibre-interpolate-heatmap',
          icon: 'lucide:thermometer',
          badge: 'IDW',
        },
        {
          title: 'Delivery Tracking',
          description:
            'Real-time delivery route visualization with labeled markers.',
          href: '/examples/maplibre-route',
          icon: 'lucide:truck',
          badge: 'New',
        },
      ],
    },
    {
      id: 'weather',
      title: 'Weather & Environmental',
      description: 'Meteorological and environmental data visualizations',
      icon: 'lucide:cloud',
      examples: [
        {
          title: 'Wind Animation',
          description:
            'Animated wind particle visualization like Windy.com using GFS data.',
          href: '/examples/wind',
          icon: 'lucide:wind',
          badge: 'Animated',
        },
      ],
    },
    {
      id: 'deckgl-core',
      title: 'deck.gl Core Layers',
      description: 'Fundamental visualization primitives',
      icon: 'lucide:layers',
      examples: [
        {
          title: 'Scatterplot',
          description: 'High-performance scatterplot with millions of points.',
          href: '/examples/deckgl-scatterplot',
          icon: 'lucide:scatter-chart',
          badge: 'Popular',
        },
        {
          title: 'Arc Layer',
          description: 'Origin-destination arc visualization for flow data.',
          href: '/examples/deckgl-arc',
          icon: 'lucide:spline',
        },
        {
          title: 'Line Layer',
          description: 'Simple line segments between point pairs.',
          href: '/examples/deckgl-line',
          icon: 'lucide:minus',
        },
        {
          title: 'Path Layer',
          description: 'Styled polyline paths with width and color.',
          href: '/examples/deckgl-path',
          icon: 'lucide:git-branch',
        },
        {
          title: 'Polygon Layer',
          description: 'Filled and stroked polygon rendering.',
          href: '/examples/deckgl-polygon',
          icon: 'lucide:pentagon',
        },
        {
          title: 'GeoJSON Layer',
          description: 'Render GeoJSON with automatic layer detection.',
          href: '/examples/deckgl-geojson',
          icon: 'lucide:file-json',
        },
        {
          title: 'Column Layer',
          description: '3D columns for categorical or quantitative data.',
          href: '/examples/deckgl-column',
          icon: 'lucide:bar-chart-3',
        },
        {
          title: 'Icon Layer',
          description: 'Custom icons and symbols at point locations.',
          href: '/examples/deckgl-icon',
          icon: 'lucide:image',
        },
        {
          title: 'Text Layer',
          description: 'Text labels with collision detection.',
          href: '/examples/deckgl-text',
          icon: 'lucide:type',
        },
      ],
    },
    {
      id: 'deckgl-aggregation',
      title: 'deck.gl Aggregation',
      description: 'Aggregate and bin large datasets',
      icon: 'lucide:bar-chart-2',
      examples: [
        {
          title: 'Heatmap',
          description: 'Density heatmap visualization for point data.',
          href: '/examples/deckgl-heatmap',
          icon: 'lucide:flame',
          badge: 'Popular',
        },
        {
          title: 'Hexagon Layer',
          description: '3D hexagonal binning for aggregated visualization.',
          href: '/examples/deckgl-hexagon',
          icon: 'lucide:hexagon',
        },
        {
          title: 'Grid Layer',
          description: 'Grid-based aggregation with elevation support.',
          href: '/examples/deckgl-grid',
          icon: 'lucide:grid-3x3',
        },
        {
          title: 'Screen Grid',
          description: 'Screen-space grid aggregation for dense data.',
          href: '/examples/deckgl-screengrid',
          icon: 'lucide:layout-grid',
        },
        {
          title: 'Contour Layer',
          description: 'Contour lines for continuous data visualization.',
          href: '/examples/deckgl-contour',
          icon: 'lucide:mountain',
        },
        {
          title: 'H3 Hexagons',
          description: 'Uber H3 hexagonal hierarchical spatial index.',
          href: '/examples/deckgl-h3',
          icon: 'lucide:hexagon',
          badge: 'Advanced',
        },
      ],
    },
    {
      id: 'deckgl-geo',
      title: 'deck.gl Geo Layers',
      description: 'Geographic and animated visualizations',
      icon: 'lucide:globe',
      examples: [
        {
          title: 'AC Transit Live',
          description:
            'Real-time bus tracking for Oakland/East Bay with historical trails.',
          href: '/examples/deckgl-actransit',
          icon: 'lucide:bus',
          badge: 'Live',
        },
        {
          title: 'Trips Animation',
          description: 'Animated path visualization for temporal data.',
          href: '/examples/deckgl-trips',
          icon: 'lucide:route',
          badge: 'Animated',
        },
        {
          title: 'Great Circle',
          description: "Geodesic arcs following Earth's curvature.",
          href: '/examples/deckgl-great-circle',
          icon: 'lucide:globe',
        },
        {
          title: 'Terrain Layer',
          description: '3D terrain visualization with elevation data.',
          href: '/examples/deckgl-terrain',
          icon: 'lucide:mountain-snow',
          badge: '3D',
        },
        {
          title: 'WMS Layer',
          description: 'Web Map Service integration for external map data.',
          href: '/examples/deckgl-wms',
          icon: 'lucide:layers-3',
        },
        {
          title: 'MVT Layer',
          description: 'Mapbox Vector Tiles for styled vector data.',
          href: '/examples/deckgl-mvt',
          icon: 'lucide:grid-2x2',
        },
        {
          title: 'Tile Layer',
          description: 'Generic tile loading for raster imagery.',
          href: '/examples/deckgl-tile',
          icon: 'lucide:square-stack',
        },
        {
          title: 'Bitmap Layer',
          description: 'Georeferenced image overlay rendering.',
          href: '/examples/deckgl-bitmap',
          icon: 'lucide:image',
        },
      ],
    },
    {
      id: 'deckgl-raster',
      title: 'deck.gl Raster',
      description: 'Cloud-Optimized GeoTIFF and satellite imagery',
      icon: 'lucide:satellite',
      examples: [
        {
          title: 'COG Layer',
          description: 'GPU-accelerated Cloud-Optimized GeoTIFF visualization.',
          href: '/examples/deckgl-cog',
          icon: 'lucide:satellite',
          badge: 'Sentinel-2',
        },
        {
          title: 'Land Cover COG',
          description: 'NLCD land use classification with automatic colormap.',
          href: '/examples/deckgl-landcover',
          icon: 'lucide:trees',
          badge: 'NLCD',
        },
        {
          title: 'NAIP Imagery',
          description:
            'STAC API integration with dynamic COG loading from Planetary Computer.',
          href: '/examples/deckgl-naip-mosaic',
          icon: 'lucide:satellite-dish',
          badge: 'STAC',
        },
      ],
    },
    {
      id: 'deckgl-tiles',
      title: 'deck.gl Tile Systems',
      description: 'Spatial indexing with H3, S2, Geohash, and more',
      icon: 'lucide:grid-3x3',
      examples: [
        {
          title: 'Geohash Layer',
          description: 'Visualize data using Geohash spatial indexing.',
          href: '/examples/deckgl-geohash',
          icon: 'lucide:hash',
        },
        {
          title: 'Quadkey Layer',
          description: 'Bing Maps Quadkey tile visualization.',
          href: '/examples/deckgl-quadkey',
          icon: 'lucide:square-code',
        },
        {
          title: 'S2 Layer',
          description: 'Google S2 geometry spherical cells.',
          href: '/examples/deckgl-s2',
          icon: 'lucide:globe-2',
        },
        {
          title: 'H3 Cluster',
          description: 'Clustered H3 hexagon regions.',
          href: '/examples/deckgl-h3-cluster',
          icon: 'lucide:hexagon',
        },
        {
          title: 'Grid Cell',
          description: 'Pre-aggregated grid cell visualization.',
          href: '/examples/deckgl-grid-cell',
          icon: 'lucide:layout-grid',
        },
      ],
    },
    {
      id: 'deckgl-3d',
      title: 'deck.gl 3D Layers',
      description: '3D models, point clouds, and mesh rendering',
      icon: 'lucide:box',
      examples: [
        {
          title: 'Scenegraph',
          description: 'glTF/GLB 3D model rendering.',
          href: '/examples/deckgl-scenegraph',
          icon: 'lucide:plane',
          badge: '3D',
        },
        {
          title: 'Simple Mesh',
          description: 'Instanced 3D mesh objects on the map.',
          href: '/examples/deckgl-simple-mesh',
          icon: 'lucide:box',
          badge: '3D',
        },
        {
          title: 'Point Cloud',
          description: 'LiDAR and photogrammetry point clouds.',
          href: '/examples/deckgl-point-cloud',
          icon: 'lucide:cloud',
          badge: '3D',
        },

        {
          title: 'Solid Polygon',
          description: '3D extruded solid polygon buildings.',
          href: '/examples/deckgl-solid-polygon',
          icon: 'lucide:building-2',
          badge: '3D',
        },
      ],
    },
    {
      id: 'lidar',
      title: 'LiDAR Point Clouds',
      description: 'LAS/LAZ/COPC/EPT point cloud visualization with streaming',
      icon: 'lucide:radar',
      examples: [
        {
          title: 'COPC Streaming',
          description:
            'Cloud-Optimized Point Cloud with dynamic viewport-based loading.',
          href: '/examples/lidar-copc',
          icon: 'lucide:cloud',
          badge: 'Streaming',
        },
        {
          title: 'EPT Streaming',
          description:
            'Entwine Point Tile datasets with viewport-based streaming.',
          href: '/examples/lidar-ept',
          icon: 'lucide:database',
          badge: 'EPT',
        },
        {
          title: 'Classification Filter',
          description:
            'Filter point clouds by ASPRS classification (ground, buildings, vegetation).',
          href: '/examples/lidar-classification',
          icon: 'lucide:filter',
          badge: 'Filter',
        },
        {
          title: 'Multiple Point Clouds',
          description: 'Load and manage multiple point cloud datasets.',
          href: '/examples/lidar-multiple',
          icon: 'lucide:layers',
        },
      ],
    },
  ];

  const totalExamples = computed(() =>
    categories.reduce((sum, cat) => sum + cat.examples.length, 0),
  );

  return {
    categories,
    totalExamples,
  };
}
