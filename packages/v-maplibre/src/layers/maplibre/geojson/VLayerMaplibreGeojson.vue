<!-- web/app/lib/v-mapbox/layers/maplibre/geojson/VLayerMaplibreGeojson.vue -->
<script setup lang="ts">
  import type { Ref } from 'vue';
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
  import type {
    GeoJSONSource,
    GeoJSONSourceSpecification,
    LayerSpecification,
    Map,
    MapLayerMouseEvent,
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
    layerId: string;
    source: GeoJSONSourceSpecification;
    layer: LayerSpecification;
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    sourceId: 'maplibre-gl-geojson-source',
    layerId: 'maplibre-gl-geojson-layer',
    before: '',
  });

  const emit = defineEmits<{
    'on-click': [event: LayerClick];
  }>();

  const map = injectStrict(MapKey);
  const loaded: Ref<boolean> = ref(false);

  // Helper to check if data is valid GeoJSON with features
  const hasValidData = (
    data: string | GeoJSON.GeoJSON | undefined,
  ): boolean => {
    if (!data || typeof data === 'string') return false;
    if (data && typeof data === 'object' && 'type' in data) {
      if (data.type === 'FeatureCollection' && 'features' in data) {
        return data.features.length > 0;
      }
      // Also valid for single Feature or Geometry
      return (
        data.type === 'Feature' ||
        data.type === 'Point' ||
        data.type === 'LineString' ||
        data.type === 'Polygon' ||
        data.type === 'MultiPoint' ||
        data.type === 'MultiLineString' ||
        data.type === 'MultiPolygon'
      );
    }
    return false;
  };

  // Helper function to safely get map instance
  const getMapInstance = (): Map | null => {
    const instance = map.value || null;
    return instance;
  };

  // Setup functions
  const setupMap = (mapInstance: Map) => {
    if (!mapInstance) {
      return;
    }

    mapInstance.on('style.load', () => {
      const styleTimeout = () => {
        if (!mapInstance.isStyleLoaded()) {
          loaded.value = false;
          setTimeout(styleTimeout, 200);
        } else {
          loaded.value = true;
        }
      };
      styleTimeout();
    });
  };

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.isStyleLoaded()) {
      return;
    }

    // For clustering support, wait for valid data before adding source/layer
    if (!hasValidData(props.source.data)) {
      console.log(
        `[${props.layerId}] Waiting for valid data before adding layer`,
      );
      return;
    }

    try {
      // Only add source if it doesn't exist
      if (!mapInstance.getSource(props.sourceId)) {
        mapInstance.addSource(props.sourceId, props.source);
      }

      // Only add layer if it doesn't exist
      if (!mapInstance.getLayer(props.layerId)) {
        const layerSpec = {
          ...props.layer,
          id: props.layerId,
          source: props.sourceId,
        } as LayerSpecification;

        mapInstance.addLayer(layerSpec, props.before);
      }
    } catch (error) {
      console.error('Error adding GeoJSON layer:', error);
    }
  };

  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      const source = mapInstance.getSource(props.sourceId) as
        | GeoJSONSource
        | undefined;

      if (source && 'setData' in source) {
        // CRITICAL FIX: Only update data if source doesn't have clustering
        // or if this is the first/primary layer for this source
        const existingLayers = mapInstance
          .getStyle()
          .layers.filter(
            (l) =>
              l.type !== 'background' &&
              'source' in l &&
              l.source === props.sourceId,
          );

        // Only update data if this is the first layer using this source
        // This prevents breaking clustering when multiple layers share a source
        if (
          existingLayers.length === 0 ||
          existingLayers[0]?.id === props.layerId
        ) {
          source.setData(props.source.data);
        }
      } else if (!source) {
        // If source doesn't exist, try to add the layer
        addLayer();
      }
    } catch (error) {
      console.error('Error updating GeoJSON source:', error);
    }
  };

  const updateLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(props.layerId)) {
        // Update paint properties
        Object.entries(props.layer.paint || {}).forEach(([key, value]) => {
          mapInstance.setPaintProperty(props.layerId, key, value);
        });
        // Update layout properties
        Object.entries(props.layer.layout || {}).forEach(([key, value]) => {
          mapInstance.setLayoutProperty(props.layerId, key, value);
        });
      } else {
        // If layer doesn't exist, try to add it
        addLayer();
      }
    } catch (error) {
      console.error('Error updating GeoJSON layer:', error);
    }
  };

  const setupLayerEvents = (mapInstance: Map) => {
    if (!mapInstance) {
      return;
    }

    try {
      // Add click handler for the specific layer
      mapInstance.on('click', props.layerId, (e: MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          emit('on-click', {
            features: e.features,
            coordinates: e.lngLat,
          });
        }
      });

      // Add hover effect to verify interactivity
      mapInstance.on('mouseenter', props.layerId, () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', props.layerId, () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    } catch (error) {
      console.error('Error in setupLayerEvents:', error);
    }
  };

  // Watchers - Modified to handle timing and prevent unnecessary updates
  watch(
    () => props.source,
    (newSource, oldSource) => {
      // Wait for valid data before doing anything
      if (!hasValidData(newSource?.data)) {
        return;
      }

      // Only update if the data actually changed
      if (JSON.stringify(newSource.data) !== JSON.stringify(oldSource?.data)) {
        const mapInstance = getMapInstance();
        if (mapInstance?.isStyleLoaded()) {
          // If source doesn't exist yet, add the whole layer
          if (!mapInstance.getSource(props.sourceId)) {
            addLayer();
          } else {
            // Source exists, just update data
            updateSource();
          }
        }
      }
    },
    { deep: true },
  );

  watch(() => props.layer, updateLayer, { deep: true });

  // Watch for map instance changes
  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
        // Check if style is already loaded
        if (newMap.isStyleLoaded()) {
          loaded.value = true;
        }
      }
    },
    { immediate: true },
  );

  // Watch loaded state - only add layer when we have valid data
  watch(loaded, (value) => {
    if (value && hasValidData(props.source.data)) {
      const mapInstance = getMapInstance();
      if (mapInstance) {
        addLayer();
        setupLayerEvents(mapInstance);
      }
    }
  });

  // Watch for visibility changes
  watch(
    () => props.layer.layout?.visibility,
    (newVisibility) => {
      const mapInstance = getMapInstance();
      if (!mapInstance || !mapInstance.isStyleLoaded()) return;

      const hasLayer = mapInstance.getLayer(props.layerId);

      if (!hasLayer && newVisibility === 'visible') {
        // Add layer if it doesn't exist and should be visible
        if (hasValidData(props.source.data)) {
          addLayer();
        }
      } else if (hasLayer) {
        // Update visibility of existing layer
        try {
          mapInstance.setLayoutProperty(
            props.layerId,
            'visibility',
            newVisibility,
          );
        } catch (error) {
          console.error(
            `Error updating visibility for ${props.layerId}:`,
            error,
          );
        }
      }
    },
    { immediate: true },
  );

  // Lifecycle hooks
  onMounted(() => {
    try {
      const mapInstance = getMapInstance();
      // Only add layer if map is ready AND we have valid data
      if (mapInstance?.isStyleLoaded() && hasValidData(props.source.data)) {
        addLayer();
      }
    } catch (error) {
      console.error('Error adding layer:', error);
    }
  });

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      // Remove layer
      if (mapInstance.getLayer(props.layerId)) {
        mapInstance.removeLayer(props.layerId);
      }

      // Only remove source if no other layers are using it
      const layersUsingSource = mapInstance
        .getStyle()
        .layers.filter(
          (l) =>
            l.type !== 'background' &&
            'source' in l &&
            l.source === props.sourceId,
        );

      if (
        layersUsingSource.length === 0 &&
        mapInstance.getSource(props.sourceId)
      ) {
        mapInstance.removeSource(props.sourceId);
      }
    } catch (error) {
      console.error('Error cleaning up GeoJSON layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
