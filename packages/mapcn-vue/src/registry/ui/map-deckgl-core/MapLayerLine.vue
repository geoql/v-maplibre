<script setup lang="ts">
  import { VLayerDeckglLine } from '@geoql/v-maplibre';
  import type { LineLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerLineProps extends Partial<LineLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerLineProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglLine
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglLine>
</template>
