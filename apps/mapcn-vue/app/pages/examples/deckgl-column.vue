<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglColumn,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Column Layer (deck.gl) - mapcn-vue Examples',
    description: '3D column/bar chart visualization on the map.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Column Layer (deck.gl)',
    description: '3D column/bar chart visualization on the map.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `column-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: -17,
  }));

  // Generate column data (buildings/metrics)
  const columnData = [];
  for (let i = 0; i < 50; i++) {
    columnData.push({
      position: [
        -122.4 + (Math.random() - 0.5) * 0.1,
        37.78 + (Math.random() - 0.5) * 0.08,
      ],
      elevation: Math.random() * 1000 + 200,
      color: Math.random() > 0.5 ? [255, 140, 0, 200] : [0, 200, 150, 200],
    });
  }

  interface ColumnData {
    position: [number, number];
    elevation: number;
    color: [number, number, number, number];
  }

  const legendItems: CategoryLegendItem[] = [
    { value: 'category-a', label: 'Category A', color: '#ff8c00' },
    { value: 'category-b', label: 'Category B', color: '#00c896' },
  ];

  const getPosition = (d: unknown) => (d as ColumnData).position;
  const getElevation = (d: unknown) => (d as ColumnData).elevation;
  const getFillColor = (d: unknown) => (d as ColumnData).color;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglColumn, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 12,
  pitch: 45,
  bearing: -17,
  };

  const columnData = [
  { position: [-122.4, 37.78], elevation: 500, color: [255, 140, 0, 200] },
  { position: [-122.38, 37.79], elevation: 800, color: [0, 200, 150, 200] },
  // ... more columns
  ];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglColumn
      id="column-layer"
      :data="columnData"
      :get-position="(d) => d.position"
      :get-elevation="(d) => d.elevation"
      :get-fill-color="(d) => d.color"
      :disk-resolution="12"
      :radius="50"
      :extruded="true"
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
          Column Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          3D extruded columns for data visualization on the map.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglColumn
                id="column-layer"
                :data="columnData"
                :get-position="getPosition"
                :get-elevation="getElevation"
                :get-fill-color="getFillColor"
                :disk-resolution="12"
                :radius="50"
                :extruded="true"
                :pickable="true"
              />
              <VControlLegend
                position="bottom-left"
                type="category"
                title="Column Categories"
                :layer-ids="['column-layer']"
                :items="legendItems"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <ExampleNavigation />
    </div>
  </div>
</template>
