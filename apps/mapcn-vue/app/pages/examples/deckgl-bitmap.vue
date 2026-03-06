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

  defineOgImage('MapcnDoc', {
    title: 'Bitmap Layer (deck.gl)',
    description: 'Georeferenced image overlay on the map.',
    category: 'deck.gl',
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
                    <VMap :options="mapOptions" class="h-125 w-full">
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
  <ComponentDemo
    title="Bitmap Layer (deck.gl)"
    description="Overlay georeferenced images on the map with precise positioning."
    :code="codeExample"
    registry="map-deckgl-core"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
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
  </ComponentDemo>
</template>
