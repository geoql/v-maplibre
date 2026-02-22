<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglLine,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Line Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render line segments between points.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Line Layer (deck.gl)',
    description: 'Render line segments between points.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `line-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.8] as [number, number],
    zoom: 11,
  }));

  // Generate line segments data
  const lineData = [
    {
      sourcePosition: [-122.45, 37.78],
      targetPosition: [-122.35, 37.82],
      color: [255, 140, 0],
    },
    {
      sourcePosition: [-122.42, 37.75],
      targetPosition: [-122.38, 37.85],
      color: [0, 200, 150],
    },
    {
      sourcePosition: [-122.48, 37.8],
      targetPosition: [-122.32, 37.76],
      color: [138, 43, 226],
    },
    {
      sourcePosition: [-122.44, 37.82],
      targetPosition: [-122.36, 37.74],
      color: [255, 99, 71],
    },
    {
      sourcePosition: [-122.4, 37.78],
      targetPosition: [-122.4, 37.84],
      color: [30, 144, 255],
    },
  ];

  interface LineData {
    sourcePosition: [number, number];
    targetPosition: [number, number];
    color: [number, number, number];
  }

  const legendItems: CategoryLegendItem[] = [
    { value: 'line-1', label: 'Segment 1', color: '#ff8c00' },
    { value: 'line-2', label: 'Segment 2', color: '#00c896' },
    { value: 'line-3', label: 'Segment 3', color: '#8a2be2' },
    { value: 'line-4', label: 'Segment 4', color: '#ff6347' },
    { value: 'line-5', label: 'Segment 5', color: '#1e90ff' },
  ];

  const getSourcePosition = (d: unknown) => (d as LineData).sourcePosition;
  const getTargetPosition = (d: unknown) => (d as LineData).targetPosition;
  const getColor = (d: unknown) => (d as LineData).color;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglLine, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.8],
  zoom: 11,
  };

  const lineData = [
  { sourcePosition: [-122.45, 37.78], targetPosition: [-122.35, 37.82], color: [255, 140, 0] },
  { sourcePosition: [-122.42, 37.75], targetPosition: [-122.38, 37.85], color: [0, 200, 150] },
  ];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglLine
      id="line-layer"
      :data="lineData"
      :get-source-position="(d) => d.sourcePosition"
      :get-target-position="(d) => d.targetPosition"
      :get-color="(d) => d.color"
      :get-width="3"
      :pickable="true"
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
          Line Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Render line segments between source and target positions.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglLine
                id="line-layer"
                :data="lineData"
                :get-source-position="getSourcePosition"
                :get-target-position="getTargetPosition"
                :get-color="getColor"
                :get-width="3"
                :pickable="true"
              />
              <VControlLegend
                position="bottom-left"
                type="category"
                title="Line Segments"
                :layer-ids="['line-layer']"
                :items="legendItems"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <ExampleNavigation />
    </div>
  </div>
</template>
