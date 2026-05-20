<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeoArrowText,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import { tableFromIPC } from 'apache-arrow';
  import type { Table } from 'apache-arrow';
  import { shallowRef } from 'vue';
  import { Slider } from '~/components/ui/slider';

  usePageGeo({
    title: 'GeoArrow Text Labels (deck.gl-geoarrow) - mapcn-vue Examples',
    description:
      'City name labels from a GeoArrow IPC file with a text column rendered via VLayerDeckglGeoArrowText. The geometry is Point (struct x/y) and the name column provides the label text.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoArrow Text Labels',
    description: 'City name labels from a GeoArrow IPC file.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const GEOARROW_URL = '/geoarrow/city-labels.arrows';

  const table = shallowRef<Table | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const fontSize = ref<number[]>([14]);

  const mapOptions = computed(() => ({
    container: `geoarrow-example-${mapId}`,
    style: mapStyle.value,
    center: [30, 20] as [number, number],
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
            <VLayerDeckglGeoArrowText
              v-if="table"
              :data="table"
              :visible="true"
              :getText="(d: Record<string, unknown>) => String(d['name'] ?? '')"
              :getPosition="([x, y]) => [x, y] as [number, number]"
              :getSize="fontSize[0]"
              :getColor="[72, 209, 204, 255]"
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
        <h2 class="text-sm font-semibold text-foreground">GEOARROW TEXT</h2>
        <span class="text-xs text-muted-foreground">TextLayer</span>
      </div>

      <div v-if="loading" class="text-xs text-muted-foreground">
        Loading Arrow data…
      </div>
      <div v-else-if="error" class="text-xs text-destructive">{{ error }}</div>
      <div v-else class="text-xs text-muted-foreground">
        {{ table?.numRows }} labels · GeoArrow IPC · Point + text column
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Font size</label>
        <Slider v-model="fontSize" :min="8" :max="36" :step="1" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ fontSize[0] }}px</span
        >
      </div>
    </div>
  </div>
</template>
