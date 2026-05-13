<script setup lang="ts">
  /**
   * AEF Mosaic — Vue port of
   * https://github.com/developmentseed/deck.gl-raster/tree/main/examples/aef-mosaic
   *
   * Faithful 1:1 port: int8 Texture2DArray upload in getTileData + custom
   * SampleAefRgb GPU shader module in renderTile. The CPU never dequantizes
   * — the shader samples 3 bands per fragment, dequantizes, rescales.
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
  import type { GetTileDataOptions } from '@developmentseed/deck.gl-zarr';
  import type { Texture } from '@luma.gl/core';
  import * as zarr from 'zarrita';
  import { Input } from '~/components/ui/input';
  import { Label } from '~/components/ui/label';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '~/components/ui/select';
  import { Slider } from '~/components/ui/slider';
  import { SampleAefRgb } from '~/utils/gpu/sample-aef-rgb';

  useSeoMeta({
    title: 'AEF Mosaic - mapcn-vue Examples',
    description:
      'AlphaEarth Foundations embedding mosaic via VLayerDeckglZarr. Int8 Texture2DArray + GPU dequant + RGB band tuning across 9 annual snapshots (2017–2025).',
  });

  defineOgImage('MapcnDoc', {
    title: 'AEF Mosaic',
    description:
      'AlphaEarth Foundations embedding mosaic rendered with deck.gl-raster ZarrLayer + custom GPU shader.',
    category: 'deck.gl',
  });

  const ZARR_URL = 'https://data.source.coop/tge-labs/aef-mosaic';
  const VARIABLE = 'embeddings';
  const NUM_BANDS = 64;
  const NUM_YEARS = 9;
  const YEAR_ORIGIN = 2017;
  const MIN_ZOOM = 10;

  const LOCATIONS = [
    {
      id: 'sf-bay',
      label: 'San Francisco Bay',
      longitude: -122.4500106165,
      latitude: 37.7691860287,
      zoom: 13,
    },
    {
      id: 'iowa-corn',
      label: 'Iowa corn belt',
      longitude: -93.5,
      latitude: 42.0,
      zoom: 13,
    },
    {
      id: 'amazon-frontier',
      label: 'Amazon frontier (Rondônia)',
      longitude: -62.2,
      latitude: -9.5,
      zoom: 12,
    },
    {
      id: 'nile-delta',
      label: 'Nile delta',
      longitude: 31.2,
      latitude: 30.8,
      zoom: 12,
    },
    {
      id: 'alaska-north-slope',
      label: 'Alaska North Slope',
      longitude: -150.0,
      latitude: 69.5,
      zoom: 12,
    },
  ] as const;

  const DEFAULT_LOCATION = LOCATIONS[0];
  const DEFAULT_YEAR_IDX = 8;
  const DEFAULT_R_BAND = 0;
  const DEFAULT_G_BAND = 16;
  const DEFAULT_B_BAND = 32;
  const DEFAULT_RESCALE_MIN = -0.3;
  const DEFAULT_RESCALE_MAX = 0.3;

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zarrNode = shallowRef<any>(null);
  const rootAttrs = shallowRef<unknown>(null);
  const bandLabels = shallowRef<string[]>([]);

  const locationId = ref<(typeof LOCATIONS)[number]['id']>(DEFAULT_LOCATION.id);
  const yearIdx = ref(DEFAULT_YEAR_IDX);
  const rBandIdx = ref(DEFAULT_R_BAND);
  const gBandIdx = ref(DEFAULT_G_BAND);
  const bBandIdx = ref(DEFAULT_B_BAND);
  const rescaleMin = ref(DEFAULT_RESCALE_MIN);
  const rescaleMax = ref(DEFAULT_RESCALE_MAX);

  const yearSliderModel = computed({
    get: () => [yearIdx.value],
    set: (v) => {
      yearIdx.value = v[0] ?? DEFAULT_YEAR_IDX;
    },
  });

  const clampBand = (v: number) =>
    Math.max(0, Math.min(NUM_BANDS - 1, Math.round(v)));

  const currentLocation = computed(
    () => LOCATIONS.find((l) => l.id === locationId.value) ?? DEFAULT_LOCATION,
  );

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

  const mapOptions = computed(() => ({
    container: `aef-mosaic-example-${mapId}`,
    style: mapStyle.value,
    center: [DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.latitude] as [
      number,
      number,
    ],
    zoom: DEFAULT_LOCATION.zoom,
    minZoom: 2,
  }));

  const selection = computed(() => ({
    time: yearIdx.value,
    band: null,
  }));

  type AefTileData = MinimalTileData & { texture: Texture };

  async function getTileData(
    arr: zarr.Array<'int8', zarr.Readable>,
    options: GetTileDataOptions,
  ): Promise<AefTileData> {
    const { device, sliceSpec, width, height, signal } = options;

    const chunk = await zarr.get(arr, sliceSpec as never, { signal });
    const { data } = chunk;

    if (chunk.shape.length !== 3) {
      throw new Error(
        `Expected 3D sliced chunk (band, y, x), got shape [${chunk.shape.join(
          ', ',
        )}]`,
      );
    }
    if (chunk.shape[0] !== NUM_BANDS) {
      throw new Error(
        `Expected depth = ${NUM_BANDS} bands, got ${chunk.shape[0]}`,
      );
    }

    const texture = device.createTexture({
      dimension: '2d-array',
      format: 'r8sint',
      width,
      height,
      depth: NUM_BANDS,
      mipLevels: 1,
      data,
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
      },
    });

    return {
      texture,
      width,
      height,
      byteLength: data.byteLength,
    } as AefTileData;
  }

  // Mirror upstream's makeRenderTile(args) factory: new closure per band/rescale
  // change so VLayerDeckglZarr's reactive watch picks it up and rebuilds the layer.
  const renderTile = computed(() => {
    const r = rBandIdx.value;
    const g = gBandIdx.value;
    const b = bBandIdx.value;
    const rMin = rescaleMin.value;
    const rMax = rescaleMax.value;
    return function renderTile(data: AefTileData): RenderTileResult {
      return {
        renderPipeline: [
          {
            module: SampleAefRgb,
            props: {
              dataTex: data.texture,
              rBandIdx: r,
              gBandIdx: g,
              bBandIdx: b,
              rescaleMin: rMin,
              rescaleMax: rMax,
            },
          },
        ],
      };
    };
  });

  watch(locationId, (id) => {
    const loc = LOCATIONS.find((l) => l.id === id);
    if (loc && mapInstance.value) {
      mapInstance.value.flyTo({
        center: [loc.longitude, loc.latitude],
        zoom: loc.zoom,
        duration: 1200,
      });
    }
  });

  onMounted(async () => {
    try {
      loading.value = true;
      error.value = null;
      const store = new zarr.FetchStore(ZARR_URL);
      const root = await zarr.open.v3(store, { kind: 'group' });
      const opened = await zarr.open.v3(root.resolve(VARIABLE), {
        kind: 'array',
      });
      if (!opened.is('int8')) {
        throw new Error(
          `Expected AEF embeddings to be int8, got ${opened.dtype}`,
        );
      }
      rootAttrs.value = root.attrs;
      try {
        const bandArr = await zarr.open.v3(root.resolve('band'), {
          kind: 'array',
        });
        const chunk = await zarr.get(bandArr);
        bandLabels.value = Array.from(chunk.data as Iterable<string>);
      } catch {
        bandLabels.value = Array.from(
          { length: NUM_BANDS },
          (_, i) => `Band ${i}`,
        );
      }
      zarrNode.value = opened;
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
import { SampleAefRgb } from '~/utils/gpu/sample-aef-rgb';
import * as zarr from 'zarrita';

const node = shallowRef(null);
const yearIdx = ref(8);
const rBand = ref(0), gBand = ref(16), bBand = ref(32);
const rescaleMin = ref(-0.3), rescaleMax = ref(0.3);

onMounted(async () => {
  const store = new zarr.FetchStore(
    'https://data.source.coop/tge-labs/aef-mosaic',
  );
  const root = await zarr.open.v3(store, { kind: 'group' });
  node.value = await zarr.open.v3(root.resolve('embeddings'), {
    kind: 'array',
  });
});

const selection = computed(() => ({
  time: yearIdx.value,
  band: null,
}));

async function getTileData(arr, { device, sliceSpec, width, height }) {
  const chunk = await zarr.get(arr, sliceSpec);
  const texture = device.createTexture({
    dimension: '2d-array',
    format: 'r8sint',
    width, height, depth: 64,
    data: chunk.data,
  });
  return { texture, width, height };
}

function renderTile(data) {
  return {
    renderPipeline: [{
      module: SampleAefRgb,
      props: {
        dataTex: data.texture,
        rBandIdx: rBand.value,
        gBandIdx: gBand.value,
        bBandIdx: bBand.value,
        rescaleMin: rescaleMin.value,
        rescaleMax: rescaleMax.value,
      },
    }],
  };
}
${SCRIPT_END}

<template>
  <VMap :options="mapOptions">
    <VLayerDeckglZarr
      v-if="node"
      id="aef"
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
    title="AEF Mosaic"
    description="AlphaEarth Foundations embedding mosaic — int8 Texture2DArray + custom GPU shader sampling 3 of 64 bands per fragment. Annual snapshots 2017–2025."
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
            id="aef-mosaic"
            :node="zarrNode"
            :selection="selection"
            :metadata="rootAttrs"
            :get-tile-data="getTileData"
            :render-tile="renderTile"
          />
        </VMap>
      </ClientOnly>

      <MapPanel title="AEF Mosaic" panel-width="w-80">
        <p class="mb-4 text-xs text-muted-foreground">
          <span v-if="loading">Opening Zarr store…</span>
          <span v-else-if="error" class="text-warning">{{ error }}</span>
          <span v-else>
            Loaded
            <span class="font-mono">{{ NUM_BANDS }}</span>
            embedding bands across
            <span class="font-mono">{{ NUM_YEARS }}</span>
            annual snapshots. Zoom &ge; {{ MIN_ZOOM }} to render tiles.
          </span>
        </p>

        <div class="mb-4 space-y-1.5">
          <Label
            for="aef-location"
            class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >Location</Label
          >
          <Select v-model="locationId">
            <SelectTrigger id="aef-location" class="w-full">
              <SelectValue :placeholder="currentLocation.label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="loc in LOCATIONS"
                :key="loc.id"
                :value="loc.id"
                >{{ loc.label }}</SelectItem
              >
            </SelectContent>
          </Select>
        </div>

        <div class="mb-4 space-y-2">
          <div class="flex items-center justify-between">
            <Label
              for="aef-year"
              class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >Year</Label
            >
            <span class="font-mono text-xs tabular-nums text-foreground">
              {{ YEAR_ORIGIN + yearIdx }}
            </span>
          </div>
          <Slider
            id="aef-year"
            v-model="yearSliderModel"
            :min="0"
            :max="NUM_YEARS - 1"
            :step="1"
            class="w-full"
          />
          <div
            class="flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground"
          >
            <span>{{ YEAR_ORIGIN }}</span>
            <span>{{ YEAR_ORIGIN + NUM_YEARS - 1 }}</span>
          </div>
        </div>

        <div class="mb-4 grid grid-cols-3 gap-2">
          <div class="space-y-1.5">
            <Label
              for="aef-r"
              class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >R</Label
            >
            <Input
              id="aef-r"
              :model-value="rBandIdx"
              type="text"
              inputmode="numeric"
              class="h-8 px-2 text-xs tabular-nums"
              @update:model-value="
                (v: string | number) => (rBandIdx = clampBand(Number(v)))
              "
            />
          </div>
          <div class="space-y-1.5">
            <Label
              for="aef-g"
              class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >G</Label
            >
            <Input
              id="aef-g"
              :model-value="gBandIdx"
              type="text"
              inputmode="numeric"
              class="h-8 px-2 text-xs tabular-nums"
              @update:model-value="
                (v: string | number) => (gBandIdx = clampBand(Number(v)))
              "
            />
          </div>
          <div class="space-y-1.5">
            <Label
              for="aef-b"
              class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >B</Label
            >
            <Input
              id="aef-b"
              :model-value="bBandIdx"
              type="text"
              inputmode="numeric"
              class="h-8 px-2 text-xs tabular-nums"
              @update:model-value="
                (v: string | number) => (bBandIdx = clampBand(Number(v)))
              "
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1.5">
            <Label
              for="aef-rmin"
              class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >Rescale Min</Label
            >
            <Input
              id="aef-rmin"
              :model-value="rescaleMin"
              type="text"
              inputmode="decimal"
              class="h-8 px-2 text-xs tabular-nums"
              @update:model-value="
                (v: string | number) => (rescaleMin = Number(v) || 0)
              "
            />
          </div>
          <div class="space-y-1.5">
            <Label
              for="aef-rmax"
              class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >Rescale Max</Label
            >
            <Input
              id="aef-rmax"
              :model-value="rescaleMax"
              type="text"
              inputmode="decimal"
              class="h-8 px-2 text-xs tabular-nums"
              @update:model-value="
                (v: string | number) => (rescaleMax = Number(v) || 0)
              "
            />
          </div>
        </div>
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
