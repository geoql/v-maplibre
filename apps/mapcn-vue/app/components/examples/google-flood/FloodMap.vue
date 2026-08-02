<script setup lang="ts">
  import {
    VControlNavigation,
    VControlScale,
    VControlLegend,
    VMap,
    VPopup,
  } from '@geoql/v-maplibre';
  import { VLayerDeckglScatterplot } from '@geoql/v-maplibre/deck.gl';
  import type { PickingInfo } from '@deck.gl/core';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import type {
    FloodMarker,
    GoogleFloodSeverity,
    ParsedFloodPolygon,
    SelectedGauge,
  } from '~/types/flood';

  const props = defineProps<{
    markers: FloodMarker[];
    polygons: ParsedFloodPolygon[];
    selectedGauge: SelectedGauge | null;
    center: [number, number];
    zoom: number;
    getSeverityColor: (
      s: GoogleFloodSeverity,
    ) => [number, number, number, number];
    getSeverityRadius: (s: GoogleFloodSeverity) => number;
  }>();

  const emit = defineEmits<{
    'select-gauge': [marker: FloodMarker];
    'close-popup': [];
  }>();

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `google-flood-map-${mapId}`,
    style: mapStyle.value,
    center: props.center,
    zoom: props.zoom,
  }));

  const rawMarkers = computed(() => toRaw(props.markers));

  const legendItems: CategoryLegendItem[] = [
    { value: 'EXTREME', label: 'Extreme', color: '#dc2626' },
    { value: 'SEVERE', label: 'Severe', color: '#f97316' },
    { value: 'ABOVE_NORMAL', label: 'Above Normal', color: '#eab308' },
    { value: 'NO_FLOODING', label: 'No Flooding', color: '#22c55e' },
    { value: 'UNKNOWN', label: 'Unknown', color: '#94a3b8' },
  ];

  const popupOptions = {
    closeButton: true,
    closeOnClick: false,
    offset: 12,
    maxWidth: '260px',
    className: 'flood-gauge-popup',
  };

  function getPosition(d: unknown): [number, number] {
    return (d as FloodMarker).coordinates;
  }

  function getFillColor(d: unknown): [number, number, number, number] {
    return props.getSeverityColor((d as FloodMarker).severity);
  }

  function getRadius(d: unknown): number {
    return props.getSeverityRadius((d as FloodMarker).severity);
  }

  function handleMapClick(evt: unknown): void {
    console.log('[FloodMap] VMap click (MapLibre):', evt);
  }

  function handleLayerClick(info: PickingInfo): void {
    console.log('[FloodMap] Scatterplot click:', {
      object: !!info.object,
      coordinate: info.coordinate,
      layer: info.layer?.id,
      index: info.index,
      picked: info.picked,
    });
    if (info.object) {
      emit('select-gauge', info.object as FloodMarker);
    }
  }

  function handleLayerHover(info: PickingInfo): void {
    if (info.object) {
      console.log(
        '[FloodMap] hover hit:',
        (info.object as FloodMarker).gaugeId,
      );
    }
  }

  function handlePopupClose(): void {
    emit('close-popup');
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<template>
  <ClientOnly>
    <VMap
      :key="mapStyle"
      :options="mapOptions"
      class="size-full"
      @click="handleMapClick"
    >
      <VControlNavigation position="top-right" />
      <VControlScale position="bottom-left" />
      <VControlLegend
        :layer-ids="['flood-gauges']"
        position="bottom-right"
        type="category"
        title="Severity"
        :items="legendItems"
        :interactive="false"
      />

      <ExamplesGoogleFloodInundationLayer :polygons="polygons" />

      <VLayerDeckglScatterplot
        v-if="rawMarkers.length > 0"
        id="flood-gauges"
        :data="rawMarkers"
        :get-position="getPosition"
        :get-fill-color="getFillColor"
        :get-radius="getRadius"
        :radius-min-pixels="5"
        :radius-max-pixels="30"
        :opacity="0.9"
        :pickable="true"
        :stroked="true"
        :get-line-color="[255, 255, 255, 80]"
        :line-width-min-pixels="1"
        :antialiasing="true"
        :auto-highlight="true"
        :highlight-color="[255, 255, 255, 100]"
        @click="handleLayerClick"
        @hover="handleLayerHover"
      />

      <VPopup
        v-if="selectedGauge"
        :coordinates="selectedGauge.coordinates"
        :options="popupOptions"
        @close="handlePopupClose"
      >
        <div class="space-y-1 p-1">
          <ExamplesGoogleFloodSeverityBadge
            :severity="selectedGauge.severity"
            size="md"
          />
          <p class="text-sm font-semibold text-popover-foreground">
            {{ selectedGauge.stationName }}
            <span
              v-if="selectedGauge.hasInundationMap"
              class="ml-1 inline-block size-1.5 rounded-full bg-primary align-middle"
              title="Inundation map loaded"
            />
          </p>
          <p
            v-if="selectedGauge.riverName"
            class="text-xs text-muted-foreground"
          >
            <Icon name="lucide:waves" class="mr-1 inline size-3" />
            {{ selectedGauge.riverName }}
          </p>
          <p
            v-if="selectedGauge.stationName !== selectedGauge.gaugeId"
            class="text-2xs font-mono text-muted-foreground/60"
          >
            {{ selectedGauge.gaugeId }}
          </p>
          <div
            class="border-t border-border pt-1 text-caption text-muted-foreground"
          >
            <Icon name="lucide:clock" class="mr-1 inline size-3" />
            {{ formatTime(selectedGauge.issuedTime) }}
          </div>
        </div>
      </VPopup>
    </VMap>
    <template #fallback>
      <div class="size-full bg-muted/30" />
    </template>
  </ClientOnly>
</template>

<style>
  .flood-gauge-popup {
    z-index: 100 !important;
  }

  .flood-gauge-popup .maplibregl-popup-content {
    background: color-mix(in oklch, var(--color-popover) 95%, transparent);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 8px 10px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 0.15);
    backdrop-filter: blur(12px);
  }

  .flood-gauge-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
    border-top-color: color-mix(
      in oklch,
      var(--color-popover) 95%,
      transparent
    );
  }

  .flood-gauge-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip {
    border-bottom-color: color-mix(
      in oklch,
      var(--color-popover) 95%,
      transparent
    );
  }

  .flood-gauge-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip {
    border-right-color: color-mix(
      in oklch,
      var(--color-popover) 95%,
      transparent
    );
  }

  .flood-gauge-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip {
    border-left-color: color-mix(
      in oklch,
      var(--color-popover) 95%,
      transparent
    );
  }

  .flood-gauge-popup .maplibregl-popup-close-button {
    color: var(--color-muted-foreground);
    font-size: 18px;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    line-height: 1;
  }

  .flood-gauge-popup .maplibregl-popup-close-button:hover {
    color: var(--color-foreground);
    background: var(--color-muted);
  }
</style>
