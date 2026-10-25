<script setup lang="ts">
  import { VLayerDeckglGreatCircle } from '@geoql/v-maplibre/deck.gl';
  import type { GreatCircleLayerProps } from '@deck.gl/geo-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerGreatCircleProps extends Partial<GreatCircleLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerGreatCircleProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglGreatCircle
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglGreatCircle>
</template>
