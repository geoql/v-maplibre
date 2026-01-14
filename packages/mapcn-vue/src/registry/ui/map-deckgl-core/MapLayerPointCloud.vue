<script setup lang="ts">
  import { VLayerDeckglPointCloud } from '@geoql/v-maplibre';
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
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglPointCloud>
</template>
