<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreVideo,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Video Layer - mapcn-vue Examples',
    description: 'Overlay video on specific map coordinates.',
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
    container: `video-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 12,
  }));

  // Video source - using a sample video
  const videoSource = {
    type: 'video' as const,
    urls: [
      'https://static-assets.mapbox.com/mapbox-gl-js/drone.mp4',
      'https://static-assets.mapbox.com/mapbox-gl-js/drone.webm',
    ],
    coordinates: [
      [-122.45, 37.82], // top-left
      [-122.35, 37.82], // top-right
      [-122.35, 37.74], // bottom-right
      [-122.45, 37.74], // bottom-left
    ],
  };

  // Video layer configuration
  const videoLayer = {
    id: 'video-overlay',
    type: 'raster' as const,
    source: 'video-source',
    paint: {
      'raster-opacity': 0.9,
    },
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerMaplibreVideo, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 12,
};

const videoSource = {
  type: 'video',
  urls: [
    'https://example.com/video.mp4',
    'https://example.com/video.webm',
  ],
  coordinates: [
    [-122.45, 37.82], // top-left
    [-122.35, 37.82], // top-right
    [-122.35, 37.74], // bottom-right
    [-122.45, 37.74], // bottom-left
  ],
};

const videoLayer = {
  id: 'video-overlay',
  type: 'raster',
  source: 'video-source',
  paint: {
    'raster-opacity': 0.9,
  },
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerMaplibreVideo
      source-id="video-source"
      layer-id="video-overlay"
      :source="videoSource"
      :layer="videoLayer"
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Video Layer</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Overlay georeferenced video content on specific map coordinates.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerMaplibreVideo
                source-id="video-source"
                layer-id="video-overlay"
                :source="videoSource"
                :layer="videoLayer"
              ></VLayerMaplibreVideo>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="VideoLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
