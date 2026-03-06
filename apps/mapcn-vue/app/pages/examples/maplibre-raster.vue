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

  defineOgImage('MapcnDoc', {
    title: 'Raster Layer',
    description: 'Display raster tile layers on the map.',
    category: 'MapLibre',
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
                    <VMap :options="mapOptions" class="h-125 w-full">
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
  <ComponentDemo
    title="Raster Layer"
    description="Display raster tile layers from tile servers like OpenStreetMap."
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
          <VLayerMaplibreRaster
            source-id="osm-source"
            layer-id="osm-raster"
            :source="rasterSource"
            :layer="rasterLayer"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
