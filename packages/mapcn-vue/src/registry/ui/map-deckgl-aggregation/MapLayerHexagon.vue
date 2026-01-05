<script setup lang="ts">
  import { VLayerDeckglHexagon } from '@geoql/v-maplibre';
  import type { HexagonLayerProps } from '@deck.gl/aggregation-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerHexagonProps extends Partial<HexagonLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerHexagonProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglHexagon
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglHexagon>
</template>
