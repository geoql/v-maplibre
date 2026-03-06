<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeohash,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { GradientLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Geohash Layer (deck.gl) - mapcn-vue Examples',
    description: 'Visualize data using Geohash spatial indexing.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Geohash Layer (deck.gl)',
    description: 'Visualize data using Geohash spatial indexing.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `geohash-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 10,
    pitch: 45,
    bearing: 0,
  }));

  interface GeohashData {
    geohash: string;
    value: number;
    name: string;
  }

  // Sample geohash data for San Francisco area
  // Precision 5 geohashes (~5km x 5km cells)
  const geohashData: GeohashData[] = [
    { geohash: '9q8yu', value: 1500, name: 'Downtown' },
    { geohash: '9q8yv', value: 2200, name: 'Financial District' },
    { geohash: '9q8yt', value: 800, name: 'Mission' },
    { geohash: '9q8ys', value: 1200, name: 'Castro' },
    { geohash: '9q8yk', value: 600, name: 'Sunset' },
    { geohash: '9q8yh', value: 900, name: 'Richmond' },
    { geohash: '9q8yj', value: 1800, name: 'SOMA' },
    { geohash: '9q8yn', value: 1100, name: 'Marina' },
    { geohash: '9q8yq', value: 700, name: 'Presidio' },
    { geohash: '9q8ym', value: 1400, name: 'North Beach' },
  ];

  const getGeohash = (d: unknown) => (d as GeohashData).geohash;
  const getElevation = (d: unknown) => (d as GeohashData).value;
  const getFillColor = (d: unknown) => {
    const value = (d as GeohashData).value;
    const t = (value - 500) / 2000;
    // Gradient from cyan to magenta
    return [
      Math.floor(100 + 155 * t),
      Math.floor(200 * (1 - t)),
      Math.floor(200 + 55 * (1 - t)),
      180,
    ] as [number, number, number, number];
  };

  const legendItems: GradientLegendItem[] = [
    {
      min: 500,
      max: 2500,
      minLabel: 'Low',
      maxLabel: 'High',
      colors: ['#64c8ff', '#b464ff', '#ff00c8'],
    },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VLayerDeckglGeohash, VControlNavigation } from '@geoql/v-maplibre';

                    const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [-122.4, 37.78],
                    zoom: 10,
                    pitch: 45,
                    };

                    interface GeohashData {
                    geohash: string;
                    value: number;
                    }

                    // Geohash precision determines cell size:
                    // 5 = ~5km, 6 = ~1.2km, 7 = ~150m, 8 = ~40m
                    const geohashData: GeohashData[] = [
                    { geohash: '9q8yu', value: 1500 },
                    { geohash: '9q8yv', value: 2200 },
                    { geohash: '9q8yt', value: 800 },
                    // ... more geohashes
                    ];

                    const getGeohash = (d: unknown) => (d as GeohashData).geohash;
                    const getElevation = (d: unknown) => (d as GeohashData).value;
                    const getFillColor = (d: unknown) => {
                    const value = (d as GeohashData).value;
                    const t = value / 2500;
                    return [100 + 155 * t, 200 * (1 - t), 255, 180];
                    };
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VLayerDeckglGeohash
                        id="geohash-layer"
                        :data="geohashData"
                        :get-geohash="getGeohash"
                        :get-fill-color="getFillColor"
                        :get-elevation="getElevation"
                        :extruded="true"
                        :pickable="true"
                        :auto-highlight="true"
                        :elevation-scale="1"
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="Geohash Layer (deck.gl)"
    description="Visualize spatially indexed data using Geohash encoding with automatic cell boundaries."
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
            :layer-ids="['geohash-layer']"
            position="bottom-left"
            type="gradient"
            title="Cell Value"
            :items="legendItems"
            :interactive="false"
          />
          <VLayerDeckglGeohash
            id="geohash-layer"
            :data="geohashData"
            :get-geohash="getGeohash"
            :get-fill-color="getFillColor"
            :get-elevation="getElevation"
            :extruded="true"
            :pickable="true"
            :auto-highlight="true"
            :elevation-scale="1"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
