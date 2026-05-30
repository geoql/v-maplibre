<script setup lang="ts">
  import type { VesselType } from '~/types/maritime-ais';

  usePageGeo({
    title: 'Global AIS + Dark Fleet Detection - mapcn-vue Examples',
    description:
      'Worldwide vessel tracking on a globe view with AIS-gap detection highlighting dark ships operating outside normal maritime communication channels.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Global AIS + Dark Fleet Detection',
    description:
      'Worldwide vessel tracking with AIS-gap anomaly detection identifying dark vessels across major shipping lanes.',
    category: 'Examples',
  });

  const {
    vessels,
    positions,
    tripData,
    loopedTime,
    activeVesselTypes,
    highlightDarkOnly,
    stats,
    isPlaying,
    speed,
    toggleVesselType,
    play,
    pause,
    reset,
    cleanup,
  } = useMaritimeAis();

  function handleToggleVesselType(type: VesselType): void {
    toggleVesselType(type);
  }

  function handleSetSpeed(s: number): void {
    speed.value = s;
  }

  function handleToggleDarkOnly(): void {
    highlightDarkOnly.value = !highlightDarkOnly.value;
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
    <VMap :options="{ style: mapStyle, center: [20, 25], zoom: 1.6, projection: { type: 'globe' } }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Global AIS + Dark Fleet Detection"
    description="World-scale vessel tracking across 10 major shipping lanes on a globe projection. Vessels move in real time; dark-fleet anomalies are identified via AIS signal gaps and highlighted with a red ring overlay."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesAisGlobeMapContainer
        :vessels="vessels"
        :positions="positions"
        :trip-data="tripData"
        :looped-time="isPlaying ? loopedTime : 0"
        class="size-full"
      />

      <MapPanel title="AIS / Globe">
        <ExamplesAisGlobeControlPanel
          :active-vessel-types="activeVesselTypes"
          :highlight-dark-only="highlightDarkOnly"
          :is-playing="isPlaying"
          :speed="speed"
          :stats="stats"
          @play="play"
          @pause="pause"
          @reset="reset"
          @set-speed="handleSetSpeed"
          @toggle-vessel-type="handleToggleVesselType"
          @toggle-dark-only="handleToggleDarkOnly"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
