<script setup lang="ts">
  import { VLayerMaplibreCanvas } from '@geoql/v-maplibre';
  import type {
    CanvasSourceSpecification,
    RasterLayerSpecification,
  } from 'maplibre-gl';

  export interface MapLayerCanvasProps {
    id: string;
    source: CanvasSourceSpecification;
    layer?: Partial<Omit<RasterLayerSpecification, 'id' | 'source' | 'type'>>;
    before?: string;
  }

  const props = defineProps<MapLayerCanvasProps>();
</script>

<template>
  <VLayerMaplibreCanvas
    :id="props.id"
    :source="props.source"
    :layer="props.layer"
    :before="props.before"
  ></VLayerMaplibreCanvas>
</template>
