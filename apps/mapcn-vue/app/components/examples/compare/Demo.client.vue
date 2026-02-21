<script setup lang="ts">
  import maplibregl from 'maplibre-gl';
  import { Compare } from '@geoql/maplibre-gl-compare';
  import '@geoql/maplibre-gl-compare/style.css';
  import type { Orientation, Theme } from '~/types/compare';

  const props = defineProps<{
    orientation: Orientation;
  }>();

  const { mapsguruLightStyle, mapsguruDarkStyle } = useMapStyle();
  const colorMode = useColorMode();

  const containerRef = ref<HTMLDivElement | null>(null);
  const beforeRef = ref<HTMLDivElement | null>(null);
  const afterRef = ref<HTMLDivElement | null>(null);

  let beforeMap: maplibregl.Map | null = null;
  let afterMap: maplibregl.Map | null = null;
  let compare: Compare | null = null;

  const compareTheme = computed<Theme>(() =>
    colorMode.value === 'dark' ? 'dark' : 'light',
  );

  function initCompare(): void {
    if (
      !containerRef.value ||
      !beforeRef.value ||
      !afterRef.value ||
      !beforeMap ||
      !afterMap
    )
      return;

    compare?.remove();
    compare = new Compare(beforeMap, afterMap, containerRef.value, {
      orientation: props.orientation,
      theme: compareTheme.value,
    });
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

  onMounted(() => {
    if (!beforeRef.value || !afterRef.value) return;

    beforeMap = new maplibregl.Map({
      container: beforeRef.value,
      style: mapsguruLightStyle.value,
      center: [-74.006, 40.7128],
      zoom: 12,
    });

    afterMap = new maplibregl.Map({
      container: afterRef.value,
      style: mapsguruDarkStyle.value,
      center: [-74.006, 40.7128],
      zoom: 12,
    });

    let loadedCount = 0;
    function onLoad(): void {
      loadedCount++;
      if (loadedCount === 2) initCompare();
    }

    beforeMap.on('load', onLoad);
    afterMap.on('load', onLoad);
  });

  onUnmounted(() => {
    compare?.remove();
    beforeMap?.remove();
    afterMap?.remove();
    compare = null;
    beforeMap = null;
    afterMap = null;
  });
</script>

<template>
  <div ref="containerRef" class="relative size-full overflow-hidden rounded-lg">
    <div ref="beforeRef" class="absolute inset-0" ></div>
    <div ref="afterRef" class="absolute inset-0" ></div>
  </div>
</template>
