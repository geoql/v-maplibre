<script setup lang="ts">
  import { VLayerDeckglQuadkey } from '@geoql/v-maplibre';
  import type { QuadkeyLayerProps } from '@deck.gl/geo-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerQuadkeyProps extends Partial<QuadkeyLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerQuadkeyProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglQuadkey
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglQuadkey>
</template>
