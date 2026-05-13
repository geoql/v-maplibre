<script setup lang="ts">
  useSeoMeta({
    title: 'Search & Rescue Grid - mapcn-vue Examples',
    description:
      'SAR grid overlay with probability heat mapping, helicopter sweep paths, and sector tracking for disaster response.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Search & Rescue Grid',
    description:
      'SAR grid with probability zones, animated helicopter sweeps, and sector tracking near Uttarakhand.',
    category: 'Examples',
  });

  const {
    sectors,
    helicopters,
    positions,
    tripData,
    loopedTime,
    isPlaying,
    speed,
    stats,
    markSearched,
    play,
    pause,
    reset,
    cleanup,
  } = useSarGrid();
  function handleSectorClick(sectorId: string): void {
    markSearched(sectorId);
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
    <VMap :options="{ style: mapStyle, center: [79.5, 30.5], zoom: 11 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Search & Rescue Grid"
    description="SAR grid overlay dividing the search area near Uttarakhand into 24 sectors with probability heat coloring. Two helicopters sweep sectors in boustrophedon patterns, auto-marking areas as searched. Click any sector to toggle its status."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesSarMapContainer
        :sectors="sectors"
        :helicopters="helicopters"
        :positions="positions"
        :trip-data="tripData"
        :looped-time="loopedTime"
        class="size-full"
        @sector-click="handleSectorClick"
      />

      <MapPanel title="SAR">
        <ExamplesSarControlPanel
          :is-playing="isPlaying"
          :speed="speed"
          :stats="stats"
          @play="play"
          @pause="pause"
          @reset="reset"
          @set-speed="(s: number) => (speed = s)"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
