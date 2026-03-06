<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreVideo,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Video Layer - mapcn-vue Examples',
    description: 'Overlay video on specific map coordinates.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Video Layer',
    description: 'Overlay video on specific map coordinates.',
    category: 'MapLibre',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

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
                    <VMap :options="mapOptions" class="h-125 w-full">
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
  <ComponentDemo
    title="Video Layer"
    description="Overlay georeferenced video content on specific map coordinates."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerMaplibreVideo
            source-id="video-source"
            layer-id="video-overlay"
            :source="videoSource"
            :layer="videoLayer"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
