<script setup lang="ts">
  import { computed } from 'vue';
  import { VLayerMaplibrePmtile } from '@geoql/v-maplibre';
  import type { RasterLayerSpecification } from 'maplibre-gl';

  export interface MapLayerPmtilesProps {
    id: string;
    url: string;
    layer?: Partial<Omit<RasterLayerSpecification, 'id' | 'source' | 'type'>>;
    before?: string;
  }

  const props = defineProps<MapLayerPmtilesProps>();

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
  <VLayerMaplibrePmtile
    :source-id="sourceId"
    :layer-id="props.id"
    :url="props.url"
    :layer="layerSpec"
    :before="props.before"
  ></VLayerMaplibrePmtile>
</template>
