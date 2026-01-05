<script setup lang="ts">
  import { VLayerDeckglGrid } from '@geoql/v-maplibre';
  import type { GridLayerProps } from '@deck.gl/aggregation-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerGridProps extends Partial<GridLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerGridProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglGrid
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglGrid>
</template>
