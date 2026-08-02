<script setup lang="ts">
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import { VLayerDeckglGeoArrowPolygon } from '@geoql/v-maplibre/deck.gl';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import { tableFromIPC } from 'apache-arrow';
  import type { Table } from 'apache-arrow';
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

  const fillColor = computed<[number, number, number, number]>(() => [
    78,
    205,
    196,
    opacity.value[0] ?? 180,
  ]);

  const legendItems: CategoryLegendItem[] = [
    { value: 'boroughs', label: 'NYC boroughs (3 polygons)', color: '#4ecdc4' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
    import { VMap } from '@geoql/v-maplibre';
    import { VLayerDeckglGeoArrowPolygon } from '@geoql/v-maplibre/deck.gl';
    import { tableFromIPC } from 'apache-arrow';

    const table = shallowRef(null);
    onMounted(async () => {
      const url = '/geoarrow/nyc-boroughs.arrows';
      const buffer = await (await fetch(url)).arrayBuffer();
      table.value = tableFromIPC(new Uint8Array(buffer));
    });
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="size-full">
      <VLayerDeckglGeoArrowPolygon
        v-if="table"
        :data="table"
        :get-fill-color="[78, 205, 196, 180]"
      />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="GeoArrow NYC Polygons (deck.gl-geoarrow)"
    description="NYC borough outlines from a synthetic GeoArrow IPC file. Demonstrates MultiPolygon geometry with multiple disjoint shapes, and the flat/extruded mode toggle."
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
            id="geoarrow-nyc"
            :data="table"
            :get-fill-color="fillColor"
            :get-line-color="[200, 220, 255, 255]"
            :line-width-min-pixels="1"
            stroked
            filled
            pickable
            :extruded="extruded"
            :get-elevation="extruded ? elevationScale[0] : 0"
          />

          <VControlLegend
            :layer-ids="['geoarrow-nyc']"
            position="bottom-right"
            type="category"
            title="NYC Boroughs"
            :items="legendItems"
            :interactive="false"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="GeoArrow MultiPolygon" panel-width="w-72">
        <p class="mb-3 text-xs text-muted-foreground">
          NYC boroughs from a synthetic
          <a
            href="https://geoarrow.org"
            target="_blank"
            rel="noopener noreferrer"
            class="font-mono text-primary hover:underline"
            >GeoArrow</a
          >
          MultiPolygon — three disjoint shapes in a single row.
        </p>

        <div class="mb-4 grid grid-cols-2 gap-2 font-mono text-caption">
          <div
            class="rounded-sm border border-border bg-background/40 px-2 py-1.5"
          >
            <div class="text-3xs uppercase tracking-caps text-muted-foreground">
              Rows
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
            <div class="text-3xs uppercase tracking-caps text-muted-foreground">
              Format
            </div>
            <div class="tabular-nums text-foreground">MultiPolygon</div>
          </div>
        </div>

        <div v-if="error" class="mb-3 text-xs text-destructive">
          {{ error }}
        </div>

        <div class="space-y-3">
          <div>
            <div
              class="mb-1.5 font-mono text-2xs uppercase tracking-caps text-muted-foreground"
            >
              Mode
            </div>
            <Button
              variant="outline"
              size="sm"
              class="w-full"
              @click="extruded = !extruded"
            >
              {{ extruded ? '3D extruded' : 'Flat polygons' }}
            </Button>
          </div>

          <div v-show="extruded">
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-2xs uppercase tracking-caps text-muted-foreground"
            >
              <span>Elevation</span>
              <span class="tabular-nums">{{ elevationScale[0] }}m</span>
            </div>
            <Slider
              v-model="elevationScale"
              :min="100"
              :max="20000"
              :step="100"
            />
          </div>

          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-2xs uppercase tracking-caps text-muted-foreground"
            >
              <span>Fill opacity</span>
              <span class="tabular-nums">{{ opacity[0] }}</span>
            </div>
            <Slider v-model="opacity" :min="50" :max="255" :step="1" />
          </div>
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
