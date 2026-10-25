<script setup lang="ts">
  import { VLayerDeckglWMS } from '@geoql/v-maplibre/deck.gl';
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
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
  ></VLayerDeckglWMS>
</template>
