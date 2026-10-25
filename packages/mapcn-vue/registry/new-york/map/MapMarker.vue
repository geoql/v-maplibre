<script setup lang="ts">
  import { VMarker } from '@geoql/v-maplibre';
  import type { LngLatLike } from 'maplibre-gl';

  export interface MapMarkerProps {
    coordinates: LngLatLike;
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

  interface MarkerDragEvent {
    lngLat: { lng: number; lat: number };
  }

  const emit = defineEmits<{
    click: [e: MouseEvent];
    dragstart: [e: MarkerDragEvent];
    drag: [e: MarkerDragEvent];
    dragend: [e: MarkerDragEvent];
  }>();
</script>

<template>
  <VMarker
    :coordinates="props.coordinates"
    :draggable="props.draggable"
    :anchor="props.anchor"
    :offset="props.offset"
    :color="props.color"
    :scale="props.scale"
    :class="props.class"
    @click="(e: MouseEvent) => emit('click', e)"
    @dragstart="(e: MarkerDragEvent) => emit('dragstart', e)"
    @drag="(e: MarkerDragEvent) => emit('drag', e)"
    @dragend="(e: MarkerDragEvent) => emit('dragend', e)"
  >
    <slot></slot>
  </VMarker>
</template>
