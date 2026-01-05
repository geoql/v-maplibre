<script setup lang="ts">
  import { VLayerDeckglText } from '@geoql/v-maplibre';
  import type { TextLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerTextProps extends Partial<TextLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerTextProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglText
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglText>
</template>
