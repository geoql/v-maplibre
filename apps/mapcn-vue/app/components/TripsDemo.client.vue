<script setup lang="ts">
  import { VMap, VLayerDeckglTrips } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';

  const colorMode = useColorMode();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  // Map reference for programmatic style changes
  const mapRef = shallowRef<Map | null>(null);

  const mapOptions = {
    container: 'trips-map',
    style: lightStyle,
    center: [-74.0, 40.72] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0,
  };

  // Handle map loaded
  const onMapLoaded = (map: Map) => {
    mapRef.value = map;
  };

  // Watch for style changes and update map
  watch(mapStyle, (newStyle) => {
    if (mapRef.value) {
      mapRef.value.setStyle(newStyle);
    }
  });

  interface Trip {
    path: [number, number][];
    timestamps: number[];
    vendor: number;
  }

  const DATA_URL =
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json';

  const tripsData = ref<Trip[]>([]);
  const currentTime = ref(0);
  const loopLength = 1800; // Based on the data's time range
  const animationSpeed = 30; // Units per second
  let animationFrame: number;
  let lastTime = 0;

  const animate = (timestamp: number) => {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    currentTime.value =
      (currentTime.value + (delta / 1000) * animationSpeed) % loopLength;
    animationFrame = requestAnimationFrame(animate);
  };

  onMounted(async () => {
    // Fetch real NYC taxi trip data (limit to 100 trips for performance)
    try {
      const response = await fetch(DATA_URL);
      const data: Trip[] = await response.json();
      // Sample evenly distributed trips for visual coverage
      const step = Math.floor(data.length / 100);
      tripsData.value = data.filter((_, i) => i % step === 0).slice(0, 100);
    } catch (error) {
      console.error('Failed to fetch trips data:', error);
    }

    // Start animation
    animationFrame = requestAnimationFrame(animate);
  });

  onUnmounted(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  interface TripData {
    path: [number, number][];
    timestamps: number[];
    vendor: number;
  }

  const getPath = (d: unknown) => (d as TripData).path;
  const getTimestamps = (d: unknown) => (d as TripData).timestamps;
  const getColor = (d: unknown): [number, number, number] =>
    (d as TripData).vendor === 0 ? [253, 128, 93] : [23, 184, 190];
</script>

<template>
  <div class="h-full w-full">
    <VMap :options="mapOptions" class="h-full w-full" @loaded="onMapLoaded">
      <VLayerDeckglTrips
        id="trips-layer"
        :data="tripsData"
        :get-path="getPath"
        :get-timestamps="getTimestamps"
        :get-color="getColor"
        :current-time="currentTime"
        :trail-length="180"
        :width-min-pixels="3"
        :cap-rounded="true"
        :joint-rounded="true"
        :opacity="0.8"
      ></VLayerDeckglTrips>
    </VMap>
  </div>
</template>

<style scoped>
  #trips-map {
    width: 100%;
    height: 100%;
  }
</style>
