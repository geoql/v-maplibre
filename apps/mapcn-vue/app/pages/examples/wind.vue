<script setup lang="ts">
  import type { Map } from 'maplibre-gl';
  import { AnimatePresence, motion } from 'motion-v';

  useSeoMeta({
    title: 'Wind Animation - mapcn-vue Examples',
    description:
      'Real-time wind particle visualization using live data from OpenWeatherMap.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Wind Animation',
    description:
      'Real-time wind particle visualization using live data from OpenWeatherMap.',
    category: 'Examples',
  });

  const {
    isLoading,
    error,
    windData,
    lastUpdated,
    colorRamp,
    fetchWindData,
    startAutoRefresh,
    stopAutoRefresh,
    handleWindLoaded,
    handleWindError,
  } = useWindData();

  const numParticles = ref([8192]);
  const maxAge = ref([30]);
  const speedFactor = ref([50]);
  const lineWidth = ref([1.5]);
  const speedRange = ref<[number, number]>([0, 30]);
  const panelOpen = ref(true);

  async function handleMapLoad(_map: Map): Promise<void> {
    await fetchWindData();
  }

  onMounted(() => {
    startAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { ref, onMounted } from 'vue';
  import {
  VMap,
  VControlNavigation,
  VLayerDeckglWindParticle,
  createWindDataFromOpenWeatherMap,
  } from '@geoql/v-maplibre';
  import type { WindDataPoint, ColorStop } from '@geoql/v-maplibre';

  const windData = ref<WindDataPoint[]>([]);

  const colorRamp: ColorStop[] = [
  [0.0, [59, 130, 189, 255]],
  [0.2, [171, 221, 164, 255]],
  [0.4, [254, 224, 139, 255]],
  [0.6, [244, 109, 67, 255]],
  [1.0, [213, 62, 79, 255]],
  ];

  const generateGridPoints = () => {
  const points = [];
  for (let lat = -60; lat <= 60; lat += 20) {
    for (let lon = -180; lon < 180; lon += 30) {
      points.push({ lat, lon });
    }
  }
  return points;
  };

  const fetchWindData = async () => {
  const gridPoints = generateGridPoints();
  const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';

  const responses = await Promise.all(
    gridPoints.map(({ lat, lon }) =>
      fetch(\`https://api.openweathermap.org/data/2.5/weather?lat=\${lat}&lon=\${lon}&appid=\${apiKey}\`)
        .then(r => r.json())
    )
  );

  windData.value = createWindDataFromOpenWeatherMap(responses);
  };

  onMounted(() => {
  fetchWindData();
  setInterval(fetchWindData, 60 * 60 * 1000);
  });
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VLayerDeckglWindParticle
      v-if="windData.length > 0"
      id="wind-particles"
      :wind-data="windData"
      :num-particles="8192"
      :max-age="30"
      :speed-factor="50"
      :color-ramp="colorRamp"
      :speed-range="[0, 30]"
    />
    <VControlNavigation position="top-right" />
  </VMap>
</template>`;
</script>

<template>
  <ComponentDemo
    title="Wind Animation"
    description="Real-time wind particle visualization using live data from OpenWeatherMap API. Particles flow based on actual wind speed and direction."
    :code="codeExample"
    registry="map-deckgl-wind"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesWindMapContainer
        :wind-data="windData"
        :is-loading="isLoading"
        :error="error"
        :last-updated="lastUpdated"
        :color-ramp="colorRamp"
        :num-particles="numParticles[0]"
        :max-age="maxAge[0]"
        :speed-factor="speedFactor[0]"
        :line-width="lineWidth[0]"
        :speed-range="speedRange"
        class="size-full"
        @load="handleMapLoad"
        @refresh="fetchWindData"
        @wind-loaded="handleWindLoaded"
        @wind-error="handleWindError"
      />

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
          <ExamplesWindControlPanel
            v-model:num-particles="numParticles"
            v-model:max-age="maxAge"
            v-model:speed-factor="speedFactor"
            v-model:line-width="lineWidth"
            :data-point-count="windData.length"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </ComponentDemo>
</template>
