<script setup lang="ts">
  import { computed } from 'vue';
  import { VLayerMaplibreRaster } from '@geoql/v-maplibre';
  import type {
    RasterSourceSpecification,
    RasterLayerSpecification,
  } from 'maplibre-gl';

  export interface MapLayerRasterProps {
    id: string;
    source: RasterSourceSpecification;
    layer?: Partial<Omit<RasterLayerSpecification, 'id' | 'source' | 'type'>>;
    before?: string;
  }

  const props = defineProps<MapLayerRasterProps>();

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
  <VLayerMaplibreRaster
    :source-id="sourceId"
    :layer-id="props.id"
    :source="props.source"
    :layer="layerSpec"
    :before="props.before"
  ></VLayerMaplibreRaster>
</template>
