<script setup lang="ts">
  import { computed } from 'vue';
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
  <VLayerMaplibreImage
    :source-id="sourceId"
    :layer-id="props.id"
    :source="props.source"
    :layer="layerSpec"
    :before="props.before"
  ></VLayerMaplibreImage>
</template>
