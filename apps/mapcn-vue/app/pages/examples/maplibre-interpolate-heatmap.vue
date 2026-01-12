<script setup lang="ts">
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';
  import { MaplibreInterpolateHeatmapLayer } from 'maplibre-gl-interpolate-heatmap';
  import type { Map, CustomLayerInterface } from 'maplibre-gl';

  useSeoMeta({
    title: 'Interpolate Heatmap - mapcn-vue Examples',
    description:
      'IDW interpolated heatmap showing real-time temperature data from OpenWeatherMap.',
  });

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `interpolate-heatmap-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 20] as [number, number],
    zoom: 1.5,
    touchPitch: false,
    pitchWithRotate: false,
    renderWorldCopies: false,
  }));

  const isLoading = ref(true);
  const error = ref<string | null>(null);

  interface WeatherPoint {
    lat: number;
    lon: number;
    val: number;
  }

  // Generate grid of points across the world
  const generatePoints = (): WeatherPoint[] => {
    const startingLatitude = -80;
    const startingLongitude = -180;
    const endingLatitude = 80;
    const endingLongitude = 180;
    const n = 10; // 10x10 grid = 100 points
    const points: WeatherPoint[] = [];

    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        points.push({
          lat: startingLatitude + (i * (endingLatitude - startingLatitude)) / n,
          lon:
            startingLongitude + (j * (endingLongitude - startingLongitude)) / n,
          val: 0,
        });
      }
    }
    return points;
  };

  const onMapLoaded = async (map: Map) => {
    try {
      const points = generatePoints();

      // Fetch real temperature data from OpenWeatherMap
      const baseUrl =
        'https://api.openweathermap.org/data/2.5/weather?units=metric';
      const apiKey = '385df3d81f3a89c1c99c115735540c6d';

      const urls = points.map(
        ({ lat, lon }) => `${baseUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`,
      );

      const weathers = await Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url);
          return response.json();
        }),
      );

      points.forEach((point, index) => {
        const weather = weathers.at(index);
        point.val = weather?.main?.temp ?? 0;
      });

      const layer = new MaplibreInterpolateHeatmapLayer({
        id: 'interpolate-temperature',
        data: points,
      });

      // Cast required due to MapLibre v5 render signature changes
      map.addLayer(layer as unknown as CustomLayerInterface);
      isLoading.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load data';
      isLoading.value = false;
    }
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VControlNavigation } from '@geoql/v-maplibre';
import { MaplibreInterpolateHeatmapLayer } from 'maplibre-gl-interpolate-heatmap';
import type { Map } from 'maplibre-gl';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [0, 20],
  zoom: 1.5,
};

// Generate grid of points
const generatePoints = () => {
  const points = [];
  const n = 10; // 10x10 grid
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      points.push({
        lat: -80 + (i * 160) / n,
        lon: -180 + (j * 360) / n,
        val: 0,
      });
    }
  }
  return points;
};

const onMapLoaded = async (map: Map) => {
  const points = generatePoints();

  // Fetch temperature from OpenWeatherMap
  const baseUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric';
  const apiKey = 'YOUR_API_KEY';

  const weathers = await Promise.all(
    points.map(({ lat, lon }) =>
      fetch(\`\${baseUrl}&lat=\${lat}&lon=\${lon}&appid=\${apiKey}\`).then(r => r.json())
    )
  );

  points.forEach((point, i) => {
    point.val = weathers[i]?.main?.temp ?? 0;
  });

  const layer = new MaplibreInterpolateHeatmapLayer({
    id: 'temperature',
    data: points,
  });

  map.addLayer(layer);
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full" @loaded="onMapLoaded">
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Interpolate Heatmap
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Real-time global temperature visualization using IDW (Inverse Distance
          Weighting) interpolation with live data from OpenWeatherMap.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="relative h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <!-- Loading overlay -->
          <div
            v-if="isLoading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div class="flex flex-col items-center gap-3">
              <Icon
                name="lucide:loader-2"
                class="h-8 w-8 animate-spin text-primary"
              ></Icon>
              <span class="text-sm text-muted-foreground"
                >Loading weather data...</span
              >
            </div>
          </div>

          <!-- Error state -->
          <div
            v-if="error"
            class="absolute inset-0 z-10 flex items-center justify-center bg-background/80"
          >
            <div class="flex flex-col items-center gap-2 text-destructive">
              <Icon name="lucide:alert-circle" class="h-8 w-8"></Icon>
              <span class="text-sm">{{ error }}</span>
            </div>
          </div>

          <ClientOnly>
            <VMap
              :key="mapStyle"
              :options="mapOptions"
              class="h-full w-full"
              @loaded="onMapLoaded"
            >
              <VControlNavigation position="top-right"></VControlNavigation>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="InterpolateHeatmap.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 space-y-4">
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Live Data:</strong> This example fetches real-time
            temperature data from
            <a
              href="https://openweathermap.org/api"
              target="_blank"
              class="text-primary hover:underline"
              >OpenWeatherMap API</a
            >
            for a 10x10 grid of points across the globe (100 API calls). The IDW
            algorithm then interpolates temperatures between these points.
          </p>
        </div>
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Density vs Interpolated:</strong> MapLibre's built-in
            heatmap shows point <em>density</em> (how many points are nearby).
            This interpolated heatmap calculates the
            <em>weighted average</em> of values using Inverse Distance Weighting
            (IDW) — perfect for temperature maps, pollution levels, or any
            continuous value visualization.
          </p>
        </div>
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Library:</strong>
            <a
              href="https://github.com/geoql/maplibre-gl-interpolate-heatmap"
              target="_blank"
              class="text-primary hover:underline"
              >maplibre-gl-interpolate-heatmap</a
            >
            — A GeoQL library for rendering IDW interpolated heatmaps with WebGL
            shaders. Blue = cold, Green = mild, Red = hot.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
