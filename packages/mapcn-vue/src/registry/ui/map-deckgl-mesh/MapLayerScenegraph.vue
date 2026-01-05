<script setup lang="ts">
  import { VLayerDeckglScenegraph } from '@geoql/v-maplibre';
  import type { ScenegraphLayerProps } from '@deck.gl/mesh-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerScenegraphProps extends Partial<ScenegraphLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerScenegraphProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglScenegraph
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglScenegraph>
</template>
