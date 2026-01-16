<script setup lang="ts">
  useSeoMeta({
    title: 'Interpolate Heatmap - mapcn-vue Examples',
    description:
      'IDW interpolated heatmap showing real-time temperature data from OpenWeatherMap.',
  });

  const { isLoading, error, onMapLoaded } = useInterpolateHeatmap();

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

const generatePoints = () => {
  const points = [];
  const n = 10;
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Interpolate Heatmap
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Real-time global temperature visualization using IDW (Inverse Distance
          Weighting) interpolation with live data from OpenWeatherMap.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <ExamplesInterpolateHeatmapMapContainer
          :is-loading="isLoading"
          :error="error"
          @loaded="onMapLoaded"
        />

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="InterpolateHeatmap.vue"
          />
        </div>
      </div>

      <ExamplesInterpolateHeatmapInfoCards />
    </div>
  </div>
</template>
