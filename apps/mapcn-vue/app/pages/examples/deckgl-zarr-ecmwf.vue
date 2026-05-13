<script setup lang="ts">
  /**
   * Minimal ECMWF GeoZarr example using VLayerDeckglZarr.
   *
   * Renders a single time slice of the ECMWF Open Data temperature dataset.
   * For animated time/level scrubbing + colormap controls, see the upstream
   * dynamical-zarr-ecmwf demo at
   * https://github.com/developmentseed/deck.gl-raster/blob/main/examples/dynamical-zarr-ecmwf/src/App.tsx
   */
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VLayerDeckglZarr,
  } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';
  import type {
    MinimalTileData,
    RenderTileResult,
  } from '@developmentseed/deck.gl-raster';
  import type { Slider } from '~/components/ui/slider';

  useSeoMeta({
    title: 'ECMWF GeoZarr - mapcn-vue Examples',
    description:
      'Render ECMWF Open Data GeoZarr temperature with deck.gl-raster ZarrLayer + zarrita. Single time slice, GPU-rendered.',
  });

  defineOgImage('MapcnDoc', {
    title: 'ECMWF GeoZarr',
    description:
      'GeoZarr temperature dataset rendered with deck.gl-raster ZarrLayer.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const ZARR_URL =
    'https://data.source.coop/dynamical/ecmwf-ifs-ens-forecast-15-day-0-25-degree/v0.1.0.zarr';
  const VARIABLE = 'temperature_2m';

  // The ECMWF source store isn't GeoZarr-compliant; we inject the synthetic
  // attrs object that zarrita's parseGeoZarrMetadata expects. Mirrors
  // upstream `dynamical-zarr-ecmwf/src/ecmwf/metadata.ts`.
  const ECMWF_GEOZARR_ATTRS = {
    'spatial:dimensions': ['latitude', 'longitude'],
    'spatial:transform': [0.25, 0, -180, 0, -0.25, 90],
    'spatial:shape': [721, 1440],
    'proj:code': 'EPSG:4326',
  } as const;

  // zarrita Array (opened on mount). Kept as shallowRef — the array is a deep
  // non-reactive zarrita instance; reactive tracking would explode.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zarrNode = shallowRef<any>(null);
  const initTimeIdx = ref<number>(0);
  const initTimeCount = ref<number>(0);

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

  const mapOptions = computed(() => ({
    container: `zarr-ecmwf-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
    minZoom: 0,
  }));

  const selection = computed(() => ({
    init_time: initTimeIdx.value,
    lead_time: 0,
    ensemble_member: 0,
  }));

  // Tile fetch: zarrita slice on the spatial dims (returned in sliceSpec).
  async function getTileData(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arr: any,
    options: { sliceSpec: unknown[]; width: number; height: number },
  ): Promise<MinimalTileData> {
    const zarr = await import('zarrita');
    const result = await zarr.get(arr, options.sliceSpec as never);
    return {
      data: result.data,
      width: options.width,
      height: options.height,
    } as MinimalTileData;
  }

  // Simple grayscale render: pass the Float32 data into an ImageData via a
  // canvas. For a production colormap pipeline see the upstream ECMWF demo.
  function renderTile(data: MinimalTileData): RenderTileResult {
    const float = data.data as Float32Array;
    const { width, height } = data;
    const pixels = new Uint8ClampedArray(width * height * 4);
    // Rescale 200K..320K (typical 2m temperature range) → 0..255.
    const min = 200;
    const max = 320;
    for (let i = 0; i < float.length; i++) {
      const v = ((float[i]! - min) / (max - min)) * 255;
      const c = Math.max(0, Math.min(255, v));
      pixels[i * 4] = c;
      pixels[i * 4 + 1] = c;
      pixels[i * 4 + 2] = c;
      pixels[i * 4 + 3] = 255;
    }
    return {
      image: new ImageData(pixels, width, height),
    } as RenderTileResult;
  }

  // The ECMWF Open Data zarr URL requires a working public mirror. When that
  // mirror is offline (common — coop / dynamical hosts come and go), the
  // example falls back to documentation-only mode so the page stays useful
  // as a code reference without spamming the console with fetch errors.
  onMounted(async () => {
    try {
      loading.value = true;
      error.value = null;
      const zarr = await import('zarrita');
      const probe = await fetch(`${ZARR_URL}/zarr.json`, {
        method: 'HEAD',
        mode: 'cors',
      }).catch(() => null);
      if (!probe || !probe.ok) {
        throw new Error(
          'ECMWF Open Data zarr mirror (data.source.coop) is unreachable. See the code example for the integration pattern; switch ZARR_URL to your own GeoZarr v3 source to render live data.',
        );
      }
      const store = await zarr.withConsolidatedMetadata(
        new zarr.FetchStore(ZARR_URL),
        { format: 'v3' },
      );
      const root = await zarr.open.v3(store, { kind: 'group' });
      const opened = await zarr.open.v3(root.resolve(VARIABLE), {
        kind: 'array',
      });
      zarrNode.value = opened;
      initTimeCount.value = opened.shape[0] ?? 0;
      initTimeIdx.value = Math.max(0, initTimeCount.value - 1);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';
  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglZarr } from '@geoql/v-maplibre';
import * as zarr from 'zarrita';

const ZARR_URL = 'https://.../ecmwf.zarr';
const node = shallowRef<unknown>(null);

onMounted(async () => {
  const store = await zarr.withConsolidatedMetadata(
    new zarr.FetchStore(ZARR_URL),
    { format: 'v3' },
  );
  const root = await zarr.open.v3(store, { kind: 'group' });
  node.value = await zarr.open.v3(
    root.resolve('temperature_2m'),
    { kind: 'array' },
  );
});

const selection = { init_time: 0, lead_time: 0, ensemble_member: 0 };
${SCRIPT_END}

<template>
  <VMap :options="mapOptions">
    <VLayerDeckglZarr
      v-if="node"
      id="ecmwf"
      :node="node"
      :selection="selection"
      :get-tile-data="getTileData"
      :render-tile="renderTile"
    />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="ECMWF GeoZarr"
    description="GeoZarr temperature dataset (ECMWF Open Data) rendered with deck.gl-raster ZarrLayer + zarrita. Single time slice, grayscale rescale 200–320 K. The full animated 4D version with colormap controls is documented upstream."
    :code="codeExample"
    registry="map-deckgl-raster"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap
          :key="mapStyle"
          :options="mapOptions"
          class="size-full"
          @loaded="onMapLoaded"
        >
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerDeckglZarr
            v-if="zarrNode"
            id="ecmwf"
            :node="zarrNode"
            :selection="selection"
            :metadata="ECMWF_GEOZARR_ATTRS"
            :get-tile-data="getTileData"
            :render-tile="renderTile"
            :opacity="0.8"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="ECMWF GeoZarr" panel-width="w-72">
        <p class="mb-3 text-xs text-muted-foreground">
          <span v-if="loading">Opening Zarr store…</span>
          <span v-else-if="error" class="text-destructive">{{ error }}</span>
          <span v-else>
            Loaded
            <a
              href="https://dynamical.org"
              target="_blank"
              class="text-primary hover:underline"
              >ECMWF Open Data</a
            >
            via
            <a
              href="https://github.com/manzt/zarrita.js"
              target="_blank"
              class="font-mono text-primary hover:underline"
              >zarrita</a
            >. {{ initTimeCount }} forecast runs available.
          </span>
        </p>

        <p class="mb-3 text-xs text-muted-foreground">
          Rendered with
          <a
            href="https://github.com/developmentseed/deck.gl-raster"
            target="_blank"
            class="font-mono text-primary hover:underline"
            >@developmentseed/deck.gl-zarr</a
          >. GPU rescale: 200 K → 320 K (grayscale).
        </p>

        <div v-if="initTimeCount > 0">
          <label
            class="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >Forecast Run</label
          >
          <input
            v-model.number="initTimeIdx"
            type="range"
            :min="0"
            :max="initTimeCount - 1"
            class="w-full"
          />
          <div
            class="mt-1.5 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground"
          >
            <span>0</span>
            <span>{{ initTimeIdx }}</span>
            <span>{{ initTimeCount - 1 }}</span>
          </div>
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
