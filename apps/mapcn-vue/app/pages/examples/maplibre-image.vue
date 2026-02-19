<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreImage,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Image Layer - mapcn-vue Examples',
    description: 'Overlay images on specific map coordinates.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Image Layer',
    description: 'Overlay images on specific map coordinates.',
    category: 'MapLibre',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `image-example-${mapId}`,
    style: mapStyle.value,
    center: [-80.425, 46.437] as [number, number],
    zoom: 4,
  }));

  // Image source - using a weather radar image from MapLibre docs example
  const imageSource = {
    type: 'image' as const,
    url: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    coordinates: [
      [-80.425, 46.437], // top-left
      [-71.516, 46.437], // top-right
      [-71.516, 37.936], // bottom-right
      [-80.425, 37.936], // bottom-left
    ],
  };

  // Image layer configuration
  const imageLayer = {
    id: 'image-overlay',
    type: 'raster' as const,
    source: 'image-source',
    paint: {
      'raster-opacity': 0.85,
      'raster-fade-duration': 0,
    },
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerMaplibreImage, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-80.425, 46.437],
  zoom: 4,
};

const imageSource = {
  type: 'image',
  url: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
  coordinates: [
    [-80.425, 46.437], // top-left
    [-71.516, 46.437], // top-right
    [-71.516, 37.936], // bottom-right
    [-80.425, 37.936], // bottom-left
  ],
};

const imageLayer = {
  id: 'image-overlay',
  type: 'raster',
  source: 'image-source',
  paint: {
    'raster-opacity': 0.85,
  },
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerMaplibreImage
      source-id="image-source"
      layer-id="image-overlay"
      :source="imageSource"
      :layer="imageLayer"
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Image Layer</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Overlay georeferenced images on specific map coordinates.
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
              <VLayerMaplibreImage
                source-id="image-source"
                layer-id="image-overlay"
                :source="imageSource"
                :layer="imageLayer"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock :code="codeExample" lang="vue" filename="ImageLayer.vue" />
        </div>
      </div>
    </div>
  </div>
</template>
