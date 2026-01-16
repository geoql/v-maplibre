<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglPath,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Path Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render continuous paths with multiple vertices.',
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
    container: `path-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.8] as [number, number],
    zoom: 11,
  }));

  // Generate path data (routes)
  const pathData = [
    {
      path: [
        [-122.45, 37.78],
        [-122.43, 37.79],
        [-122.41, 37.78],
        [-122.39, 37.8],
        [-122.37, 37.79],
      ],
      name: 'Route A',
      color: [255, 140, 0],
    },
    {
      path: [
        [-122.48, 37.75],
        [-122.45, 37.77],
        [-122.42, 37.76],
        [-122.4, 37.78],
        [-122.38, 37.77],
        [-122.35, 37.79],
      ],
      name: 'Route B',
      color: [0, 200, 150],
    },
    {
      path: [
        [-122.44, 37.82],
        [-122.42, 37.81],
        [-122.4, 37.83],
        [-122.38, 37.82],
        [-122.36, 37.84],
      ],
      name: 'Route C',
      color: [138, 43, 226],
    },
  ];

  interface PathData {
    path: [number, number][];
    name: string;
    color: [number, number, number];
  }

  const getPath = (d: unknown) => (d as PathData).path;
  const getColor = (d: unknown) => (d as PathData).color;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglPath, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.8],
  zoom: 11,
};

const pathData = [
  {
    path: [[-122.45, 37.78], [-122.43, 37.79], [-122.41, 37.78], [-122.39, 37.8]],
    name: 'Route A',
    color: [255, 140, 0],
  },
  // ... more paths
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglPath
      id="path-layer"
      :data="pathData"
      :get-path="(d) => d.path"
      :get-color="(d) => d.color"
      :get-width="4"
      :width-min-pixels="2"
      :pickable="true"
      :rounded="true"
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
          Path Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render continuous paths with multiple vertices for routes and
          trajectories.
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
              <VLayerDeckglPath
                id="path-layer"
                :data="pathData"
                :get-path="getPath"
                :get-color="getColor"
                :get-width="4"
                :width-min-pixels="2"
                :pickable="true"
                :rounded="true"
              ></VLayerDeckglPath>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="PathLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
