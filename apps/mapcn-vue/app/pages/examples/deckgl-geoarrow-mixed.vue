<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeoArrowScatterplot,
    VLayerDeckglGeoArrowPath,
    VLayerDeckglGeoArrowPolygon,
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
    title: 'GeoArrow All Geometries (deck.gl-geoarrow) - mapcn-vue Examples',
    description:
      'Demonstrates Point, LineString, and Polygon geometries in a single view, loaded from three separate GeoArrow IPC files.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoArrow All Geometries',
    description: 'Point, LineString, and Polygon from GeoArrow IPC files.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const POINTS_URL = '/geoarrow/natural-earth_cities-clusters.arrows';
  const LINES_URL = '/geoarrow/famous-routes.arrows';
  const POLYGONS_URL = '/geoarrow/nyc-boroughs.arrows';

  const pointsTable = shallowRef<Table | null>(null);
  const linesTable = shallowRef<Table | null>(null);
  const polygonsTable = shallowRef<Table | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const pointSize = ref<number[]>([10]);
  const lineWidth = ref<number[]>([3]);
  const polyOpacity = ref<number[]>([150]);

  const mapOptions = computed(() => ({
    container: `geoarrow-example-${mapId}`,
    style: mapStyle.value,
    center: [-30, 20] as [number, number],
    zoom: 2,
    pitch: 0,
    bearing: 0,
  }));

  onMounted(async () => {
    try {
      const [pRes, lRes, polyRes] = await Promise.all([
        fetch(POINTS_URL),
        fetch(LINES_URL),
        fetch(POLYGONS_URL),
      ]);
      const [pBuf, lBuf, polyBuf] = await Promise.all([
        pRes.ok
          ? pRes.arrayBuffer()
          : Promise.reject(new Error(`HTTP ${pRes.status}`)),
        lRes.ok
          ? lRes.arrayBuffer()
          : Promise.reject(new Error(`HTTP ${lRes.status}`)),
        polyRes.ok
          ? polyRes.arrayBuffer()
          : Promise.reject(new Error(`HTTP ${polyRes.status}`)),
      ]);
      const [pT, lT, polyT] = [
        tableFromIPC(new Uint8Array(pBuf)),
        tableFromIPC(new Uint8Array(lBuf)),
        tableFromIPC(new Uint8Array(polyBuf)),
      ];
      if (!pT.batches[0] || !lT.batches[0] || !polyT.batches[0]) {
        throw new Error('Missing record batches');
      }
      pointsTable.value = pT;
      linesTable.value = lT;
      polygonsTable.value = polyT;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  const legend: CategoryLegendItem[] = [
    { color: '#48d1cc', label: 'Cities (MultiPoint)' },
    { color: '#ffd700', label: 'Routes (LineString)' },
    { color: '#ff6b6b', label: 'NYC boroughs (MultiPolygon)' },
  ];
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-3">
    <div class="min-w-0 flex flex-col gap-3 flex-1">
      <div class="relative flex-1">
        <ClientOnly>
          <VMap :options="mapOptions" class="h-[500px]">
            <!-- NYC boroughs: MultiPolygon -->
            <VLayerDeckglGeoArrowPolygon
              v-if="polygonsTable"
              :data="polygonsTable"
              :visible="true"
              :getFillColor="[255, 107, 107, polyOpacity[0]]"
            />
            <!-- Famous routes: LineString -->
            <VLayerDeckglGeoArrowPath
              v-if="linesTable"
              :data="linesTable"
              :visible="true"
              :widthScale="lineWidth[0]"
              :getColor="[255, 215, 0, 220]"
            />
            <!-- City clusters: MultiPoint -->
            <VLayerDeckglGeoArrowScatterplot
              v-if="pointsTable"
              :data="pointsTable"
              :visible="true"
              :getPosition="([x, y]) => [x, y] as [number, number]"
              :getColor="[72, 209, 204, 220]"
              :pointSize="pointSize[0]"
            />
            <template #layers>
              <VControlNavigation />
              <VControlScale position="bottom-left" />
              <VControlLegend
                v-if="legend.length"
                :items="legend"
                title="Geometry Types"
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
        <h2 class="text-sm font-semibold text-foreground">GEOARROW MIXED</h2>
        <span class="text-xs text-muted-foreground">3 geometry types</span>
      </div>

      <div v-if="loading" class="text-xs text-muted-foreground">
        Loading Arrow data…
      </div>
      <div v-else-if="error" class="text-xs text-destructive">{{ error }}</div>
      <div v-else class="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>{{ pointsTable?.numRows ?? 0 }} points</span>
        <span>{{ linesTable?.numRows ?? 0 }} lines</span>
        <span>{{ polygonsTable?.numRows ?? 0 }} polygons</span>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Point size</label>
        <Slider v-model="pointSize" :min="3" :max="30" :step="1" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ pointSize[0] }}px</span
        >
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground">Line width</label>
        <Slider v-model="lineWidth" :min="1" :max="20" :step="1" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ lineWidth[0] }}px</span
        >
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-foreground"
          >Polygon opacity</label
        >
        <Slider v-model="polyOpacity" :min="50" :max="255" :step="1" />
        <span class="text-xs text-muted-foreground text-right"
          >{{ Math.round((polyOpacity[0] / 255) * 100) }}%</span
        >
      </div>
    </div>
  </div>
</template>
