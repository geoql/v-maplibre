<script setup lang="ts">
  import { VLayerDeckglHeatmap } from '@geoql/v-maplibre';
  import type { HeatmapLayerProps } from '@deck.gl/aggregation-layers';

  export interface MapLayerHeatmapProps extends Partial<HeatmapLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerHeatmapProps>();
</script>

<template>
  <VLayerDeckglHeatmap v-bind="props"></VLayerDeckglHeatmap>
</template>
