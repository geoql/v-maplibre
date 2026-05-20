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

  const polyFillColor = computed<[number, number, number, number]>(() => [
    255,
    107,
    107,
    polyOpacity.value[0] ?? 150,
  ]);

  const legendItems: CategoryLegendItem[] = [
    { value: 'pts', label: 'Cities (MultiPoint)', color: '#48d1cc' },
    { value: 'lines', label: 'Routes (LineString)', color: '#ffd700' },
    { value: 'polys', label: 'NYC boroughs (MultiPolygon)', color: '#ff6b6b' },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
    import {
      VMap,
      VLayerDeckglGeoArrowScatterplot,
      VLayerDeckglGeoArrowPath,
      VLayerDeckglGeoArrowPolygon,
    } from '@geoql/v-maplibre';
    import { tableFromIPC } from 'apache-arrow';

    const pointsTable = shallowRef(null);
    const linesTable = shallowRef(null);
    const polygonsTable = shallowRef(null);
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="size-full">
      <VLayerDeckglGeoArrowPolygon
        v-if="polygonsTable"
        :data="polygonsTable"
        :get-fill-color="[255, 107, 107, 180]"
      />
      <VLayerDeckglGeoArrowPath
        v-if="linesTable"
        :data="linesTable"
        :get-color="[255, 215, 0, 220]"
        :get-width="2"
        width-units="pixels"
      />
      <VLayerDeckglGeoArrowScatterplot
        v-if="pointsTable"
        :data="pointsTable"
        :get-fill-color="[72, 209, 204, 220]"
        :get-radius="10"
        radius-units="pixels"
      />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="GeoArrow All Geometries (deck.gl-geoarrow)"
    description="Point, LineString, and Polygon geometries in one view — each layer reads its own GeoArrow IPC file and renders to a shared MapboxOverlay canvas."
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
            v-if="polygonsTable"
            id="geoarrow-mixed-polys"
            :data="polygonsTable"
            :get-fill-color="polyFillColor"
          />

          <VLayerDeckglGeoArrowPath
            v-if="linesTable"
            id="geoarrow-mixed-lines"
            :data="linesTable"
            :get-color="[255, 215, 0, 220]"
            :get-width="2"
            width-units="pixels"
            :width-scale="lineWidth[0]"
            :width-min-pixels="1"
          />

          <VLayerDeckglGeoArrowScatterplot
            v-if="pointsTable"
            id="geoarrow-mixed-points"
            :data="pointsTable"
            :get-fill-color="[72, 209, 204, 220]"
            :get-radius="pointSize[0] ?? 8"
            radius-units="pixels"
            :radius-min-pixels="2"
          />

          <VControlLegend
            :layer-ids="[
              'geoarrow-mixed-polys',
              'geoarrow-mixed-lines',
              'geoarrow-mixed-points',
            ]"
            position="bottom-right"
            type="category"
            title="Geometry Types"
            :items="legendItems"
            :interactive="false"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="All Geometry Types" panel-width="w-72">
        <p class="mb-3 text-xs text-muted-foreground">
          Three
          <a
            href="https://geoarrow.org"
            target="_blank"
            class="font-mono text-primary hover:underline"
            >GeoArrow</a
          >
          IPC files — points, lines, polygons — rendered through one
          MapboxOverlay.
        </p>

        <div v-if="error" class="mb-3 text-xs text-destructive">
          {{ error }}
        </div>
        <div v-else-if="loading" class="mb-3 text-xs text-muted-foreground">
          Loading Arrow files…
        </div>

        <div class="space-y-3">
          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>Point size</span>
              <span class="tabular-nums">{{ pointSize[0] }}px</span>
            </div>
            <Slider v-model="pointSize" :min="2" :max="40" :step="1" />
          </div>

          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>Line width</span>
              <span class="tabular-nums">{{ lineWidth[0] }}×</span>
            </div>
            <Slider v-model="lineWidth" :min="1" :max="20" :step="1" />
          </div>

          <div>
            <div
              class="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>Polygon opacity</span>
              <span class="tabular-nums">{{ polyOpacity[0] }}</span>
            </div>
            <Slider v-model="polyOpacity" :min="50" :max="255" :step="1" />
          </div>
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
