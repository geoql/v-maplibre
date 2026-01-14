<script setup lang="ts">
  import { VLayerDeckglS2 } from '@geoql/v-maplibre';
  import type { S2LayerProps } from '@deck.gl/geo-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerS2Props extends Partial<S2LayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerS2Props>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglS2
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglS2>
</template>
