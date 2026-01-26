<script setup lang="ts">
  import type { Map } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    isLoading: boolean;
    error: string | null;
  }>();

  const emit = defineEmits<{
    loaded: [map: Map];
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `interpolate-heatmap-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 20] as [number, number],
    zoom: 1.5,
    touchPitch: false,
    pitchWithRotate: false,
    renderWorldCopies: false,
  }));
</script>

<template>
  <div
    class="relative h-125 min-w-0 overflow-hidden rounded-lg border border-border"
  >
    <div
      v-if="isLoading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-3">
        <Icon name="lucide:loader-2" class="size-8 animate-spin text-primary" />
        <span class="text-sm text-muted-foreground"
          >Loading weather data...</span
        >
      </div>
    </div>

    <div
      v-if="error"
      class="absolute inset-0 z-10 flex items-center justify-center bg-background/80"
    >
      <div class="flex flex-col items-center gap-2 text-destructive">
        <Icon name="lucide:alert-circle" class="size-8" />
        <span class="text-sm">{{ error }}</span>
      </div>
    </div>

    <ClientOnly>
      <VMap
        :key="mapStyle"
        :options="mapOptions"
        class="size-full"
        @loaded="emit('loaded', $event)"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
      </VMap>
    </ClientOnly>
  </div>
</template>
