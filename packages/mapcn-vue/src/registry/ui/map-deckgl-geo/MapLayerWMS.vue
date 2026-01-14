<script setup lang="ts">
  import { VLayerDeckglWMS } from '@geoql/v-maplibre';
  import type { PickingInfo } from '@deck.gl/core';

  export interface MapLayerWMSProps {
    id: string;
    data: string;
    serviceType?: 'wms' | 'template';
    layers?: string[];
    tileSize?: number;
    minZoom?: number;
    maxZoom?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
  }

  const props = defineProps<MapLayerWMSProps>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();
</script>

<template>
  <VLayerDeckglWMS
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
  ></VLayerDeckglWMS>
</template>
