<script setup lang="ts">
  import { VLayerDeckglMVT } from '@geoql/v-maplibre/deck.gl';
  import type { MVTLayerProps } from '@deck.gl/geo-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerMVTProps extends Partial<MVTLayerProps> {
    id: string;
    data: string | string[];
  }

  const props = defineProps<MapLayerMVTProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglMVT
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglMVT>
</template>
