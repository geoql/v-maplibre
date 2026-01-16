<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglTerrain,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Terrain Layer (deck.gl) - mapcn-vue Examples',
    description: '3D terrain visualization with elevation data.',
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
    container: `terrain-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.75] as [number, number],
    zoom: 11,
    pitch: 60,
    bearing: -17,
  }));

  // Terrain tile URL (using Mapzen/AWS terrain tiles)
  const TERRAIN_IMAGE =
    'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
  const SURFACE_IMAGE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglTerrain, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.75],
  zoom: 11,
  pitch: 60,
  bearing: -17,
};

// Terrain elevation tiles (Mapzen Terrarium format)
const TERRAIN_IMAGE = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
// Surface texture tiles
const SURFACE_IMAGE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglTerrain
      id="terrain-layer"
      :elevation-data="TERRAIN_IMAGE"
      :texture="SURFACE_IMAGE"
      :elevation-decoder="{
        rScaler: 256,
        gScaler: 1,
        bScaler: 1/256,
        offset: -32768,
      }"
      :bounds="[-122.5, 37.6, -122.2, 37.9]"
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
          Terrain Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          3D terrain visualization using elevation data and surface textures.
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
              <VLayerDeckglTerrain
                id="terrain-layer"
                :elevation-data="TERRAIN_IMAGE"
                :texture="SURFACE_IMAGE"
                :elevation-decoder="{
                  rScaler: 256,
                  gScaler: 1,
                  bScaler: 1 / 256,
                  offset: -32768,
                }"
                :bounds="[-122.5, 37.6, -122.2, 37.9]"
                :pickable="true"
              ></VLayerDeckglTerrain>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="TerrainLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
