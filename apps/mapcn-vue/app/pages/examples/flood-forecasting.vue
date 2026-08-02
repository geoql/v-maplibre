<script setup lang="ts">
  import {
    VMap,
    VPopup,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import {
    VLayerDeckglScatterplot,
    VLayerDeckglHeatmap,
  } from '@geoql/v-maplibre/deck.gl';
  import type { PickingInfo } from '@deck.gl/core';
  import type {
    CategoryLegendItem,
    GradientLegendItem,
  } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';
  import type { FloodPoint } from '~/types/flood';

  usePageGeo({
    title: 'Flood Forecasting - mapcn-vue Examples',
    description:
      'Global flood visualization powered by Google Groundsource: 2.6M+ historical flash flood events from 2000 to 2026.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Flood Forecasting',
    description:
      'Global flood visualization with 2.6M+ historical events from Google Groundsource.',
    category: 'Examples',
  });

  const { mapStyle, cartoLightStyle, cartoDarkStyle } = useMapStyle();
  const mapId = useId();

  const ZOOM_THRESHOLD = 12;

  const mapOptions = computed(() => ({
    container: `flood-forecasting-${mapId}`,
    style: mapStyle.value,
    center: [20, 10] as [number, number],
    zoom: 2,
  }));

  const mapInstance = shallowRef<Map | null>(null);
  const currentZoom = ref(2);

  const showHeatmap = computed(() => currentZoom.value < ZOOM_THRESHOLD);
  const showScatterplot = computed(() => currentZoom.value >= ZOOM_THRESHOLD);

  const {
    filteredPoints,
    selectedPoint,
    loading,
    progress,
    total,
    loaded,
    yearRange,
    yearCounts,
    selectPoint,
    clearSelection,
    getAreaColor,
    getAreaRadius,
    minYear,
    maxYear,
  } = useFloodData();

  function handleMapLoad(map: Map) {
    mapInstance.value = map;
    currentZoom.value = map.getZoom();
    map.on('zoomend', () => {
      currentZoom.value = map.getZoom();
    });
  }

  const hasData = computed(() => filteredPoints.value.length > 0);
  const rawFloodPoints = computed(() => toRaw(filteredPoints.value));

  function getPosition(d: unknown) {
    const p = d as FloodPoint;
    return [p[0], p[1]];
  }

  function getHeatmapWeight(d: unknown) {
    return (d as FloodPoint)[2];
  }

  function getRadius(d: unknown) {
    return getAreaRadius((d as FloodPoint)[2]);
  }

  function getFillColor(d: unknown) {
    return getAreaColor((d as FloodPoint)[2]);
  }

  const dotStrokeColor: [number, number, number, number] = [255, 255, 255, 50];

  const heatmapColorRange: [number, number, number][] = [
    [56, 189, 248],
    [59, 130, 246],
    [139, 92, 246],
    [249, 115, 22],
    [220, 38, 38],
    [153, 27, 27],
  ];

  function handleClick(info: PickingInfo) {
    if (info.object) {
      const point = info.object as FloodPoint;
      selectPoint(point);
    }
  }

  const severityLabel = computed(() => {
    if (!selectedPoint.value) return '';
    switch (selectedPoint.value.severity) {
      case 'major':
        return 'Major';
      case 'significant':
        return 'Significant';
      case 'moderate':
        return 'Moderate';
      default:
        return 'Localized';
    }
  });

  const severityColorClass = computed(() => {
    if (!selectedPoint.value) return '';
    switch (selectedPoint.value.severity) {
      case 'major':
        return 'bg-red-500';
      case 'significant':
        return 'bg-orange-500';
      case 'moderate':
        return 'bg-blue-500';
      default:
        return 'bg-cyan-400';
    }
  });

  const categoryLegendItems: CategoryLegendItem[] = [
    { value: 'major', label: 'Major (>500 km²)', color: '#dc2626' },
    { value: 'significant', label: 'Significant (>100 km²)', color: '#f97316' },
    { value: 'moderate', label: 'Moderate (>10 km²)', color: '#3b82f6' },
    { value: 'localized', label: 'Localized (≤10 km²)', color: '#38bdf8' },
  ];

  const gradientLegendItems: GradientLegendItem[] = [
    {
      min: 0,
      max: 500,
      minLabel: 'Low',
      maxLabel: 'High',
      colors: [
        '#38bdf8',
        '#3b82f6',
        '#8b5cf6',
        '#f97316',
        '#dc2626',
        '#991b1b',
      ],
    },
  ];

  const formattedArea = computed(() => {
    if (!selectedPoint.value) return '';
    const area = selectedPoint.value.areaKm2;
    return area >= 1
      ? `${area.toFixed(1)} km²`
      : `${(area * 1_000_000).toFixed(0)} m²`;
  });

  const popupOptions = {
    closeButton: true,
    closeOnClick: false,
    offset: 14,
    maxWidth: '280px',
    className: 'flood-event-popup',
  };

  const layerModeLabel = computed(() =>
    showHeatmap.value ? 'Density heatmap' : 'Individual events',
  );

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                      import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                      import { VLayerDeckglHeatmap, VLayerDeckglScatterplot } from '@geoql/v-maplibre/deck.gl';

                      const colorMode = useColorMode();
                      const mapStyle = computed(() =>
                        colorMode.value === 'dark'
                          ? '${cartoDarkStyle}'
                          : '${cartoLightStyle}',
                      );

                      const mapOptions = computed(() => ({
                        style: mapStyle.value,
                        center: [20, 10],
                        zoom: 2,
                      }));

                      const { data } = await useFetch('/api/groundsource');

                      const currentZoom = ref(2);
                      const showHeatmap = computed(() => currentZoom.value < 12);
                    ${SCRIPT_END}

                    <template>
                      <VMap :options="mapOptions" class="h-125 w-full">
                        <VControlNavigation position="top-right" />
                        <VLayerDeckglHeatmap
                          v-if="showHeatmap"
                          id="floods-heat"
                          :data="data.data"
                          :get-position="(d) => [d[0], d[1]]"
                          :get-weight="(d) => d[2]"
                          :radius-pixels="40"
                          :intensity="1.5"
                          :threshold="0.03"
                        />
                        <VLayerDeckglScatterplot
                          v-if="!showHeatmap"
                          id="floods"
                          :data="data.data"
                          :get-position="(d) => [d[0], d[1]]"
                          :get-fill-color="getAreaColor"
                          :get-radius="getAreaRadius"
                          :radius-min-pixels="3"
                          :radius-max-pixels="25"
                          :opacity="0.85"
                          :pickable="true"
                        />
                      </VMap>
                    </template>`;
</script>

<template>
  <ComponentDemo
    title="Flood Forecasting"
    description="Global flood visualization powered by Google Groundsource — an AI-generated dataset of 2.6M+ historical flash flood events spanning 2000–2026, now powering forecasts on Google Flood Hub."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap
          :key="mapStyle"
          :options="mapOptions"
          class="size-full"
          @loaded="handleMapLoad"
        >
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VControlLegend
            v-if="showHeatmap"
            :layer-ids="['floods-heat']"
            position="bottom-left"
            type="gradient"
            title="Flood Density"
            :items="gradientLegendItems"
            :interactive="false"
          />
          <VControlLegend
            v-if="showScatterplot"
            :layer-ids="['floods']"
            position="bottom-left"
            type="category"
            title="Flood Area"
            :items="categoryLegendItems"
            :interactive="false"
          />
          <VLayerDeckglHeatmap
            v-if="hasData"
            id="floods-heat"
            :data="rawFloodPoints"
            :get-position="getPosition"
            :get-weight="getHeatmapWeight"
            :radius-pixels="40"
            :intensity="1.5"
            :threshold="0.03"
            :color-range="heatmapColorRange"
            :aggregation="'SUM'"
            :opacity="0.9"
            :visible="showHeatmap"
          />
          <VLayerDeckglScatterplot
            v-if="hasData"
            id="floods"
            :data="rawFloodPoints"
            :get-position="getPosition"
            :get-radius="getRadius"
            :get-fill-color="getFillColor"
            :radius-min-pixels="3"
            :radius-max-pixels="25"
            :opacity="0.85"
            :pickable="true"
            :stroked="true"
            :get-line-color="dotStrokeColor"
            :line-width-min-pixels="1"
            :antialiasing="true"
            :visible="showScatterplot"
            @click="handleClick"
          />
          <VPopup
            v-if="selectedPoint"
            :coordinates="selectedPoint.coordinates"
            :options="popupOptions"
            @close="clearSelection"
          >
            <div class="space-y-2 p-1">
              <div class="flex items-center gap-2">
                <span
                  class="size-2.5 shrink-0 rounded-full"
                  :class="severityColorClass"
                ></span>
                <span class="text-sm font-semibold text-popover-foreground">
                  {{ severityLabel }} flood
                </span>
              </div>
              <p class="text-xs text-muted-foreground">
                <template v-if="selectedPoint.locationLoading">
                  <Icon
                    name="lucide:loader-2"
                    class="mr-1 inline size-3 animate-spin"
                  />
                  Locating...
                </template>
                <template v-else-if="selectedPoint.locationName">
                  {{ selectedPoint.locationName }}
                </template>
                <template v-else>
                  {{ selectedPoint.coordinates[1].toFixed(4) }}°,
                  {{ selectedPoint.coordinates[0].toFixed(4) }}°
                </template>
              </p>
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p class="text-muted-foreground">Area</p>
                  <p class="font-medium text-popover-foreground">
                    {{ formattedArea }}
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground">Severity</p>
                  <p class="font-medium text-popover-foreground">
                    {{ severityLabel }}
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground">Year</p>
                  <p class="font-medium text-popover-foreground">
                    {{ selectedPoint.year }}
                  </p>
                </div>
              </div>
              <div class="border-t border-border pt-1.5">
                <a
                  href="https://sites.research.google/floods/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-caption text-primary transition-colors hover:text-primary/80"
                >
                  <Icon name="lucide:external-link" class="size-3" />
                  Google Flood Hub
                </a>
              </div>
            </div>
          </VPopup>
        </VMap>
        <template #fallback>
          <div class="size-full bg-black"></div>
        </template>
      </ClientOnly>

      <Transition name="fade">
        <div
          v-if="total > 0"
          class="absolute left-3 top-3 z-10 rounded-lg border border-border bg-card/80 px-3 py-2 backdrop-blur-sm"
        >
          <div class="flex items-center gap-3 text-xs">
            <span class="font-mono text-foreground">{{
              (loading ? loaded : rawFloodPoints.length).toLocaleString()
            }}</span>
            <span v-if="loading" class="text-muted-foreground">
              / {{ total.toLocaleString() }} ({{ progress }}%)
            </span>
            <span v-else class="text-muted-foreground">events</span>
            <span class="text-muted-foreground/40">·</span>
            <span class="text-muted-foreground">{{ layerModeLabel }}</span>
            <Icon
              v-if="loading"
              name="lucide:loader-2"
              class="size-3 animate-spin text-primary"
            />
          </div>
        </div>
      </Transition>

      <div
        class="absolute bottom-4 left-1/2 z-10 w-9/10 max-w-105 -translate-x-1/2"
      >
        <ExamplesFloodTimeSlider
          v-model="yearRange"
          :min="minYear"
          :max="maxYear"
          :loading="loading"
          :year-counts="yearCounts"
        />
      </div>
    </div>
  </ComponentDemo>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  :deep(.flood-event-popup) {
    --popup-bg: color-mix(in oklch, var(--color-popover) 95%, transparent);
    z-index: 10 !important;
  }

  :deep(.flood-event-popup .maplibregl-popup-content) {
    background: var(--popup-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 8px 10px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 0.15);
    backdrop-filter: blur(12px);
  }

  :deep(.flood-event-popup .maplibregl-popup-close-button) {
    color: var(--color-muted-foreground);
    font-size: 18px;
    padding: 4px 8px;
  }

  :deep(.flood-event-popup .maplibregl-popup-close-button:hover) {
    color: var(--color-foreground);
    background: transparent;
  }

  :deep(
    .flood-event-popup .maplibregl-popup-anchor-bottom .maplibregl-popup-tip
  ) {
    border-top-color: var(--popup-bg);
  }

  :deep(.flood-event-popup .maplibregl-popup-anchor-top .maplibregl-popup-tip) {
    border-bottom-color: var(--popup-bg);
  }

  :deep(
    .flood-event-popup .maplibregl-popup-anchor-left .maplibregl-popup-tip
  ) {
    border-right-color: var(--popup-bg);
  }

  :deep(
    .flood-event-popup .maplibregl-popup-anchor-right .maplibregl-popup-tip
  ) {
    border-left-color: var(--popup-bg);
  }
</style>
