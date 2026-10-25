<script setup lang="ts">
  import { computed } from 'vue';
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

  // Source and layer ids derive from `id`, so two instances never collide.
  const sourceId = computed(() => `${props.id}-source`);
  const layerSpec = computed<RasterLayerSpecification>(() => ({
    ...props.layer,
    id: props.id,
    type: 'raster',
    source: sourceId.value,
  }));
</script>

<template>
  <VLayerMaplibreCanvas
    :source-id="sourceId"
    :layer-id="props.id"
    :source="props.source"
    :layer="layerSpec"
    :before="props.before"
  ></VLayerMaplibreCanvas>
</template>
