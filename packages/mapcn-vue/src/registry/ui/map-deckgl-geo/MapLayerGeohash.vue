<script setup lang="ts">
  import { VLayerDeckglGeohash } from '@geoql/v-maplibre';
  import type { GeohashLayerProps } from '@deck.gl/geo-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerGeohashProps extends Partial<GeohashLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerGeohashProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglGeohash
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglGeohash>
</template>
