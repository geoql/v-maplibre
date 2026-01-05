<script setup lang="ts">
  import {
    VControlNavigation,
    VControlScale,
    VControlGeolocate,
    VControlFullscreen,
  } from '@geoql/v-maplibre';

  export interface MapControlsProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showNavigation?: boolean;
    showScale?: boolean;
    showGeolocate?: boolean;
    showFullscreen?: boolean;
  }

  const props = withDefaults(defineProps<MapControlsProps>(), {
    position: 'bottom-right',
    showNavigation: true,
    showScale: false,
    showGeolocate: false,
    showFullscreen: false,
  });

  const emit = defineEmits<{
    geolocate: [position: GeolocationPosition];
    geolocateError: [error: GeolocationPositionError];
  }>();
</script>

<template>
  <VControlNavigation
    v-if="props.showNavigation"
    :position="props.position"
  ></VControlNavigation>
  <VControlScale
    v-if="props.showScale"
    :position="props.position"
  ></VControlScale>
  <VControlGeolocate
    v-if="props.showGeolocate"
    :position="props.position"
    @geolocate="(e) => emit('geolocate', e)"
    @error="(e) => emit('geolocateError', e)"
  ></VControlGeolocate>
  <VControlFullscreen
    v-if="props.showFullscreen"
    :position="props.position"
  ></VControlFullscreen>
</template>
