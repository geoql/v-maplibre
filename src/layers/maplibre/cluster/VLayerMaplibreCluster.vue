<!-- web/app/lib/v-mapbox/layers/maplibre/cluster/VLayerMaplibreCluster.vue -->
<script setup lang="ts">
  import type { Ref } from 'vue';
  import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
  import type {
    GeoJSONSource,
    GeoJSONSourceSpecification,
    CircleLayerSpecification,
    SymbolLayerSpecification,
    Map,
    MapLayerMouseEvent,
    DataDrivenPropertyValueSpecification,
  } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';

  interface LayerClick {
    features: GeoJSON.Feature[];
    coordinates: {
      lng: number;
      lat: number;
    };
  }

  interface Props {
    sourceId: string;
    baseLayerId: string;
    source: GeoJSONSourceSpecification;
    visibility?: boolean;
    clusterPaint?: {
      colors?: string[];
      radii?: number[];
    };
    unclusteredPaint?: {
      color?: DataDrivenPropertyValueSpecification<string>;
      radius?: number;
    };
    textPaint?: {
      color?: string;
      font?: string[];
      size?: number;
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    sourceId: 'cluster-source',
    baseLayerId: 'cluster',
    visibility: true,
    clusterPaint: () => ({
      colors: ['#51bbd6', '#f1f075', '#f28cb1'],
      radii: [20, 30, 40],
    }),
    unclusteredPaint: () => ({
      color: '#51bbd6',
      radius: 6,
    }),
    textPaint: () => ({
      color: '#ffffff',
      font: ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      size: 12,
    }),
  });

  const emit = defineEmits<{
    'cluster-click': [event: LayerClick];
    'point-click': [event: LayerClick];
  }>();

  const map = injectStrict(MapKey);
  const loaded: Ref<boolean> = ref(false);

  // Layer IDs
  const clustersLayerId = computed(() => `${props.baseLayerId}-clusters`);
  const clusterCountLayerId = computed(
    () => `${props.baseLayerId}-cluster-count`,
  );
  const unclusteredLayerId = computed(
    () => `${props.baseLayerId}-unclustered-point`,
  );

  // Helper function to safely get map instance
  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  // Helper to check if data is valid GeoJSON with features
  const hasValidData = (data: string | GeoJSON.GeoJSON): boolean => {
    if (typeof data === 'string') return false;
    if (data && typeof data === 'object' && 'type' in data) {
      if (data.type === 'FeatureCollection' && 'features' in data) {
        return data.features.length > 0;
      }
    }
    return false;
  };

  // Add all cluster-related layers at once
  const addClusterLayers = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.isStyleLoaded()) {
      return;
    }

    try {
      // 1. Add source if it doesn't exist
      if (!mapInstance.getSource(props.sourceId)) {
        console.log(`Adding clustered source: ${props.sourceId}`);
        mapInstance.addSource(props.sourceId, {
          ...props.source,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });
      } else {
        // If source exists, update its data
        const source = mapInstance.getSource(props.sourceId) as GeoJSONSource;
        if (source && 'setData' in source) {
          source.setData(props.source.data);
        }
      }

      // 2. Add clusters layer
      if (!mapInstance.getLayer(clustersLayerId.value)) {
        console.log(`Adding clusters layer: ${clustersLayerId.value}`);
        mapInstance.addLayer({
          id: clustersLayerId.value,
          type: 'circle',
          source: props.sourceId,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              props.clusterPaint.colors![0]!,
              100,
              props.clusterPaint.colors![1]!,
              750,
              props.clusterPaint.colors![2]!,
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              props.clusterPaint.radii![0]!,
              100,
              props.clusterPaint.radii![1]!,
              750,
              props.clusterPaint.radii![2]!,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
          layout: {
            visibility: props.visibility ? 'visible' : 'none',
          },
        } as CircleLayerSpecification);
      }

      // 3. Add cluster count text layer
      if (!mapInstance.getLayer(clusterCountLayerId.value)) {
        console.log(`Adding cluster count layer: ${clusterCountLayerId.value}`);
        mapInstance.addLayer({
          id: clusterCountLayerId.value,
          type: 'symbol',
          source: props.sourceId,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': props.textPaint.font!,
            'text-size': props.textPaint.size!,
            visibility: props.visibility ? 'visible' : 'none',
          },
          paint: {
            'text-color': props.textPaint.color!,
          },
        } as SymbolLayerSpecification);
      }

      // 4. Add unclustered points layer
      if (!mapInstance.getLayer(unclusteredLayerId.value)) {
        console.log(
          `Adding unclustered points layer: ${unclusteredLayerId.value}`,
        );
        mapInstance.addLayer({
          id: unclusteredLayerId.value,
          type: 'circle',
          source: props.sourceId,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': props.unclusteredPaint.color!,
            'circle-radius': props.unclusteredPaint.radius!,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.95,
          },
          layout: {
            visibility: props.visibility ? 'visible' : 'none',
          },
        } as CircleLayerSpecification);
      }

      console.log(`All cluster layers added for ${props.baseLayerId}`);

      // Setup click handlers after layers are added
      setupLayerEvents(mapInstance);
    } catch (error) {
      console.error('Error adding cluster layers:', error);
    }
  };

  // Update source data
  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      const source = mapInstance.getSource(props.sourceId) as
        | GeoJSONSource
        | undefined;
      if (source && 'setData' in source) {
        console.log(`Updating source ${props.sourceId} with data`);
        source.setData(props.source.data);

        // After updating data, ensure all layers are properly added
        // This fixes the issue where layers might not render correctly with initial empty data
        setTimeout(() => {
          // Re-add layers if they're missing (this won't duplicate them)
          addClusterLayers();
        }, 100);
      } else if (!source) {
        // Source doesn't exist, add all layers
        addClusterLayers();
      }
    } catch (error) {
      console.error('Error updating source:', error);
    }
  };

  // Update visibility for all layers
  const updateVisibility = (visible: boolean): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    const visibility = visible ? 'visible' : 'none';

    [
      clustersLayerId.value,
      clusterCountLayerId.value,
      unclusteredLayerId.value,
    ].forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  };

  // Setup click handlers for layers
  const setupLayerEvents = (mapInstance: Map) => {
    if (!mapInstance) return;

    try {
      // Click handler for clusters
      mapInstance.on(
        'click',
        clustersLayerId.value,
        (e: MapLayerMouseEvent) => {
          if (e.features && e.features.length > 0) {
            emit('cluster-click', {
              features: e.features,
              coordinates: e.lngLat,
            });
          }
        },
      );

      // Click handler for individual points
      mapInstance.on(
        'click',
        unclusteredLayerId.value,
        (e: MapLayerMouseEvent) => {
          if (e.features && e.features.length > 0) {
            emit('point-click', {
              features: e.features,
              coordinates: e.lngLat,
            });
          }
        },
      );

      // Add hover effects
      [clustersLayerId.value, unclusteredLayerId.value].forEach((layerId) => {
        mapInstance.on('mouseenter', layerId, () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.on('mouseleave', layerId, () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      });
    } catch (error) {
      console.error('Error setting up layer events:', error);
    }
  };

  // Setup map
  const setupMap = (mapInstance: Map) => {
    if (!mapInstance) return;

    mapInstance.on('style.load', () => {
      const checkStyleLoaded = () => {
        if (!mapInstance.isStyleLoaded()) {
          loaded.value = false;
          setTimeout(checkStyleLoaded, 200);
        } else {
          loaded.value = true;
          // Only add layers if we have data
          if (hasValidData(props.source.data)) {
            addClusterLayers();
          }
        }
      };
      checkStyleLoaded();
    });

    // If style is already loaded
    if (mapInstance.isStyleLoaded()) {
      loaded.value = true;
      // Only add layers if we have data
      if (hasValidData(props.source.data)) {
        addClusterLayers();
      }
    }
  };

  // Watchers
  watch(
    () => props.source.data,
    (newData) => {
      // Only proceed if we have actual data
      if (hasValidData(newData)) {
        const mapInstance = getMapInstance();
        if (mapInstance?.isStyleLoaded()) {
          // First time with data - add all layers
          if (!mapInstance.getSource(props.sourceId)) {
            addClusterLayers();
          } else {
            // Source exists, just update data
            updateSource();
          }
        }
      }
    },
    { deep: true, immediate: true },
  );

  watch(() => props.visibility, updateVisibility);

  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
      }
    },
    { immediate: true },
  );

  // Lifecycle
  onMounted(() => {
    const mapInstance = getMapInstance();
    // Only add layers if map is ready AND we have data
    if (mapInstance?.isStyleLoaded() && hasValidData(props.source.data)) {
      addClusterLayers();
    }
  });

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      // Remove click handlers
      [clustersLayerId.value, unclusteredLayerId.value].forEach((layerId) => {
        mapInstance.off('click', layerId, () => {});
        mapInstance.off('mouseenter', layerId, () => {});
        mapInstance.off('mouseleave', layerId, () => {});
      });

      // Remove all layers
      [
        clustersLayerId.value,
        clusterCountLayerId.value,
        unclusteredLayerId.value,
      ].forEach((layerId) => {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.removeLayer(layerId);
        }
      });

      // Remove source
      if (mapInstance.getSource(props.sourceId)) {
        mapInstance.removeSource(props.sourceId);
      }
    } catch (error) {
      console.error('Error cleaning up cluster layers:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
