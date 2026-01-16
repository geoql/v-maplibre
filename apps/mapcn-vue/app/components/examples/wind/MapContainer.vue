<script setup lang="ts">
  import type { WindDataPoint, ColorStop } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VLayerDeckglWindParticle,
  } from '@geoql/v-maplibre';

  const props = defineProps<{
    windData: WindDataPoint[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    colorRamp: ColorStop[];
    numParticles: number;
    maxAge: number;
    speedFactor: number;
    lineWidth: number;
    speedRange: [number, number];
  }>();

  const emit = defineEmits<{
    load: [map: Map];
    refresh: [];
    windLoaded: [];
    windError: [error: Error];
  }>();

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `wind-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
    minZoom: 0,
  }));

  function handleMapLoad(map: Map): void {
    emit('load', map);
  }

  function handleWindLoaded(): void {
    emit('windLoaded');
  }

  function handleWindError(err: Error): void {
    emit('windError', err);
  }
</script>

<template>
  <div
    class="lg:col-span-2 relative h-125 min-w-0 overflow-hidden rounded-lg border border-border"
  >
    <ClientOnly>
      <div
        v-if="isLoading && windData.length === 0"
        class="absolute inset-0 z-10 flex items-center justify-center bg-muted"
      >
        <div class="flex items-center gap-2 text-muted-foreground">
          <Icon name="lucide:loader-2" class="size-5 animate-spin" />
          <span>Fetching wind data...</span>
        </div>
      </div>

      <div
        v-if="error"
        class="absolute inset-0 z-10 flex items-center justify-center bg-muted"
      >
        <div class="text-center text-destructive">
          <Icon name="lucide:alert-circle" class="mx-auto mb-2 size-8" />
          <p>{{ error }}</p>
        </div>
      </div>

      <div
        v-if="lastUpdated"
        class="absolute left-2 top-2 z-10 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm"
      >
        <div class="flex items-center gap-2">
          <span>Updated: {{ lastUpdated.toLocaleTimeString() }}</span>
          <button
            class="hover:text-foreground"
            title="Refresh now"
            @click="emit('refresh')"
          >
            <Icon
              name="lucide:refresh-cw"
              class="size-3"
              :class="{ 'animate-spin': isLoading }"
            />
          </button>
        </div>
      </div>

      <VMap
        :key="mapStyle"
        :options="mapOptions"
        class="size-full"
        @loaded="handleMapLoad"
      >
        <VLayerDeckglWindParticle
          v-if="windData.length > 0"
          id="wind-particles"
          :wind-data="windData"
          :num-particles="numParticles"
          :max-age="maxAge"
          :speed-factor="speedFactor"
          :color-ramp="colorRamp"
          :speed-range="speedRange"
          :width="lineWidth"
          @loaded="handleWindLoaded"
          @error="handleWindError"
        />
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
      </VMap>
    </ClientOnly>
  </div>
</template>
