<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglScreenGrid,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Screen Grid Layer (deck.gl) - mapcn-vue Examples',
    description: 'Screen-space grid aggregation visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Screen Grid Layer (deck.gl)',
    description: 'Screen-space grid aggregation visualization.',
    category: 'deck.gl',
  });

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `screengrid-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 11,
  }));

  // Generate random point data
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
      const count = Math.floor(Math.random() * 500) + 200;
      for (let i = 0; i < count; i++) {
        data.push({
          position: [
            center[0] + (Math.random() - 0.5) * 0.05,
            center[1] + (Math.random() - 0.5) * 0.04,
          ],
          weight: Math.random() * 10,
        });
      }
    }
    return data;
  };

  interface ScreenGridPoint {
    position: [number, number];
    weight: number;
  }

  const screenGridData = generateData();

  const getPosition = (d: unknown) => (d as ScreenGridPoint).position;
  const getWeight = (d: unknown) => (d as ScreenGridPoint).weight;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglScreenGrid, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
};

const screenGridData = [
  { position: [-122.42, 37.78], weight: 5 },
  { position: [-122.38, 37.79], weight: 10 },
  // ... many more points
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglScreenGrid
      id="screengrid-layer"
      :data="screenGridData"
      :get-position="(d) => d.position"
      :get-weight="(d) => d.weight"
      :cell-size-pixels="20"
      :color-range="[
        [255, 255, 178, 25],
        [254, 217, 118, 85],
        [254, 178, 76, 127],
        [253, 141, 60, 170],
        [240, 59, 32, 212],
        [189, 0, 38, 255],
      ]"
      :pickable="true"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Screen Grid Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Screen-space grid aggregation for high-performance density
          visualization.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglScreenGrid
                id="screengrid-layer"
                :data="screenGridData"
                :get-position="getPosition"
                :get-weight="getWeight"
                :cell-size-pixels="20"
                :color-range="[
                  [255, 255, 178, 25],
                  [254, 217, 118, 85],
                  [254, 178, 76, 127],
                  [253, 141, 60, 170],
                  [240, 59, 32, 212],
                  [189, 0, 38, 255],
                ]"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ScreenGridLayer.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
