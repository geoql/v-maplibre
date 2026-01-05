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

  // Berlin area - EV charging stations
  const mapOptions = computed(() => ({
    container: 'charging-map',
    style: mapStyle.value,
    center: [13.405, 52.52] as [number, number],
    zoom: 12,
    attributionControl: false,
    interactive: false,
  }));

  // EV charging station locations with availability status
  const chargingStations = [
    { coordinates: [13.405, 52.52], available: true, power: 150 },
    { coordinates: [13.385, 52.515], available: true, power: 50 },
    { coordinates: [13.42, 52.525], available: false, power: 150 },
    { coordinates: [13.395, 52.53], available: true, power: 22 },
    { coordinates: [13.415, 52.51], available: false, power: 50 },
    { coordinates: [13.375, 52.525], available: true, power: 150 },
    { coordinates: [13.4, 52.535], available: true, power: 22 },
    { coordinates: [13.43, 52.515], available: false, power: 50 },
    { coordinates: [13.365, 52.51], available: true, power: 150 },
    { coordinates: [13.41, 52.505], available: true, power: 22 },
  ];

  // Color based on availability: amber for available, gray for occupied
  const getFillColor = (
    d: (typeof chargingStations)[0],
  ): [number, number, number, number] => {
    if (d.available) {
      return [245, 158, 11, 220]; // amber-500
    }
    return [107, 114, 128, 180]; // gray-500
  };

  // Size based on charging power (kW)
  const getRadius = (d: (typeof chargingStations)[0]) => {
    if (d.power >= 150) return 400; // Fast charger
    if (d.power >= 50) return 300; // Medium charger
    return 200; // Slow charger
  };
</script>

<template>
  <div class="h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <VLayerDeckglScatterplot
        id="charging-stations-scatterplot"
        :data="chargingStations"
        :get-position="(d: (typeof chargingStations)[0]) => d.coordinates"
        :get-radius="getRadius"
        :get-fill-color="getFillColor"
        :radius-min-pixels="8"
        :radius-max-pixels="20"
        :opacity="0.9"
        :stroked="true"
        :line-width-min-pixels="2"
        :get-line-color="[255, 255, 255, 200]"
      />
    </VMap>
  </div>
</template>

<style scoped>
  #charging-map {
    width: 100%;
    height: 100%;
  }
</style>
