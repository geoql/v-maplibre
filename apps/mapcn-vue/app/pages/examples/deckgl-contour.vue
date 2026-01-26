<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglContour,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Contour Layer (deck.gl) - mapcn-vue Examples',
    description: 'Contour lines for density visualization.',
  });

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `contour-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 11,
  }));

  // Generate random point data for contour
  const generateData = () => {
    const data = [];
    const centers: [number, number][] = [
      [-122.42, 37.78],
      [-122.38, 37.79],
      [-122.45, 37.77],
      [-122.4, 37.8],
    ];

    for (const center of centers) {
      const count = Math.floor(Math.random() * 400) + 200;
      for (let i = 0; i < count; i++) {
        data.push({
          position: [
            center[0] + (Math.random() - 0.5) * 0.03,
            center[1] + (Math.random() - 0.5) * 0.02,
          ],
        });
      }
    }
    return data;
  };

  interface ContourPoint {
    position: [number, number];
  }

  const contourData = generateData();

  const getPosition = (d: unknown) => (d as ContourPoint).position;

  const contours = [
    {
      threshold: 1,
      color: [255, 255, 178, 100] as [number, number, number, number],
      strokeWidth: 1,
    },
    {
      threshold: 5,
      color: [254, 204, 92, 150] as [number, number, number, number],
      strokeWidth: 2,
    },
    {
      threshold: 10,
      color: [253, 141, 60, 180] as [number, number, number, number],
      strokeWidth: 2,
    },
    {
      threshold: 20,
      color: [240, 59, 32, 200] as [number, number, number, number],
      strokeWidth: 3,
    },
    {
      threshold: 50,
      color: [189, 0, 38, 220] as [number, number, number, number],
      strokeWidth: 4,
    },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglContour, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
};

const contourData = [
  { position: [-122.42, 37.78] },
  { position: [-122.38, 37.79] },
  // ... many more points
];

const contours = [
  { threshold: 1, color: [255, 255, 178, 100], strokeWidth: 1 },
  { threshold: 5, color: [254, 204, 92, 150], strokeWidth: 2 },
  { threshold: 10, color: [253, 141, 60, 180], strokeWidth: 2 },
  { threshold: 20, color: [240, 59, 32, 200], strokeWidth: 3 },
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglContour
      id="contour-layer"
      :data="contourData"
      :get-position="(d) => d.position"
      :contours="contours"
      :cell-size="50"
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
          Contour Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Contour lines showing density thresholds for point data.
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
              <VLayerDeckglContour
                id="contour-layer"
                :data="contourData"
                :get-position="getPosition"
                :contours="contours"
                :cell-size="50"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ContourLayer.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
