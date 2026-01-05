<script setup lang="ts">
  import { VLayerDeckglScreenGrid } from '@geoql/v-maplibre';
  import type { ScreenGridLayerProps } from '@deck.gl/aggregation-layers';

  export interface MapLayerScreenGridProps extends Partial<ScreenGridLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerScreenGridProps>();
</script>

<template>
  <VLayerDeckglScreenGrid v-bind="props"></VLayerDeckglScreenGrid>
</template>
