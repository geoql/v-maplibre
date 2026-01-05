<script setup lang="ts">
  import { VLayerMaplibreCluster } from '@geoql/v-maplibre';
  import type { GeoJSON } from 'geojson';

  export interface MapLayerClusterProps {
    id: string;
    data: string | GeoJSON.FeatureCollection;
    clusterRadius?: number;
    clusterMaxZoom?: number;
    clusterMinPoints?: number;
    clusterProperties?: Record<string, unknown>;
    maxZoom?: number;
  }

  const props = withDefaults(defineProps<MapLayerClusterProps>(), {
    clusterRadius: 50,
    clusterMaxZoom: 14,
    clusterMinPoints: 2,
  });

  const emit = defineEmits<{
    clusterClick: [clusterId: number, coordinates: [number, number]];
    pointClick: [feature: GeoJSON.Feature, coordinates: [number, number]];
  }>();
</script>

<template>
  <VLayerMaplibreCluster
    :id="props.id"
    :data="props.data"
    :cluster-radius="props.clusterRadius"
    :cluster-max-zoom="props.clusterMaxZoom"
    :cluster-min-points="props.clusterMinPoints"
    :cluster-properties="props.clusterProperties"
    :max-zoom="props.maxZoom"
    @cluster-click="(id, coords) => emit('clusterClick', id, coords)"
    @point-click="(feature, coords) => emit('pointClick', feature, coords)"
  ></VLayerMaplibreCluster>
</template>
