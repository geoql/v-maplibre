<script setup lang="ts">
  usePageGeo({
    title: 'Chokepoint Density & STS Detection - mapcn-vue Examples',
    description:
      'Maritime defense visualization for strategic chokepoint monitoring with vessel-density heatmaps and ship-to-ship transfer detection.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Chokepoint Density & STS Detection',
    description:
      'deck.gl-over-MapLibre visualization for maritime defense: vessel-density hotspots and STS transfer detection at global chokepoints.',
    category: 'Examples',
  });

  const {
    chokepoints,
    selectedChokepoint,
    selectedChokepointId,
    vesselPositions,
    stsEventData,
    lanePath,
    showSts,
    hexagonRadius,
    elevationScale,
    isPlaying,
    loopedTime,
    stats,
    selectChokepoint,
    play,
    pause,
    reset,
    cleanup,
  } = useMaritimeChokepoints();

  function handleSelectChokepoint(id: string): void {
    selectChokepoint(id);
  }

  function handleToggleSts(): void {
    showSts.value = !showSts.value;
  }

  function handleSetHexRadius(val: number): void {
    hexagonRadius.value = val;
  }

  function handleSetElevation(val: number): void {
    elevationScale.value = val;
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
    <VMap :options="{ style: mapStyle, center: [56.3, 26.6], zoom: 7, pitch: 45 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Chokepoint Density &amp; STS Detection"
    description="Strategic maritime chokepoint monitoring with deck.gl HexagonLayer vessel-density heatmaps and ship-to-ship (STS) transfer event detection. Four global chokepoints: Hormuz, Suez, Malacca, Bab-el-Mandeb."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesChokepointsMapContainer
        :chokepoint="selectedChokepoint"
        :vessel-positions="vesselPositions"
        :sts-event-data="stsEventData"
        :lane-path="lanePath"
        :looped-time="isPlaying ? loopedTime : 0"
        :hexagon-radius="hexagonRadius"
        :elevation-scale="elevationScale"
        :show-sts="showSts"
        class="size-full"
      />

      <MapPanel title="Maritime">
        <ExamplesChokepointsControlPanel
          :chokepoints="chokepoints"
          :selected-id="selectedChokepointId"
          :show-sts="showSts"
          :hexagon-radius="hexagonRadius"
          :elevation-scale="elevationScale"
          :is-playing="isPlaying"
          :stats="stats"
          @select-chokepoint="handleSelectChokepoint"
          @toggle-sts="handleToggleSts"
          @set-hexagon-radius="handleSetHexRadius"
          @set-elevation-scale="handleSetElevation"
          @play="play"
          @pause="pause"
          @reset="reset"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
