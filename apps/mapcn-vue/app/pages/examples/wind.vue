<script setup lang="ts">
  import type { Map } from 'maplibre-gl';

  usePageGeo({
    title: 'Wind Animation - mapcn-vue Examples',
    description:
      'Real-time wind particle visualization using live data from OpenWeatherMap.',
  });

  defineOgImage('SiteDoc', {
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

  // Defaults for the wind particle controls. The control panel exposes them as
  // `number[]` models (shadcn-vue Slider emits an array), so the page reads
  // index 0 — with an explicit fallback so the map layer always receives a
  // number even if the model is momentarily empty.
  const DEFAULT_NUM_PARTICLES = 8192;
  const DEFAULT_MAX_AGE = 30;
  const DEFAULT_SPEED_FACTOR = 50;
  const DEFAULT_LINE_WIDTH = 1.5;

  const numParticles = ref([DEFAULT_NUM_PARTICLES]);
  const maxAge = ref([DEFAULT_MAX_AGE]);
  const speedFactor = ref([DEFAULT_SPEED_FACTOR]);
  const lineWidth = ref([DEFAULT_LINE_WIDTH]);
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
                import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                import { VLayerWindParticle } from '@geoql/v-maplibre/wind';
                import type { WindDataPoint, ColorStop } from '@geoql/v-maplibre/wind';
                import { createWindDataFromOpenWeatherMap } from 'maplibre-gl-wind';

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
                  <VLayerWindParticle
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
        :num-particles="numParticles[0] ?? DEFAULT_NUM_PARTICLES"
        :max-age="maxAge[0] ?? DEFAULT_MAX_AGE"
        :speed-factor="speedFactor[0] ?? DEFAULT_SPEED_FACTOR"
        :line-width="lineWidth[0] ?? DEFAULT_LINE_WIDTH"
        :speed-range="speedRange"
        class="size-full"
        @load="handleMapLoad"
        @refresh="fetchWindData"
        @wind-loaded="handleWindLoaded"
        @wind-error="handleWindError"
      />

      <MapPanel title="Wind">
        <ExamplesWindControlPanel
          v-model:num-particles="numParticles"
          v-model:max-age="maxAge"
          v-model:speed-factor="speedFactor"
          v-model:line-width="lineWidth"
          :data-point-count="windData.length"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
