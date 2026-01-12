<script setup lang="ts">
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';
  import { MaplibreInterpolateHeatmapLayer } from 'maplibre-gl-interpolate-heatmap';
  import type { Map, CustomLayerInterface } from 'maplibre-gl';

  useSeoMeta({
    title: 'Interpolate Heatmap - mapcn-vue Examples',
    description:
      'IDW interpolated heatmap showing weighted average values, not density.',
  });

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `interpolate-heatmap-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
  }));

  // Sample temperature data points around the world
  const temperatureData = [
    // Europe
    { lat: 48.85, lon: 2.35, val: 18 }, // Paris
    { lat: 51.51, lon: -0.13, val: 15 }, // London
    { lat: 52.52, lon: 13.41, val: 14 }, // Berlin
    { lat: 41.9, lon: 12.5, val: 24 }, // Rome
    { lat: 40.42, lon: -3.7, val: 26 }, // Madrid
    { lat: 59.33, lon: 18.07, val: 10 }, // Stockholm
    { lat: 55.68, lon: 12.57, val: 12 }, // Copenhagen
    { lat: 60.17, lon: 24.94, val: 8 }, // Helsinki
    // North America
    { lat: 40.71, lon: -74.01, val: 22 }, // New York
    { lat: 34.05, lon: -118.24, val: 28 }, // Los Angeles
    { lat: 41.88, lon: -87.63, val: 20 }, // Chicago
    { lat: 29.76, lon: -95.37, val: 32 }, // Houston
    { lat: 33.45, lon: -112.07, val: 35 }, // Phoenix
    { lat: 47.61, lon: -122.33, val: 16 }, // Seattle
    { lat: 45.5, lon: -73.57, val: 14 }, // Montreal
    { lat: 49.28, lon: -123.12, val: 14 }, // Vancouver
    // Asia
    { lat: 35.68, lon: 139.69, val: 22 }, // Tokyo
    { lat: 31.23, lon: 121.47, val: 24 }, // Shanghai
    { lat: 39.9, lon: 116.41, val: 20 }, // Beijing
    { lat: 22.32, lon: 114.17, val: 30 }, // Hong Kong
    { lat: 1.35, lon: 103.82, val: 32 }, // Singapore
    { lat: 13.76, lon: 100.5, val: 34 }, // Bangkok
    { lat: 28.61, lon: 77.23, val: 36 }, // Delhi
    { lat: 19.08, lon: 72.88, val: 32 }, // Mumbai
    // South America
    { lat: -23.55, lon: -46.63, val: 26 }, // Sao Paulo
    { lat: -34.6, lon: -58.38, val: 22 }, // Buenos Aires
    { lat: -33.45, lon: -70.67, val: 18 }, // Santiago
    { lat: 4.71, lon: -74.07, val: 16 }, // Bogota
    { lat: -12.05, lon: -77.04, val: 20 }, // Lima
    // Africa
    { lat: 30.04, lon: 31.24, val: 30 }, // Cairo
    { lat: -33.93, lon: 18.42, val: 20 }, // Cape Town
    { lat: -1.29, lon: 36.82, val: 24 }, // Nairobi
    { lat: 33.59, lon: -7.62, val: 24 }, // Casablanca
    { lat: 6.52, lon: 3.38, val: 30 }, // Lagos
    // Oceania
    { lat: -33.87, lon: 151.21, val: 22 }, // Sydney
    { lat: -37.81, lon: 144.96, val: 18 }, // Melbourne
    { lat: -36.85, lon: 174.76, val: 16 }, // Auckland
  ];

  let heatmapLayer: MaplibreInterpolateHeatmapLayer | null = null;

  const onMapLoaded = (map: Map) => {
    heatmapLayer = new MaplibreInterpolateHeatmapLayer({
      id: 'interpolate-temperature',
      data: temperatureData,
      opacity: 0.6,
      minValue: 5,
      maxValue: 40,
      p: 3,
      framebufferFactor: 0.3,
    });

    // Cast required due to MapLibre v5 render signature changes
    map.addLayer(heatmapLayer as unknown as CustomLayerInterface);
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VControlNavigation } from '@geoql/v-maplibre';
import { MaplibreInterpolateHeatmapLayer } from 'maplibre-gl-interpolate-heatmap';
import type { Map } from 'maplibre-gl';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [0, 30],
  zoom: 1.5,
};

// Temperature data: { lat, lon, val }
const temperatureData = [
  { lat: 48.85, lon: 2.35, val: 18 },   // Paris
  { lat: 51.51, lon: -0.13, val: 15 },  // London
  { lat: 35.68, lon: 139.69, val: 22 }, // Tokyo
  { lat: 40.71, lon: -74.01, val: 22 }, // New York
  // ... more cities
];

const onMapLoaded = (map: Map) => {
  const layer = new MaplibreInterpolateHeatmapLayer({
    id: 'temperature',
    data: temperatureData,
    opacity: 0.6,
    minValue: 5,   // Blue color
    maxValue: 40,  // Red color
    p: 3,          // IDW power parameter
  });
  map.addLayer(layer);
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg" @loaded="onMapLoaded">
    <VControlNavigation position="top-right" />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10 overflow-x-hidden">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4"></Icon>
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Interpolate Heatmap
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          IDW (Inverse Distance Weighting) interpolated heatmap showing weighted
          average values across the map — unlike density heatmaps that show
          point concentration.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap
              :key="mapStyle"
              :options="mapOptions"
              class="h-full w-full"
              @loaded="onMapLoaded"
            >
              <VControlNavigation position="top-right"></VControlNavigation>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="InterpolateHeatmap.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 space-y-4">
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Density vs Interpolated:</strong> MapLibre's built-in
            heatmap shows point <em>density</em> (how many points are nearby).
            This interpolated heatmap calculates the
            <em>weighted average</em> of values using Inverse Distance Weighting
            (IDW) — perfect for temperature maps, pollution levels, or any
            continuous value visualization.
          </p>
        </div>
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Library:</strong>
            <a
              href="https://github.com/geoql/maplibre-gl-interpolate-heatmap"
              target="_blank"
              class="text-primary hover:underline"
              >maplibre-gl-interpolate-heatmap</a
            >
            — A GeoQL library for rendering IDW interpolated heatmaps with WebGL
            shaders. Blue represents low values ({{ 5 }}°), red represents high
            values ({{ 40 }}°).
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
