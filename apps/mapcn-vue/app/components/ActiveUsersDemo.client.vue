<script setup lang="ts">
  import { VMap, VLayerDeckglHeatmap } from '@geoql/v-maplibre';

  const colorMode = useColorMode();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: 'active-users-map',
    style: mapStyle.value,
    center: [0, 20] as [number, number],
    zoom: 1.2,
  }));

  interface UserData {
    coordinates: [number, number];
    weight: number;
  }

  const usersData: UserData[] = [
    { coordinates: [-74.006, 40.7128], weight: 847 },
    { coordinates: [-0.1276, 51.5074], weight: 623 },
    { coordinates: [139.6917, 35.6895], weight: 512 },
    { coordinates: [2.3522, 48.8566], weight: 234 },
    { coordinates: [-122.4194, 37.7749], weight: 198 },
    { coordinates: [77.209, 28.6139], weight: 187 },
    { coordinates: [121.4737, 31.2304], weight: 156 },
    { coordinates: [151.2093, -33.8688], weight: 89 },
    { coordinates: [-43.1729, -22.9068], weight: 67 },
    { coordinates: [18.4241, -33.9249], weight: 45 },
    { coordinates: [103.8198, 1.3521], weight: 78 },
    { coordinates: [-99.1332, 19.4326], weight: 56 },
    { coordinates: [116.4074, 39.9042], weight: 320 },
    { coordinates: [37.6173, 55.7558], weight: 145 },
    { coordinates: [126.978, 37.5665], weight: 210 },
    { coordinates: [-46.6333, -23.5505], weight: 178 },
    { coordinates: [72.8777, 19.076], weight: 290 },
    { coordinates: [28.9784, 41.0082], weight: 165 },
    { coordinates: [100.5018, 13.7563], weight: 142 },
    { coordinates: [-3.7038, 40.4168], weight: 118 },
  ];

  const getPosition = (d: any) => d.coordinates;
  const getWeight = (d: any) => d.weight;

  const colorRange: [number, number, number][] = [
    [1, 25, 1],
    [15, 85, 15],
    [30, 127, 30],
    [45, 170, 45],
    [60, 210, 60],
    [16, 185, 129],
  ];
</script>

<template>
  <div class="h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <VLayerDeckglHeatmap
        id="active-users-heatmap"
        :data="usersData"
        :get-position="getPosition"
        :get-weight="getWeight"
        :radius-pixels="60"
        :intensity="1"
        :threshold="0.03"
        :color-range="colorRange"
      />
    </VMap>
  </div>
</template>

<style scoped>
  #active-users-map {
    width: 100%;
    height: 100%;
  }
</style>
