<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglArc,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Arc Layer (deck.gl) - mapcn-vue Examples',
    description: 'Origin-destination arc visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Arc Layer (deck.gl)',
    description: 'Origin-destination arc visualization.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `arc-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
  }));

  const arcData = [
    {
      source: [-122.4, 37.8],
      target: [139.7, 35.7],
      name: 'San Francisco to Tokyo',
    },
    {
      source: [-122.4, 37.8],
      target: [-0.1, 51.5],
      name: 'San Francisco to London',
    },
    {
      source: [-122.4, 37.8],
      target: [2.3, 48.9],
      name: 'San Francisco to Paris',
    },
    {
      source: [-74.0, 40.7],
      target: [116.4, 39.9],
      name: 'New York to Beijing',
    },
    { source: [-74.0, 40.7], target: [77.2, 28.6], name: 'New York to Delhi' },
    { source: [151.2, -33.9], target: [-43.2, -22.9], name: 'Sydney to Rio' },
  ];

  interface ArcData {
    source: [number, number];
    target: [number, number];
    name: string;
  }

  const legendItems: CategoryLegendItem[] = [
    { value: 'origin', label: 'Origin', color: '#00b4d8' },
    { value: 'destination', label: 'Destination', color: '#72efdd' },
  ];

  const getSourcePosition = (d: unknown) => (d as ArcData).source;
  const getTargetPosition = (d: unknown) => (d as ArcData).target;
  const getSourceColor = (): [number, number, number, number] => [
    0, 180, 216, 200,
  ];
  const getTargetColor = (): [number, number, number, number] => [
    114, 239, 221, 200,
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglArc, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [0, 30],
  zoom: 1.5,
  };

  const arcData = [
  { source: [-122.4, 37.8], target: [139.7, 35.7], name: 'SF to Tokyo' },
  { source: [-122.4, 37.8], target: [-0.1, 51.5], name: 'SF to London' },
  // ... more arcs
  ];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglArc
      id="arcs"
      :data="arcData"
      :get-source-position="(d) => d.source"
      :get-target-position="(d) => d.target"
      :get-source-color="[0, 180, 216, 200]"
      :get-target-color="[114, 239, 221, 200]"
      :get-width="2"
      :great-circle="true"
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
          Arc Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Origin-destination arc visualization with great circle paths.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglArc
                id="arcs"
                :data="arcData"
                :get-source-position="getSourcePosition"
                :get-target-position="getTargetPosition"
                :get-source-color="getSourceColor"
                :get-target-color="getTargetColor"
                :get-width="2"
                :great-circle="true"
              />
              <VControlLegend
                position="bottom-left"
                type="category"
                title="Arc Endpoints"
                :layer-ids="['arcs']"
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
