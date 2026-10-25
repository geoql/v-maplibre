<script setup lang="ts">
  import { VLayerDeckglGeojson } from '@geoql/v-maplibre/deck.gl';
  import type { GeoJsonLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerGeojsonProps extends Partial<
    Omit<GeoJsonLayerProps, 'data'>
  > {
    id: string;
    data: unknown[] | string | object;
  }

  const props = defineProps<MapLayerGeojsonProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglGeojson
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglGeojson>
</template>
