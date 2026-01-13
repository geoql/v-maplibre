<script setup lang="ts">
  import { VLayerMaplibreRoute } from '@geoql/v-maplibre';

  export interface MapLayerRouteProps {
    id?: string;
    coordinates: [number, number][];
    color?: string;
    width?: number;
    opacity?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'bevel' | 'round' | 'miter';
    dashArray?: number[];
    blur?: number;
    visible?: boolean;
    interactive?: boolean;
    before?: string;
  }

  const props = withDefaults(defineProps<MapLayerRouteProps>(), {
    color: 'hsl(var(--primary))',
    width: 4,
    opacity: 1,
    lineCap: 'round',
    lineJoin: 'round',
    visible: true,
    interactive: true,
    blur: 0,
  });

  const emit = defineEmits<{
    click: [event: { coordinates: { lng: number; lat: number } }];
    mouseenter: [];
    mouseleave: [];
  }>();
</script>

<template>
  <VLayerMaplibreRoute
    :id="props.id"
    :coordinates="props.coordinates"
    :color="props.color"
    :width="props.width"
    :opacity="props.opacity"
    :line-cap="props.lineCap"
    :line-join="props.lineJoin"
    :dash-array="props.dashArray"
    :blur="props.blur"
    :visible="props.visible"
    :interactive="props.interactive"
    :before="props.before"
    @click="emit('click', $event)"
    @mouseenter="emit('mouseenter')"
    @mouseleave="emit('mouseleave')"
  ></VLayerMaplibreRoute>
</template>
