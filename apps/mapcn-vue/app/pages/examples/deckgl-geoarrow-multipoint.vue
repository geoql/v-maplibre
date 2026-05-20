<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeoArrowScatterplot,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import { tableFromIPC } from 'apache-arrow';
  import type { Table } from 'apache-arrow';
  import { shallowRef } from 'vue';
  import { Slider } from '~/components/ui/slider';

  usePageGeo({
    title: 'GeoArrow Multipoint (deck.gl-geoarrow) - mapcn-vue Examples',
    description:
      'Individual city locations from a GeoArrow IPC file rendered with VLayerDeckglGeoArrowScatterplot. Each city is stored as a Point in a MultiPoint geometry collection.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoArrow Multipoint',
    description: 'City points from a GeoArrow IPC file.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  // Individual city points from the clusters file
  const GEOARROW_URL = '/geoarrow/natural-earth_cities-clusters.arrows';

  const table = shallowRef<Table | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const pointSize = ref<number[]>([8]);
  const opacity = ref<number[]>([255]);

  const mapOptions = computed(() => ({
    container: `geoarrow-example-${mapId}`,
    style: mapStyle.value,
    center: [10, 30] as [number, number],
    zoom: 1.8,
    pitch: 0,
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

  // Dark teal dots
  const pointColor: [number, number, number, number] = [32, 64, 64, 255];

  const legend: CategoryLegendItem[] = [
    { color: '#204040', label: '21 individual cities' },
  ];
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-3">
    <div class="min-w-0 flex flex-col gap-3 flex-1">
      <div class="relative flex-1">
        <ClientOnly>
          <VMap :options="mapOptions" class="h-[500px]">
            <VLayerDeckglGeoArrowScatterplot
              v-if="table"
              :data="table"
              :visible="true"
              :getPosition="([x, y]) => [x, y] as [number, number]"
              :getColor="pointColor"
              :pointSize="pointSize[0]"
              :opacity="opacity[0] / 255"
            />
            <template #layers>
              <VControlNavigation />
              <VControlScale position="bottom-left" />
              <VControlLegend
                v-if="legend.length"
                :items="legend"
                title="Cities"
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
        <h2 class="text-sm font-semibold text-foreground">
          GEOARROW MULTIPOINT
        </h2>
        <span class="text-xs text-muted-foreground">ScatterplotLayer</span>
      </div>

      <div v-if="loading" class="text-xs text-muted-foreground">
        Loading Arrow data…
      </div>
      <div v-else-if="error" class="text-xs text-destructive">{{ error }}</div>
      <div v-else class="text-xs text-muted-foreground">
        {{ table?.numRows }} points · GeoArrow IPC · MultiPoint
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Point size</label>
        <Slider v-model="pointSize" :min="3" :max="30" :step="1" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ pointSize[0] }}px</span
        >
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Opacity</label>
        <Slider v-model="opacity" :min="50" :max="255" :step="1" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ Math.round((opacity[0] / 255) * 100) }}%</span
        >
      </div>
    </div>
  </div>
</template>
