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

  // timestamps are in ms; max time = 6000ms
  const maxTime = 6000;

  // GeoArrow TripsLayer needs the timestamps column as an Arrow Data object
  const getTimestamps = computed(() => {
    if (!table.value) return null;
    return table.value.getChild('timestamps')?.data[0] ?? null;
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
    import { VMap, VLayerDeckglGeoArrowTrips } from '@geoql/v-maplibre';
    import { tableFromIPC } from 'apache-arrow';

    const table = shallowRef(null);
    const currentTime = ref(0);
    onMounted(async () => {
      const url = '/geoarrow/city-trips.arrows';
      const buffer = await (await fetch(url)).arrayBuffer();
      table.value = tableFromIPC(new Uint8Array(buffer));
    });
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="size-full">
      <VLayerDeckglGeoArrowTrips
        v-if="table"
        :data="table"
        :get-timestamps="table.getChild('timestamps').data[0]"
        :current-time="currentTime"
        :trail-length="80"
        :get-color="[180, 220, 255, 255]"
        :get-width="3"
        width-units="pixels"
      />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="GeoArrow Trips (deck.gl-geoarrow)"
    description="Animated travel paths from a GeoArrow IPC file. Each trip has a timestamp column that drives the animation along the path."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />

          <VLayerDeckglGeoArrowTrips
            v-if="table && getTimestamps"
            id="geoarrow-trips"
            :data="table"
            :get-timestamps="getTimestamps"
            :current-time="currentTime[0]"
            :trail-length="trailLength[0]"
            :get-color="[180, 220, 255, 220]"
            :get-width="3"
            width-units="pixels"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="GeoArrow Trips" panel-width="w-72">
        <p class="mb-3 text-xs text-muted-foreground">
          Animated trips from a
          <a
            href="https://geoarrow.org"
            target="_blank"
            class="font-mono text-primary hover:underline"
            >GeoArrow</a
          >
          LineString + parallel timestamps column — the animation head walks
          each path.
        </p>

        <div class="mb-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div
            class="rounded-sm border border-border bg-background/40 px-2 py-1.5"
          >
            <div
              class="text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Trips
            </div>
            <div class="tabular-nums text-foreground">
              <span v-if="loading">—</span>
              <span v-else-if="error" class="text-destructive">err</span>
              <span v-else-if="table">{{ table.numRows }}</span>
              <span v-else>—</span>
            </div>
          </div>
          <div
            class="rounded-sm border border-border bg-background/40 px-2 py-1.5"
          >
            <div
              class="text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Format
            </div>
            <div class="tabular-nums text-foreground">Trips</div>
          </div>
        </div>

        <div v-if="error" class="mb-3 text-xs text-destructive">
          {{ error }}
        </div>

        <div class="space-y-3">
          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>Time</span>
              <span class="tabular-nums">{{ currentTime[0] }}ms</span>
            </div>
            <Slider
              v-model="currentTime"
              :min="0"
              :max="maxTime"
              :step="1000"
            />
          </div>

          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>Trail length</span>
              <span class="tabular-nums">{{ trailLength[0] }}</span>
            </div>
            <Slider v-model="trailLength" :min="10" :max="200" :step="1" />
          </div>

          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>Speed</span>
              <span class="tabular-nums">{{ speed[0] }}</span>
            </div>
            <Slider v-model="speed" :min="10" :max="500" :step="10" />
          </div>
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
