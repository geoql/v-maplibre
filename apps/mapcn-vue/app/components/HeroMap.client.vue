<script setup lang="ts">
  import {
    VMap,
    VControlNavigation,
    VLayerMaplibreGeojson,
  } from '@geoql/v-maplibre';

  const colorMode = useColorMode();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: 'hero-map',
    style: mapStyle.value,
    center: [0, 20] as [number, number],
    zoom: 1.5,
  }));

  const pointsGeojson = {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [-74.006, 40.7128] },
        properties: { name: 'New York' },
      },
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [-0.1276, 51.5074] },
        properties: { name: 'London' },
      },
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [139.6917, 35.6895] },
        properties: { name: 'Tokyo' },
      },
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [72.8777, 19.076] },
        properties: { name: 'Mumbai' },
      },
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [151.2093, -33.8688] },
        properties: { name: 'Sydney' },
      },
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [-43.1729, -22.9068] },
        properties: { name: 'Rio de Janeiro' },
      },
    ],
  };

  const circleLayer = {
    id: 'hero-points',
    type: 'circle' as const,
    source: 'hero-points',
    paint: {
      'circle-radius': 8,
      'circle-color': colorMode.value === 'dark' ? '#818cf8' : '#6366f1',
      'circle-stroke-width': 2,
      'circle-stroke-color': colorMode.value === 'dark' ? '#1e1b4b' : '#ffffff',
    },
  };
</script>

<template>
  <div class="map-container h-125">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <VControlNavigation position="top-right"></VControlNavigation>
      <VLayerMaplibreGeojson
        source-id="hero-points"
        layer-id="hero-points"
        :source="{ type: 'geojson', data: pointsGeojson }"
        :layer="circleLayer"
      ></VLayerMaplibreGeojson>
    </VMap>
  </div>
</template>

<style>
  #hero-map {
    height: 500px;
  }
</style>
