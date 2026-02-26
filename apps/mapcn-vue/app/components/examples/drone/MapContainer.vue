<script setup lang="ts">
  import type { DronePosition, DroneTrip } from '~/types/drone';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  const props = defineProps<{
    tripData: DroneTrip[];
    currentTime: number;
    dronePosition: DronePosition | null;
    isLoading: boolean;
    error: string | null;
    isPlaying: boolean;
  }>();

  const mapId = useId();
  const config = useRuntimeConfig();
  const colorMode = useColorMode();
  const mapRef = ref<MaplibreMap | null>(null);

  const droneMapStyle = computed(() => {
    const key = config.public.mapsguruApiKey;
    return colorMode.value === 'dark'
      ? `https://maps.guru/api/v1/styles/standard/3d_dusk/style.json?key=${key}`
      : `https://maps.guru/api/v1/styles/standard/3d_day/style.json?key=${key}`;
  });

  const mapOptions = computed(() => ({
    container: `drone-flight-${mapId}`,
    style: droneMapStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 13,
    pitch: 50,
    bearing: -20,
  }));

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
  }

  // Track map bearing so Layers can compute correct screen-space icon angle.
  // jumpTo({ bearing: pos.bearing }) keeps map bearing ≈ drone bearing while playing.
  const mapBearing = computed(() =>
    props.isPlaying && props.dronePosition
      ? props.dronePosition.bearing
      : (mapRef.value?.getBearing() ?? 0),
  );

  watch(
    () => props.dronePosition,
    (pos) => {
      if (pos && mapRef.value && props.isPlaying) {
        mapRef.value.jumpTo({
          center: [pos.lng, pos.lat],
          bearing: pos.bearing,
          pitch: 50,
          zoom: 14,
        });
      }
    },
    { flush: 'post' },
  );
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 flex items-center justify-center bg-muted"
      >
        <div class="flex items-center gap-2 text-muted-foreground">
          <Icon name="lucide:loader-2" class="size-5 animate-spin" />
          <span>Loading flight path...</span>
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

      <VMap
        :key="droneMapStyle"
        :options="mapOptions"
        class="size-full"
        @loaded="handleMapLoad"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <ExamplesDroneLayers
          :trip-data="tripData"
          :current-time="currentTime"
          :drone-position="dronePosition"
          :map-bearing="mapBearing"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
