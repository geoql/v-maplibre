<script setup lang="ts">
  import type {
    OceanGridCell,
    CurrentSample,
    TripStreamline,
  } from '~/types/maritime-ocean';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    oceanGrid: OceanGridCell[];
    currentSamples: CurrentSample[];
    streamlineTrips: TripStreamline[];
    showSst: boolean;
    showCurrents: boolean;
    sstOpacity: number;
    loopedTime: number;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `ocean-${mapId}`,
    style: mapStyle.value,
    // Centered on the Arabian Sea SST grid extent (lng 60-78, lat 6-22) so the
    // thermal field fills the frame instead of sitting in a corner off India.
    center: [68, 14] as [number, number],
    zoom: 5.4,
    pitch: 0,
    bearing: 0,
  }));
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap :key="mapStyle" :options="mapOptions" class="size-full">
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <ExamplesOceanLayers
          :ocean-grid="oceanGrid"
          :current-samples="currentSamples"
          :streamline-trips="streamlineTrips"
          :show-sst="showSst"
          :show-currents="showCurrents"
          :sst-opacity="sstOpacity"
          :looped-time="loopedTime"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
