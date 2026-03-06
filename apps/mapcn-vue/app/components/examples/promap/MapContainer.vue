<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { PickingInfo } from '@deck.gl/core';
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VLayerDeckglScatterplot,
    VPopup,
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
    viewportChange: [bounds: ReturnType<typeof boundsToViewport>];
    hoverZip: [zip: ZipDataPoint | null];
    mapLoad: [map: MaplibreMap];
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

  function getPosition(d: unknown): [number, number] {
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
    emit('mapLoad', map);

    // Emit initial viewport
    const bounds = map.getBounds();
    emit('viewportChange', boundsToViewport(bounds));

    // Track viewport changes
    map.on('moveend', () => {
      const b = map.getBounds();
      emit('viewportChange', boundsToViewport(b));
    });
  }

  function handleHover(info: PickingInfo): void {
    if (info.object) {
      emit('hoverZip', (info.object as ZipRenderPoint).data);
    } else {
      emit('hoverZip', null);
    }
  }

  /** Fly to coordinates (used by search) */
  function flyTo(coords: [number, number], zoom = 10): void {
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
        <div class="promap-popup-content">
          <p class="promap-popup-location">
            {{ hoveredZip.city }}, {{ hoveredZip.state }}
            {{ hoveredZip.zip }}
          </p>
          <p v-if="viewMode === 'levels'" class="promap-popup-value">
            {{ formatPrice(hoveredZip.price) }}
          </p>
          <p v-else class="promap-popup-value">
            {{ formatChange(hoveredZip.priceChange) }}
          </p>
          <p v-if="hoveredZip.metro" class="promap-popup-detail">
            {{ hoveredZip.metro }}
          </p>
          <p class="promap-popup-detail">
            Pop: {{ formatPopulation(hoveredZip.population) }}
          </p>
        </div>
      </VPopup>
    </VMap>
    <template #fallback>
      <div class="size-full animate-pulse bg-muted"></div>
    </template>
  </ClientOnly>

  <!-- Legend overlay -->
  <div
    v-if="legendBuckets.length > 0"
    class="absolute bottom-12 left-4 z-10 rounded-lg border border-border/50 bg-background/95 p-3 shadow-sm backdrop-blur-sm"
  >
    <p
      class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {{ viewMode === 'levels' ? 'Median Price' : 'YoY Change' }}
      <span v-if="localView" class="ml-1 text-primary">(local)</span>
    </p>
    <div class="flex flex-col gap-1">
      <div
        v-for="(bucket, i) in legendBuckets"
        :key="i"
        class="flex items-center gap-2"
      >
        <span
          class="inline-block size-3 rounded-full"
          :style="{
            backgroundColor: `rgb(${bucket.color[0]}, ${bucket.color[1]}, ${bucket.color[2]})`,
          }"
        ></span>
        <span class="text-[11px] text-muted-foreground">{{
          bucket.label
        }}</span>
      </div>
    </div>
  </div>
</template>

<style>
  .promap-hover-popup .maplibregl-popup-content {
    background: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
    border: 1px solid hsl(var(--border));
  }

  .promap-hover-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
    border-top-color: hsl(var(--popover));
  }

  .promap-hover-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip {
    border-bottom-color: hsl(var(--popover));
  }

  .promap-hover-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip {
    border-right-color: hsl(var(--popover));
  }

  .promap-hover-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip {
    border-left-color: hsl(var(--popover));
  }

  .promap-popup-content {
    font-family: inherit;
  }

  .promap-popup-location {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .promap-popup-value {
    font-size: 16px;
    font-weight: 700;
    margin-top: 2px;
  }

  .promap-popup-detail {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 2px;
  }
</style>
