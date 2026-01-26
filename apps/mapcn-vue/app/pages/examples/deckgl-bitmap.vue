<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglBitmap,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Bitmap Layer (deck.gl) - mapcn-vue Examples',
    description: 'Georeferenced image overlay on the map.',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `bitmap-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.75] as [number, number],
    zoom: 11,
  }));

  const IMAGE_URL =
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-districts.png';

  const BOUNDS: [number, number, number, number] = [
    -122.519, 37.7045, -122.355, 37.829,
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglBitmap, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.75],
  zoom: 11,
};

// Image URL and geographic bounds [west, south, east, north]
const IMAGE_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-districts.png';
const BOUNDS = [-122.519, 37.7045, -122.355, 37.829];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglBitmap
      id="bitmap-layer"
      :image="IMAGE_URL"
      :bounds="BOUNDS"
      :opacity="0.8"
      :pickable="true"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Bitmap Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Overlay georeferenced images on the map with precise positioning.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          Data source:
          <a
            href="https://github.com/visgl/deck.gl-data"
            target="_blank"
            class="text-primary hover:underline"
            >deck.gl-data</a
          >
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
              <VLayerDeckglBitmap
                id="bitmap-layer"
                :image="IMAGE_URL"
                :bounds="BOUNDS"
                :opacity="0.8"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="BitmapLayer.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
