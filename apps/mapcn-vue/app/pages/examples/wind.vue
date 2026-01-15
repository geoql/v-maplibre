<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import {
    VMap,
    VControlNavigation,
    VLayerDeckglWindParticle,
    createWindDataFromOpenWeatherMap,
  } from '@geoql/v-maplibre';
  import type { WindDataPoint, ColorStop } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';
  import { Slider } from '~/components/ui/slider';
  import { Label } from '~/components/ui/label';

  useSeoMeta({
    title: 'Wind Animation - mapcn-vue Examples',
    description:
      'Real-time wind particle visualization using live data from OpenWeatherMap.',
  });

  const colorMode = useColorMode();
  const mapId = useId();
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const windData = ref<WindDataPoint[]>([]);
  const lastUpdated = ref<Date | null>(null);
  const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null);

  const numParticles = ref([8192]);
  const maxAge = ref([30]);
  const speedFactor = ref([50]);
  const lineWidth = ref([1.5]);
  const speedRange = ref<[number, number]>([0, 30]);

  const colorRamp: ColorStop[] = [
    [0.0, [59, 130, 189, 255]],
    [0.1, [102, 194, 165, 255]],
    [0.2, [171, 221, 164, 255]],
    [0.3, [230, 245, 152, 255]],
    [0.4, [254, 224, 139, 255]],
    [0.5, [253, 174, 97, 255]],
    [0.6, [244, 109, 67, 255]],
    [1.0, [213, 62, 79, 255]],
  ];

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `wind-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
    minZoom: 0,
  }));

  const generateGridPoints = () => {
    const points: Array<{ lat: number; lon: number }> = [];
    const latStep = 20;
    const lonStep = 30;

    for (let lat = -60; lat <= 60; lat += latStep) {
      for (let lon = -180; lon < 180; lon += lonStep) {
        points.push({ lat, lon });
      }
    }
    return points;
  };

  const fetchWindData = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const gridPoints = generateGridPoints();
      const apiKey = '385df3d81f3a89c1c99c115735540c6d';
      const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

      const responses = await Promise.all(
        gridPoints.map(async ({ lat, lon }) => {
          const url = `${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
          const response = await fetch(url);
          return response.json();
        }),
      );

      const data = createWindDataFromOpenWeatherMap(responses);
      windData.value = data;
      lastUpdated.value = new Date();
      isLoading.value = false;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch wind data';
      isLoading.value = false;
    }
  };

  const handleMapLoad = async (_map: Map) => {
    await fetchWindData();
  };

  const handleWindLoaded = () => {
    console.log('Wind layer loaded with', windData.value.length, 'data points');
  };

  const handleWindError = (err: Error) => {
    error.value = err.message;
    console.error('Wind layer error:', err);
  };

  const startAutoRefresh = () => {
    refreshInterval.value = setInterval(
      () => {
        fetchWindData();
      },
      60 * 60 * 1000,
    );
  };

  const manualRefresh = async () => {
    await fetchWindData();
  };

  onMounted(() => {
    startAutoRefresh();
  });

  onUnmounted(() => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
    }
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

// Color gradient: blue (slow) -> green -> yellow -> red (fast)
const colorRamp: ColorStop[] = [
  [0.0, [59, 130, 189, 255]],   // Blue - calm
  [0.2, [171, 221, 164, 255]], // Green - light
  [0.4, [254, 224, 139, 255]], // Yellow - moderate
  [0.6, [244, 109, 67, 255]],  // Orange - strong
  [1.0, [213, 62, 79, 255]],   // Red - severe
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
  <div class="container max-w-screen-2xl py-10 overflow-x-hidden">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4"></Icon>
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
        <div
          class="lg:col-span-2 h-125 min-w-0 overflow-hidden rounded-lg border border-border relative"
        >
          <ClientOnly>
            <div
              v-if="isLoading && windData.length === 0"
              class="absolute inset-0 flex items-center justify-center bg-muted z-10"
            >
              <div class="flex items-center gap-2 text-muted-foreground">
                <Icon
                  name="lucide:loader-2"
                  class="h-5 w-5 animate-spin"
                ></Icon>
                <span>Fetching wind data...</span>
              </div>
            </div>
            <div
              v-if="error"
              class="absolute inset-0 flex items-center justify-center bg-muted z-10"
            >
              <div class="text-center text-destructive">
                <Icon
                  name="lucide:alert-circle"
                  class="mx-auto mb-2 h-8 w-8"
                ></Icon>
                <p>{{ error }}</p>
              </div>
            </div>

            <div
              v-if="lastUpdated"
              class="absolute top-2 left-2 z-10 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm"
            >
              <div class="flex items-center gap-2">
                <span>Updated: {{ lastUpdated.toLocaleTimeString() }}</span>
                <button
                  class="hover:text-foreground"
                  title="Refresh now"
                  @click="manualRefresh"
                >
                  <Icon
                    name="lucide:refresh-cw"
                    class="h-3 w-3"
                    :class="{ 'animate-spin': isLoading }"
                  ></Icon>
                </button>
              </div>
            </div>

            <VMap
              :key="mapStyle"
              :options="mapOptions"
              class="h-full w-full"
              @loaded="handleMapLoad"
            >
              <VLayerDeckglWindParticle
                v-if="windData.length > 0"
                id="wind-particles"
                :wind-data="windData"
                :num-particles="numParticles[0]"
                :max-age="maxAge[0]"
                :speed-factor="speedFactor[0]"
                :color-ramp="colorRamp"
                :speed-range="speedRange"
                :width="lineWidth[0]"
                @loaded="handleWindLoaded"
                @error="handleWindError"
              ></VLayerDeckglWindParticle>
              <VControlNavigation position="top-right"></VControlNavigation>
            </VMap>
          </ClientOnly>
        </div>

        <div class="space-y-6">
          <div class="rounded-lg border border-border bg-card p-4">
            <h3 class="mb-4 font-semibold">Particle Controls</h3>
            <div class="space-y-6">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label>Particles</Label>
                  <span class="text-sm text-muted-foreground">{{
                    numParticles[0]?.toLocaleString()
                  }}</span>
                </div>
                <Slider
                  v-model="numParticles"
                  :min="1000"
                  :max="32768"
                  :step="1000"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label>Trail Length</Label>
                  <span class="text-sm text-muted-foreground">{{
                    maxAge[0]
                  }}</span>
                </div>
                <Slider v-model="maxAge" :min="5" :max="100" :step="5" />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label>Speed</Label>
                  <span class="text-sm text-muted-foreground">{{
                    speedFactor[0]
                  }}</span>
                </div>
                <Slider v-model="speedFactor" :min="10" :max="200" :step="10" />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label>Line Width</Label>
                  <span class="text-sm text-muted-foreground">{{
                    lineWidth[0]
                  }}</span>
                </div>
                <Slider v-model="lineWidth" :min="0.5" :max="5" :step="0.5" />
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-muted/50 p-4">
            <p class="text-sm text-muted-foreground">
              <strong>Live Data:</strong> Fetching real-time wind from
              <a
                href="https://openweathermap.org/api"
                target="_blank"
                class="text-primary hover:underline"
                >OpenWeatherMap</a
              >. Auto-refreshes every hour.
            </p>
          </div>

          <div class="rounded-lg border border-border bg-muted/50 p-4">
            <p class="text-sm text-muted-foreground">
              <strong>Data Points:</strong>
              {{ windData.length }} locations sampled globally
            </p>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <CodeBlock
          :code="codeExample"
          lang="vue"
          filename="WindAnimation.vue"
        ></CodeBlock>
      </div>
    </div>
  </div>
</template>
