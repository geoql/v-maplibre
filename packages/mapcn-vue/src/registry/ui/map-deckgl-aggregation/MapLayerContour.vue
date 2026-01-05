<script setup lang="ts">
  import { VLayerDeckglContour } from '@geoql/v-maplibre';
  import type { ContourLayerProps } from '@deck.gl/aggregation-layers';

  export interface MapLayerContourProps extends Partial<ContourLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerContourProps>();
</script>

<template>
  <VLayerDeckglContour v-bind="props"></VLayerDeckglContour>
</template>
