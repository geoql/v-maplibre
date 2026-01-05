<script setup lang="ts">
  import { VPopup } from '@geoql/v-maplibre';
  import type { LngLatLike } from 'maplibre-gl';

  export interface MapPopupProps {
    lngLat: LngLatLike;
    closeButton?: boolean;
    closeOnClick?: boolean;
    closeOnMove?: boolean;
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
    offset?: number | [number, number];
    maxWidth?: string;
    class?: string;
  }

  const props = withDefaults(defineProps<MapPopupProps>(), {
    closeButton: true,
    closeOnClick: true,
    closeOnMove: false,
    anchor: 'bottom',
    maxWidth: '240px',
  });

  const emit = defineEmits<{
    open: [];
    close: [];
  }>();
</script>

<template>
  <VPopup
    :lng-lat="props.lngLat"
    :close-button="props.closeButton"
    :close-on-click="props.closeOnClick"
    :close-on-move="props.closeOnMove"
    :anchor="props.anchor"
    :offset="props.offset"
    :max-width="props.maxWidth"
    :class="['rounded-lg bg-background p-3 shadow-lg border', props.class]"
    @open="emit('open')"
    @close="emit('close')"
  >
    <slot></slot>
  </VPopup>
</template>
