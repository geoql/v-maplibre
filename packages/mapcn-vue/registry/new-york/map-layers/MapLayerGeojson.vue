<script setup lang="ts">
  import { VLayerMaplibreGeojson } from '@geoql/v-maplibre';
  import type {
    GeoJSONSourceSpecification,
    LayerSpecification,
    MapLayerMouseEvent,
  } from 'maplibre-gl';

  export interface MapLayerGeojsonProps {
    id: string;
    source: GeoJSONSourceSpecification;
    layer: Omit<LayerSpecification, 'id' | 'source'>;
    before?: string;
  }

  const props = defineProps<MapLayerGeojsonProps>();

  const emit = defineEmits<{
    click: [e: MapLayerMouseEvent];
    mouseenter: [e: MapLayerMouseEvent];
    mouseleave: [e: MapLayerMouseEvent];
  }>();
</script>

<template>
  <VLayerMaplibreGeojson
    :id="props.id"
    :source="props.source"
    :layer="props.layer"
    :before="props.before"
    @click="(e) => emit('click', e)"
    @mouseenter="(e) => emit('mouseenter', e)"
    @mouseleave="(e) => emit('mouseleave', e)"
  ></VLayerMaplibreGeojson>
</template>
