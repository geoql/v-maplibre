<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglSolidPolygon,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Solid Polygon Layer (deck.gl) - mapcn-vue Examples',
    description: '3D extruded solid polygons visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Solid Polygon Layer (deck.gl)',
    description: '3D extruded solid polygons visualization.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `solid-polygon-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 13,
    pitch: 45,
    bearing: 0,
  }));

  interface BuildingData {
    polygon: [number, number][];
    height: number;
    color: [number, number, number, number];
    name: string;
  }

  // Sample building footprints in San Francisco
  const buildings: BuildingData[] = [
    {
      name: 'Building A',
      polygon: [
        [-122.405, 37.785],
        [-122.403, 37.785],
        [-122.403, 37.783],
        [-122.405, 37.783],
      ],
      height: 150,
      color: [64, 192, 255, 200],
    },
    {
      name: 'Building B',
      polygon: [
        [-122.41, 37.78],
        [-122.408, 37.78],
        [-122.408, 37.778],
        [-122.41, 37.778],
      ],
      height: 200,
      color: [255, 140, 64, 200],
    },
    {
      name: 'Building C',
      polygon: [
        [-122.395, 37.782],
        [-122.393, 37.782],
        [-122.392, 37.78],
        [-122.394, 37.779],
        [-122.396, 37.78],
      ],
      height: 100,
      color: [128, 255, 128, 200],
    },
    {
      name: 'Building D',
      polygon: [
        [-122.4, 37.775],
        [-122.398, 37.775],
        [-122.398, 37.773],
        [-122.4, 37.773],
      ],
      height: 250,
      color: [255, 64, 128, 200],
    },
    {
      name: 'Building E',
      polygon: [
        [-122.415, 37.785],
        [-122.412, 37.785],
        [-122.412, 37.782],
        [-122.415, 37.782],
      ],
      height: 180,
      color: [192, 128, 255, 200],
    },
  ];

  const getPolygon = (d: unknown) => (d as BuildingData).polygon;
  const getFillColor = (d: unknown) => (d as BuildingData).color;
  const getElevation = (d: unknown) => (d as BuildingData).height;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglSolidPolygon, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 13,
  pitch: 45,
  };

  interface BuildingData {
  polygon: [number, number][];
  height: number;
  color: [number, number, number, number];
  }

  const buildings: BuildingData[] = [
  {
    polygon: [[-122.405, 37.785], [-122.403, 37.785], [-122.403, 37.783], [-122.405, 37.783]],
    height: 150,
    color: [64, 192, 255, 200],
  },
  // ... more buildings
  ];

  const getPolygon = (d: unknown) => (d as BuildingData).polygon;
  const getFillColor = (d: unknown) => (d as BuildingData).color;
  const getElevation = (d: unknown) => (d as BuildingData).height;
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglSolidPolygon
      id="solid-polygon-layer"
      :data="buildings"
      :get-polygon="getPolygon"
      :get-fill-color="getFillColor"
      :get-elevation="getElevation"
      :extruded="true"
      :wireframe="true"
      :pickable="true"
      :elevation-scale="1"
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
          Solid Polygon Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Render 3D extruded polygons with solid fills and optional wireframe.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglSolidPolygon
                id="solid-polygon-layer"
                :data="buildings"
                :get-polygon="getPolygon"
                :get-fill-color="getFillColor"
                :get-elevation="getElevation"
                :extruded="true"
                :wireframe="true"
                :pickable="true"
                :elevation-scale="1"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> SolidPolygonLayer is a more performant
          alternative to PolygonLayer when you only need filled polygons without
          stroke. It's ideal for building footprints, zoning areas, and other 3D
          extrusions.
        </p>
      </div>
    </div>
  </div>
</template>
