<script setup lang="ts">
  import { VLayerDeckglPolygon } from '@geoql/v-maplibre';
  import type { PolygonLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerPolygonProps extends Partial<PolygonLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerPolygonProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglPolygon
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglPolygon>
</template>
