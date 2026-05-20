<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeoArrowPath,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import { tableFromIPC } from 'apache-arrow';
  import type { Table } from 'apache-arrow';
  import { shallowRef } from 'vue';
  import { Slider } from '~/components/ui/slider';

  usePageGeo({
    title: 'GeoArrow MultiLineStrings (deck.gl-geoarrow) - mapcn-vue Examples',
    description:
      'Country boundary lines from a GeoArrow IPC file rendered with VLayerDeckglGeoArrowPath. The MultiLineString geometry is encoded as a list of coordinate rings.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoArrow MultiLineStrings',
    description: 'Country boundary lines from a GeoArrow IPC file.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  // This file uses MultiLineString geometry (list of rings)
  const GEOARROW_URL = '/geoarrow/natural-earth_countries-bounds.arrows';

  const table = shallowRef<Table | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const widthScale = ref<number[]>([1]);
  const opacity = ref<number[]>([180]);

  const mapOptions = computed(() => ({
    container: `geoarrow-example-${mapId}`,
    style: mapStyle.value,
    center: [10, 30] as [number, number],
    zoom: 1.5,
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
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-3">
    <div class="min-w-0 flex flex-col gap-3 flex-1">
      <div class="relative flex-1">
        <ClientOnly>
          <VMap :options="mapOptions" class="h-[500px]">
            <VLayerDeckglGeoArrowPath
              v-if="table"
              :data="table"
              :visible="true"
              :widthScale="widthScale[0]"
              :opacity="opacity[0] / 255"
              :getColor="[180, 180, 180, 200]"
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
        <h2 class="text-sm font-semibold text-foreground">
          GEOARROW MULTILINESTRING
        </h2>
        <span class="text-xs text-muted-foreground">PathLayer</span>
      </div>

      <div v-if="loading" class="text-xs text-muted-foreground">
        Loading Arrow data…
      </div>
      <div v-else-if="error" class="text-xs text-destructive">{{ error }}</div>
      <div v-else class="text-xs text-muted-foreground">
        {{ table?.numRows }} features · GeoArrow IPC · MultiLineString
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Line width</label>
        <Slider v-model="widthScale" :min="1" :max="10" :step="0.5" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ widthScale[0] }}px</span
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
