<script setup lang="ts">
  import { VLayerDeckglWindParticle } from '@geoql/v-maplibre';
  import type { PickingInfo, Color } from '@deck.gl/core';
  import type { ColorStop, WindDataPoint } from 'maplibre-gl-wind';

  export interface MapLayerWindParticleProps {
    id: string;
    imageUrl?: string;
    windData?: WindDataPoint[];
    bounds?: [number, number, number, number];
    uMin?: number;
    uMax?: number;
    vMin?: number;
    vMax?: number;
    numParticles?: number;
    maxAge?: number;
    speedFactor?: number;
    color?: Color;
    colorRamp?: ColorStop[];
    speedRange?: [number, number];
    width?: number;
    animate?: boolean;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<MapLayerWindParticleProps>(), {
    bounds: () => [-180, -90, 180, 90],
    uMin: -50,
    uMax: 50,
    vMin: -50,
    vMax: 50,
    numParticles: 8192,
    maxAge: 30,
    speedFactor: 50,
    color: () => [255, 255, 255, 200] as Color,
    colorRamp: () =>
      [
        [0.0, [59, 130, 189, 255]],
        [0.1, [102, 194, 165, 255]],
        [0.2, [171, 221, 164, 255]],
        [0.3, [230, 245, 152, 255]],
        [0.4, [254, 224, 139, 255]],
        [0.5, [253, 174, 97, 255]],
        [0.6, [244, 109, 67, 255]],
        [1.0, [213, 62, 79, 255]],
      ] as ColorStop[],
    speedRange: () => [0, 30],
    width: 1.5,
    animate: true,
    opacity: 1,
    visible: true,
    pickable: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    loaded: [];
    error: [error: Error];
  }>();
</script>

<template>
  <VLayerDeckglWindParticle
    v-bind="props"
    @click="(info) => emit('click', info)"
    @hover="(info) => emit('hover', info)"
    @loaded="emit('loaded')"
    @error="(err) => emit('error', err)"
  ></VLayerDeckglWindParticle>
</template>
