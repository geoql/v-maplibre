<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGrid,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Grid Layer (deck.gl) - mapcn-vue Examples',
    description: '3D grid aggregation visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Grid Layer (deck.gl)',
    description: '3D grid aggregation visualization.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `grid-example-${mapId}`,
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

  interface GridPoint {
    position: [number, number];
  }

  const gridData = generateData();

  const getPosition = (d: unknown) => (d as GridPoint).position;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglGrid, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
  pitch: 45,
  bearing: -17,
  };

  const gridData = [
  { position: [-122.42, 37.78] },
  { position: [-122.38, 37.79] },
  // ... many more points for aggregation
  ];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglGrid
      id="grid-layer"
      :data="gridData"
      :get-position="(d) => d.position"
      :cell-size="200"
      :elevation-scale="50"
      :elevation-range="[0, 1000]"
      :extruded="true"
      :pickable="true"
      :color-range="[
        [255, 255, 204],
        [199, 233, 180],
        [127, 205, 187],
        [65, 182, 196],
        [44, 127, 184],
        [37, 52, 148],
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
          Grid Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          3D square grid aggregation for point data visualization.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglGrid
                id="grid-layer"
                :data="gridData"
                :get-position="getPosition"
                :cell-size="200"
                :elevation-scale="50"
                :elevation-range="[0, 1000]"
                :extruded="true"
                :pickable="true"
                :color-range="[
                  [255, 255, 204],
                  [199, 233, 180],
                  [127, 205, 187],
                  [65, 182, 196],
                  [44, 127, 184],
                  [37, 52, 148],
                ]"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>
    </div>
  </div>
</template>
