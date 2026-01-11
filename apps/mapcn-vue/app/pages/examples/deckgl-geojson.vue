<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeojson,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'GeoJSON Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render GeoJSON data with deck.gl for high performance.',
  });

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `deckgl-geojson-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 11,
    pitch: 45,
  }));

  // Sample GeoJSON data
  const geojsonData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Zone A', height: 500, color: [255, 140, 0] },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-122.45, 37.78],
              [-122.43, 37.8],
              [-122.41, 37.79],
              [-122.42, 37.77],
              [-122.45, 37.78],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: { name: 'Zone B', height: 800, color: [0, 200, 150] },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-122.4, 37.77],
              [-122.38, 37.79],
              [-122.36, 37.78],
              [-122.37, 37.76],
              [-122.4, 37.77],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: { name: 'Zone C', height: 600, color: [138, 43, 226] },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-122.42, 37.81],
              [-122.4, 37.83],
              [-122.38, 37.82],
              [-122.39, 37.8],
              [-122.42, 37.81],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: { name: 'Route', color: [255, 255, 255] },
        geometry: {
          type: 'LineString',
          coordinates: [
            [-122.45, 37.76],
            [-122.42, 37.78],
            [-122.39, 37.77],
            [-122.36, 37.79],
          ],
        },
      },
    ],
  };

  interface GeoJSONFeature {
    properties: {
      color?: [number, number, number];
      height?: number;
    };
  }

  const getFillColor = (f: unknown) =>
    (f as GeoJSONFeature).properties.color || [200, 200, 200];
  const getLineColor = () => [255, 255, 255];
  const getElevation = (f: unknown) =>
    (f as GeoJSONFeature).properties.height || 0;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglGeojson, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
  pitch: 45,
};

const geojsonData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Zone A', height: 500, color: [255, 140, 0] },
      geometry: { type: 'Polygon', coordinates: [...] },
    },
    // ... more features
  ],
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglGeojson
      id="deckgl-geojson-layer"
      :data="geojsonData"
      :get-fill-color="(f) => f.properties.color"
      :get-line-color="[255, 255, 255]"
      :get-elevation="(f) => f.properties.height || 0"
      :extruded="true"
      :stroked="true"
      :filled="true"
      :line-width-min-pixels="2"
      :pickable="true"
    />
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
          GeoJSON Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          High-performance GeoJSON rendering with 3D extrusion support.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglGeojson
                id="deckgl-geojson-layer"
                :data="geojsonData"
                :get-fill-color="getFillColor"
                :get-line-color="getLineColor"
                :get-elevation="getElevation"
                :extruded="true"
                :stroked="true"
                :filled="true"
                :line-width-min-pixels="2"
                :pickable="true"
              ></VLayerDeckglGeojson>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="DeckGLGeoJSON.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
