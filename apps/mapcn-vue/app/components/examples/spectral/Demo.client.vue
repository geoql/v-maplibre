<script setup lang="ts">
  import { VMap, VControlScale } from '@geoql/v-maplibre';
  import { Compare } from '@geoql/maplibre-gl-compare';
  import '@geoql/maplibre-gl-compare/style.css';
  import type { Map } from 'maplibre-gl';
  import type {
    Orientation,
    SpectralBand,
    RasterPaintConfig,
  } from '~/types/defense-spectral';
  import type { Theme } from '~/types/compare';

  const SATELLITE_SOURCE =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const BAND_PAINT: Record<SpectralBand, RasterPaintConfig> = {
    visual: { 'raster-opacity': 1 },
    thermal: {
      'raster-hue-rotate': 30,
      'raster-saturation': 0.6,
      'raster-contrast': 0.4,
      'raster-brightness-max': 0.85,
    },
    nightvision: {
      'raster-hue-rotate': 120,
      'raster-saturation': -0.4,
      'raster-brightness-max': 0.65,
      'raster-contrast': 0.3,
    },
  };

  const props = defineProps<{
    orientation: Orientation;
    beforeStyle: string;
    afterStyle: string;
    beforeBand: SpectralBand;
    afterBand: SpectralBand;
  }>();

  const colorMode = useColorMode();
  const containerRef = ref<HTMLDivElement | null>(null);

  let beforeMap: Map | null = null;
  let afterMap: Map | null = null;
  let compare: Compare | null = null;

  const compareTheme = computed<Theme>(() =>
    colorMode.value === 'dark' ? 'dark' : 'light',
  );

  const beforeMapOptions = computed(() => ({
    container: 'spectral-before',
    style: props.beforeStyle,
    center: [77.5, 34.0] as [number, number],
    zoom: 10,
  }));

  const afterMapOptions = computed(() => ({
    container: 'spectral-after',
    style: props.afterStyle,
    center: [77.5, 34.0] as [number, number],
    zoom: 10,
  }));

  function addSatelliteLayer(map: Map, band: SpectralBand): void {
    const sourceId = 'satellite-src';
    const layerId = 'satellite-layer';

    if (map.getSource(sourceId)) {
      map.removeLayer(layerId);
      map.removeSource(sourceId);
    }

    map.addSource(sourceId, {
      type: 'raster',
      tiles: [SATELLITE_SOURCE],
      tileSize: 256,
      attribution: '&copy; Esri',
      maxzoom: 18,
    });

    map.addLayer(
      {
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: BAND_PAINT[band],
      },
      map.getStyle().layers?.find((l) => l.type === 'symbol')?.id,
    );
  }

  function initCompare(): void {
    if (!containerRef.value || !beforeMap || !afterMap) return;
    compare?.remove();
    compare = new Compare(beforeMap, afterMap, containerRef.value, {
      orientation: props.orientation,
      theme: compareTheme.value,
    });
  }

  function onBeforeMapLoaded(map: Map): void {
    beforeMap = map;
    addSatelliteLayer(map, props.beforeBand);
    if (afterMap) initCompare();
  }

  function onAfterMapLoaded(map: Map): void {
    afterMap = map;
    addSatelliteLayer(map, props.afterBand);
    if (beforeMap) initCompare();
  }

  watch(
    () => props.orientation,
    () => initCompare(),
  );
  watch(compareTheme, (theme) => compare?.setTheme(theme));

  watch(
    () => props.beforeBand,
    (band) => {
      if (beforeMap) addSatelliteLayer(beforeMap, band);
    },
  );

  watch(
    () => props.afterBand,
    (band) => {
      if (afterMap) addSatelliteLayer(afterMap, band);
    },
  );

  onUnmounted(() => {
    compare?.remove();
    compare = null;
    beforeMap = null;
    afterMap = null;
  });
</script>

<template>
  <div ref="containerRef" class="relative size-full overflow-hidden">
    <VMap
      :options="beforeMapOptions"
      class="absolute inset-0"
      @loaded="onBeforeMapLoaded"
    />
    <VMap
      :options="afterMapOptions"
      class="absolute inset-0"
      @loaded="onAfterMapLoaded"
    >
      <VControlScale position="bottom-left" />
    </VMap>
  </div>
</template>
