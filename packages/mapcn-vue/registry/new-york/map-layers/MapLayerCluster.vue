<script setup lang="ts">
  import { computed } from 'vue';
  import { VLayerMaplibreCluster } from '@geoql/v-maplibre';
  import type { Feature, FeatureCollection } from 'geojson';
  import type { GeoJSONSourceSpecification } from 'maplibre-gl';

  export interface MapLayerClusterProps {
    id: string;
    data: string | FeatureCollection;
    clusterMinPoints?: number;
    clusterProperties?: GeoJSONSourceSpecification['clusterProperties'];
    maxZoom?: number;
  }

  interface ClusterLayerClick {
    features: Feature[];
    coordinates: { lng: number; lat: number };
  }

  const props = withDefaults(defineProps<MapLayerClusterProps>(), {
    clusterMinPoints: 2,
  });

  const emit = defineEmits<{
    clusterClick: [clusterId: number, coordinates: [number, number]];
    pointClick: [feature: Feature, coordinates: [number, number]];
  }>();

  // Source id and layer id prefix derive from `id`, so two instances never
  // collide.
  const sourceId = computed(() => `${props.id}-source`);
  const source = computed<GeoJSONSourceSpecification>(() => ({
    type: 'geojson',
    data: props.data,
    clusterMinPoints: props.clusterMinPoints,
    // Only set optional keys when given; MapLibre validates source keys.
    ...(props.clusterProperties
      ? { clusterProperties: props.clusterProperties }
      : {}),
    ...(props.maxZoom !== undefined ? { maxzoom: props.maxZoom } : {}),
  }));

  function onClusterClick(event: ClusterLayerClick) {
    const clusterId = event.features[0]?.properties?.cluster_id;
    if (typeof clusterId !== 'number') return;
    emit('clusterClick', clusterId, [
      event.coordinates.lng,
      event.coordinates.lat,
    ]);
  }

  function onPointClick(event: ClusterLayerClick) {
    const feature = event.features[0];
    if (!feature) return;
    emit('pointClick', feature, [event.coordinates.lng, event.coordinates.lat]);
  }
</script>

<template>
  <VLayerMaplibreCluster
    :source-id="sourceId"
    :base-layer-id="props.id"
    :source="source"
    @cluster-click="onClusterClick"
    @point-click="onPointClick"
  ></VLayerMaplibreCluster>
</template>
