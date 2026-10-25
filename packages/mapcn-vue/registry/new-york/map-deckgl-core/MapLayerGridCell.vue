<script setup lang="ts">
  import { VLayerDeckglGridCell } from '@geoql/v-maplibre/deck.gl';
  import type { GridCellLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerGridCellProps extends Partial<GridCellLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerGridCellProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglGridCell
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglGridCell>
</template>
