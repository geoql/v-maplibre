<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglHeatmap,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Heatmap (deck.gl) - mapcn-vue Examples',
    description: 'Density heatmap visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Heatmap (deck.gl)',
    description: 'Density heatmap visualization.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `heatmap-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.8] as [number, number],
    zoom: 11,
  }));

  // Generate sample heatmap data
  const generateData = () => {
    const data = [];
    // Create clusters of points
    const centers: [number, number][] = [
      [-122.42, 37.78],
      [-122.38, 37.79],
      [-122.45, 37.77],
      [-122.4, 37.8],
    ];

    for (const center of centers) {
      for (let i = 0; i < 200; i++) {
        data.push({
          coordinates: [
            center[0] + (Math.random() - 0.5) * 0.03,
            center[1] + (Math.random() - 0.5) * 0.02,
          ],
          weight: Math.random() * 10 + 1,
        });
      }
    }
    return data;
  };

  interface HeatmapPoint {
    coordinates: [number, number];
    weight: number;
  }

  const heatmapData = generateData();

  const getPosition = (d: unknown) => (d as HeatmapPoint).coordinates;
  const getWeight = (d: unknown) => (d as HeatmapPoint).weight;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglHeatmap, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-122.4, 37.8],
  zoom: 11,
  };

  const heatmapData = [
  { coordinates: [-122.4, 37.8], weight: 5 },
  { coordinates: [-122.38, 37.79], weight: 10 },
  // ... more points
  ];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglHeatmap
      id="heatmap"
      :data="heatmapData"
      :get-position="(d) => d.coordinates"
      :get-weight="(d) => d.weight"
      :radius-pixels="30"
      :intensity="1"
      :threshold="0.03"
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
          Heatmap (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Density heatmap visualization showing point concentrations.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglHeatmap
                id="heatmap"
                :data="heatmapData"
                :get-position="getPosition"
                :get-weight="getWeight"
                :radius-pixels="30"
                :intensity="1"
                :threshold="0.03"
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
          </ClientOnly>
        </div>
      </ComponentDemo>
    </div>
  </div>
</template>
