<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglS2,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'S2 Layer (deck.gl) - mapcn-vue Examples',
    description: 'Visualize data using Google S2 geometry cells.',
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
    container: `s2-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 10,
    pitch: 45,
    bearing: 0,
  }));

  interface S2Data {
    token: string;
    value: number;
    density: string;
  }

  // Sample S2 tokens for San Francisco area
  // These are S2 cell tokens at level 13 (~1km cells)
  const s2Data: S2Data[] = [
    { token: '80858c4', value: 2800, density: 'high' },
    { token: '80858cc', value: 2100, density: 'high' },
    { token: '80858d4', value: 1500, density: 'medium' },
    { token: '80858dc', value: 900, density: 'low' },
    { token: '80858e4', value: 1800, density: 'medium' },
    { token: '80858ec', value: 1200, density: 'medium' },
    { token: '80858f4', value: 600, density: 'low' },
    { token: '80858fc', value: 2400, density: 'high' },
    { token: '8085904', value: 1100, density: 'medium' },
    { token: '808590c', value: 700, density: 'low' },
  ];

  const getS2Token = (d: unknown) => (d as S2Data).token;
  const getElevation = (d: unknown) => (d as S2Data).value;
  const getFillColor = (d: unknown) => {
    const density = (d as S2Data).density;
    switch (density) {
      case 'high':
        return [255, 80, 120, 200] as [number, number, number, number];
      case 'medium':
        return [255, 180, 80, 200] as [number, number, number, number];
      case 'low':
        return [80, 180, 255, 200] as [number, number, number, number];
      default:
        return [150, 150, 150, 200] as [number, number, number, number];
    }
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglS2, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 10,
  pitch: 45,
};

interface S2Data {
  token: string;
  value: number;
  density: 'high' | 'medium' | 'low';
}

// S2 cell tokens (Google's spherical geometry library)
// Level 13 ≈ 1km², Level 15 ≈ 150m², Level 17 ≈ 20m²
const s2Data: S2Data[] = [
  { token: '80858c4', value: 2800, density: 'high' },
  { token: '80858cc', value: 2100, density: 'high' },
  { token: '80858d4', value: 1500, density: 'medium' },
];

const getS2Token = (d: unknown) => (d as S2Data).token;
const getElevation = (d: unknown) => (d as S2Data).value;
const getFillColor = (d: unknown) => {
  const colors = { high: [255, 80, 120], medium: [255, 180, 80], low: [80, 180, 255] };
  return [...colors[(d as S2Data).density], 200];
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglS2
      id="s2-layer"
      :data="s2Data"
      :get-s2-token="getS2Token"
      :get-fill-color="getFillColor"
      :get-elevation="getElevation"
      :extruded="true"
      :pickable="true"
      :auto-highlight="true"
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
          S2 Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render data using Google S2 geometry spherical cells for uniform
          global coverage.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VControlScale position="bottom-left"></VControlScale>
              <VLayerDeckglS2
                id="s2-layer"
                :data="s2Data"
                :get-s2-token="getS2Token"
                :get-fill-color="getFillColor"
                :get-elevation="getElevation"
                :extruded="true"
                :pickable="true"
                :auto-highlight="true"
              ></VLayerDeckglS2>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="S2Layer.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> S2 is Google's spherical geometry library that
          divides the Earth into hierarchical cells. Unlike H3, S2 uses
          quadrilateral cells. Common levels: 13 (~1km²), 15 (~150m²), 17
          (~20m²). Used by Google Maps, Foursquare, and others.
        </p>
      </div>
    </div>
  </div>
</template>
