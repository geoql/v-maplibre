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
    title: 'Land Cover COG - mapcn-vue Examples',
    description:
      'Render NLCD Land Cover classification data with automatic colormap visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Land Cover COG',
    description:
      'Render NLCD Land Cover classification data with automatic colormap visualization.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

  // NLCD Land Cover COG - 1.3GB file streamed efficiently via COG tiling
  // Shows land use classification across the continental US
  const COG_URL =
    'https://s3.us-east-1.amazonaws.com/ds-deck.gl-raster-public/cog/Annual_NLCD_LndCov_2024_CU_C1V1.tif';

  const mapOptions = computed(() => ({
    container: `landcover-example-${mapId}`,
    style: mapStyle.value,
    center: [-98.5, 39.8] as [number, number],
    zoom: 4,
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
      '[Land Cover Example] COG loaded, bounds:',
      options.geographicBounds,
    );
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VLayerDeckglCOG, VControlNavigation } from '@geoql/v-maplibre';

                    const mapOptions = {
                      style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
                      center: [-98.5, 39.8], // Continental US
                      zoom: 4,
                    };

                    // NLCD Land Cover COG with automatic colormap
                    const COG_URL = 'https://s3.us-east-1.amazonaws.com/.../NLCD_LndCov.tif';
                    ${SCRIPT_END}

                    <template>
                      <VMap :options="mapOptions" class="h-125 w-full">
                        <VControlNavigation position="top-right" />
                        <VLayerDeckglCOG
                          id="landcover-layer"
                          :geotiff="COG_URL"
                        />
                      </VMap>
                    </template>`;

  const mapLegendItems: CategoryLegendItem[] = [
    { value: 'open-water', label: 'Open Water', color: '#466b9f' },
    { value: 'ice-snow', label: 'Perennial Ice/Snow', color: '#d1def8' },
    { value: 'dev-open', label: 'Developed, Open Space', color: '#dec5c5' },
    { value: 'dev-low', label: 'Developed, Low Intensity', color: '#d99282' },
    {
      value: 'dev-med',
      label: 'Developed, Medium Intensity',
      color: '#eb0000',
    },
    { value: 'dev-high', label: 'Developed, High Intensity', color: '#ab0000' },
    { value: 'barren', label: 'Barren Land', color: '#b3ac9f' },
    { value: 'deciduous', label: 'Deciduous Forest', color: '#68ab5f' },
    { value: 'evergreen', label: 'Evergreen Forest', color: '#1c5f2c' },
    { value: 'mixed-forest', label: 'Mixed Forest', color: '#b5c58f' },
    { value: 'shrub', label: 'Shrub/Scrub', color: '#ccb879' },
    { value: 'grassland', label: 'Grassland/Herbaceous', color: '#dfdfc2' },
    { value: 'pasture', label: 'Pasture/Hay', color: '#dcd939' },
    { value: 'crops', label: 'Cultivated Crops', color: '#ab6c28' },
    { value: 'woody-wetlands', label: 'Woody Wetlands', color: '#b8d9eb' },
    {
      value: 'herbaceous-wetlands',
      label: 'Emergent Herbaceous Wetlands',
      color: '#6c9fb8',
    },
  ];
</script>

<template>
  <ComponentDemo
    title="Land Cover COG"
    description="Visualize NLCD Land Cover classification data with automatic colormap rendering. A 1.3GB dataset streamed efficiently via COG tiling."
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
            id="landcover-layer"
            :geotiff="COG_URL"
            @geotiff-load="handleGeotiffLoad"
          />
          <VControlLegend
            :layer-ids="['landcover-layer']"
            position="bottom-left"
            type="category"
            title="Land Cover Classes"
            :items="mapLegendItems"
            :interactive="false"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
