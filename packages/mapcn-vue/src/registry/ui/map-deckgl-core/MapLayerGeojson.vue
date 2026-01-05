<script setup lang="ts">
  import { VLayerDeckglGeojson } from '@geoql/v-maplibre';
  import type { GeoJsonLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerGeojsonProps extends Partial<GeoJsonLayerProps> {
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
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglGeojson>
</template>
