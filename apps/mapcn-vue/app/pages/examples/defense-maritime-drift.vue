<script setup lang="ts">
  import type { DriftMode } from '~/types/maritime-drift';

  usePageGeo({
    title: 'SAR / Spill Drift Trajectory - mapcn-vue Examples',
    description:
      'Monte-Carlo stochastic drift modeling for search-and-rescue and oil-spill response. deck.gl-over-MapLibre with particle advection, probability cone, and animated trails.',
  });

  defineOgImage('SiteDoc', {
    title: 'SAR / Spill Drift Trajectory',
    description:
      'Stochastic drift modeling with Monte-Carlo particle advection under wind and current forces.',
    category: 'Examples',
  });

  const {
    mode,
    particleCount,
    currentSpeedKn,
    currentBearingDeg,
    windSpeedKn,
    windBearingDeg,
    durationHours,
    showHeatmap,
    isPlaying,
    currentTime,
    datumLng,
    datumLat,
    probabilityHull,
    particlePositionData,
    tripData,
    vectorData,
    stats,
    play,
    pause,
    reset,
    cleanup,
  } = useMaritimeDrift();

  function handleUpdateMode(m: DriftMode): void {
    mode.value = m;
  }

  function handleUpdateParticleCount(n: number): void {
    particleCount.value = n;
  }

  function handleUpdateCurrentSpeedKn(s: number): void {
    currentSpeedKn.value = s;
  }

  function handleUpdateCurrentBearingDeg(b: number): void {
    currentBearingDeg.value = b;
  }

  function handleUpdateWindSpeedKn(s: number): void {
    windSpeedKn.value = s;
  }

  function handleUpdateWindBearingDeg(b: number): void {
    windBearingDeg.value = b;
  }

  function handleUpdateDurationHours(h: number): void {
    durationHours.value = h;
  }

  function handleUpdateShowHeatmap(v: boolean): void {
    showHeatmap.value = v;
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
    <VMap :options="{ style: mapStyle, center: [73.5, 15.5], zoom: 7 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="SAR / Spill Drift Trajectory"
    description="Monte-Carlo stochastic drift modeling for maritime search-and-rescue (person/liferaft) or oil-spill response. Configure wind/current forces, particle count, and duration — then watch the probability cone emerge from 600-particle advection."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesDriftMapContainer
        :particle-position-data="particlePositionData"
        :trip-data="tripData"
        :probability-hull="probabilityHull"
        :vector-data="vectorData"
        :datum-lng="datumLng"
        :datum-lat="datumLat"
        :mode="mode"
        :current-time="currentTime"
        :show-heatmap="showHeatmap"
        class="size-full"
      />

      <MapPanel title="Drift">
        <ExamplesDriftControlPanel
          :mode="mode"
          :particle-count="particleCount"
          :current-speed-kn="currentSpeedKn"
          :current-bearing-deg="currentBearingDeg"
          :wind-speed-kn="windSpeedKn"
          :wind-bearing-deg="windBearingDeg"
          :duration-hours="durationHours"
          :show-heatmap="showHeatmap"
          :is-playing="isPlaying"
          :stats="stats"
          @update:mode="handleUpdateMode"
          @update:particle-count="handleUpdateParticleCount"
          @update:current-speed-kn="handleUpdateCurrentSpeedKn"
          @update:current-bearing-deg="handleUpdateCurrentBearingDeg"
          @update:wind-speed-kn="handleUpdateWindSpeedKn"
          @update:wind-bearing-deg="handleUpdateWindBearingDeg"
          @update:duration-hours="handleUpdateDurationHours"
          @update:show-heatmap="handleUpdateShowHeatmap"
          @play="play"
          @pause="pause"
          @reset="reset"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
