<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglQuadkey,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Quadkey Layer (deck.gl) - mapcn-vue Examples',
    description: 'Visualize data using Bing Maps Quadkey tiles.',
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
    container: `quadkey-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 10,
    pitch: 45,
    bearing: 0,
  }));

  interface QuadkeyData {
    quadkey: string;
    value: number;
    category: string;
  }

  // Sample quadkey data for San Francisco area
  // Quadkey at zoom level 12
  const quadkeyData: QuadkeyData[] = [
    { quadkey: '023010211030', value: 2500, category: 'High' },
    { quadkey: '023010211031', value: 1800, category: 'Medium' },
    { quadkey: '023010211032', value: 1200, category: 'Medium' },
    { quadkey: '023010211033', value: 900, category: 'Low' },
    { quadkey: '023010211020', value: 2100, category: 'High' },
    { quadkey: '023010211021', value: 1500, category: 'Medium' },
    { quadkey: '023010211022', value: 700, category: 'Low' },
    { quadkey: '023010211023', value: 1100, category: 'Medium' },
    { quadkey: '023010211010', value: 1900, category: 'High' },
    { quadkey: '023010211011', value: 800, category: 'Low' },
  ];

  const getQuadkey = (d: unknown) => (d as QuadkeyData).quadkey;
  const getElevation = (d: unknown) => (d as QuadkeyData).value;
  const getFillColor = (d: unknown) => {
    const category = (d as QuadkeyData).category;
    switch (category) {
      case 'High':
        return [255, 100, 100, 200] as [number, number, number, number];
      case 'Medium':
        return [255, 200, 100, 200] as [number, number, number, number];
      case 'Low':
        return [100, 200, 100, 200] as [number, number, number, number];
      default:
        return [150, 150, 150, 200] as [number, number, number, number];
    }
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglQuadkey, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 10,
  pitch: 45,
};

interface QuadkeyData {
  quadkey: string;
  value: number;
  category: 'High' | 'Medium' | 'Low';
}

// Quadkey tiles (Bing Maps tile system)
// Length determines zoom level: 12 chars = zoom 12
const quadkeyData: QuadkeyData[] = [
  { quadkey: '023010211030', value: 2500, category: 'High' },
  { quadkey: '023010211031', value: 1800, category: 'Medium' },
  { quadkey: '023010211032', value: 1200, category: 'Medium' },
];

const getQuadkey = (d: unknown) => (d as QuadkeyData).quadkey;
const getElevation = (d: unknown) => (d as QuadkeyData).value;
const getFillColor = (d: unknown) => {
  const category = (d as QuadkeyData).category;
  const colors = { High: [255, 100, 100], Medium: [255, 200, 100], Low: [100, 200, 100] };
  return [...colors[category], 200];
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglQuadkey
      id="quadkey-layer"
      :data="quadkeyData"
      :get-quadkey="getQuadkey"
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
          Quadkey Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render data indexed using Bing Maps Quadkey tile system.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglQuadkey
                id="quadkey-layer"
                :data="quadkeyData"
                :get-quadkey="getQuadkey"
                :get-fill-color="getFillColor"
                :get-elevation="getElevation"
                :extruded="true"
                :pickable="true"
                :auto-highlight="true"
              ></VLayerDeckglQuadkey>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="QuadkeyLayer.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> Quadkey is the tile indexing system used by
          Bing Maps. Each character represents a zoom level (0-3). A
          12-character quadkey corresponds to zoom level 12. Commonly used for
          pre-aggregated tile-based analytics.
        </p>
      </div>
    </div>
  </div>
</template>
