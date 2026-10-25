<script setup lang="ts">
  import { VLayerDeckglPointCloud } from '@geoql/v-maplibre/deck.gl';
  import type { PointCloudLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerPointCloudProps extends Partial<PointCloudLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerPointCloudProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglPointCloud
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglPointCloud>
</template>
