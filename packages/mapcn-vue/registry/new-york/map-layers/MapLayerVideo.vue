<script setup lang="ts">
  import { computed } from 'vue';
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
  <VLayerMaplibreVideo
    :source-id="sourceId"
    :layer-id="props.id"
    :source="props.source"
    :layer="layerSpec"
    :before="props.before"
  ></VLayerMaplibreVideo>
</template>
