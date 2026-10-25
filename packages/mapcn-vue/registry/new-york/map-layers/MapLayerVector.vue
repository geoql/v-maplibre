<script setup lang="ts">
  import { computed } from 'vue';
  import { VLayerMaplibreVector } from '@geoql/v-maplibre';
  import type {
    VectorSourceSpecification,
    LayerSpecification,
    MapLayerMouseEvent,
  } from 'maplibre-gl';

  // Layer types that read from a vector source.
  type VectorLayerSpecification = Extract<
    LayerSpecification,
    {
      type:
        | 'fill'
        | 'line'
        | 'symbol'
        | 'circle'
        | 'heatmap'
        | 'fill-extrusion';
    }
  >;
  // `id` and `source` are set by this component, per layer type.
  type VectorLayerInput = VectorLayerSpecification extends infer L
    ? L extends VectorLayerSpecification
      ? Omit<L, 'id' | 'source'>
      : never
    : never;

  export interface MapLayerVectorProps {
    id: string;
    source: VectorSourceSpecification;
    layer: VectorLayerInput;
    before?: string;
  }

  const props = defineProps<MapLayerVectorProps>();

  const emit = defineEmits<{
    click: [e: MapLayerMouseEvent];
    mouseenter: [e: MapLayerMouseEvent];
    mouseleave: [e: MapLayerMouseEvent];
  }>();

  // Source and layer ids derive from `id`, so two instances never collide.
  const sourceId = computed(() => `${props.id}-source`);
  const layerSpec = computed<VectorLayerSpecification>(() => ({
    ...props.layer,
    id: props.id,
    source: sourceId.value,
  }));
</script>

<template>
  <VLayerMaplibreVector
    :source-id="sourceId"
    :layer-id="props.id"
    :source="props.source"
    :layer="layerSpec"
    :before="props.before"
    @click="(e: MapLayerMouseEvent) => emit('click', e)"
    @mouseenter="(e: MapLayerMouseEvent) => emit('mouseenter', e)"
    @mouseleave="(e: MapLayerMouseEvent) => emit('mouseleave', e)"
  ></VLayerMaplibreVector>
</template>
