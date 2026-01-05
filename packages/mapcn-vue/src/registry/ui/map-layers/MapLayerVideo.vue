<script setup lang="ts">
  import { VLayerMaplibreVideo } from '@geoql/v-maplibre';
  import type {
    VideoSourceSpecification,
    RasterLayerSpecification,
  } from 'maplibre-gl';

  export interface MapLayerVideoProps {
    id: string;
    source: VideoSourceSpecification;
    layer?: Partial<Omit<RasterLayerSpecification, 'id' | 'source' | 'type'>>;
    before?: string;
  }

  const props = defineProps<MapLayerVideoProps>();
</script>

<template>
  <VLayerMaplibreVideo
    :id="props.id"
    :source="props.source"
    :layer="props.layer"
    :before="props.before"
  ></VLayerMaplibreVideo>
</template>
