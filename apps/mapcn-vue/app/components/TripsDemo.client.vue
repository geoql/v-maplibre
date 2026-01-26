<script setup lang="ts">
  import { VMap, VLayerDeckglTrips } from '@geoql/v-maplibre';

  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: 'trips-map',
    style: mapStyle.value,
    center: [-74.0, 40.72] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0,
  }));

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
  <div class="size-full">
    <VMap :key="mapStyle" :options="mapOptions" class="size-full">
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
      />
    </VMap>
  </div>
</template>

<style scoped>
  #trips-map {
    width: 100%;
    height: 100%;
  }
</style>
