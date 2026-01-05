<script setup lang="ts">
  import { VLayerMaplibreImage } from '@geoql/v-maplibre';
  import type {
    ImageSourceSpecification,
    RasterLayerSpecification,
  } from 'maplibre-gl';

  export interface MapLayerImageProps {
    id: string;
    source: ImageSourceSpecification;
    layer?: Partial<Omit<RasterLayerSpecification, 'id' | 'source' | 'type'>>;
    before?: string;
  }

  const props = defineProps<MapLayerImageProps>();
</script>

<template>
  <VLayerMaplibreImage
    :id="props.id"
    :source="props.source"
    :layer="props.layer"
    :before="props.before"
  ></VLayerMaplibreImage>
</template>
