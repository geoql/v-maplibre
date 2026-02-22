<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglHexagon,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Hexagon Layer (deck.gl) - mapcn-vue Examples',
    description: '3D hexagonal binning aggregation visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Hexagon Layer (deck.gl)',
    description: '3D hexagonal binning aggregation visualization.',
    category: 'deck.gl',
  });

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `hexagon-example-${mapId}`,
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

  interface HexagonPoint {
    position: [number, number];
  }

  const hexagonData = generateData();

  const getPosition = (d: unknown) => (d as HexagonPoint).position;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglHexagon, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
  pitch: 45,
  bearing: -17,
  };

  const hexagonData = [
  { position: [-122.42, 37.78] },
  { position: [-122.38, 37.79] },
  // ... many more points for aggregation
  ];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglHexagon
      id="hexagon-layer"
      :data="hexagonData"
      :get-position="(d) => d.position"
      :radius="200"
      :elevation-scale="50"
      :elevation-range="[0, 1000]"
      :extruded="true"
      :pickable="true"
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
          Hexagon Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          3D hexagonal binning for point aggregation with elevation.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglHexagon
                id="hexagon-layer"
                :data="hexagonData"
                :get-position="getPosition"
                :radius="200"
                :elevation-scale="50"
                :elevation-range="[0, 1000]"
                :extruded="true"
                :pickable="true"
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

      <ExampleNavigation />
    </div>
  </div>
</template>
