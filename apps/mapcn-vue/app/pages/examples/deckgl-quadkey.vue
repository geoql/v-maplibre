<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglQuadkey,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Quadkey Layer (deck.gl) - mapcn-vue Examples',
    description: 'Visualize data using Bing Maps Quadkey tiles.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Quadkey Layer (deck.gl)',
    description: 'Visualize data using Bing Maps Quadkey tiles.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  // Center on Sacramento where the quadkey data is located
  const mapOptions = computed(() => ({
    container: `quadkey-example-${mapId}`,
    style: mapStyle.value,
    center: [-121.5, 38.56] as [number, number],
    zoom: 11,
    pitch: 45,
    bearing: 0,
  }));

  interface QuadkeyData {
    quadkey: string;
    value: number;
    category: string;
  }

  // Sample quadkey data for Sacramento area
  // Quadkey at zoom level 12
  const quadkeyData: QuadkeyData[] = [
    { quadkey: '023010211030', value: 2500, category: 'High' },
    { quadkey: '023010211031', value: 1800, category: 'Medium' },
    { quadkey: '023010211032', value: 1200, category: 'Medium' },
    { quadkey: '023010211033', value: 900, category: 'Low' },
    { quadkey: '023010211020', value: 2100, category: 'High' },
    { quadkey: '023010211021', value: 1500, category: 'Medium' },
    { quadkey: '023010211022', value: 700, category: 'Low' },
    { quadkey: '023010211023', value: 1100, category: 'Medium' },
    { quadkey: '023010211010', value: 1900, category: 'High' },
    { quadkey: '023010211011', value: 800, category: 'Low' },
  ];

  const getQuadkey = (d: unknown) => (d as QuadkeyData).quadkey;
  const getElevation = (d: unknown) => (d as QuadkeyData).value;
  const getFillColor = (d: unknown) => {
    const category = (d as QuadkeyData).category;
    switch (category) {
      case 'High':
        return [255, 100, 100, 200] as [number, number, number, number];
      case 'Medium':
        return [255, 200, 100, 200] as [number, number, number, number];
      case 'Low':
        return [100, 200, 100, 200] as [number, number, number, number];
      default:
        return [150, 150, 150, 200] as [number, number, number, number];
    }
  };

  const legendItems: CategoryLegendItem[] = [
    { value: 'high', label: 'High', color: '#ff6464' },
    { value: 'medium', label: 'Medium', color: '#ffc864' },
    { value: 'low', label: 'Low', color: '#64c864' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                  import { VMap, VLayerDeckglQuadkey, VControlNavigation } from '@geoql/v-maplibre';

                  const mapOptions = {
                  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                  center: [-121.5, 38.56], // Sacramento area where quadkey data is located
                  zoom: 11,
                  pitch: 45,
                  };

                  interface QuadkeyData {
                  quadkey: string;
                  value: number;
                  category: 'High' | 'Medium' | 'Low';
                  }

                  // Quadkey tiles (Bing Maps tile system)
                  // Length determines zoom level: 12 chars = zoom 12
                  const quadkeyData: QuadkeyData[] = [
                  { quadkey: '023010211030', value: 2500, category: 'High' },
                  { quadkey: '023010211031', value: 1800, category: 'Medium' },
                  { quadkey: '023010211032', value: 1200, category: 'Medium' },
                  ];

                  const getQuadkey = (d: unknown) => (d as QuadkeyData).quadkey;
                  const getElevation = (d: unknown) => (d as QuadkeyData).value;
                  const getFillColor = (d: unknown) => {
                  const category = (d as QuadkeyData).category;
                  const colors = { High: [255, 100, 100], Medium: [255, 200, 100], Low: [100, 200, 100] };
                  return [...colors[category], 200];
                  };
                ${SCRIPT_END}

                <template>
                  <VMap :options="mapOptions" class="h-125 w-full">
                    <VControlNavigation position="top-right" />
                    <VLayerDeckglQuadkey
                      id="quadkey-layer"
                      :data="quadkeyData"
                      :get-quadkey="getQuadkey"
                      :get-fill-color="getFillColor"
                      :get-elevation="getElevation"
                      :extruded="true"
                      :pickable="true"
                      :auto-highlight="true"
                    />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="Quadkey Layer (deck.gl)"
    description="Render data indexed using Bing Maps Quadkey tile system."
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
          <VControlLegend
            :layer-ids="['quadkey-layer']"
            position="bottom-left"
            type="category"
            title="Category"
            :items="legendItems"
            :interactive="false"
          />
          <VLayerDeckglQuadkey
            id="quadkey-layer"
            :data="quadkeyData"
            :get-quadkey="getQuadkey"
            :get-fill-color="getFillColor"
            :get-elevation="getElevation"
            :extruded="true"
            :pickable="true"
            :auto-highlight="true"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
