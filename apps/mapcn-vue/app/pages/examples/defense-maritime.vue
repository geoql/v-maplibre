<script setup lang="ts">
  import type { ShipType } from '~/types/defense-maritime';

  useSeoMeta({
    title: 'Maritime Domain Awareness - mapcn-vue Examples',
    description:
      'Indian Navy coastal surveillance with ship tracking, EEZ boundary, and coastal radar coverage.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Maritime Domain Awareness',
    description:
      "Ship tracking, EEZ monitoring, and coastal radar coverage along India's western coast.",
    category: 'Examples',
  });

  const {
    ships,
    positions,
    eezBoundary,
    radars,
    radarCircles,
    tripData,
    activeShipTypes,
    stats,
    loopedTime,
    isPlaying,
    speed,
    toggleShipType,
    play,
    pause,
    reset,
    cleanup,
  } = useMaritime();
  function handleToggleShipType(type: ShipType): void {
    toggleShipType(type);
  }

  function handleSetSpeed(s: number): void {
    speed.value = s;
  }

  onMounted(() => {
    play();
  });

  onUnmounted(() => {
    cleanup();
  });

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
    <VMap :options="{ style: mapStyle, center: [73.5, 14.5], zoom: 6 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Maritime Domain Awareness"
    description="Indian Navy western coast surveillance tracking 6 ships across EEZ boundary with coastal radar coverage. Animated ship movement via deck.gl TripsLayer with type filtering and situational stats."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesMaritimeMapContainer
        :ships="ships"
        :positions="positions"
        :eez-boundary="eezBoundary"
        :radars="radars"
        :radar-circles="radarCircles"
        :trip-data="tripData"
        :looped-time="loopedTime"
        class="size-full"
      />

      <MapPanel title="Maritime">
        <ExamplesMaritimeControlPanel
          :active-ship-types="activeShipTypes"
          :is-playing="isPlaying"
          :speed="speed"
          :stats="stats"
          @play="play"
          @pause="pause"
          @reset="reset"
          @set-speed="handleSetSpeed"
          @toggle-ship-type="handleToggleShipType"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
