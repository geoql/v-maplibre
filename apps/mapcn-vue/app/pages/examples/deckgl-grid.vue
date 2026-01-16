<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGrid,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Grid Layer (deck.gl) - mapcn-vue Examples',
    description: '3D grid aggregation visualization.',
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
    container: `grid-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 11,
    pitch: 45,
    bearing: -17,
  }));

  // Generate random point data for aggregation
  const generateData = () => {
    const data = [];
    const centers: [number, number][] = [
      [-122.42, 37.78],
      [-122.38, 37.79],
      [-122.45, 37.77],
      [-122.4, 37.8],
      [-122.36, 37.76],
    ];

    for (const center of centers) {
      const count = Math.floor(Math.random() * 300) + 100;
      for (let i = 0; i < count; i++) {
        data.push({
          position: [
            center[0] + (Math.random() - 0.5) * 0.04,
            center[1] + (Math.random() - 0.5) * 0.03,
          ],
        });
      }
    }
    return data;
  };

  interface GridPoint {
    position: [number, number];
  }

  const gridData = generateData();

  const getPosition = (d: unknown) => (d as GridPoint).position;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglGrid, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
  pitch: 45,
  bearing: -17,
};

const gridData = [
  { position: [-122.42, 37.78] },
  { position: [-122.38, 37.79] },
  // ... many more points for aggregation
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglGrid
      id="grid-layer"
      :data="gridData"
      :get-position="(d) => d.position"
      :cell-size="200"
      :elevation-scale="50"
      :elevation-range="[0, 1000]"
      :extruded="true"
      :pickable="true"
      :color-range="[
        [255, 255, 204],
        [199, 233, 180],
        [127, 205, 187],
        [65, 182, 196],
        [44, 127, 184],
        [37, 52, 148],
      ]"
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
          Grid Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          3D square grid aggregation for point data visualization.
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
              <VLayerDeckglGrid
                id="grid-layer"
                :data="gridData"
                :get-position="getPosition"
                :cell-size="200"
                :elevation-scale="50"
                :elevation-range="[0, 1000]"
                :extruded="true"
                :pickable="true"
                :color-range="[
                  [255, 255, 204],
                  [199, 233, 180],
                  [127, 205, 187],
                  [65, 182, 196],
                  [44, 127, 184],
                  [37, 52, 148],
                ]"
              ></VLayerDeckglGrid>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="GridLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
