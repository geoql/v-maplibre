<script setup lang="ts">
  import { VLayerDeckglH3Cluster } from '@geoql/v-maplibre/deck.gl';
  import type { H3ClusterLayerProps } from '@deck.gl/geo-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerH3ClusterProps extends Partial<H3ClusterLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerH3ClusterProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglH3Cluster
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglH3Cluster>
</template>
