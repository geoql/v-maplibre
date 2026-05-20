<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeoArrowTrips,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import { tableFromIPC } from 'apache-arrow';
  import type { Table } from 'apache-arrow';
  import { shallowRef } from 'vue';
  import { Slider } from '~/components/ui/slider';

  usePageGeo({
    title: 'GeoArrow Trips (deck.gl-geoarrow) - mapcn-vue Examples',
    description:
      'Animated travel paths from a GeoArrow IPC file rendered with VLayerDeckglGeoArrowTrips. Each trip has a timestamp column that controls the animation progress along the path.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoArrow Trips',
    description: 'Animated travel paths from a GeoArrow IPC file.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const GEOARROW_URL = '/geoarrow/city-trips.arrows';

  const table = shallowRef<Table | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const currentTime = ref<number[]>([0]);
  const speed = ref<number[]>([100]);
  const trailLength = ref<number[]>([80]);

  const mapOptions = computed(() => ({
    container: `geoarrow-example-${mapId}`,
    style: mapStyle.value,
    center: [30, 20] as [number, number],
    zoom: 1.5,
    pitch: 45,
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

  // timestamps are in ms; max time = 240000ms
  const maxTime = 240000;
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-3">
    <div class="min-w-0 flex flex-col gap-3 flex-1">
      <div class="relative flex-1">
        <ClientOnly>
          <VMap :options="mapOptions" class="h-[500px]">
            <VLayerDeckglGeoArrowTrips
              v-if="table"
              :data="table"
              :visible="true"
              :currentTime="currentTime[0]"
              :speed="speed[0]"
              :trailLength="trailLength[0]"
              :getTimestamp="
                (d: Record<string, unknown>) => {
                  const ts = d['timestamps'];
                  return Array.isArray(ts) ? (ts[ts.length - 1] as number) : 0;
                }
              "
              :getColor="[72, 209, 204, 200]"
            />
            <template #layers>
              <VControlNavigation />
              <VControlScale position="bottom-left" />
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
        <h2 class="text-sm font-semibold text-foreground">GEOARROW TRIPS</h2>
        <span class="text-xs text-muted-foreground">TripsLayer</span>
      </div>

      <div v-if="loading" class="text-xs text-muted-foreground">
        Loading Arrow data…
      </div>
      <div v-else-if="error" class="text-xs text-destructive">{{ error }}</div>
      <div v-else class="text-xs text-muted-foreground">
        {{ table?.numRows }} trips · GeoArrow IPC · LineString + timestamps
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground"
          >Current time (ms)</label
        >
        <Slider v-model="currentTime" :min="0" :max="maxTime" :step="1000" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ currentTime[0].toLocaleString() }}ms</span
        >
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Speed</label>
        <Slider v-model="speed" :min="1" :max="500" :step="1" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ speed[0] }}x</span
        >
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Trail length</label>
        <Slider v-model="trailLength" :min="10" :max="200" :step="5" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ trailLength[0] }} frames</span
        >
      </div>
    </div>
  </div>
</template>
