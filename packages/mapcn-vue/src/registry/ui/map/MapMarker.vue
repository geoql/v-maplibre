<script setup lang="ts">
  import { VMarker } from '@geoql/v-maplibre';
  import type { LngLatLike } from 'maplibre-gl';

  export interface MapMarkerProps {
    lngLat: LngLatLike;
    draggable?: boolean;
    anchor?:
      | 'center'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';
    offset?: [number, number];
    color?: string;
    scale?: number;
    class?: string;
  }

  const props = withDefaults(defineProps<MapMarkerProps>(), {
    draggable: false,
    anchor: 'bottom',
    scale: 1,
  });

  const emit = defineEmits<{
    click: [e: MouseEvent];
    dragstart: [e: { lngLat: { lng: number; lat: number } }];
    drag: [e: { lngLat: { lng: number; lat: number } }];
    dragend: [e: { lngLat: { lng: number; lat: number } }];
  }>();
</script>

<template>
  <VMarker
    :lng-lat="props.lngLat"
    :draggable="props.draggable"
    :anchor="props.anchor"
    :offset="props.offset"
    :color="props.color"
    :scale="props.scale"
    :class="props.class"
    @click="(e) => emit('click', e)"
    @dragstart="(e) => emit('dragstart', e)"
    @drag="(e) => emit('drag', e)"
    @dragend="(e) => emit('dragend', e)"
  >
    <slot></slot>
  </VMarker>
</template>
