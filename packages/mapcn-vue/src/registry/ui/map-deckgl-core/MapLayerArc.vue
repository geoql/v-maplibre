<script setup lang="ts">
  import { VLayerDeckglArc } from '@geoql/v-maplibre';
  import type { ArcLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerArcProps extends Partial<ArcLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerArcProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglArc
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglArc>
</template>
