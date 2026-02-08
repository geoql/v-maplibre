import type { ExampleCategory } from '~/types/examples';

export function useExamplesData() {
  const categories: ExampleCategory[] = [
    {
      id: 'featured',
      title: 'Featured Demos',
      description:
        'Real-time, animated, and impressive third-party integrations',
      icon: 'lucide:sparkles',
      examples: [
        {
          title: 'AC Transit Live',
          description:
            'Real-time GTFS-RT bus tracking for Oakland/East Bay with historical trails.',
          href: '/examples/deckgl-actransit',
          icon: 'lucide:bus',
          badge: 'Live',
        },
        {
          title: 'Isochrone Analysis',
          description:
            'Travel time zones showing reachable areas from any point.',
          href: '/examples/maplibre-isochrone',
          icon: 'lucide:timer',
          badge: 'Valhalla',
        },
        {
          title: 'COPC Streaming',
          description:
            'Cloud-Optimized Point Cloud with dynamic viewport-based streaming.',
          href: '/examples/lidar-copc',
          icon: 'lucide:radar',
          badge: 'Streaming',
        },
        {
          title: 'NAIP Mosaic',
          description:
            'Client-side satellite imagery from STAC API with no server required.',
          href: '/examples/deckgl-naip-mosaic',
          icon: 'lucide:satellite-dish',
          badge: 'STAC',
        },
        {
          title: 'Trip Planner',
          description: 'Multi-day itinerary generator with route optimization.',
          href: '/examples/valhalla-trip-planner',
          icon: 'lucide:calendar-days',
          badge: 'Valhalla',
        },
        {
          title: 'Interpolate Heatmap',
          description:
            'IDW interpolated temperature heatmap from OpenWeatherMap.',
          href: '/examples/maplibre-interpolate-heatmap',
          icon: 'lucide:thermometer',
          badge: 'IDW',
        },
      ],
    },
    {
      id: 'globe',
      title: 'Globe',
      description: 'Globe projection visualizations with starfield backgrounds',
      icon: 'lucide:globe',
      examples: [
        {
          title: 'Earthquake Globe',
          description:
            'Live 3D globe showing worldwide seismic activity from USGS.',
          href: '/examples/earthquake-globe',
          icon: 'lucide:activity',
          badge: 'USGS',
        },
      ],
    },
    {
      id: 'valhalla',
      title: 'Valhalla Routing',
      description: 'Turn-by-turn navigation, optimization, and travel analysis',
      icon: 'lucide:navigation',
      examples: [
        {
          title: 'Route Planning',
          description: 'A to B routing with turn-by-turn directions.',
          href: '/examples/valhalla-route-planning',
          icon: 'lucide:map-pin',
        },
        {
          title: 'Delivery Tracking',
          description: 'Live delivery simulation with ETA updates.',
          href: '/examples/valhalla-delivery-tracking',
          icon: 'lucide:truck',
          badge: 'Simulation',
        },
        {
          title: 'Multi-Stop Routes',
          description: 'Traveling salesman route optimization.',
          href: '/examples/valhalla-multi-stop',
          icon: 'lucide:waypoints',
        },
        {
          title: 'Trip Playback',
          description: 'Animated route replay with timeline scrubbing.',
          href: '/examples/valhalla-trip-playback',
          icon: 'lucide:play-circle',
          badge: 'Playback',
        },
      ],
    },
    {
      id: 'essentials',
      title: 'MapLibre Essentials',
      description: 'Foundation map components and interactions',
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
          title: 'FlyTo Animation',
          description:
            'Smooth camera animations with flyTo, easeTo, and jumpTo.',
          href: '/examples/maplibre-flyto',
          icon: 'lucide:navigation-2',
        },
        {
          title: 'Pitch & Bearing',
          description: 'Interactive sliders for 3D map tilt and rotation.',
          href: '/examples/maplibre-pitch-control',
          icon: 'lucide:rotate-3d',
          badge: '3D',
        },
        {
          title: 'Layer Switcher',
          description: 'Switch between different basemap styles dynamically.',
          href: '/examples/maplibre-layer-switcher',
          icon: 'lucide:layers',
        },
        {
          title: 'Layer Control',
          description:
            'Toggle layer visibility and opacity with VControlLayer.',
          href: '/examples/maplibre-layer-control',
          icon: 'lucide:sliders-horizontal',
        },
        {
          title: 'Interactive Legend',
          description: 'Click legend items to filter map features by category.',
          href: '/examples/maplibre-legend',
          icon: 'lucide:list',
          badge: 'New',
        },
      ],
    },
    {
      id: 'maplibre-layers',
      title: 'MapLibre Layers',
      description: 'Native MapLibre data visualization',
      icon: 'lucide:layers-2',
      examples: [
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
          title: 'Choropleth Map',
          description: 'Color-coded regions for thematic mapping.',
          href: '/examples/choropleth',
          icon: 'lucide:map',
        },
        {
          title: 'Proximity Map',
          description: 'Visualize distances and connections between locations.',
          href: '/examples/maplibre-proximity',
          icon: 'lucide:link',
        },
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
      id: 'satellite',
      title: 'Satellite & Raster',
      description: 'Cloud-Optimized GeoTIFF and Earth observation',
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
      ],
    },
    {
      id: 'lidar',
      title: 'LiDAR Point Clouds',
      description: 'LAS/LAZ/COPC/EPT streaming visualization',
      icon: 'lucide:radar',
      examples: [
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
            'Filter point clouds by ASPRS classification (ground, buildings).',
          href: '/examples/lidar-classification',
          icon: 'lucide:filter',
          badge: 'Filter',
        },
        {
          title: 'Multiple Sources',
          description: 'Load and manage multiple point cloud datasets.',
          href: '/examples/lidar-multiple',
          icon: 'lucide:layers',
        },
      ],
    },
    {
      id: 'deckgl-core',
      title: 'deck.gl Core',
      description: 'Fundamental visualization primitives',
      icon: 'lucide:shapes',
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
        {
          title: 'Trips Animation',
          description:
            'Animated path visualization for temporal trajectory data.',
          href: '/examples/deckgl-trips',
          icon: 'lucide:route',
          badge: 'Animated',
        },
      ],
    },
    {
      id: 'deckgl-aggregation',
      title: 'deck.gl Aggregation',
      description: 'Density and binning for large datasets',
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
      title: 'deck.gl Geographic',
      description: 'Geographic and tile-based layers',
      icon: 'lucide:globe',
      examples: [
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
      id: 'deckgl-spatial',
      title: 'deck.gl Spatial Indexing',
      description: 'H3, S2, Geohash, and tile systems',
      icon: 'lucide:grid-3x3',
      examples: [
        {
          title: 'H3 Cluster',
          description: 'Clustered H3 hexagon regions.',
          href: '/examples/deckgl-h3-cluster',
          icon: 'lucide:hexagon',
        },
        {
          title: 'S2 Layer',
          description: 'Google S2 geometry spherical cells.',
          href: '/examples/deckgl-s2',
          icon: 'lucide:globe-2',
        },
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
          title: 'Grid Cell',
          description: 'Pre-aggregated grid cell visualization.',
          href: '/examples/deckgl-grid-cell',
          icon: 'lucide:layout-grid',
        },
      ],
    },
    {
      id: 'deckgl-3d',
      title: 'deck.gl 3D',
      description: '3D models, meshes, and point clouds',
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
  ];

  const totalExamples = computed(() =>
    categories.reduce((sum, cat) => sum + cat.examples.length, 0),
  );

  return {
    categories,
    totalExamples,
  };
}
