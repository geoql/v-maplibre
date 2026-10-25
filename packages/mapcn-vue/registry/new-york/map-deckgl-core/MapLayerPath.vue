<script setup lang="ts">
  import { VLayerDeckglPath } from '@geoql/v-maplibre/deck.gl';
  import type { PathLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerPathProps extends Partial<PathLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerPathProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglPath
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglPath>
</template>
