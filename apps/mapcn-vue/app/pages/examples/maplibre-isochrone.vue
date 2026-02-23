<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VControlLayer,
    VControlLegend,
    VMarker,
    VLayerMaplibreIsochrone,
  } from '@geoql/v-maplibre';
  import { motion, AnimatePresence } from 'motion-v';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import type {
    IsochroneResponse,
    TransportMode,
    TransportModeOption,
  } from '~/types/isochrone';

  useSeoMeta({
    title: 'Isochrone Map - mapcn-vue Examples',
    description:
      'Visualize travel time or distance zones showing areas reachable from a point.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Isochrone Map',
    description:
      'Visualize travel time or distance zones showing areas reachable from a point.',
    category: 'MapLibre',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);
  const mapLoaded = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const panelOpen = ref(true);

  const mapOptions = computed(() => ({
    container: `isochrone-map-${mapId}`,
    style: mapStyle.value,
    center: [-96.797, 32.777] as [number, number],
    zoom: 10,
  }));

  const originPoint = ref<[number, number]>([-96.797, 32.777]);
  const isochroneData = ref<IsochroneResponse | null>(null);

  type MetricType = 'time' | 'distance';
  const selectedMetric = ref<MetricType>('time');

  const transportModes: TransportModeOption[] = [
    { value: 'auto', label: 'Car', icon: 'lucide:car' },
    { value: 'bicycle', label: 'Bicycle', icon: 'lucide:bike' },
    { value: 'pedestrian', label: 'Walk', icon: 'lucide:footprints' },
  ];

  const selectedMode = ref<TransportMode>('auto');

  const timeContours = [
    { time: 5, color: '#dc2626', label: '5 min' },
    { time: 10, color: '#2563eb', label: '10 min' },
    { time: 15, color: '#16a34a', label: '15 min' },
  ];

  const distanceContours = [
    { distance: 2, color: '#dc2626', label: '2 km' },
    { distance: 5, color: '#2563eb', label: '5 km' },
    { distance: 10, color: '#16a34a', label: '10 km' },
  ];

  const activeContours = computed(() =>
    selectedMetric.value === 'time' ? timeContours : distanceContours,
  );

  // Legend items for VControlLegend
  const legendItems = computed<CategoryLegendItem[]>(() =>
    activeContours.value.map((contour) => ({
      value: contour.label,
      label: contour.label,
      color: contour.color,
    })),
  );

  const legendTitle = computed(() =>
    selectedMetric.value === 'time' ? 'Travel Time' : 'Distance',
  );

  // Helper to remove # from hex color for Valhalla API
  function toValhallaColor(hex: string): string {
    return hex.replace('#', '');
  }

  async function fetchIsochrone(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Valhalla expects colors without # prefix
      const contours =
        selectedMetric.value === 'time'
          ? timeContours.map((c) => ({
              time: c.time,
              color: toValhallaColor(c.color),
            }))
          : distanceContours.map((c) => ({
              distance: c.distance,
              color: toValhallaColor(c.color),
            }));

      const params = {
        locations: [
          {
            lat: originPoint.value[1],
            lon: originPoint.value[0],
          },
        ],
        costing: selectedMode.value,
        contours,
        polygons: true,
        denoise: 0.5,
        generalize: 50,
      };

      const url = `/api/valhalla?endpoint=isochrone&json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch<IsochroneResponse>(url);

      isochroneData.value = data;
    } catch (err) {
      console.error('Isochrone fetch error:', err);
      error.value = 'Failed to load isochrone data';
    } finally {
      isLoading.value = false;
    }
  }

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    mapLoaded.value = true;
    fetchIsochrone();
  }

  function handleMarkerDragEnd(event: {
    target: { getLngLat: () => { lng: number; lat: number } };
  }): void {
    const lngLat = event.target.getLngLat();
    originPoint.value = [lngLat.lng, lngLat.lat];
    fetchIsochrone();
  }

  function handleModeChange(mode: TransportMode): void {
    selectedMode.value = mode;
    fetchIsochrone();
  }

  function handleMetricChange(metric: MetricType): void {
    selectedMetric.value = metric;
    fetchIsochrone();
  }

  watch(mapStyle, () => {
    mapLoaded.value = false;
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VMarker, VControlScale, VControlLayer, VControlLegend, VLayerMaplibreIsochrone } from '@geoql/v-maplibre';

  const originPoint = ref([-96.797, 32.777]); // Dallas
  const isochroneData = ref(null);

  // Contours - Valhalla expects colors without # prefix
  const contours = [
    { time: 5, color: 'dc2626', label: '5 min' },   // red
    { time: 10, color: '2563eb', label: '10 min' }, // blue
    { time: 15, color: '16a34a', label: '15 min' }, // green
  ];

  const legendItems = contours.map(c => ({
    value: c.label, label: c.label, color: '#' + c.color,
  }));

  async function fetchIsochrone() {
    const params = {
      locations: [{ lat: originPoint.value[1], lon: originPoint.value[0] }],
      costing: 'auto',
      contours,
      polygons: true,
    };
    const response = await $fetch('/api/valhalla?endpoint=isochrone&json=' +
      encodeURIComponent(JSON.stringify(params)));
    isochroneData.value = response;
  }

  function handleMarkerDrag(e) {
    const { lng, lat } = e.target.getLngLat();
    originPoint.value = [lng, lat];
    fetchIsochrone();
  }
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" @loaded="fetchIsochrone">
      <VControlScale position="bottom-left" />
      <VLayerMaplibreIsochrone
        v-if="isochroneData"
        id="isochrone"
        :data="isochroneData"
        :fill-opacity="0.85"
        :line-width="0"
        :reverse-order="false"
      />
      <VMarker :coordinates="originPoint" :options="{ draggable: true }" @dragend="handleMarkerDrag" />
      <VControlLegend ... />
      <VControlLayer
        layer-id="isochrone-fill"
        title="Opacity"
        position="top-left"
        :opacity="0.85"
      />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Isochrone Map"
    description="Visualize travel time or distance zones showing areas reachable from a point. Drag the marker to change the origin."
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

          <VLayerMaplibreIsochrone
            v-if="mapLoaded && isochroneData"
            id="isochrone"
            :data="isochroneData"
            :fill-opacity="0.85"
            :line-width="0"
            :line-opacity="0"
            :reverse-order="false"
          />

          <VMarker
            :coordinates="originPoint"
            :options="{ draggable: true, color: '#ef4444' }"
            @dragend="handleMarkerDragEnd"
          />

          <VControlLegend
            :layer-ids="['isochrone-fill', 'isochrone-line']"
            type="category"
            :items="legendItems"
            :title="legendTitle"
            position="bottom-left"
            :interactive="false"
          />

          <VControlLayer
            layer-id="isochrone-fill"
            title="Isochrone Opacity"
            position="top-right"
            :visible="true"
            :opacity="0.85"
          />
        </VMap>
        <template #fallback>
          <div class="flex h-full items-center justify-center bg-muted">
            <Icon
              name="lucide:loader-2"
              class="size-8 animate-spin text-muted-foreground"
            />
          </div>
        </template>
      </ClientOnly>

      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 flex items-center justify-center bg-background/50"
      >
        <div class="flex items-center gap-2 text-sm">
          <Icon name="lucide:loader-2" class="size-4 animate-spin" />
          Calculating travel zones...
        </div>
      </div>

      <div
        v-if="error"
        class="absolute inset-0 z-10 flex items-center justify-center bg-background/80"
      >
        <div class="text-center">
          <Icon
            name="lucide:alert-circle"
            class="mx-auto size-8 text-destructive"
          />
          <p class="mt-2 text-sm text-destructive">{{ error }}</p>
        </div>
      </div>

      <!-- Toggle button - always visible -->
      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-accent"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="panelOpen = !panelOpen"
      >
        <Icon
          :name="
            panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'
          "
          class="size-4"
        />
      </button>

      <!-- Collapsible panel with motion-v -->
      <AnimatePresence>
        <motion.div
          v-if="panelOpen"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute top-16 left-4 z-10 w-64 rounded-lg bg-background/95 p-4 shadow-lg backdrop-blur-sm"
        >
          <div class="mb-3">
            <h3 class="mb-2 text-xs font-medium">Metric</h3>
            <div class="flex gap-1.5">
              <button
                class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors"
                :class="[
                  selectedMetric === 'time'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80',
                ]"
                :disabled="isLoading"
                @click="handleMetricChange('time')"
              >
                <Icon name="lucide:clock" class="size-3.5" />
                Time
              </button>
              <button
                class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors"
                :class="[
                  selectedMetric === 'distance'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80',
                ]"
                :disabled="isLoading"
                @click="handleMetricChange('distance')"
              >
                <Icon name="lucide:ruler" class="size-3.5" />
                Distance
              </button>
            </div>
          </div>

          <div>
            <h3 class="mb-2 text-xs font-medium">Transport</h3>
            <div class="flex gap-1.5">
              <button
                v-for="mode in transportModes"
                :key="mode.value"
                class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors"
                :class="[
                  selectedMode === mode.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80',
                ]"
                :disabled="isLoading"
                @click="handleModeChange(mode.value)"
              >
                <Icon :name="mode.icon" class="size-3.5" />
                {{ mode.label }}
              </button>
            </div>
          </div>

          <p class="mt-3 text-xs text-muted-foreground">
            Drag the red marker to change origin.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
