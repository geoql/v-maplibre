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
                      position="bottom-left"
                      :interactive="false"
                    />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="Interpolate Heatmap"
    description="Real-time global temperature visualization using IDW (Inverse Distance Weighting) interpolation with live data from OpenWeatherMap."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <ExamplesInterpolateHeatmapMapContainer
      :is-loading="isLoading"
      :error="error"
      @loaded="onMapLoaded"
    />
  </ComponentDemo>
</template>
