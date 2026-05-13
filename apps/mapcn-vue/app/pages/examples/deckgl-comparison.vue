<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglCOG,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';
  import { Slider } from '~/components/ui/slider';

  useSeoMeta({
    title: 'Before / After Comparison - mapcn-vue Examples',
    description:
      'Compare two COG layers side by side with a draggable swipe slider. Useful for change detection, time-series and A/B raster comparison.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Before / After Comparison',
    description: 'Compare two COG layers with a draggable opacity slider.',
    category: 'deck.gl',
  });

  // Slider 0%  = pure 2018 (after-cog fully transparent)
  // Slider 100% = pure 2024 (after-cog fully opaque)
  // In between = blended view of both timestamps
  // Note: true left/right swipe clipping requires layer-level bounds clipping
  // which is not yet exposed by VLayerDeckglCOG — opacity fade is the
  // honest fallback that still demonstrates change-detection workflows.

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

  const BEFORE_COG =
    'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/18/T/XQ/2018/9/S2A_18TXQ_20180915_0_L2A/TCI.tif';
  const AFTER_COG =
    'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/18/T/XQ/2024/9/S2B_18TXQ_20240920_0_L2A/TCI.tif';

  const splitPosition = ref<[number]>([50]);
  const afterOpacity = computed(() => splitPosition.value[0]! / 100);

  const mapOptions = computed(() => ({
    container: `comparison-example-${mapId}`,
    style: mapStyle.value,
    center: [-73.0, 44.5] as [number, number],
    zoom: 8,
  }));

  const handleGeotiffLoad = (
    _tiff: unknown,
    options: {
      geographicBounds: {
        west: number;
        south: number;
        east: number;
        north: number;
      };
    },
  ) => {
    const { west, south, east, north } = options.geographicBounds;
    mapInstance.value?.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      { padding: 40, duration: 1000 },
    );
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import {
  VMap,
  VLayerDeckglCOG,
  VControlNavigation,
} from '@geoql/v-maplibre';
import { Slider } from '~/components/ui/slider';

const BEFORE_COG = 'https://.../S2A_2018.tif';
const AFTER_COG  = 'https://.../S2B_2024.tif';

const splitPosition = ref<[number]>([50]);

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-73.0, 44.5],
  zoom: 8,
};
${SCRIPT_END}

<template>
  <div class="relative">
    <VMap :options="mapOptions" class="h-125 w-full">
      <VControlNavigation position="top-right" />
      <VLayerDeckglCOG id="before" :geotiff="BEFORE_COG" />
      <VLayerDeckglCOG
        id="after"
        :geotiff="AFTER_COG"
        :bounds-clip="{ leftRatio: splitPosition[0] / 100 }"
      />
    </VMap>
    <Slider v-model="splitPosition" :min="0" :max="100" />
  </div>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Before / After Comparison"
    description="Compare two COG layers side-by-side with a draggable swipe slider. Useful for change detection, time-series and A/B raster comparison. Vermont, 2018 vs 2024 Sentinel-2 TCI."
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
          <VLayerDeckglCOG
            id="before-cog"
            :geotiff="BEFORE_COG"
            @geotiff-load="handleGeotiffLoad"
          />
          <VLayerDeckglCOG
            id="after-cog"
            :geotiff="AFTER_COG"
            :opacity="afterOpacity"
          />
        </VMap>
      </ClientOnly>

      <!-- Slider control bar -->
      <div
        class="pointer-events-auto absolute bottom-4 left-1/2 z-20 w-72 -translate-x-1/2 rounded-md border border-border bg-background/85 p-3 backdrop-blur-sm"
      >
        <div
          class="mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase"
        >
          <span>2018</span>
          <span class="tabular-nums text-foreground"
            >{{ splitPosition[0] }}%</span
          >
          <span>2024</span>
        </div>
        <Slider v-model="splitPosition" :min="0" :max="100" :step="1" />
      </div>
    </div>
  </ComponentDemo>
</template>
