<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGridCell,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Grid Cell Layer (deck.gl) - mapcn-vue Examples',
    description: '3D grid cell visualization for aggregated data.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Grid Cell Layer (deck.gl)',
    description: '3D grid cell visualization for aggregated data.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `grid-cell-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 11,
    pitch: 45,
    bearing: 0,
  }));

  interface GridCellData {
    centroid: [number, number];
    value: number;
  }

  // Generate a grid of cells with random values
  const generateGridData = (): GridCellData[] => {
    const cells: GridCellData[] = [];
    const startLng = -122.5;
    const startLat = 37.7;
    const cellSize = 0.02; // ~2km

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        cells.push({
          centroid: [startLng + i * cellSize, startLat + j * cellSize],
          value: Math.random() * 5000 + 500,
        });
      }
    }
    return cells;
  };

  const gridData = generateGridData();

  const getPosition = (d: unknown) => (d as GridCellData).centroid;
  const getElevation = (d: unknown) => (d as GridCellData).value;
  const getFillColor = (d: unknown) => {
    const value = (d as GridCellData).value;
    const t = value / 5500;
    // Color gradient from blue to red
    return [
      Math.floor(255 * t),
      Math.floor(100 * (1 - t)),
      Math.floor(255 * (1 - t)),
      200,
    ] as [number, number, number, number];
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglGridCell, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 11,
  pitch: 45,
  };

  interface GridCellData {
  centroid: [number, number];
  value: number;
  }

  // Pre-aggregated grid data
  const gridData: GridCellData[] = [
  { centroid: [-122.5, 37.7], value: 1000 },
  { centroid: [-122.48, 37.72], value: 2500 },
  // ... more cells
  ];

  const getPosition = (d: unknown) => (d as GridCellData).centroid;
  const getElevation = (d: unknown) => (d as GridCellData).value;
  const getFillColor = (d: unknown) => {
  const value = (d as GridCellData).value;
  const t = value / 5500;
  return [255 * t, 100 * (1 - t), 255 * (1 - t), 200];
  };
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglGridCell
      id="grid-cell-layer"
      :data="gridData"
      :get-position="getPosition"
      :get-fill-color="getFillColor"
      :get-elevation="getElevation"
      :cell-size="2000"
      :extruded="true"
      :coverage="0.9"
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
          Grid Cell Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Render pre-aggregated data as 3D grid cells with elevation and color
          mapping.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglGridCell
                id="grid-cell-layer"
                :data="gridData"
                :get-position="getPosition"
                :get-fill-color="getFillColor"
                :get-elevation="getElevation"
                :cell-size="2000"
                :extruded="true"
                :coverage="0.9"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> GridCellLayer is for rendering pre-aggregated
          data. If you have raw point data that needs aggregation, use GridLayer
          instead. Cell size is specified in meters.
        </p>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
