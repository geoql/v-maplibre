<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglWMS,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'WMS Layer (deck.gl) - mapcn-vue Examples',
    description: 'Web Map Service (WMS) integration with deck.gl.',
  });

  defineOgImage('MapcnDoc', {
    title: 'WMS Layer (deck.gl)',
    description: 'Web Map Service (WMS) integration with deck.gl.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `wms-example-${mapId}`,
    style: mapStyle.value,
    center: [10.0, 51.0] as [number, number],
    zoom: 5,
    pitch: 0,
    bearing: 0,
  }));

  // Using terrestris OSM WMS service
  const WMS_URL = 'https://ows.terrestris.de/osm/service';

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VLayerDeckglWMS, VControlNavigation } from '@geoql/v-maplibre';

                    const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [10.0, 51.0],
                    zoom: 5,
                    };

                    // WMS service URL
                    const WMS_URL = 'https://ows.terrestris.de/osm/service';
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VLayerDeckglWMS
                        id="wms-layer"
                        :data="WMS_URL"
                        service-type="wms"
                        :layers="['OSM-WMS']"
                        srs="EPSG:4326"
                        :opacity="0.7"
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="WMS Layer (deck.gl)"
    description="Load and display Web Map Service (WMS) layers with automatic tiling and caching."
    :code="codeExample"
    registry="map-deckgl-geo"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerDeckglWMS
            id="wms-layer"
            :data="WMS_URL"
            service-type="wms"
            :layers="['OSM-WMS']"
            srs="EPSG:4326"
            :opacity="0.7"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
