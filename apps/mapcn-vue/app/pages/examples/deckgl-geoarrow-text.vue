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

  // GeoArrow Text expects getText as the Arrow Data of the string column
  const getText = computed(() => {
    if (!table.value) return null;
    return table.value.getChild('name')?.data[0] ?? null;
  });

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

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
    import { VMap, VLayerDeckglGeoArrowText } from '@geoql/v-maplibre';
    import { tableFromIPC } from 'apache-arrow';

    const table = shallowRef(null);
    onMounted(async () => {
      const url = '/geoarrow/city-labels.arrows';
      const buffer = await (await fetch(url)).arrayBuffer();
      table.value = tableFromIPC(new Uint8Array(buffer));
    });
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="size-full">
      <VLayerDeckglGeoArrowText
        v-if="table"
        :data="table"
        :get-text="table.getChild('name').data[0]"
        :get-size="14"
        size-units="pixels"
        :get-color="[180, 220, 255, 255]"
      />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="GeoArrow Text Labels (deck.gl-geoarrow)"
    description="City name labels rendered from a GeoArrow IPC file. The geometry column is a Point (struct x/y) and the name column provides label text."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />

          <VLayerDeckglGeoArrowText
            v-if="table && getText"
            id="geoarrow-text"
            :data="table"
            :get-text="getText"
            :get-size="fontSize[0]"
            size-units="pixels"
            :get-color="[200, 220, 255, 255]"
            font-family="sans-serif"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="GeoArrow Text" panel-width="w-72">
        <p class="mb-3 text-xs text-muted-foreground">
          Text labels driven by a
          <a
            href="https://geoarrow.org"
            target="_blank"
            class="font-mono text-primary hover:underline"
            >GeoArrow</a
          >
          Point geometry plus a separate
          <span class="font-mono text-foreground">name</span>
          column.
        </p>

        <div class="mb-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div
            class="rounded-sm border border-border bg-background/40 px-2 py-1.5"
          >
            <div
              class="text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Labels
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
            <div class="tabular-nums text-foreground">Point + name</div>
          </div>
        </div>

        <div v-if="error" class="mb-3 text-xs text-destructive">
          {{ error }}
        </div>

        <div>
          <div
            class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span>Font size</span>
            <span class="tabular-nums">{{ fontSize[0] }}px</span>
          </div>
          <Slider v-model="fontSize" :min="8" :max="48" :step="1" />
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
