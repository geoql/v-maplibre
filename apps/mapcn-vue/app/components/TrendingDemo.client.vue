<script setup lang="ts">
  import { VMap, VLayerDeckglHexagon } from '@geoql/v-maplibre';

  const colorMode = useColorMode();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  // San Francisco area - trending data points
  const mapOptions = computed(() => ({
    container: 'trending-map',
    style: mapStyle.value,
    center: [-122.4194, 37.7749] as [number, number],
    zoom: 11,
    pitch: 45,
    attributionControl: false,
    interactive: false,
  }));

  // Generate clustered points for hexagon visualization
  const generatePoints = () => {
    const points = [];
    const hotspots = [
      { center: [-122.4194, 37.7749], count: 200, spread: 0.02 }, // Downtown
      { center: [-122.4089, 37.7855], count: 150, spread: 0.015 }, // Chinatown
      { center: [-122.4324, 37.7654], count: 120, spread: 0.018 }, // Castro
      { center: [-122.3894, 37.7694], count: 100, spread: 0.012 }, // SoMa
      { center: [-122.4474, 37.7599], count: 80, spread: 0.015 }, // Sunset
    ];

    for (const hotspot of hotspots) {
      for (let i = 0; i < hotspot.count; i++) {
        points.push({
          coordinates: [
            hotspot.center[0] + (Math.random() - 0.5) * hotspot.spread * 2,
            hotspot.center[1] + (Math.random() - 0.5) * hotspot.spread * 2,
          ],
          value: Math.random() * 100,
        });
      }
    }
    return points;
  };

  const trendingData = generatePoints();

  const colorRange: [number, number, number][] = [
    [255, 255, 178],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [240, 59, 32],
    [189, 0, 38],
  ];
</script>

<template>
  <div class="h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <VLayerDeckglHexagon
        id="trending-hexagon"
        :data="trendingData"
        :get-position="(d: (typeof trendingData)[0]) => d.coordinates"
        :radius="200"
        :elevation-scale="50"
        :extruded="true"
        :coverage="0.8"
        :color-range="colorRange"
        :get-elevation-weight="(d: (typeof trendingData)[0]) => d.value"
        :get-color-weight="(d: (typeof trendingData)[0]) => d.value"
        :elevation-aggregation="'SUM'"
        :color-aggregation="'SUM'"
      />
    </VMap>
  </div>
</template>

<style scoped>
  #trending-map {
    width: 100%;
    height: 100%;
  }
</style>
