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
  const { mapStyle } = useMapStyle();
  const { isAutomated } = useIsAutomated();

  const mapOptions = computed(() => ({
    container: `map-demo-${mapId}`,
    style: mapStyle.value,
    center: props.center,
    zoom: props.zoom,
  }));
</script>

<template>
  <div
    v-if="isAutomated"
    class="flex size-full items-center justify-center bg-muted font-mono text-xs text-muted-foreground"
  >
    Interactive map demo
  </div>
  <div v-else class="map-container size-full">
    <VMap :key="mapStyle" :options="mapOptions" class="size-full">
      <VControlNavigation position="top-right" />
      <VControlScale v-if="showScale" position="bottom-left" />
      <slot></slot>
    </VMap>
  </div>
</template>
