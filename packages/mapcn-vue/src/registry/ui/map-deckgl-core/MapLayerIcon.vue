<script setup lang="ts">
  import { VLayerDeckglIcon } from '@geoql/v-maplibre';
  import type { IconLayerProps } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerIconProps extends Partial<IconLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerIconProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglIcon
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglIcon>
</template>
