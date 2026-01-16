<script setup lang="ts">
  import type { Map } from 'maplibre-gl';

  useSeoMeta({
    title: 'Wind Animation - mapcn-vue Examples',
    description:
      'Real-time wind particle visualization using live data from OpenWeatherMap.',
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
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Wind Animation</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Real-time wind particle visualization using live data from
          OpenWeatherMap API. Particles flow based on actual wind speed and
          direction.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-3">
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
          @load="handleMapLoad"
          @refresh="fetchWindData"
          @wind-loaded="handleWindLoaded"
          @wind-error="handleWindError"
        />

        <ExamplesWindControlPanel
          v-model:num-particles="numParticles"
          v-model:max-age="maxAge"
          v-model:speed-factor="speedFactor"
          v-model:line-width="lineWidth"
          :data-point-count="windData.length"
        />
      </div>

      <div class="mt-8">
        <CodeBlock
          :code="codeExample"
          lang="vue"
          filename="WindAnimation.vue"
        />
      </div>
    </div>
  </div>
</template>
