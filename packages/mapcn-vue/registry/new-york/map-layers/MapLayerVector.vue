<script setup lang="ts">
  import { VLayerMaplibreVector } from '@geoql/v-maplibre';
  import type {
    VectorSourceSpecification,
    LayerSpecification,
    MapLayerMouseEvent,
  } from 'maplibre-gl';

  export interface MapLayerVectorProps {
    id: string;
    source: VectorSourceSpecification;
    layer: Omit<LayerSpecification, 'id' | 'source'>;
    before?: string;
  }

  const props = defineProps<MapLayerVectorProps>();

  const emit = defineEmits<{
    click: [e: MapLayerMouseEvent];
    mouseenter: [e: MapLayerMouseEvent];
    mouseleave: [e: MapLayerMouseEvent];
  }>();
</script>

<template>
  <VLayerMaplibreVector
    :id="props.id"
    :source="props.source"
    :layer="props.layer"
    :before="props.before"
    @click="(e) => emit('click', e)"
    @mouseenter="(e) => emit('mouseenter', e)"
    @mouseleave="(e) => emit('mouseleave', e)"
  ></VLayerMaplibreVector>
</template>
