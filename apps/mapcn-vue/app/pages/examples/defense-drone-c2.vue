<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { GeofenceDrawMode } from '~/types/defense-drone-c2';

  useSeoMeta({
    title: 'Multi-Drone C2 Dashboard - mapcn-vue Examples',
    description:
      'Command & Control dashboard with multiple drones and UGVs tracked on a 3D map in real-time.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Multi-Drone C2 Dashboard',
    description:
      'Real-time command & control for 4 UAVs + 2 UGVs over the Thar Desert.',
    category: 'Examples',
  });

  const {
    units,
    patrolPaths,
    waypoints,
    tripData,
    loopedTime,
    isPlaying,
    speed,
    selectedUnitId,
    selectedUnit,
    positions,
    telemetry,
    play,
    pause,
    resetAnimation,
    setSpeed,
    selectUnit,
    cleanup: cleanupDrone,
  } = useDroneC2();

  const {
    geofence,
    drawMode,
    initDraw,
    setDrawMode,
    clearGeofence,
    checkBreaches,
    cleanup: cleanupGeofence,
  } = useGeofence();
  const selectedTelemetry = computed(() => {
    if (!selectedUnitId.value) return null;
    return telemetry.value[selectedUnitId.value] ?? null;
  });

  const breaches = computed(() => checkBreaches(positions.value, units.value));

  const breachCount = computed(() => breaches.value.length);

  function handleMapLoaded(map: MaplibreMap): void {
    map.once('style.load', () => {
      initDraw(map);
    });
    if (map.isStyleLoaded()) {
      initDraw(map);
    }
  }

  function handleSetGeofenceMode(mode: GeofenceDrawMode): void {
    setDrawMode(mode);
  }

  function handleClearGeofence(): void {
    clearGeofence();
  }

  onMounted(() => {
    play();
  });

  onUnmounted(() => {
    cleanupGeofence();
    cleanupDrone();
  });

  function handleSelectUnit(unitId: string): void {
    selectUnit(selectedUnitId.value === unitId ? null : unitId);
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';

  const colorMode = useColorMode();
  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  );
  ${SCRIPT_END}

  <template>
    <VMap :options="{ style: mapStyle, center: [70.5, 26.8], zoom: 11, pitch: 45 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Multi-Drone C2 Dashboard"
    description="Command & Control dashboard tracking 4 UAVs and 2 UGVs patrolling the Thar Desert, Rajasthan. Real-time animated trails via deck.gl TripsLayer with unit selection and telemetry readout."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesDroneC2MapContainer
        :units="units"
        :patrol-paths="patrolPaths"
        :positions="positions"
        :waypoints="waypoints"
        :looped-time="loopedTime"
        :selected-unit-id="selectedUnitId"
        :is-playing="isPlaying"
        class="size-full"
        @map-loaded="handleMapLoaded"
      />

      <div class="absolute top-4 right-4 z-10 mt-40 md:mt-24">
        <ExamplesDroneC2GeofenceToolbar
          :draw-mode="drawMode"
          :breach-count="breachCount"
          @set-mode="handleSetGeofenceMode"
          @clear="handleClearGeofence"
        />
      </div>

      <div
        v-if="breaches.length > 0"
        class="absolute bottom-16 left-1/2 z-10 -translate-x-1/2"
      >
        <div
          class="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive backdrop-blur-sm"
        >
          <Icon name="lucide:shield-alert" class="size-4 shrink-0" />
          <span>
            Geofence breach:
            {{ breaches.map((b) => b.callsign).join(', ') }}
          </span>
        </div>
      </div>

      <div
        v-if="selectedUnit && selectedTelemetry"
        class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
      >
        <ExamplesDroneC2TelemetryPanel
          :unit="selectedUnit"
          :telemetry="selectedTelemetry"
        />
      </div>

      <MapPanel title="Drone C2">
        <ExamplesDroneC2ControlPanel
          :units="units"
          :is-playing="isPlaying"
          :speed="speed"
          :selected-unit-id="selectedUnitId"
          @play="play"
          @pause="pause"
          @reset="resetAnimation"
          @set-speed="setSpeed"
          @select-unit="handleSelectUnit"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
