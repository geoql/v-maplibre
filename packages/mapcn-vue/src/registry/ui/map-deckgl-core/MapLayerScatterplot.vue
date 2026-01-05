<script setup lang="ts">
  import { VLayerDeckglScatterplot } from '@geoql/v-maplibre';
  import type { ScatterplotLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerScatterplotProps extends Partial<ScatterplotLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerScatterplotProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglScatterplot
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglScatterplot>
</template>
