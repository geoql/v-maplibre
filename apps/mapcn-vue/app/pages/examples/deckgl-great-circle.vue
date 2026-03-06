<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGreatCircle,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import type { GreatCircleData } from '~/types/great-circle';

  useSeoMeta({
    title: 'Great Circle Layer (deck.gl) - mapcn-vue Examples',
    description: 'Great circle arcs for global flight paths.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Great Circle Layer (deck.gl)',
    description: 'Great circle arcs for global flight paths.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `great-circle-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
  }));

  // Flight routes from San Francisco
  const flightData = [
    {
      from: [-122.4, 37.8],
      to: [139.7, 35.7],
      name: 'San Francisco → Tokyo',
      color: [255, 140, 0],
    },
    {
      from: [-122.4, 37.8],
      to: [-0.12, 51.5],
      name: 'San Francisco → London',
      color: [0, 200, 150],
    },
    {
      from: [-122.4, 37.8],
      to: [2.35, 48.85],
      name: 'San Francisco → Paris',
      color: [138, 43, 226],
    },
    {
      from: [-122.4, 37.8],
      to: [116.4, 39.9],
      name: 'San Francisco → Beijing',
      color: [255, 99, 71],
    },
    {
      from: [-122.4, 37.8],
      to: [151.2, -33.9],
      name: 'San Francisco → Sydney',
      color: [30, 144, 255],
    },
    {
      from: [-122.4, 37.8],
      to: [-43.2, -22.9],
      name: 'San Francisco → Rio',
      color: [255, 215, 0],
    },
    {
      from: [-122.4, 37.8],
      to: [77.2, 28.6],
      name: 'San Francisco → Delhi',
      color: [50, 205, 50],
    },
  ];

  const legendItems: CategoryLegendItem[] = [
    { value: 'tokyo', label: 'Tokyo', color: '#ff8c00' },
    { value: 'london', label: 'London', color: '#00c896' },
    { value: 'paris', label: 'Paris', color: '#8a2be2' },
    { value: 'beijing', label: 'Beijing', color: '#ff6347' },
    { value: 'sydney', label: 'Sydney', color: '#1e90ff' },
    { value: 'rio', label: 'Rio', color: '#ffd700' },
    { value: 'delhi', label: 'Delhi', color: '#32cd32' },
  ];

  const getSourcePosition = (d: unknown) => (d as GreatCircleData).from;
  const getTargetPosition = (d: unknown) => (d as GreatCircleData).to;
  const getSourceColor = (d: unknown) => (d as GreatCircleData).color;
  const getTargetColor = (d: unknown) => [
    ...(d as GreatCircleData).color.slice(0, 3),
    100,
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VLayerDeckglGreatCircle, VControlNavigation } from '@geoql/v-maplibre';

                    const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [0, 30],
                    zoom: 1.5,
                    };

                    const flightData = [
                    { from: [-122.4, 37.8], to: [139.7, 35.7], name: 'SF → Tokyo', color: [255, 140, 0] },
                    { from: [-122.4, 37.8], to: [-0.12, 51.5], name: 'SF → London', color: [0, 200, 150] },
                    // ... more routes
                    ];
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VLayerDeckglGreatCircle
                        id="great-circle-layer"
                        :data="flightData"
                        :get-source-position="(d) => d.from"
                        :get-target-position="(d) => d.to"
                        :get-source-color="(d) => d.color"
                        :get-target-color="(d) => [...d.color, 100]"
                        :get-stroke-width="3"
                        :pickable="true"
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="Great Circle Layer (deck.gl)"
    description="Great circle arcs showing the shortest path between points on Earth."
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
          <VLayerDeckglGreatCircle
            id="great-circle-layer"
            :data="flightData"
            :get-source-position="getSourcePosition"
            :get-target-position="getTargetPosition"
            :get-source-color="getSourceColor"
            :get-target-color="getTargetColor"
            :get-stroke-width="3"
            :pickable="true"
          />
          <VControlLegend
            position="bottom-left"
            type="category"
            title="Flight Destinations"
            :layer-ids="['great-circle-layer']"
            :items="legendItems"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
