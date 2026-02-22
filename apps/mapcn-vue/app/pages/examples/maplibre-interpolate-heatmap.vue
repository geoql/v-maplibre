<script setup lang="ts">
  useSeoMeta({
    title: 'Interpolate Heatmap - mapcn-vue Examples',
    description:
      'IDW interpolated heatmap showing real-time temperature data from OpenWeatherMap.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Interpolate Heatmap',
    description:
      'IDW interpolated heatmap showing real-time temperature data from OpenWeatherMap.',
    category: 'MapLibre',
  });

  const { isLoading, error, onMapLoaded } = useInterpolateHeatmap();

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VControlNavigation, VControlLegend } from '@geoql/v-maplibre';
  import { MaplibreInterpolateHeatmapLayer } from 'maplibre-gl-interpolate-heatmap';
  import type { Map } from 'maplibre-gl';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [0, 20],
  zoom: 1.5,
  };

  // Temperature gradient legend
  const temperatureLegend = {
  min: -30,
  max: 40,
  colors: ['#00008B', '#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000'],
  stops: [-30, -10, 5, 15, 25, 40],
  minLabel: '-30°C',
  maxLabel: '40°C',
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
    <VControlLegend
      :layer-ids="['temperature']"
      type="gradient"
      :items="[temperatureLegend]"
      title="Temperature"
      position="top-left"
      :interactive="false"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Interpolate Heatmap
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Real-time global temperature visualization using IDW (Inverse Distance
          Weighting) interpolation with live data from OpenWeatherMap.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <ExamplesInterpolateHeatmapMapContainer
          :is-loading="isLoading"
          :error="error"
          @loaded="onMapLoaded"
        />
      </ComponentDemo>

      <ExamplesInterpolateHeatmapInfoCards />

      <div class="mt-8 rounded-lg border bg-muted/30 p-6">
        <h3 class="mb-3 text-lg font-semibold">About This Example</h3>
        <p class="mb-4 text-muted-foreground">
          This example uses
          <a
            href="https://github.com/nicholasyager/maplibre-gl-interpolate-heatmap"
            target="_blank"
            class="text-primary hover:underline"
          >
            maplibre-interpolate-heatmap
          </a>
          to render an IDW (Inverse Distance Weighting) interpolated heatmap of
          real-time global temperature data from the OpenWeatherMap API.
        </p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>MaplibreInterpolateHeatmapLayer</strong> - WebGL-based IDW
              interpolation rendered directly on the map
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>VControlLegend</strong> - Gradient legend with temperature
              color scale (-30°C to 40°C)
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Live temperature data from 100 global grid points via
              OpenWeatherMap
            </span>
          </li>
        </ul>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
