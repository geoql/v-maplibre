<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreGeojson,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import { MaplibreSnowLayer } from '@geoql/maplibre-gl-snow';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { NYCBorough } from '~/types/nyc-snow';
  import { PLOW_STATUS_LEGEND, SNOW_PRIORITY_LEGEND } from '~/types/nyc-snow';
  import { motion, AnimatePresence } from 'motion-v';

  useSeoMeta({
    title: 'NYC Snow Plowing - mapcn-vue Examples',
    description:
      '3D visualization of snow accumulation on NYC streets using DSNY data.',
  });

  defineOgImage('MapcnDoc', {
    title: 'NYC Snow Plowing',
    description:
      '3D visualization of snow accumulation on NYC streets using DSNY data.',
    category: 'Examples',
  });

  const mapId = useId();
  const panelOpen = ref(true);

  const { mapStyle, cartoStyle } = useMapStyle();

  const {
    borough,
    snowfallRate,
    loading,
    error,
    boroughInfo,
    snowGeoJson,
    streetCount,
    totalSnow24h,
    changeBorough,
  } = useNYCSnow();

  const mapOptions = computed(() => ({
    container: `nyc-snow-${mapId}`,
    style: mapStyle.value,
    center: boroughInfo.value.center,
    zoom: boroughInfo.value.zoom,
    pitch: 55,
    bearing: -17,
  }));

  const mapRef = ref<MaplibreMap | null>(null);
  const snowLayer = ref<MaplibreSnowLayer | null>(null);
  const { start: startSnowSync, stop: stopSnowSync } = useSnowLayerSync(
    mapRef,
    snowLayer,
  );
  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    const layer = new MaplibreSnowLayer({
      intensity: snowfallRate.value / 4,
      opacity: 0.75,
      direction: [0, 30],
      fog: true,
      fogOpacity: 0.04,
    });
    snowLayer.value = layer;
    map.addLayer(layer);
    startSnowSync();
  }
  onUnmounted(() => {
    stopSnowSync();
    if (mapRef.value && snowLayer.value) {
      mapRef.value.removeLayer(snowLayer.value.id);
    }
  });

  function handleBoroughUpdate(newBorough: NYCBorough): void {
    changeBorough(newBorough);
    if (mapRef.value) {
      const info = boroughInfo.value;
      mapRef.value.flyTo({
        center: info.center,
        zoom: info.zoom,
        duration: 1500,
      });
    }
  }

  function handleSnowfallUpdate(rate: number): void {
    snowfallRate.value = rate;
    snowLayer.value?.setIntensity(rate / 4);
  }

  function togglePanel(): void {
    panelOpen.value = !panelOpen.value;
  }

  const snowSource = computed(() => ({
    type: 'geojson' as const,
    data: snowGeoJson.value,
  }));

  const extrusionLayer = computed(() => ({
    id: 'snow-extrusion',
    type: 'fill-extrusion' as const,
    source: 'snow-streets',
    paint: {
      'fill-extrusion-color': ['get', 'plowColor'] as unknown as string,
      'fill-extrusion-height': [
        '+',
        1,
        ['*', ['get', 'snowDepth'], 0.6],
      ] as unknown as number,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.85,
    },
  }));

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerMaplibreGeojson, VControlNavigation } from '@geoql/v-maplibre';
  import { MaplibreSnowLayer } from '@geoql/maplibre-gl-snow';
  const { snowGeoJson, snowfallRate } = useNYCSnow();
  const mapOptions = {
    style: '${cartoStyle.value}',
    center: [-73.98, 40.758],
    zoom: 13,
    pitch: 55,
    bearing: -17,
  };
  function onMapLoad(map) {
    map.addLayer(new MaplibreSnowLayer({
      intensity: snowfallRate.value / 4,
      fog: true,
    }));
  }
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-full w-full" @loaded="onMapLoad">
    <VControlNavigation position="top-right" />
    <VLayerMaplibreGeojson
      source-id="snow-streets"
      layer-id="snow-extrusion"
      :source="{ type: 'geojson', data: snowGeoJson }"
      :layer="{
        id: 'snow-extrusion',
        type: 'fill-extrusion',
        source: 'snow-streets',
        paint: {
          'fill-extrusion-color': ['get', 'plowColor'],
          'fill-extrusion-height': ['+', 1, ['*', ['get', 'snowDepth'], 0.6]],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85,
        },
      }"
    />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="NYC Snow Plowing"
    description="3D visualization of snow accumulation on NYC streets. Fetches real DSNY street geometry from NYC Open Data, simulates plow status and snow depth."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden bg-black">
      <ClientOnly>
        <VMap
          :key="`snow-${borough}`"
          :options="mapOptions"
          class="size-full"
          @loaded="handleMapLoad"
        >
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerMaplibreGeojson
            v-if="!loading && snowGeoJson.features.length > 0"
            source-id="snow-streets"
            layer-id="snow-extrusion"
            :source="snowSource"
            :layer="extrusionLayer"
          />
          <VControlLegend
            :layer-ids="['snow-extrusion']"
            position="bottom-left"
            type="gradient"
            title="Plow Status"
            :items="[PLOW_STATUS_LEGEND]"
            :interactive="false"
          />
          <VControlLegend
            :layer-ids="['snow-extrusion']"
            position="bottom-left"
            type="category"
            title="Snow Priority"
            :items="SNOW_PRIORITY_LEGEND"
            :interactive="false"
          />
        </VMap>
        <template #fallback>
          <div class="size-full bg-black"></div>
        </template>
      </ClientOnly>

      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="togglePanel"
      >
        <Icon
          :name="
            panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'
          "
          class="size-4"
        />
      </button>

      <AnimatePresence>
        <motion.div
          v-if="panelOpen"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute top-16 left-4 z-10 w-64 rounded-lg bg-background/95 p-4 shadow-lg backdrop-blur-sm"
        >
          <ExamplesNycSnowControlPanel
            :borough="borough"
            :snowfall-rate="snowfallRate"
            :street-count="streetCount"
            :total-snow24h="totalSnow24h"
            :loading="loading"
            :error="error"
            @update:borough="handleBoroughUpdate"
            @update:snowfall-rate="handleSnowfallUpdate"
          />

          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80"
          >
            <div class="flex items-center gap-2 text-sm">
              <Icon name="lucide:loader-2" class="size-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div
        class="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/70 px-2 py-1 rounded"
      >
        Data: NYC Open Data (DSNY)
      </div>
    </div>
  </ComponentDemo>
</template>
