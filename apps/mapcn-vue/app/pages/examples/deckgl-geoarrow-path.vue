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
    title: 'GeoArrow LineStrings (deck.gl-geoarrow) - mapcn-vue Examples',
    description:
      'Three famous travel routes rendered from a GeoArrow IPC file with VLayerDeckglGeoArrowPath. LineStrings are encoded as flat coordinate arrays.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoArrow LineStrings',
    description: 'Famous travel routes from a GeoArrow IPC file.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const GEOARROW_URL = '/geoarrow/famous-routes.arrows';

  const table = shallowRef<Table | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const widthScale = ref<number[]>([10]);
  const opacity = ref<number[]>([200]);

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
    import { VMap, VLayerDeckglGeoArrowPath } from '@geoql/v-maplibre';
    import { tableFromIPC } from 'apache-arrow';

    const table = shallowRef(null);
    onMounted(async () => {
      const url = '/geoarrow/famous-routes.arrows';
      const buffer = await (await fetch(url)).arrayBuffer();
      table.value = tableFromIPC(new Uint8Array(buffer));
    });
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="size-full">
      <VLayerDeckglGeoArrowPath
        v-if="table"
        :data="table"
        :width-scale="10"
        :get-color="[72, 209, 204, 220]"
      />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="GeoArrow LineStrings (deck.gl-geoarrow)"
    description="Three famous travel routes rendered from a GeoArrow IPC file with VLayerDeckglGeoArrowPath. LineStrings are encoded as flat coordinate arrays."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />

          <VLayerDeckglGeoArrowPath
            v-if="table"
            id="geoarrow-routes"
            :data="table"
            :get-color="[72, 209, 204, 220]"
            :get-width="3"
            width-units="pixels"
            :width-scale="widthScale[0]"
            :width-min-pixels="2"
            :opacity="(opacity[0] ?? 200) / 255"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="GeoArrow LineStrings" panel-width="w-72">
        <p class="mb-3 text-xs text-muted-foreground">
          Three famous travel routes from a
          <a
            href="https://geoarrow.org"
            target="_blank"
            class="font-mono text-primary hover:underline"
            >GeoArrow</a
          >
          LineString encoding — coast-to-coast US, London → Tokyo, and Nile
          Delta.
        </p>

        <div class="mb-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div
            class="rounded-sm border border-border bg-background/40 px-2 py-1.5"
          >
            <div
              class="text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Routes
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
            <div class="tabular-nums text-foreground">LineString</div>
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
              <span>Width scale</span>
              <span class="tabular-nums">{{ widthScale[0] }}×</span>
            </div>
            <Slider v-model="widthScale" :min="1" :max="30" :step="1" />
          </div>

          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>Opacity</span>
              <span class="tabular-nums"
                >{{ Math.round(((opacity[0] ?? 200) / 255) * 100) }}%</span
              >
            </div>
            <Slider v-model="opacity" :min="50" :max="255" :step="1" />
          </div>
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
