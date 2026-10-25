<script setup lang="ts">
  import { VLayerDeckglSolidPolygon } from '@geoql/v-maplibre/deck.gl';
  import type { SolidPolygonLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerSolidPolygonProps extends Partial<SolidPolygonLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerSolidPolygonProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglSolidPolygon
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglSolidPolygon>
</template>
