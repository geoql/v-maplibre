<script setup lang="ts">
  useSeoMeta({
    title: 'NBC Plume Dispersion - mapcn-vue Examples',
    description:
      'NBC hazard plume dispersion modeling with wind-driven Gaussian dispersion zones on a MapLibre map.',
  });

  defineOgImage('MapcnDoc', {
    title: 'NBC Plume Dispersion',
    description:
      'Model nuclear, biological, and chemical hazard plume spread with wind control.',
    category: 'Examples',
  });

  const {
    source,
    plumeZones,
    windDirection,
    windSpeed,
    stats,
    isSimulating,
    hazardType,
    expansion,
    placeSource,
    reset,
    cleanup,
  } = useNbcPlume();
  function handleMapClick(lngLat: [number, number]): void {
    placeSource(lngLat);
  }

  function handleWindDirection(value: number): void {
    windDirection.value = value;
  }

  function handleWindSpeed(value: number): void {
    windSpeed.value = value;
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
    <VMap :options="{ style: mapStyle, center: [72.0, 26.3], zoom: 11 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="NBC Plume Dispersion"
    description="Click to place a hazard source and model wind-driven NBC plume dispersion with lethal, danger, and caution zones using Gaussian dispersion."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesNbcPlumeMapContainer
        :source="source"
        :plume-zones="plumeZones"
        class="size-full"
        @map-click="handleMapClick"
      />

      <MapPanel title="NBC Plume">
        <ExamplesNbcPlumeControlPanel
          :wind-direction="windDirection"
          :wind-speed="windSpeed"
          :stats="stats"
          :is-simulating="isSimulating"
          :has-source="!!source"
          :hazard-type="hazardType"
          :expansion="expansion"
          @update:wind-direction="handleWindDirection"
          @update:wind-speed="handleWindSpeed"
          @update:hazard-type="hazardType = $event"
          @reset="reset"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
