<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreRaster,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Raster Layer - mapcn-vue Examples',
    description: 'Display raster tile layers on the map.',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `raster-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 20] as [number, number],
    zoom: 2,
  }));

  // Raster source configuration (using OpenStreetMap tiles)
  const rasterSource = {
    type: 'raster' as const,
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    attribution: '© OpenStreetMap contributors',
  };

  // Raster layer configuration
  const rasterLayer = {
    id: 'osm-raster',
    type: 'raster' as const,
    source: 'osm-source',
    paint: {
      'raster-opacity': 0.7,
    },
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerMaplibreRaster, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [0, 20],
  zoom: 2,
};

const rasterSource = {
  type: 'raster',
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  tileSize: 256,
  attribution: '© OpenStreetMap contributors',
};

const rasterLayer = {
  id: 'osm-raster',
  type: 'raster',
  source: 'osm-source',
  paint: {
    'raster-opacity': 0.7,
  },
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerMaplibreRaster
      source-id="osm-source"
      layer-id="osm-raster"
      :source="rasterSource"
      :layer="rasterLayer"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Raster Layer</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Display raster tile layers from tile servers like OpenStreetMap.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerMaplibreRaster
                source-id="osm-source"
                layer-id="osm-raster"
                :source="rasterSource"
                :layer="rasterLayer"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="RasterLayer.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
