<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglH3Hexagon,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'H3 Hexagon Layer (deck.gl) - mapcn-vue Examples',
    description: 'H3 hexagonal grid visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'H3 Hexagon Layer (deck.gl)',
    description: 'H3 hexagonal grid visualization.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `h3-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 11,
    pitch: 45,
  }));

  // Pre-generated H3 hexagon data for San Francisco area
  // H3 cells at resolution 8
  const h3Data = [
    { hex: '8828308281fffff', value: 850, color: [255, 99, 71, 200] },
    { hex: '8828308283fffff', value: 620, color: [255, 165, 0, 180] },
    { hex: '8828308285fffff', value: 340, color: [50, 205, 50, 160] },
    { hex: '8828308287fffff', value: 780, color: [255, 99, 71, 200] },
    { hex: '8828308289fffff', value: 450, color: [255, 165, 0, 180] },
    { hex: '882830828bfffff', value: 290, color: [50, 205, 50, 160] },
    { hex: '882830828dfffff', value: 920, color: [255, 99, 71, 200] },
    { hex: '882830828ffffff', value: 560, color: [255, 165, 0, 180] },
    { hex: '8828308291fffff', value: 380, color: [50, 205, 50, 160] },
    { hex: '8828308293fffff', value: 710, color: [255, 99, 71, 200] },
    { hex: '8828308295fffff', value: 490, color: [255, 165, 0, 180] },
    { hex: '8828308297fffff', value: 250, color: [50, 205, 50, 160] },
    { hex: '8828308299fffff', value: 830, color: [255, 99, 71, 200] },
    { hex: '882830829bfffff', value: 670, color: [255, 165, 0, 180] },
    { hex: '882830829dfffff', value: 410, color: [255, 165, 0, 180] },
    { hex: '882830829ffffff', value: 580, color: [255, 165, 0, 180] },
    { hex: '88283082a1fffff', value: 320, color: [50, 205, 50, 160] },
    { hex: '88283082a3fffff', value: 750, color: [255, 99, 71, 200] },
    { hex: '88283082a5fffff', value: 890, color: [255, 99, 71, 200] },
    { hex: '88283082a7fffff', value: 530, color: [255, 165, 0, 180] },
  ];

  interface H3Data {
    hex: string;
    value: number;
    color: [number, number, number, number];
  }

  const getHexagon = (d: unknown) => (d as H3Data).hex;
  const getFillColor = (d: unknown) => (d as H3Data).color;
  const getElevation = (d: unknown) => (d as H3Data).value;

  const legendItems: CategoryLegendItem[] = [
    { value: 'high', label: 'High (700+)', color: '#ff6347' },
    { value: 'medium', label: 'Medium (400–699)', color: '#ffa500' },
    { value: 'low', label: 'Low (<400)', color: '#32cd32' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglH3Hexagon, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
  pitch: 45,
  };

  // H3 hexagon data (resolution 8)
  const h3Data = [
  { hex: '882830829bfffff', value: 500, color: [255, 165, 0, 180] },
  { hex: '8828308299fffff', value: 800, color: [255, 99, 71, 200] },
  // ... more H3 cells
  ];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglH3Hexagon
      id="h3-layer"
      :data="h3Data"
      :get-hexagon="(d) => d.hex"
      :get-fill-color="(d) => d.color"
      :get-elevation="(d) => d.value"
      :elevation-scale="20"
      :extruded="true"
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
          H3 Hexagon Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Uber's H3 hexagonal hierarchical geospatial indexing system.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VControlLegend
                :layer-ids="['h3-layer']"
                position="bottom-left"
                type="category"
                title="Cell Value"
                :items="legendItems"
                :interactive="false"
              />
              <VLayerDeckglH3Hexagon
                id="h3-layer"
                :data="h3Data"
                :get-hexagon="getHexagon"
                :get-fill-color="getFillColor"
                :get-elevation="getElevation"
                :elevation-scale="20"
                :extruded="true"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <ExampleNavigation />
    </div>
  </div>
</template>
