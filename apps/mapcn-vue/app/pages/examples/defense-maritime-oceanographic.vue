<script setup lang="ts">
  usePageGeo({
    title: 'Sea-Surface Temperature + Surface Currents - mapcn-vue Examples',
    description:
      'Oceanographic situational awareness for the Arabian Sea: procedural sea-surface temperature field and animated surface current vectors via deck.gl TripsLayer.',
  });

  defineOgImage('SiteDoc', {
    title: 'Sea-Surface Temperature + Surface Currents',
    description:
      'Oceanographic visualization of Arabian Sea SST and surface currents with animated current streamlines.',
    category: 'Examples',
  });

  const {
    oceanGrid,
    currentSamples,
    streamlineTrips,
    showSst,
    showCurrents,
    sstOpacity,
    currentDensity,
    currentSpeed,
    stats,
    isPlaying,
    loopedTime,
    play,
    pause,
    reset,
    cleanup,
  } = useMaritimeOcean();

  onMounted(() => {
    play();
  });

  onUnmounted(() => {
    cleanup();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap } from '@geoql/v-maplibre';

  const colorMode = useColorMode();
  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  );
  ${SCRIPT_END}

  <template>
    <VMap :options="{ style: mapStyle, center: [69, 14], zoom: 5 }">
      <!-- SST + Current layers via useMaritimeOcean composable -->
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Sea-Surface Temperature + Surface Currents"
    description="Oceanographic situational layer over the Arabian Sea: procedural SST field (22–32°C) with a thermal color ramp and animated surface current streamlines derived from a monsoon/gyre streamfunction. deck.gl ScatterplotLayer (SST) + TripsLayer (currents)."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesOceanMapContainer
        :ocean-grid="oceanGrid"
        :current-samples="currentSamples"
        :streamline-trips="streamlineTrips"
        :show-sst="showSst"
        :show-currents="showCurrents"
        :sst-opacity="sstOpacity"
        :looped-time="loopedTime"
        class="size-full"
      />

      <MapPanel title="Ocean">
        <ExamplesOceanControlPanel
          :show-sst="showSst"
          :show-currents="showCurrents"
          :sst-opacity="sstOpacity"
          :current-density="currentDensity"
          :current-speed="currentSpeed"
          :is-playing="isPlaying"
          :stats="stats"
          @update:showSst="showSst = $event"
          @update:showCurrents="showCurrents = $event"
          @update:sstOpacity="sstOpacity = $event"
          @update:currentDensity="currentDensity = $event"
          @update:currentSpeed="currentSpeed = $event"
          @play="play"
          @pause="pause"
          @reset="reset"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
