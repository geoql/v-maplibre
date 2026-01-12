<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglTile3D,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Tile 3D Layer (deck.gl) - mapcn-vue Examples',
    description: '3D Tiles visualization with Cesium Ion data.',
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
    container: `tile3d-example-${mapId}`,
    style: mapStyle.value,
    center: [144.9717, -37.8048] as [number, number], // Melbourne, Australia
    zoom: 17,
    pitch: 45,
    bearing: 0,
  }));

  // Using a public 3D Tiles dataset - Melbourne Photogrammetry
  const TILESET_URL =
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/3d-tiles/RoyalExhibitionBuilding/tileset.json';

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglTile3D, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [144.9717, -37.8048], // Melbourne, Australia
  zoom: 17,
  pitch: 45,
  bearing: 0,
};

// 3D Tiles dataset URL
const TILESET_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/3d-tiles/RoyalExhibitionBuilding/tileset.json';
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglTile3D
      id="tile3d-layer"
      :data="TILESET_URL"
      :point-size="2"
      :pickable="true"
      @tileset-load="(tileset) => console.log('Tileset loaded:', tileset)"
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
          Tile 3D Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Load and display 3D Tiles datasets (Cesium Ion, Google 3D Tiles, etc.)
          with automatic level-of-detail.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglTile3D
                id="tile3d-layer"
                :data="TILESET_URL"
                :point-size="2"
                :pickable="true"
              ></VLayerDeckglTile3D>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="Tile3DLayer.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Data source:</strong> Royal Exhibition Building 3D Tiles from
          <a
            href="https://github.com/visgl/deck.gl-data"
            target="_blank"
            class="text-primary hover:underline"
            >deck.gl-data</a
          >. Supports Cesium 3D Tiles 1.0 format including point clouds, batched
          3D models, and instanced 3D models.
        </p>
      </div>
    </div>
  </div>
</template>
