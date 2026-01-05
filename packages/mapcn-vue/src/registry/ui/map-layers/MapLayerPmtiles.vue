<script setup lang="ts">
  import { VLayerMaplibrePmtile } from '@geoql/v-maplibre';
  import type { LayerSpecification } from 'maplibre-gl';

  export interface MapLayerPmtilesProps {
    id: string;
    url: string;
    layer: Omit<LayerSpecification, 'id' | 'source'>;
    before?: string;
  }

  const props = defineProps<MapLayerPmtilesProps>();

  const emit = defineEmits<{
    click: [e: maplibregl.MapLayerMouseEvent];
    mouseenter: [e: maplibregl.MapLayerMouseEvent];
    mouseleave: [e: maplibregl.MapLayerMouseEvent];
  }>();
</script>

<template>
  <VLayerMaplibrePmtile
    :id="props.id"
    :url="props.url"
    :layer="props.layer"
    :before="props.before"
    @click="(e) => emit('click', e)"
    @mouseenter="(e) => emit('mouseenter', e)"
    @mouseleave="(e) => emit('mouseleave', e)"
  ></VLayerMaplibrePmtile>
</template>
