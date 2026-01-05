<script setup lang="ts">
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
</script>

<template>
  <VLayerMaplibreRaster
    :id="props.id"
    :source="props.source"
    :layer="props.layer"
    :before="props.before"
  ></VLayerMaplibreRaster>
</template>
