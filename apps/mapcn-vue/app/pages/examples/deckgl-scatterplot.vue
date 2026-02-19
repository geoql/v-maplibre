<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglScatterplot,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Scatterplot (deck.gl) - mapcn-vue Examples',
    description: 'High-performance scatterplot visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Scatterplot (deck.gl)',
    description: 'High-performance scatterplot visualization.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `scatterplot-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.8] as [number, number],
    zoom: 11,
  }));

  // Generate sample data
  const generateData = () => {
    const data = [];
    for (let i = 0; i < 1000; i++) {
      data.push({
        coordinates: [
          -122.4 + (Math.random() - 0.5) * 0.2,
          37.8 + (Math.random() - 0.5) * 0.15,
        ],
        size: Math.random() * 100 + 20,
        color: Math.random() > 0.5 ? [255, 140, 0] : [0, 200, 150],
      });
    }
    return data;
  };

  interface ScatterPoint {
    coordinates: [number, number];
    size: number;
    color: [number, number, number];
  }

  const scatterData = generateData();

  const getPosition = (d: unknown) => (d as ScatterPoint).coordinates;
  const getRadius = (d: unknown) => (d as ScatterPoint).size;
  const getFillColor = (d: unknown) => (d as ScatterPoint).color;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglScatterplot, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.8],
  zoom: 11,
};

const data = [
  { coordinates: [-122.4, 37.8], size: 100, color: [255, 140, 0] },
  { coordinates: [-122.5, 37.7], size: 200, color: [0, 200, 150] },
  // ... more points
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglScatterplot
      id="scatterplot"
      :data="data"
      :get-position="(d) => d.coordinates"
      :get-radius="(d) => d.size"
      :get-fill-color="(d) => d.color"
      :radius-min-pixels="3"
      :radius-max-pixels="30"
      :opacity="0.8"
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
          Scatterplot (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          High-performance WebGL scatterplot rendering thousands of points.
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
              <VLayerDeckglScatterplot
                id="scatterplot"
                :data="scatterData"
                :get-position="getPosition"
                :get-radius="getRadius"
                :get-fill-color="getFillColor"
                :radius-min-pixels="3"
                :radius-max-pixels="30"
                :opacity="0.8"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="Scatterplot.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
