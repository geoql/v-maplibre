<script setup lang="ts">
  useSeoMeta({
    title: 'Terrain Viewshed Analysis - mapcn-vue Examples',
    description:
      'Interactive terrain viewshed analysis demo. Place observer points and visualize visible terrain areas with adjustable observer height.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Terrain Viewshed Analysis',
    description:
      'Place observers and simulate line-of-sight terrain visibility.',
    category: 'Examples',
  });

  const {
    observers,
    viewshedPolygons,
    observerHeight,
    totalVisibleAreaKm2,
    heightOptions,
    maxObservers,
    addObserver,
    removeObserver,
    clearAll,
    setHeight,
    cleanup,
  } = useViewshed();
  function handleMapClick(lngLat: [number, number]): void {
    addObserver(lngLat);
  }

  onUnmounted(() => {
    cleanup();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';

  const colorMode = useColorMode();
  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  );
  ${SCRIPT_END}

  <template>
    <VMap :options="{ style: mapStyle, center: [77.5, 34.2], zoom: 12 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Terrain Viewshed Analysis"
    description="Click to place observer points and visualize simulated terrain viewshed polygons. Adjust observer height to simulate standing, vehicle, or tower positions."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesViewshedMapContainer
        :observers="observers"
        :viewshed-polygons="viewshedPolygons"
        class="size-full"
        @map-click="handleMapClick"
      />

      <MapPanel title="Viewshed">
        <ExamplesViewshedControlPanel
          :observers="observers"
          :observer-height="observerHeight"
          :height-options="heightOptions"
          :max-observers="maxObservers"
          :total-visible-area-km2="totalVisibleAreaKm2"
          @set-height="setHeight"
          @remove-observer="removeObserver"
          @clear-all="clearAll"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
