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
        {
          title: 'NYC Snow Plowing',
          description:
            '3D snow accumulation on NYC streets with DSNY data and falling snow.',
          href: '/examples/nyc-snow-plowing',
          icon: 'lucide:snowflake',
          badge: 'NYC',
        },
        {
          title: 'Weather Dashboard',
          description:
            'Global weather explorer with city search, live conditions, and 7-day forecasts from Open-Meteo.',
          href: '/examples/weather-dashboard',
          icon: 'lucide:cloud-sun-rain',
          badge: 'Live',
        },
        {
          title: 'Drone Flight',
          description:
            'Cinematic drone animation along uploaded GeoJSON paths with camera follow.',
          href: '/examples/drone-flight',
          icon: 'lucide:plane',
          badge: 'Animated',
        },
        {
          title: 'HHI Map',
          description:
            'US Vehicle Market Concentration (HHI) - Herfindahl-Hirschman Index census tract map.',
          href: '/examples/hhi-map',
          icon: 'lucide:car',
          badge: 'HHI',
        },
        {
          title: 'Home Price Explorer',
          description:
            'Interactive US home price bubble map at the ZIP code level with LocalView viewport-based re-bucketing.',
          href: '/examples/promap',
          icon: 'lucide:home',
          badge: 'ProMap',
        },
        {
          title: 'Real-Time Flood Monitoring',
          description:
            'Live flood severity, inundation maps, and gauge forecasts from Google Flood Forecasting API across 20+ countries.',
          href: '/examples/google-flood-forecasting',
          icon: 'lucide:waves',
          badge: 'Live',
        },
        {
          title: 'Flood Forecasting',
          description:
            'Global flood event visualization powered by GDACS and Google Groundsource across 150+ countries.',
          href: '/examples/flood-forecasting',
          icon: 'lucide:droplets',
          badge: 'GDACS',
        },
      ],
    },
    {
      id: 'defense',
      title: 'Defense & C4ISR',
      description:
        'Command, control, communications, computers, intelligence, surveillance, and reconnaissance',
      icon: 'lucide:shield',
      examples: [
        {
          title: 'Multi-Drone C2',
          description:
            'Command & Control dashboard tracking 4 drones and 2 UGVs with real-time telemetry.',
          href: '/examples/defense-drone-c2',
          icon: 'lucide:radar',
          badge: 'C2',
        },
        {
          title: '3D Battlefield Terrain',
          description:
            '3D terrain visualization with animated troop movement replay in Ladakh.',
          href: '/examples/defense-battlefield',
          icon: 'lucide:mountain',
          badge: '3D',
        },
        {
          title: 'Sensor Network & EW',
          description:
            'Distributed sensor network with pulsating detection radii and EW coverage zones.',
          href: '/examples/defense-sensor-network',
          icon: 'lucide:radio-tower',
          badge: 'EW',
        },
        {
          title: 'Convoy Tracker',
          description:
            'Military logistics convoy tracking with checkpoints, ETA, and cargo status.',
          href: '/examples/defense-convoy',
          icon: 'lucide:truck',
          badge: 'Logistics',
        },
        {
          title: 'Multi-Spectral Compare',
          description:
            'Swipe comparison of visual, thermal, and night-vision imagery bands.',
          href: '/examples/defense-spectral',
          icon: 'lucide:scan-eye',
          badge: 'ISR',
        },
        {
          title: 'Zone Planner',
          description:
            'Draw danger zones (minefields, restricted areas) with safe corridor planning.',
          href: '/examples/defense-zone-planner',
          icon: 'lucide:triangle-alert',
          badge: 'Planning',
        },
        {
          title: 'Troop Navigation',
          description:
            'Multi-waypoint infantry route planning with Valhalla pedestrian routing and elevation profile.',
          href: '/examples/defense-troop-nav',
          icon: 'lucide:footprints',
          badge: 'Routing',
        },
        {
          title: 'Artillery Range',
          description:
            'Place gun positions with range fan arc polygons for howitzer, mortar, and MLRS.',
          href: '/examples/defense-artillery',
          icon: 'lucide:target',
          badge: 'Fire Control',
        },
        {
          title: 'Comms Network',
          description:
            'Tactical communication nodes with signal strength links and network simulation.',
          href: '/examples/defense-comms',
          icon: 'lucide:radio',
          badge: 'C4',
        },
        {
          title: 'Border Surveillance',
          description:
            'LAC border monitoring with camera coverage cones, patrol routes, and intrusion detection.',
          href: '/examples/defense-border-surveillance',
          icon: 'lucide:scan-line',
          badge: 'ISR',
        },
        {
          title: 'Air Defense Radar',
          description:
            'Layered SHORAD/MRSAM/LRSAM radar coverage with sweep animation and altitude filtering.',
          href: '/examples/defense-air-defense',
          icon: 'lucide:radar',
          badge: 'AD',
        },
        {
          title: 'SAR Grid',
          description:
            'Search & rescue sector grid with probability zones and helicopter sweep paths.',
          href: '/examples/defense-sar',
          icon: 'lucide:grid-3x3',
          badge: 'SAR',
        },
        {
          title: 'Terrain Viewshed',
          description:
            'Click to place observers and compute simulated line-of-sight visibility polygons.',
          href: '/examples/defense-viewshed',
          icon: 'lucide:eye',
          badge: 'Recon',
        },
        {
          title: 'NBC Plume',
          description:
            'Wind-driven nuclear/chemical hazard plume dispersion with concentric danger zones.',
          href: '/examples/defense-nbc-plume',
          icon: 'lucide:biohazard',
          badge: 'NBC',
        },
        {
          title: 'Maritime Domain',
          description:
            'Indian Navy coastal surveillance with ship tracking, EEZ boundary, and coastal radar.',
          href: '/examples/defense-maritime',
          icon: 'lucide:anchor',
          badge: 'Navy',
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
        {
          title: 'Globe Day/Night',
          description:
            'Real-time sun tracking based on your location and current time.',
          href: '/examples/globe-day-night',
          icon: 'lucide:sun-moon',
          badge: 'Live',
        },
        {
          title: 'Globe Atmosphere',
          description:
            'Interactive dawn, day, dusk, and night atmosphere mode selector.',
          href: '/examples/globe-atmosphere',
          icon: 'lucide:sunrise',
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
        {
          title: 'Map Compare',
          description:
            'Swipe-style comparison control to view two map styles side by side.',
          href: '/examples/maplibre-compare',
          icon: 'lucide:columns-2',
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
          title: 'RGB GeoTIFF (COG)',
          description:
            'GPU-accelerated true-color Sentinel-2 imagery from a Cloud-Optimized GeoTIFF.',
          href: '/examples/deckgl-cog',
          icon: 'lucide:satellite',
          badge: 'Sentinel-2',
        },
        {
          title: 'Land Cover COG',
          description:
            'NLCD land use classification with automatic categorical colormap.',
          href: '/examples/deckgl-landcover',
          icon: 'lucide:trees',
          badge: 'NLCD',
        },
        {
          title: 'NAIP Mosaic',
          description:
            'Client-side mosaic of NAIP aerial imagery COGs sourced from Microsoft Planetary Computer.',
          href: '/examples/deckgl-naip-mosaic',
          icon: 'lucide:satellite-dish',
          badge: 'STAC',
        },
        {
          title: 'Before / After Comparison',
          description:
            'Swipe between two timestamps of Vermont state imagery (2018 vs 2024) using paired COG layers.',
          href: '/examples/deckgl-comparison',
          icon: 'lucide:scan',
          badge: 'A / B',
        },
        {
          title: 'Sentinel-2 Multi-Band',
          description:
            'Sentinel-2 multi-band compositing from separate COGs at different native resolutions. True Color, False Color, and SWIR presets rendered entirely client-side.',
          href: '/examples/deckgl-sentinel2',
          icon: 'lucide:satellite',
          badge: 'MultiCOG',
        },
        {
          title: 'ECMWF GeoZarr',
          description:
            'ECMWF Open Data temperature GeoZarr rendered with deck.gl-raster ZarrLayer + zarrita. Single time slice with grayscale rescale.',
          href: '/examples/deckgl-zarr-ecmwf',
          icon: 'lucide:cloud',
          badge: 'Zarr',
        },
        {
          title: 'AEF Mosaic',
          description:
            'Annual Earth Foundation embedding mosaic via VLayerDeckglZarr. Int8 quantized embeddings dequantized + RGB-mapped across 9 annual snapshots (2017–2025).',
          href: '/examples/deckgl-aef-mosaic',
          icon: 'lucide:layers',
          badge: 'Zarr Mosaic',
        },
      ],
    },
    {
      id: 'geoarrow',
      title: 'GeoArrow / Apache Arrow',
      description:
        'Native Arrow IPC rendering with deck.gl-geoarrow — Point, LineString, Polygon, MultiPolygon, Text, Trips',
      icon: 'lucide:network',
      examples: [
        {
          title: 'GeoArrow Polygons',
          description:
            'Natural Earth countries from a GeoArrow IPC file. Toggle 3D extrusion to switch between Polygon and SolidPolygon wrappers.',
          href: '/examples/deckgl-geoarrow',
          icon: 'lucide:map',
          badge: 'Arrow IPC',
        },
        {
          title: 'GeoArrow Points',
          description:
            'City clusters as a MultiPoint geometry. Each point rendered directly from Arrow struct<x,y> coordinates.',
          href: '/examples/deckgl-geoarrow-scatterplot',
          icon: 'lucide:scatter-chart',
          badge: 'Scatterplot',
        },
        {
          title: 'GeoArrow Multipoint',
          description:
            'Individual cities as explicit Multipoint features from a GeoArrow IPC file.',
          href: '/examples/deckgl-geoarrow-multipoint',
          icon: 'lucide:dot',
          badge: 'MultiPoint',
        },
        {
          title: 'GeoArrow LineStrings',
          description:
            'Famous travel routes as LineString geometries. Flat coordinate arrays encoded in Arrow IPC format.',
          href: '/examples/deckgl-geoarrow-path',
          icon: 'lucide:route',
          badge: 'LineString',
        },
        {
          title: 'GeoArrow NYC Polygons',
          description:
            'NYC borough outlines as MultiPolygon geometry. Demonstrates multiple disjoint polygon shapes in one layer.',
          href: '/examples/deckgl-geoarrow-polygon-nyc',
          icon: 'lucide:hexagon',
          badge: 'MultiPolygon',
        },
        {
          title: 'GeoArrow Text Labels',
          description:
            'City name labels from a GeoArrow table with a Point geometry column and a text name column.',
          href: '/examples/deckgl-geoarrow-text',
          icon: 'lucide:type',
          badge: 'TextLayer',
        },
        {
          title: 'GeoArrow Trips',
          description:
            'Animated travel paths with timestamps. Demonstrates the TripsLayer using Arrow list<int64> timestamps.',
          href: '/examples/deckgl-geoarrow-triplines',
          icon: 'lucide:clock',
          badge: 'TripsLayer',
        },
        {
          title: 'All Geometry Types',
          description:
            'Point, LineString, and Polygon in a single view — three GeoArrow IPC files rendered together.',
          href: '/examples/deckgl-geoarrow-mixed',
          icon: 'lucide:layers',
          badge: 'Combined',
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
