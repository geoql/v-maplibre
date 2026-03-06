<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { PickingInfo } from '@deck.gl/core';
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VControlLegend,
    VLayerDeckglScatterplot,
    VPopup,
    type CategoryLegendItem,
  } from '@geoql/v-maplibre';
  import type {
    ZipRenderPoint,
    ZipDataPoint,
    QuintileBucket,
    ViewMode,
  } from '~/types/promap';
  import { boundsToViewport } from '~/types/promap';
  import {
    formatPrice,
    formatChange,
    formatPopulation,
  } from '~/composables/use-promap-data';

  const props = defineProps<{
    renderPoints: ZipRenderPoint[];
    legendBuckets: QuintileBucket[];
    hoveredZip: ZipDataPoint | null;
    viewMode: ViewMode;
    localView: boolean;
    mapStyle: string;
  }>();

  const emit = defineEmits<{
    'viewport-change': [bounds: ReturnType<typeof boundsToViewport>];
    'hover-zip': [zip: ZipDataPoint | null];
    'map-load': [map: MaplibreMap];
  }>();

  const mapId = useId();
  const mapRef = shallowRef<MaplibreMap | null>(null);

  const mapOptions = computed(() => ({
    container: `promap-${mapId}`,
    style: props.mapStyle,
    center: [-98.5, 39.8] as [number, number],
    zoom: 3.8,
    minZoom: 2,
    maxZoom: 16,
  }));

  const legendTitle = computed(() => {
    const base = props.viewMode === 'levels' ? 'Median Price' : 'YoY Change';
    return props.localView ? `${base} (local)` : base;
  });

  const legendItems = computed((): CategoryLegendItem[] =>
    props.legendBuckets.map((bucket, i) => ({
      value: i,
      label: bucket.label,
      color: `rgb(${bucket.color[0]}, ${bucket.color[1]}, ${bucket.color[2]})`,
      visible: true,
    })),
  );

  function getPosition(d: unknown): readonly [number, number] {
    return (d as ZipRenderPoint).coordinates;
  }

  function getRadius(d: unknown): number {
    return (d as ZipRenderPoint).radius;
  }

  function getFillColor(d: unknown): [number, number, number, number] {
    return (d as ZipRenderPoint).fillColor;
  }

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    emit('map-load', map);

    // Emit initial viewport
    const bounds = map.getBounds();
    emit('viewport-change', boundsToViewport(bounds));

    // Track viewport changes
    map.on('moveend', () => {
      const b = map.getBounds();
      emit('viewport-change', boundsToViewport(b));
    });
  }

  function handleHover(info: PickingInfo): void {
    if (info.object) {
      emit('hover-zip', (info.object as ZipRenderPoint).data);
    } else {
      emit('hover-zip', null);
    }
  }

  /** Fly to coordinates (used by search) */
  function flyTo(coords: readonly [number, number], zoom = 10): void {
    mapRef.value?.flyTo({
      center: coords,
      zoom,
      duration: 1500,
    });
  }

  defineExpose({ flyTo });
</script>

<template>
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
        :layer-ids="['promap-bubbles']"
        type="category"
        :items="legendItems"
        :title="legendTitle"
        position="bottom-left"
        :interactive="false"
      />

      <VLayerDeckglScatterplot
        id="promap-bubbles"
        :data="renderPoints"
        :get-position="getPosition"
        :get-radius="getRadius"
        :get-fill-color="getFillColor"
        :radius-min-pixels="2"
        :radius-max-pixels="40"
        :opacity="0.85"
        :pickable="true"
        :auto-highlight="true"
        :highlight-color="[255, 255, 255, 100]"
        :radius-scale="1"
        :anti-aliasing="true"
        @hover="handleHover"
      />

      <!-- Hover popup -->
      <VPopup
        v-if="hoveredZip"
        :coordinates="hoveredZip.coordinates"
        :options="{
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          className: 'promap-hover-popup',
        }"
      >
        <span class="promap-popup-label">
          {{ hoveredZip.city }}, {{ hoveredZip.state }} {{ hoveredZip.zip }}
        </span>
        <span v-if="viewMode === 'levels'" class="promap-popup-value">
          {{ formatPrice(hoveredZip.price) }}
        </span>
        <span v-else class="promap-popup-value">
          {{ formatChange(hoveredZip.priceChange) }}
        </span>
        <span v-if="hoveredZip.metro" class="promap-popup-detail">
          {{ hoveredZip.metro }}
        </span>
        <span class="promap-popup-detail">
          Pop: {{ formatPopulation(hoveredZip.population) }}
        </span>
      </VPopup>
    </VMap>
    <template #fallback>
      <div class="size-full animate-pulse bg-muted"></div>
    </template>
  </ClientOnly>
</template>

<style>
  .promap-hover-popup {
    z-index: 10;
  }

  .promap-hover-popup .maplibregl-popup-content {
    background: var(--color-popover);
    color: var(--color-popover-foreground);
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
    border: 1px solid var(--color-border);
  }

  .promap-hover-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
    border-top-color: var(--color-popover);
  }

  .promap-hover-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip {
    border-bottom-color: var(--color-popover);
  }

  .promap-hover-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip {
    border-right-color: var(--color-popover);
  }

  .promap-hover-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip {
    border-left-color: var(--color-popover);
  }

  .promap-popup-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .promap-popup-value {
    display: block;
    font-size: 16px;
    font-weight: 700;
  }

  .promap-popup-detail {
    display: block;
    font-size: 11px;
    opacity: 0.7;
  }
</style>
