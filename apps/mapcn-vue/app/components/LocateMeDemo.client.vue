<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglScatterplot,
    VLayerDeckglPath,
  } from '@geoql/v-maplibre';

  const colorMode = useColorMode();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  // Paris area - user location with trail
  const userLocation: [number, number] = [2.3522, 48.8566];

  const mapOptions = computed(() => ({
    container: 'locate-me-map',
    style: mapStyle.value,
    center: userLocation,
    zoom: 14,
    attributionControl: false,
    interactive: false,
  }));

  // User's recent path (simulated GPS trail)
  const userPath = [
    {
      path: [
        [2.345, 48.853],
        [2.347, 48.854],
        [2.349, 48.8555],
        [2.3505, 48.856],
        [2.3522, 48.8566],
      ],
    },
  ];

  // Current user position for the dot
  const userPosition = [{ coordinates: userLocation }];
</script>

<template>
  <div class="h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <!-- GPS trail path -->
      <VLayerDeckglPath
        id="user-trail"
        :data="userPath"
        :get-path="(d: (typeof userPath)[0]) => d.path"
        :get-color="[59, 130, 246, 150]"
        :width-min-pixels="4"
        :cap-rounded="true"
        :joint-rounded="true"
      />
      <!-- Current location dot -->
      <VLayerDeckglScatterplot
        id="user-location"
        :data="userPosition"
        :get-position="(d: (typeof userPosition)[0]) => d.coordinates"
        :get-radius="200"
        :get-fill-color="[59, 130, 246, 255]"
        :radius-min-pixels="8"
        :radius-max-pixels="12"
        :opacity="1"
        :stroked="true"
        :line-width-min-pixels="3"
        :get-line-color="[255, 255, 255, 255]"
      />
      <!-- Accuracy circle (larger, semi-transparent) -->
      <VLayerDeckglScatterplot
        id="user-accuracy"
        :data="userPosition"
        :get-position="(d: (typeof userPosition)[0]) => d.coordinates"
        :get-radius="600"
        :get-fill-color="[59, 130, 246, 30]"
        :radius-min-pixels="30"
        :radius-max-pixels="50"
        :opacity="0.8"
        :stroked="true"
        :line-width-min-pixels="1"
        :get-line-color="[59, 130, 246, 60]"
      />
    </VMap>
  </div>
</template>

<style scoped>
  #locate-me-map {
    width: 100%;
    height: 100%;
  }
</style>
