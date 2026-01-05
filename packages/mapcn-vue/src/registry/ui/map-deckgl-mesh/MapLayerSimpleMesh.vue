<script setup lang="ts">
  import { VLayerDeckglSimpleMesh } from '@geoql/v-maplibre';
  import type { SimpleMeshLayerProps } from '@deck.gl/mesh-layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerSimpleMeshProps extends Partial<SimpleMeshLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerSimpleMeshProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglSimpleMesh
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglSimpleMesh>
</template>
