<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglPolygon,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Polygon Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render filled and stroked polygons.',
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
    container: `polygon-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 12,
  }));

  // Generate polygon data (neighborhoods/zones)
  const polygonData = [
    {
      polygon: [
        [-122.45, 37.78],
        [-122.43, 37.8],
        [-122.41, 37.79],
        [-122.42, 37.77],
        [-122.45, 37.78],
      ],
      name: 'Zone A',
      fillColor: [255, 140, 0, 150],
      lineColor: [255, 140, 0],
    },
    {
      polygon: [
        [-122.4, 37.77],
        [-122.38, 37.79],
        [-122.36, 37.78],
        [-122.37, 37.76],
        [-122.4, 37.77],
      ],
      name: 'Zone B',
      fillColor: [0, 200, 150, 150],
      lineColor: [0, 200, 150],
    },
    {
      polygon: [
        [-122.42, 37.81],
        [-122.4, 37.83],
        [-122.38, 37.82],
        [-122.39, 37.8],
        [-122.42, 37.81],
      ],
      name: 'Zone C',
      fillColor: [138, 43, 226, 150],
      lineColor: [138, 43, 226],
    },
  ];

  interface PolygonData {
    polygon: [number, number][];
    name: string;
    fillColor: [number, number, number, number];
    lineColor: [number, number, number];
  }

  const getPolygon = (d: unknown) => (d as PolygonData).polygon;
  const getFillColor = (d: unknown) => (d as PolygonData).fillColor;
  const getLineColor = (d: unknown) => (d as PolygonData).lineColor;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglPolygon, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 12,
};

const polygonData = [
  {
    polygon: [[-122.45, 37.78], [-122.43, 37.8], [-122.41, 37.79], [-122.42, 37.77], [-122.45, 37.78]],
    name: 'Zone A',
    fillColor: [255, 140, 0, 150],
    lineColor: [255, 140, 0],
  },
  // ... more polygons
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglPolygon
      id="polygon-layer"
      :data="polygonData"
      :get-polygon="(d) => d.polygon"
      :get-fill-color="(d) => d.fillColor"
      :get-line-color="(d) => d.lineColor"
      :get-line-width="2"
      :stroked="true"
      :filled="true"
      :pickable="true"
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Polygon Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render filled and stroked polygons for zones, boundaries, and areas.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VControlScale position="bottom-left"></VControlScale>
              <VLayerDeckglPolygon
                id="polygon-layer"
                :data="polygonData"
                :get-polygon="getPolygon"
                :get-fill-color="getFillColor"
                :get-line-color="getLineColor"
                :get-line-width="2"
                :stroked="true"
                :filled="true"
                :pickable="true"
              ></VLayerDeckglPolygon>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="PolygonLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
