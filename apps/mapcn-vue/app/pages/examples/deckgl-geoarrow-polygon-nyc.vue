<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeoArrowPolygon,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import { tableFromIPC } from 'apache-arrow';
  import type { Table } from 'apache-arrow';
  import { shallowRef } from 'vue';
  import { Button } from '~/components/ui/button';
  import { Slider } from '~/components/ui/slider';

  usePageGeo({
    title: 'GeoArrow NYC Polygons (deck.gl-geoarrow) - mapcn-vue Examples',
    description:
      'NYC borough outlines from a synthetic GeoArrow IPC file rendered with VLayerDeckglGeoArrowPolygon. Demonstrates MultiPolygon geometry with multiple disjoint shapes.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoArrow NYC Polygons',
    description: 'NYC borough outlines from a GeoArrow IPC file.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const GEOARROW_URL = '/geoarrow/nyc-boroughs.arrows';

  const table = shallowRef<Table | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const extruded = ref(false);
  const elevationScale = ref<number[]>([5000]);
  const opacity = ref<number[]>([180]);

  const mapOptions = computed(() => ({
    container: `geoarrow-example-${mapId}`,
    style: mapStyle.value,
    center: [-73.95, 40.7] as [number, number],
    zoom: 10,
    pitch: extruded.value ? 45 : 0,
    bearing: 0,
  }));

  onMounted(async () => {
    try {
      const response = await fetch(GEOARROW_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      const arrowTable = tableFromIPC(new Uint8Array(buffer));
      if (!arrowTable.batches[0]) throw new Error('No record batches');
      table.value = arrowTable;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  const legend: CategoryLegendItem[] = [
    { color: '#4ecdc4', label: 'NYC boroughs (3 polygons)' },
  ];
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-3">
    <div class="min-w-0 flex flex-col gap-3 flex-1">
      <div class="relative flex-1">
        <ClientOnly>
          <VMap :options="mapOptions" class="h-[500px]">
            <VLayerDeckglGeoArrowPolygon
              v-if="table && !extruded"
              :data="table"
              :visible="true"
              :getFillColor="[72, 209, 204, opacity[0]]"
            />
            <VLayerDeckglGeoArrowPolygon
              v-if="table && extruded"
              :data="table"
              :visible="true"
              :extruded="true"
              :getElevation="elevationScale[0]"
              :getFillColor="[72, 209, 204, opacity[0]]"
            />
            <template #layers>
              <VControlNavigation />
              <VControlScale position="bottom-left" />
              <VControlLegend
                v-if="legend.length"
                :items="legend"
                title="NYC Boroughs"
                position="top-left"
              />
            </template>
          </VMap>
          <template #fallback>
            <div class="h-[500px] skeleton" />
          </template>
        </ClientOnly>
      </div>
    </div>

    <div
      class="w-full lg:w-72 flex flex-col gap-4 p-4 bg-background border rounded-lg"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-foreground">GEOARROW NYC</h2>
        <span class="text-xs text-muted-foreground">PolygonLayer</span>
      </div>

      <div v-if="loading" class="text-xs text-muted-foreground">
        Loading Arrow data…
      </div>
      <div v-else-if="error" class="text-xs text-destructive">{{ error }}</div>
      <div v-else class="text-xs text-muted-foreground">
        {{ table?.numRows }} polygons · GeoArrow IPC · MultiPolygon
      </div>

      <div class="flex flex-col gap-2">
        <Button
          :variant="extruded ? 'default' : 'outline'"
          size="sm"
          @click="extruded = !extruded"
        >
          {{ extruded ? '3D extruded' : 'Flat polygons' }}
        </Button>
      </div>

      <div v-if="extruded" class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground"
          >Elevation scale</label
        >
        <Slider v-model="elevationScale" :min="100" :max="50000" :step="100" />
        <span class="text-xs text-muted-foreground text-right">{{
          elevationScale[0].toLocaleString()
        }}</span>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Fill opacity</label>
        <Slider v-model="opacity" :min="50" :max="255" :step="1" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ Math.round((opacity[0] / 255) * 100) }}%</span
        >
      </div>
    </div>
  </div>
</template>
