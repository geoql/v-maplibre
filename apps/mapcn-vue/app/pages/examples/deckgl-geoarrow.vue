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
  import { markRaw, shallowRef, watch } from 'vue';
  import { Button } from '~/components/ui/button';
  import { Slider } from '~/components/ui/slider';

  usePageGeo({
    title: 'GeoArrow Polygons (deck.gl-geoarrow) - mapcn-vue Examples',
    description:
      'Country boundaries from a native GeoArrow IPC file rendered with VLayerDeckglGeoArrowPolygon. Zero GeoJSON parsing — Arrow RecordBatch goes straight to the GPU.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoArrow Polygons',
    description:
      'Natural Earth countries from a native GeoArrow IPC file rendered with deck.gl-geoarrow.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const GEOARROW_URL =
    'https://cdn.jsdelivr.net/gh/geoarrow/geoarrow-data@main/natural-earth/files/natural-earth_countries-geography.arrows';

  const table = shallowRef<Table | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const firstBatch = computed(() => table.value?.batches[0] ?? null);
  const extruded = ref(false);
  const elevationScale = ref<number[]>([50000]);
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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} loading ${GEOARROW_URL}`);
      }
      const buffer = await response.arrayBuffer();
      const arrowTable = tableFromIPC(new Uint8Array(buffer));
      if (!arrowTable.batches[0]) {
        throw new Error('Arrow IPC file contains no record batches');
      }
      console.log(
        '[GA-PAGE] table set, batches:',
        arrowTable.batches.length,
        'numRows:',
        arrowTable.numRows,
        'has geometry:',
        !!arrowTable.getChild('geometry'),
      );
      table.value = arrowTable;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  const fillOpacity = computed<[number, number, number, number]>(() => [
    100,
    150,
    220,
    opacity.value[0] ?? 180,
  ]);

  const elevationMultiplier = computed(() => elevationScale.value[0] ?? 50000);

  const legendItems: CategoryLegendItem[] = [
    { value: 'land', label: 'Land polygon', color: 'rgb(100, 150, 220)' },
    { value: 'border', label: 'Country border', color: 'rgb(180, 220, 255)' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VLayerDeckglGeoArrowPolygon } from '@geoql/v-maplibre';
                    import { tableFromIPC } from 'apache-arrow';
                    import type { RecordBatch } from 'apache-arrow';

  const table = shallowRef<Table | null>(null);

                    onMounted(async () => {
                      const url = 'https://cdn.jsdelivr.net/gh/geoarrow/geoarrow-data@main/natural-earth/files/natural-earth_countries-geography.arrows';
                      const buffer = await (await fetch(url)).arrayBuffer();
                      const table = tableFromIPC(new Uint8Array(buffer));
                      batch.value = table.batches[0];
                    });
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VLayerDeckglGeoArrowPolygon
                        v-if="batch"
                        id="geoarrow-countries"
                        :data="batch"
                        :get-fill-color="[100, 150, 220, 180]"
                        :get-line-color="[180, 220, 255, 255]"
                        :line-width-min-pixels="1"
                        stroked
                        filled
                        pickable
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="GeoArrow Polygons (deck.gl-geoarrow)"
    description="Country boundaries from a native GeoArrow IPC file rendered with VLayerDeckglGeoArrowPolygon. Zero GeoJSON parsing — Arrow RecordBatch goes straight to the GPU."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />

          <VLayerDeckglGeoArrowPolygon
            id="geoarrow-countries"
            :data="table"
            :get-fill-color="fillOpacity"
            :get-line-color="[200, 220, 255, 255]"
            :line-width-min-pixels="0.5"
            stroked
            filled
            pickable
          />

          <VControlLegend
            :layer-ids="['geoarrow-countries']"
            position="bottom-right"
            type="category"
            title="Natural Earth Countries"
            :items="legendItems"
            :interactive="false"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="GeoArrow Polygons" panel-width="w-72">
        <p class="mb-3 text-xs text-muted-foreground">
          Native
          <a
            href="https://geoarrow.org"
            target="_blank"
            class="font-mono text-primary hover:underline"
            >GeoArrow</a
          >
          IPC →
          <a
            href="https://github.com/geoarrow/deck.gl-geoarrow"
            target="_blank"
            class="font-mono text-primary hover:underline"
            >deck.gl-geoarrow</a
          >. Arrow RecordBatch goes straight to the GPU — no GeoJSON parsing.
        </p>

        <div class="mb-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div
            class="rounded-sm border border-border bg-background/40 px-2 py-1.5"
          >
            <div
              class="text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Rows
            </div>
            <div class="tabular-nums text-foreground">
              <span v-if="loading">—</span>
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
              Payload
            </div>
            <div class="tabular-nums text-foreground">174.7 KB</div>
          </div>
        </div>

        <div class="mb-4">
          <label
            class="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            Mode
          </label>
          <Button
            :variant="extruded ? 'default' : 'outline'"
            size="sm"
            class="w-full justify-center"
            @click="extruded = !extruded"
          >
            {{ extruded ? '3D extruded' : 'Flat polygons' }}
          </Button>
        </div>

        <div class="mb-4">
          <label
            class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span>Fill opacity</span>
            <span class="tabular-nums text-foreground">{{ opacity[0] }}</span>
          </label>
          <Slider
            v-model="opacity"
            :min="40"
            :max="255"
            :step="5"
            class="w-full"
          />
        </div>

        <div v-show="extruded" class="mb-1">
          <label
            class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span>Elevation scale</span>
            <span class="tabular-nums text-foreground"
              >{{ Math.round(elevationMultiplier / 1000) }}k m</span
            >
          </label>
          <Slider
            v-model="elevationScale"
            :min="0"
            :max="500000"
            :step="10000"
            class="w-full"
          />
        </div>

        <p
          v-if="loading"
          class="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          Loading natural-earth.arrows…
        </p>
        <p
          v-else-if="error"
          class="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-destructive"
        >
          {{ error }}
        </p>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
