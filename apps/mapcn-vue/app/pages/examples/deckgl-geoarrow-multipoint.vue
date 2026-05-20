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

  const pointColor: [number, number, number, number] = [180, 220, 255, 255];

  const legendItems: CategoryLegendItem[] = [
    { value: 'cities', label: '21 individual cities', color: '#b4dcff' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
    import { VMap, VLayerDeckglGeoArrowScatterplot } from '@geoql/v-maplibre';
    import { tableFromIPC } from 'apache-arrow';

    const table = shallowRef(null);
    onMounted(async () => {
      const url = '/geoarrow/natural-earth_cities-clusters.arrows';
      const buffer = await (await fetch(url)).arrayBuffer();
      table.value = tableFromIPC(new Uint8Array(buffer));
    });
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="size-full">
      <VLayerDeckglGeoArrowScatterplot
        v-if="table"
        :data="table"
        :get-fill-color="[180, 220, 255, 255]"
        :get-radius="8"
        radius-units="pixels"
      />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="GeoArrow Multipoint (deck.gl-geoarrow)"
    description="Individual city locations from a GeoArrow IPC file. Same dataset as the Points example, rendered as small individual dots instead of clustered halos."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />

          <VLayerDeckglGeoArrowScatterplot
            v-if="table"
            id="geoarrow-multipoint"
            :data="table"
            :get-fill-color="pointColor"
            :get-radius="pointSize[0] ?? 8"
            radius-units="pixels"
            :radius-min-pixels="2"
            :opacity="(opacity[0] ?? 255) / 255"
          />

          <VControlLegend
            :layer-ids="['geoarrow-multipoint']"
            position="bottom-right"
            type="category"
            title="Cities"
            :items="legendItems"
            :interactive="false"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="GeoArrow Multipoint" panel-width="w-72">
        <p class="mb-3 text-xs text-muted-foreground">
          Individual points from a
          <a
            href="https://geoarrow.org"
            target="_blank"
            class="font-mono text-primary hover:underline"
            >GeoArrow</a
          >
          MultiPoint encoding — each city is a discrete dot rather than a
          cluster halo.
        </p>

        <div class="mb-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div
            class="rounded-sm border border-border bg-background/40 px-2 py-1.5"
          >
            <div
              class="text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Cities
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
            <div class="tabular-nums text-foreground">MultiPoint</div>
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
              <span>Dot size</span>
              <span class="tabular-nums">{{ pointSize[0] }}px</span>
            </div>
            <Slider v-model="pointSize" :min="2" :max="40" :step="1" />
          </div>

          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>Opacity</span>
              <span class="tabular-nums"
                >{{ Math.round(((opacity[0] ?? 255) / 255) * 100) }}%</span
              >
            </div>
            <Slider v-model="opacity" :min="50" :max="255" :step="1" />
          </div>
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
