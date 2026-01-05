<script setup lang="ts">
  import { VMap, VLayerDeckglArc } from '@geoql/v-maplibre';

  const colorMode = useColorMode();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: 'delivery-map',
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
  }));

  interface DeliveryRoute {
    source: [number, number];
    target: [number, number];
    deliveries: number;
  }

  const deliveryRoutes: DeliveryRoute[] = [
    { source: [-74.006, 40.7128], target: [-0.1276, 51.5074], deliveries: 234 },
    {
      source: [-122.4194, 37.7749],
      target: [2.3522, 48.8566],
      deliveries: 156,
    },
    {
      source: [-118.2437, 34.0522],
      target: [139.6917, 35.6895],
      deliveries: 189,
    },
    {
      source: [-74.006, 40.7128],
      target: [121.4737, 31.2304],
      deliveries: 145,
    },
    { source: [-0.1276, 51.5074], target: [77.209, 28.6139], deliveries: 112 },
    { source: [2.3522, 48.8566], target: [103.8198, 1.3521], deliveries: 98 },
    {
      source: [139.6917, 35.6895],
      target: [121.4737, 31.2304],
      deliveries: 267,
    },
    {
      source: [121.4737, 31.2304],
      target: [103.8198, 1.3521],
      deliveries: 178,
    },
    {
      source: [103.8198, 1.3521],
      target: [151.2093, -33.8688],
      deliveries: 87,
    },
    {
      source: [-74.006, 40.7128],
      target: [-43.1729, -22.9068],
      deliveries: 76,
    },
  ];

  const getSourcePosition = (d: any) => d.source;
  const getTargetPosition = (d: any) => d.target;
  const getWidth = (d: any) => Math.sqrt(d.deliveries) * 0.5;

  const getSourceColor = (): [number, number, number] => {
    return colorMode.value === 'dark' ? [59, 130, 246] : [37, 99, 235];
  };

  const getTargetColor = (): [number, number, number] => {
    return colorMode.value === 'dark' ? [16, 185, 129] : [5, 150, 105];
  };
</script>

<template>
  <div class="h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <VLayerDeckglArc
        id="delivery-arcs"
        :data="deliveryRoutes"
        :get-source-position="getSourcePosition"
        :get-target-position="getTargetPosition"
        :get-source-color="getSourceColor"
        :get-target-color="getTargetColor"
        :get-width="getWidth"
        :width-min-pixels="2"
        :width-max-pixels="8"
        :get-height="0.5"
        :great-circle="true"
      ></VLayerDeckglArc>
    </VMap>
  </div>
</template>

<style scoped>
  #delivery-map {
    width: 100%;
    height: 100%;
  }
</style>
