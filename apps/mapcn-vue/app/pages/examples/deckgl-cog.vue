<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglCOG,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';

  useSeoMeta({
    title: 'COG Layer (deck.gl-raster) - mapcn-vue Examples',
    description:
      'GPU-accelerated Cloud-Optimized GeoTIFF visualization with automatic reprojection.',
  });

  defineOgImage('MapcnDoc', {
    title: 'COG Layer (deck.gl-raster)',
    description:
      'GPU-accelerated Cloud-Optimized GeoTIFF visualization with automatic reprojection.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

  const COG_URL =
    'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif';

  const mapOptions = computed(() => ({
    container: `cog-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 0] as [number, number],
    zoom: 2,
  }));

  const handleGeotiffLoad = (
    _tiff: unknown,
    options: {
      geographicBounds: {
        west: number;
        south: number;
        east: number;
        north: number;
      };
    },
  ) => {
    console.log(
      '[COG Example] GeoTIFF loaded, bounds:',
      options.geographicBounds,
    );
    const { west, south, east, north } = options.geographicBounds;
    mapInstance.value?.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      { padding: 40, duration: 1000 },
    );
  };

  const legendItems: CategoryLegendItem[] = [
    { value: 'vegetation', label: 'Vegetation', color: '#2d7d3e' },
    { value: 'water', label: 'Water', color: '#1a5fb4' },
    { value: 'urban', label: 'Urban / Built-up', color: '#9a9996' },
    { value: 'bare-soil', label: 'Bare Soil', color: '#c8a260' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                  import { VMap, VLayerDeckglCOG, VControlNavigation } from '@geoql/v-maplibre';

                  const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
                    center: [31.5, 30.0], // Egypt/Nile area
                    zoom: 8,
                  };

                  // Sentinel-2 RGB imagery COG
                  const COG_URL = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif';
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VLayerDeckglCOG
                        id="cog-layer"
                        :geotiff="COG_URL"
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="COG Layer (deck.gl-raster)"
    description="GPU-accelerated Cloud-Optimized GeoTIFF visualization with automatic reprojection and intelligent tile streaming."
    :code="codeExample"
    registry="map-deckgl-raster"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap
          :key="mapStyle"
          :options="mapOptions"
          class="size-full"
          @loaded="onMapLoaded"
        >
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerDeckglCOG
            id="cog-layer"
            :geotiff="COG_URL"
            @geotiff-load="handleGeotiffLoad"
          />
          <VControlLegend
            :layer-ids="['cog-layer']"
            position="bottom-left"
            type="category"
            title="Sentinel-2 Imagery"
            :items="legendItems"
            :interactive="false"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
