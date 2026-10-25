<script setup lang="ts">
  import { VLayerDeckglGrid } from '@geoql/v-maplibre/deck.gl';
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
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglGrid>
</template>
