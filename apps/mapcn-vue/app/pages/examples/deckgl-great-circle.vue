<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGreatCircle,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Great Circle Layer (deck.gl) - mapcn-vue Examples',
    description: 'Great circle arcs for global flight paths.',
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
    container: `great-circle-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
  }));

  // Flight routes from San Francisco
  const flightData = [
    {
      from: [-122.4, 37.8],
      to: [139.7, 35.7],
      name: 'San Francisco → Tokyo',
      color: [255, 140, 0],
    },
    {
      from: [-122.4, 37.8],
      to: [-0.12, 51.5],
      name: 'San Francisco → London',
      color: [0, 200, 150],
    },
    {
      from: [-122.4, 37.8],
      to: [2.35, 48.85],
      name: 'San Francisco → Paris',
      color: [138, 43, 226],
    },
    {
      from: [-122.4, 37.8],
      to: [116.4, 39.9],
      name: 'San Francisco → Beijing',
      color: [255, 99, 71],
    },
    {
      from: [-122.4, 37.8],
      to: [151.2, -33.9],
      name: 'San Francisco → Sydney',
      color: [30, 144, 255],
    },
    {
      from: [-122.4, 37.8],
      to: [-43.2, -22.9],
      name: 'San Francisco → Rio',
      color: [255, 215, 0],
    },
    {
      from: [-122.4, 37.8],
      to: [77.2, 28.6],
      name: 'San Francisco → Delhi',
      color: [50, 205, 50],
    },
  ];

  interface GreatCircleData {
    from: [number, number];
    to: [number, number];
    name: string;
    color: [number, number, number];
  }

  const getSourcePosition = (d: unknown) => (d as GreatCircleData).from;
  const getTargetPosition = (d: unknown) => (d as GreatCircleData).to;
  const getSourceColor = (d: unknown) => (d as GreatCircleData).color;
  const getTargetColor = (d: unknown) => [
    ...(d as GreatCircleData).color.slice(0, 3),
    100,
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglGreatCircle, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [0, 30],
  zoom: 1.5,
};

const flightData = [
  { from: [-122.4, 37.8], to: [139.7, 35.7], name: 'SF → Tokyo', color: [255, 140, 0] },
  { from: [-122.4, 37.8], to: [-0.12, 51.5], name: 'SF → London', color: [0, 200, 150] },
  // ... more routes
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglGreatCircle
      id="great-circle-layer"
      :data="flightData"
      :get-source-position="(d) => d.from"
      :get-target-position="(d) => d.to"
      :get-source-color="(d) => d.color"
      :get-target-color="(d) => [...d.color, 100]"
      :get-stroke-width="3"
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
          Great Circle Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Great circle arcs showing the shortest path between points on Earth.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglGreatCircle
                id="great-circle-layer"
                :data="flightData"
                :get-source-position="getSourcePosition"
                :get-target-position="getTargetPosition"
                :get-source-color="getSourceColor"
                :get-target-color="getTargetColor"
                :get-stroke-width="3"
                :pickable="true"
              ></VLayerDeckglGreatCircle>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="GreatCircleLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
