<script setup lang="ts">
  import { VLayerCog } from '@geoql/v-maplibre/geotiff';
  import type { PickingInfo, Color } from '@deck.gl/core';

  export interface MapLayerCogProps {
    id: string;
    geotiff: string | ArrayBuffer | Blob | object;
    tileSize?: number;
    maxZoom?: number;
    minZoom?: number;
    maxCacheSize?: number;
    refinementStrategy?: 'best-available' | 'no-overlap' | 'never';
    maxRequests?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
    debug?: boolean;
    debugOpacity?: number;
  }

  const props = withDefaults(defineProps<MapLayerCogProps>(), {
    tileSize: 256,
    minZoom: 0,
    refinementStrategy: 'best-available',
    maxRequests: 6,
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
    debug: false,
    debugOpacity: 0.25,
  });

  interface GeotiffLoadOptions {
    geographicBounds: {
      west: number;
      south: number;
      east: number;
      north: number;
    };
  }

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    geotiffLoad: [tiff: unknown, options: GeotiffLoadOptions];
  }>();
</script>

<template>
  <VLayerCog
    v-bind="props"
    @click="(info: PickingInfo) => emit('click', info)"
    @hover="(info: PickingInfo) => emit('hover', info)"
    @geotiff-load="
      (tiff: unknown, options: GeotiffLoadOptions) =>
        emit('geotiffLoad', tiff, options)
    "
  ></VLayerCog>
</template>
