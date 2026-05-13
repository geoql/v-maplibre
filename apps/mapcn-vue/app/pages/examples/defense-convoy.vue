<script setup lang="ts">
  useSeoMeta({
    title: 'Logistics Convoy Tracker - mapcn-vue Examples',
    description:
      'Military supply convoy tracking with animated routes, checkpoints, and ETA across the Rajasthan corridor.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Logistics Convoy Tracker',
    description:
      'Track 3 military convoys moving along supply routes in Rajasthan with real-time checkpoints and ETA.',
    category: 'Examples',
  });

  const {
    convoys,
    routes,
    positions,
    activeCheckpoints,
    loopedTime,
    isPlaying,
    isLoading,
    speed,
    selectedConvoyId,
    selectedDetails,
    play,
    pause,
    resetAnimation,
    setSpeed,
    selectConvoy,
    cleanup,
  } = useConvoyTracker();
  function handleSelectConvoy(convoyId: string): void {
    selectConvoy(selectedConvoyId.value === convoyId ? null : convoyId);
  }

  watch(isLoading, (loading) => {
    if (!loading) play();
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
    <VMap :options="{ style: mapStyle, center: [72.0, 26.3], zoom: 8 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Logistics Convoy Tracker"
    description="Military supply convoy tracking across the Jodhpur–Jaisalmer–Barmer corridor in Rajasthan. Animated trails via deck.gl TripsLayer with checkpoint status and ETA."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesConvoyMapContainer
        :convoys="convoys"
        :routes="routes"
        :positions="positions"
        :active-checkpoints="activeCheckpoints"
        :looped-time="loopedTime"
        :selected-convoy-id="selectedConvoyId"
        class="size-full"
      />

      <div
        v-if="selectedDetails"
        class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
      >
        <ExamplesConvoyStatusPanel :details="selectedDetails" />
      </div>

      <MapPanel title="Convoy">
        <ExamplesConvoyControlPanel
          :convoys="convoys"
          :is-playing="isPlaying"
          :speed="speed"
          :selected-convoy-id="selectedConvoyId"
          @play="play"
          @pause="pause"
          @reset="resetAnimation"
          @set-speed="setSpeed"
          @select-convoy="handleSelectConvoy"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
