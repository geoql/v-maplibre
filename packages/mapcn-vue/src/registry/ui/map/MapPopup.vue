<script setup lang="ts">
  import { computed } from 'vue';
  import { VPopup } from '@geoql/v-maplibre';
  import type { LngLatLike, PopupOptions } from 'maplibre-gl';

  export interface MapPopupProps {
    coordinates: LngLatLike;
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
    className?: string;
  }

  const props = withDefaults(defineProps<MapPopupProps>(), {
    closeButton: true,
    closeOnClick: true,
    closeOnMove: false,
    anchor: 'bottom',
    maxWidth: '240px',
    className: '',
  });

  const emit = defineEmits<{
    open: [];
    close: [];
  }>();

  const popupOptions = computed<PopupOptions>(() => ({
    closeButton: props.closeButton,
    closeOnClick: props.closeOnClick,
    closeOnMove: props.closeOnMove,
    anchor: props.anchor,
    offset: props.offset,
    maxWidth: props.maxWidth,
    className: `mapcn-popup ${props.className}`.trim(),
  }));
</script>

<template>
  <VPopup
    :coordinates="props.coordinates"
    :options="popupOptions"
    @open="emit('open')"
    @close="emit('close')"
  >
    <slot></slot>
  </VPopup>
</template>

<style>
  .mapcn-popup .maplibregl-popup-content {
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
    border: 1px solid hsl(var(--border));
    background: hsl(var(--background));
    color: hsl(var(--foreground));
  }

  .mapcn-popup .maplibregl-popup-close-button {
    color: hsl(var(--muted-foreground));
    font-size: 18px;
    padding: 4px 8px;
  }

  .mapcn-popup .maplibregl-popup-close-button:hover {
    color: hsl(var(--foreground));
    background: transparent;
  }

  .mapcn-popup .maplibregl-popup-tip {
    border-top-color: hsl(var(--background));
  }

  .mapcn-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip {
    border-bottom-color: hsl(var(--background));
  }
</style>
