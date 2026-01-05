<script setup lang="ts">
  import { VMap, VLayerDeckglScatterplot } from '@geoql/v-maplibre';

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

  // World locations with activity data - using deck.gl scatterplot
  const usersData = [
    // High activity (large circles)
    { coordinates: [-74.006, 40.7128], users: 847, activity: 'high' },
    { coordinates: [-0.1276, 51.5074], users: 623, activity: 'high' },
    { coordinates: [139.6917, 35.6895], users: 512, activity: 'high' },
    // Medium activity
    { coordinates: [2.3522, 48.8566], users: 234, activity: 'medium' },
    { coordinates: [-122.4194, 37.7749], users: 198, activity: 'medium' },
    { coordinates: [77.209, 28.6139], users: 187, activity: 'medium' },
    { coordinates: [121.4737, 31.2304], users: 156, activity: 'medium' },
    // Low activity
    { coordinates: [151.2093, -33.8688], users: 89, activity: 'low' },
    { coordinates: [-43.1729, -22.9068], users: 67, activity: 'low' },
    { coordinates: [18.4241, -33.9249], users: 45, activity: 'low' },
    { coordinates: [103.8198, 1.3521], users: 78, activity: 'low' },
    { coordinates: [-99.1332, 19.4326], users: 56, activity: 'low' },
  ];

  const getRadius = (d: (typeof usersData)[0]) => {
    if (d.activity === 'high') return d.users * 50;
    if (d.activity === 'medium') return d.users * 40;
    return d.users * 30;
  };

  const getFillColor = (
    d: (typeof usersData)[0],
  ): [number, number, number, number] => {
    if (d.activity === 'high') return [16, 185, 129, 220];
    if (d.activity === 'medium') return [16, 185, 129, 170];
    return [16, 185, 129, 120];
  };
</script>

<template>
  <div class="h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <VLayerDeckglScatterplot
        id="active-users-scatterplot"
        :data="usersData"
        :get-position="(d: (typeof usersData)[0]) => d.coordinates"
        :get-radius="getRadius"
        :get-fill-color="getFillColor"
        :radius-min-pixels="6"
        :radius-max-pixels="40"
        :opacity="0.9"
        :stroked="true"
        :line-width-min-pixels="2"
        :get-line-color="[16, 185, 129, 100]"
      ></VLayerDeckglScatterplot>
    </VMap>
  </div>
</template>

<style scoped>
  #active-users-map {
    width: 100%;
    height: 100%;
  }
</style>
