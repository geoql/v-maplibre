<script setup lang="ts">
  import { VLayerDeckglMVT } from '@geoql/v-maplibre';
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
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglMVT>
</template>
