<script setup lang="ts">
  import { computed } from 'vue';
  import { VLayerMaplibreGeojson } from '@geoql/v-maplibre';
  import type { Feature } from 'geojson';
  import type {
    GeoJSONSourceSpecification,
    LayerSpecification,
  } from 'maplibre-gl';

  // Layer types that read from a GeoJSON source.
  type GeojsonLayerSpecification = Extract<
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
  type GeojsonLayerInput = GeojsonLayerSpecification extends infer L
    ? L extends GeojsonLayerSpecification
      ? Omit<L, 'id' | 'source'>
      : never
    : never;

  export interface MapLayerGeojsonClickEvent {
    features: Feature[];
    coordinates: { lng: number; lat: number };
  }

  export interface MapLayerGeojsonProps {
    id: string;
    source: GeoJSONSourceSpecification;
    layer: GeojsonLayerInput;
    before?: string;
  }

  const props = defineProps<MapLayerGeojsonProps>();

  const emit = defineEmits<{
    click: [event: MapLayerGeojsonClickEvent];
  }>();

  // Source and layer ids derive from `id`, so two instances never collide.
  const sourceId = computed(() => `${props.id}-source`);
  const layerSpec = computed<GeojsonLayerSpecification>(() => ({
    ...props.layer,
    id: props.id,
    source: sourceId.value,
  }));
</script>

<template>
  <VLayerMaplibreGeojson
    :source-id="sourceId"
    :layer-id="props.id"
    :source="props.source"
    :layer="layerSpec"
    :before="props.before"
    @on-click="(event) => emit('click', event)"
  ></VLayerMaplibreGeojson>
</template>
