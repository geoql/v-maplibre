<script setup lang="ts">
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  interface Props {
    center?: [number, number];
    zoom?: number;
    showScale?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    center: () => [0, 0],
    zoom: 2,
    showScale: false,
  });

  const mapId = useId();
  const colorMode = useColorMode();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `map-demo-${mapId}`,
    style: mapStyle.value,
    center: props.center,
    zoom: props.zoom,
    attributionControl: false,
  }));
</script>

<template>
  <div class="map-container h-full w-full">
    <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
      <VControlNavigation position="top-right"></VControlNavigation>
      <VControlScale v-if="showScale" position="bottom-left"></VControlScale>
      <slot></slot>
    </VMap>
  </div>
</template>
