<script setup lang="ts">
  import { VLayerDeckglH3Hexagon } from '@geoql/v-maplibre/deck.gl';
  import type { H3HexagonLayerProps } from '@deck.gl/geo-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerH3HexagonProps extends Partial<H3HexagonLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerH3HexagonProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglH3Hexagon
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglH3Hexagon>
</template>
