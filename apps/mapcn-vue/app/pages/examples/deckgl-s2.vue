<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglS2,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'S2 Layer (deck.gl) - mapcn-vue Examples',
    description: 'Visualize data using Google S2 geometry cells.',
  });

  defineOgImage('MapcnDoc', {
    title: 'S2 Layer (deck.gl)',
    description: 'Visualize data using Google S2 geometry cells.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `s2-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 10,
    pitch: 45,
    bearing: 0,
  }));

  interface S2Data {
    token: string;
    value: number;
    density: string;
  }

  // Sample S2 tokens for San Francisco area
  // These are S2 cell tokens at level 13 (~1km cells)
  const s2Data: S2Data[] = [
    { token: '80858c4', value: 2800, density: 'high' },
    { token: '80858cc', value: 2100, density: 'high' },
    { token: '80858d4', value: 1500, density: 'medium' },
    { token: '80858dc', value: 900, density: 'low' },
    { token: '80858e4', value: 1800, density: 'medium' },
    { token: '80858ec', value: 1200, density: 'medium' },
    { token: '80858f4', value: 600, density: 'low' },
    { token: '80858fc', value: 2400, density: 'high' },
    { token: '8085904', value: 1100, density: 'medium' },
    { token: '808590c', value: 700, density: 'low' },
  ];

  const getS2Token = (d: unknown) => (d as S2Data).token;
  const getElevation = (d: unknown) => (d as S2Data).value;
  const getFillColor = (d: unknown) => {
    const density = (d as S2Data).density;
    switch (density) {
      case 'high':
        return [255, 80, 120, 200] as [number, number, number, number];
      case 'medium':
        return [255, 180, 80, 200] as [number, number, number, number];
      case 'low':
        return [80, 180, 255, 200] as [number, number, number, number];
      default:
        return [150, 150, 150, 200] as [number, number, number, number];
    }
  };

  const legendItems: CategoryLegendItem[] = [
    { value: 'high', label: 'High Density', color: '#ff5078' },
    { value: 'medium', label: 'Medium Density', color: '#ffb450' },
    { value: 'low', label: 'Low Density', color: '#50b4ff' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglS2, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 10,
  pitch: 45,
  };

  interface S2Data {
  token: string;
  value: number;
  density: 'high' | 'medium' | 'low';
  }

  // S2 cell tokens (Google's spherical geometry library)
  // Level 13 ≈ 1km², Level 15 ≈ 150m², Level 17 ≈ 20m²
  const s2Data: S2Data[] = [
  { token: '80858c4', value: 2800, density: 'high' },
  { token: '80858cc', value: 2100, density: 'high' },
  { token: '80858d4', value: 1500, density: 'medium' },
  ];

  const getS2Token = (d: unknown) => (d as S2Data).token;
  const getElevation = (d: unknown) => (d as S2Data).value;
  const getFillColor = (d: unknown) => {
  const colors = { high: [255, 80, 120], medium: [255, 180, 80], low: [80, 180, 255] };
  return [...colors[(d as S2Data).density], 200];
  };
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglS2
      id="s2-layer"
      :data="s2Data"
      :get-s2-token="getS2Token"
      :get-fill-color="getFillColor"
      :get-elevation="getElevation"
      :extruded="true"
      :pickable="true"
      :auto-highlight="true"
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
          S2 Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Render data using Google S2 geometry spherical cells for uniform
          global coverage.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VControlLegend
                :layer-ids="['s2-layer']"
                position="bottom-left"
                type="category"
                title="Density"
                :items="legendItems"
                :interactive="false"
              />
              <VLayerDeckglS2
                id="s2-layer"
                :data="s2Data"
                :get-s2-token="getS2Token"
                :get-fill-color="getFillColor"
                :get-elevation="getElevation"
                :extruded="true"
                :pickable="true"
                :auto-highlight="true"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> S2 is Google's spherical geometry library that
          divides the Earth into hierarchical cells. Unlike H3, S2 uses
          quadrilateral cells. Common levels: 13 (~1km²), 15 (~150m²), 17
          (~20m²). Used by Google Maps, Foursquare, and others.
        </p>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
