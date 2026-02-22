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

  defineOgImage('MapcnDoc', {
    title: 'Path Layer (deck.gl)',
    description: 'Render continuous paths with multiple vertices.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

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
  <VMap :options="mapOptions" class="h-125 w-full">
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
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Path Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Render continuous paths with multiple vertices for routes and
          trajectories.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglPath
                id="path-layer"
                :data="pathData"
                :get-path="getPath"
                :get-color="getColor"
                :get-width="4"
                :width-min-pixels="2"
                :pickable="true"
                :rounded="true"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>
    </div>
  </div>
</template>
