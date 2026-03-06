<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Drone Flight - mapcn-vue Examples',
    description:
      'Cinematic drone flight animation along a GeoJSON path with animated trail and camera follow.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Drone Flight',
    description: 'Cinematic drone flight animation along a GeoJSON path.',
    category: 'Examples',
  });

  const {
    tripData,
    currentTime,
    dronePosition,
    isPlaying,
    speed,
    progress,
    isLoading,
    error,
    flightPath,
    flightStats,
    loadGeoJSON,
    loadFromFile,
    play,
    pause,
    resetAnimation,
    setSpeed,
    cleanup,
  } = useDroneAnimation();

  const panelOpen = ref(true);

  const hasFlightPath = computed(() => flightPath.value !== null);

  onMounted(() => {
    loadGeoJSON('/sample-drone-path.geojson');
  });

  onUnmounted(() => {
    cleanup();
  });

  function handleUploadFile(file: File): void {
    loadFromFile(file);
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                  import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                  import { MapboxOverlay } from '@deck.gl/mapbox';
                  import { TripsLayer } from '@deck.gl/geo-layers';
                  import { IconLayer } from '@deck.gl/layers';

                  const tripData = ref([]);
                  const currentTime = ref(0);
                  ${SCRIPT_END}
                  <VMap :options="mapOptions" class="h-125 w-full">
                    <VControlNavigation position="top-right" />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="Drone Flight"
    description="Cinematic drone flight animation along a GeoJSON path. Animated trail via deck.gl TripsLayer with camera follow and bearing-rotated drone marker."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesDroneMapContainer
        :trip-data="tripData"
        :current-time="currentTime"
        :drone-position="dronePosition"
        :is-loading="isLoading"
        :error="error"
        :is-playing="isPlaying"
        class="size-full"
      />

      <!-- Flight stats overlay -->
      <div
        v-if="hasFlightPath"
        class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
      >
        <ExamplesDroneFlightStats :stats="flightStats" />
      </div>

      <!-- Toggle button -->
      <button
        class="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-lg border border-border/50 bg-background/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
        :class="{
          'bg-primary text-primary-foreground hover:bg-primary/90': !panelOpen,
        }"
        @click="panelOpen = !panelOpen"
      >
        <Icon
          :name="
            panelOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'
          "
          class="size-4"
        />
      </button>

      <!-- Controls overlay -->
      <AnimatePresence>
        <motion.div
          v-if="panelOpen"
          :initial="{ opacity: 0, x: -20, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: -20, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
          class="absolute top-16 left-4 z-10 w-64 max-h-[calc(100%-5rem)] overflow-auto rounded-xl bg-background/95 shadow-lg backdrop-blur-sm"
        >
          <ExamplesDroneControlPanel
            :is-playing="isPlaying"
            :speed="speed"
            :progress="progress"
            :has-flight-path="hasFlightPath"
            @play="play"
            @pause="pause"
            @reset="resetAnimation"
            @set-speed="setSpeed"
            @upload-file="handleUploadFile"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
