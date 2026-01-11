<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglHexagon,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Hexagon Layer (deck.gl) - mapcn-vue Examples',
    description: '3D hexagonal binning aggregation visualization.',
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
    container: `hexagon-example-${mapId}`,
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

  interface HexagonPoint {
    position: [number, number];
  }

  const hexagonData = generateData();

  const getPosition = (d: unknown) => (d as HexagonPoint).position;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglHexagon, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
  pitch: 45,
  bearing: -17,
};

const hexagonData = [
  { position: [-122.42, 37.78] },
  { position: [-122.38, 37.79] },
  // ... many more points for aggregation
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglHexagon
      id="hexagon-layer"
      :data="hexagonData"
      :get-position="(d) => d.position"
      :radius="200"
      :elevation-scale="50"
      :elevation-range="[0, 1000]"
      :extruded="true"
      :pickable="true"
      :color-range="[
        [255, 255, 178],
        [254, 217, 118],
        [254, 178, 76],
        [253, 141, 60],
        [240, 59, 32],
        [189, 0, 38],
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
          Hexagon Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          3D hexagonal binning for point aggregation with elevation.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglHexagon
                id="hexagon-layer"
                :data="hexagonData"
                :get-position="getPosition"
                :radius="200"
                :elevation-scale="50"
                :elevation-range="[0, 1000]"
                :extruded="true"
                :pickable="true"
                :color-range="[
                  [255, 255, 178],
                  [254, 217, 118],
                  [254, 178, 76],
                  [253, 141, 60],
                  [240, 59, 32],
                  [189, 0, 38],
                ]"
              ></VLayerDeckglHexagon>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="HexagonLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
