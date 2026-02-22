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

  defineOgImage('MapcnDoc', {
    title: 'Polygon Layer (deck.gl)',
    description: 'Render filled and stroked polygons.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

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
  <VMap :options="mapOptions" class="h-125 w-full">
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
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Polygon Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Render filled and stroked polygons for zones, boundaries, and areas.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
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
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <ExampleNavigation />
    </div>
  </div>
</template>
