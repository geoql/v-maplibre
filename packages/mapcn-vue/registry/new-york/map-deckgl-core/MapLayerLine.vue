<script setup lang="ts">
  import { VLayerDeckglLine } from '@geoql/v-maplibre/deck.gl';
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
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglLine>
</template>
