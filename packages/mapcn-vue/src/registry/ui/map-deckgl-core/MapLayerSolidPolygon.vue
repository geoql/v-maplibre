<script setup lang="ts">
  import { VLayerDeckglSolidPolygon } from '@geoql/v-maplibre';
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
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglSolidPolygon>
</template>
