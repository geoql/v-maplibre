<script setup lang="ts">
  import { VLayerDeckglColumn } from '@geoql/v-maplibre';
  import type { ColumnLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerColumnProps extends Partial<ColumnLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerColumnProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglColumn
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglColumn>
</template>
