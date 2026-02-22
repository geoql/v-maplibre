<script setup lang="ts">
  import { VMap } from '@geoql/v-maplibre';
  import { Compare } from '@geoql/maplibre-gl-compare';
  import '@geoql/maplibre-gl-compare/style.css';
  import type { Map } from 'maplibre-gl';
  import type { Orientation, Theme } from '~/types/compare';

  const props = defineProps<{
    orientation: Orientation;
  }>();

  const { mapsguruLightStyle, mapsguruDarkStyle } = useMapStyle();
  const colorMode = useColorMode();

  const containerRef = ref<HTMLDivElement | null>(null);

  let beforeMap: Map | null = null;
  let afterMap: Map | null = null;
  let compare: Compare | null = null;

  const compareTheme = computed<Theme>(() =>
    colorMode.value === 'dark' ? 'dark' : 'light',
  );

  const beforeMapOptions = computed(() => ({
    container: 'compare-before',
    style: mapsguruLightStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 12,
  }));

  const afterMapOptions = computed(() => ({
    container: 'compare-after',
    style: mapsguruDarkStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 12,
  }));

  function initCompare(): void {
    if (!containerRef.value || !beforeMap || !afterMap) return;
    compare?.remove();
    compare = new Compare(beforeMap, afterMap, containerRef.value, {
      orientation: props.orientation,
      theme: compareTheme.value,
    });
  }

  function onBeforeMapLoaded(map: Map): void {
    beforeMap = map;
    if (afterMap) initCompare();
  }

  function onAfterMapLoaded(map: Map): void {
    afterMap = map;
    if (beforeMap) initCompare();
  }

  watch(
    () => props.orientation,
    () => {
      initCompare();
    },
  );

  watch(compareTheme, (theme) => {
    compare?.setTheme(theme);
  });

  onUnmounted(() => {
    compare?.remove();
    compare = null;
    beforeMap = null;
    afterMap = null;
  });
</script>

<template>
  <div ref="containerRef" class="relative size-full overflow-hidden">
    <VMap
      :options="beforeMapOptions"
      class="absolute inset-0"
      @loaded="onBeforeMapLoaded"
    />
    <VMap
      :options="afterMapOptions"
      class="absolute inset-0"
      @loaded="onAfterMapLoaded"
    />
  </div>
</template>
