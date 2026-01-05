<script setup lang="ts">
  import { VMap } from '@geoql/v-maplibre';
  import { useColorMode } from '@vueuse/core';
  import { computed, type StyleValue } from 'vue';
  import type { MapOptions, StyleSpecification } from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  export interface MapProps {
    center?: [number, number];
    zoom?: number;
    bearing?: number;
    pitch?: number;
    minZoom?: number;
    maxZoom?: number;
    styles?: {
      light?: string | StyleSpecification;
      dark?: string | StyleSpecification;
    };
    options?: Partial<MapOptions>;
    class?: string;
    style?: StyleValue;
  }

  const props = withDefaults(defineProps<MapProps>(), {
    center: () => [0, 0],
    zoom: 2,
    bearing: 0,
    pitch: 0,
  });

  const emit = defineEmits<{
    load: [map: maplibregl.Map];
    click: [e: maplibregl.MapMouseEvent];
    move: [e: maplibregl.MapMouseEvent];
    zoom: [e: maplibregl.MapMouseEvent];
  }>();

  const { isDark } = useColorMode();

  const defaultStyles = {
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  };

  const mapStyle = computed(() => {
    if (props.styles) {
      return isDark.value
        ? (props.styles.dark ?? defaultStyles.dark)
        : (props.styles.light ?? defaultStyles.light);
    }
    return isDark.value ? defaultStyles.dark : defaultStyles.light;
  });

  const mapOptions = computed<MapOptions>(() => ({
    style: mapStyle.value,
    center: props.center,
    zoom: props.zoom,
    bearing: props.bearing,
    pitch: props.pitch,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
    ...props.options,
  }));

  function handleLoad(map: maplibregl.Map) {
    emit('load', map);
  }
</script>

<template>
  <VMap
    :options="mapOptions"
    :class="['h-full w-full', props.class]"
    :style="props.style"
    @loaded="handleLoad"
    @click="(e) => emit('click', e)"
    @move="(e) => emit('move', e)"
    @zoom="(e) => emit('zoom', e)"
  >
    <slot></slot>
  </VMap>
</template>
