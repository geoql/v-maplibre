<script setup lang="ts">
  import type { Ref } from 'vue';
  import { onMounted, ref, watch } from 'vue';
  import type {
    Map,
    VectorSourceSpecification,
    LayerSpecification,
  } from 'maplibre-gl';
  import { mapLayerEvents } from '../../../constants/events';
  import { injectStrict, MapKey } from '../../../utils';

  const props = defineProps<{
    sourceId: string;
    source: VectorSourceSpecification;
    layerId: string;
    layer: LayerSpecification;
    before?: string;
  }>();
  const emit = defineEmits([...mapLayerEvents]);

  const map = injectStrict(MapKey);
  const loaded: Ref<boolean> = ref(false);

  // Helper function to safely get map instance
  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  // Setup functions
  const setupMap = (mapInstance: Map) => {
    if (!mapInstance) return;

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
    if (!mapInstance) return;

    try {
      if (!mapInstance.getSource(props.sourceId)) {
        mapInstance.addSource(props.sourceId, props.source);
      }
      if (!mapInstance.getLayer(props.layerId)) {
        // Always get a fresh beforeId when adding a layer
        if (props.layer.layout?.visibility === 'visible') {
          mapInstance.addLayer(props.layer, props.before);
        } else {
          // For hidden layers, just add them without worrying about order
          mapInstance.addLayer(props.layer);
        }
      }
    } catch (error) {
      console.error(`[${props.layerId}] Error setting up layer:`, error);
    }
  };
  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      const existingSource = mapInstance.getSource(props.sourceId);
      // Only update source if it has actually changed
      if (
        existingSource &&
        JSON.stringify(existingSource.serialize()) !==
          JSON.stringify(props.source)
      ) {
        if (mapInstance.getLayer(props.layerId)) {
          mapInstance.removeLayer(props.layerId);
        }
        mapInstance.removeSource(props.sourceId);
        mapInstance.addSource(props.sourceId, props.source);
        const layerSpec = {
          ...props.layer,
          id: props.layerId,
          source: props.sourceId,
        } as LayerSpecification;
        mapInstance.addLayer(layerSpec, props.before);
      }
    } catch (error) {
      console.error('Error updating vector source:', error);
    }
  };
  const updateLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(props.layerId)) {
        // Get current paint and layout properties
        const currentLayer = mapInstance.getLayer(props.layerId);
        const currentPaint = (currentLayer?.paint || {}) as Record<
          string,
          unknown
        >;
        const currentLayout = (currentLayer?.layout || {}) as Record<
          string,
          unknown
        >;

        // Only update properties that have changed
        Object.entries(props.layer.paint || {}).forEach(([key, value]) => {
          if (JSON.stringify(currentPaint[key]) !== JSON.stringify(value)) {
            mapInstance.setPaintProperty(props.layerId, key, value);
          }
        });

        Object.entries(props.layer.layout || {}).forEach(([key, value]) => {
          if (JSON.stringify(currentLayout[key]) !== JSON.stringify(value)) {
            mapInstance.setLayoutProperty(props.layerId, key, value);
          }
        });
      }
    } catch (error) {
      console.error('Error updating vector layer:', error);
    }
  };
  const setupLayerEvents = (mapInstance: Map) => {
    if (!mapInstance) return;

    try {
      mapLayerEvents.forEach((eventName) => {
        mapInstance.on(eventName, props.layerId, (e) => {
          if (eventName === 'mousemove') {
            mapInstance.getCanvas().style.cursor = 'pointer';
          }
          if (eventName === 'mouseleave') {
            mapInstance.getCanvas().style.cursor = '';
          }
          emit(eventName, e);
        });
      });
    } catch (error) {
      console.error('Error setting up layer events:', error);
    }
  };

  // Watchers
  watch(
    map,
    (newMap, oldMap) => {
      if (newMap && newMap !== oldMap) {
        setupMap(newMap);
      }
    },
    { immediate: true },
  );
  watch(loaded, (value) => {
    if (value) {
      const mapInstance = getMapInstance();
      if (!mapInstance) return;
      addLayer();
      setupLayerEvents(mapInstance);
    }
  });
  watch(
    () => JSON.stringify(props.source.tiles),
    (newTiles, oldTiles) => {
      if (newTiles !== oldTiles) {
        updateSource();
      }
    },
  );
  watch(
    () => ({
      paint: props.layer.paint,
      // Watch layout changes but exclude visibility since it's handled separately
      layout: props.layer.layout
        ? { ...props.layer.layout, visibility: undefined }
        : undefined,
    }),
    (newValue, oldValue) => {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        updateLayer();
      }
    },
    { deep: true },
  );
  watch(
    () => props.layer.layout?.visibility,
    (newVisibility) => {
      const mapInstance = getMapInstance();
      if (!mapInstance) return;

      const hasLayer = mapInstance.getLayer(props.layerId);

      if (!hasLayer) {
        // Add layer if it doesn't exist
        try {
          if (!mapInstance.getSource(props.sourceId)) {
            mapInstance.addSource(props.sourceId, props.source);
          }
          mapInstance.addLayer(props.layer, props.before);
        } catch (error) {
          console.error(`[${props.layerId}] Error adding layer:`, error);
        }
      } else {
        try {
          // Update visibility
          mapInstance.setLayoutProperty(
            props.layerId,
            'visibility',
            newVisibility,
          );

          // If becoming visible, ensure proper layer order
          if (newVisibility === 'visible' && props.before) {
            // Small timeout to ensure target layer is ready
            setTimeout(() => {
              mapInstance.moveLayer(props.layerId, props.before);
            }, 0);
          }
        } catch (error) {
          console.error(`[${props.layerId}] Error updating visibility:`, error);
        }
      }
    },
    { immediate: true },
  );
  watch(
    () => props.before,
    (newBefore) => {
      const mapInstance = getMapInstance();
      if (!mapInstance || !mapInstance.getLayer(props.layerId)) return;

      // Only move visible layers
      if (props.layer.layout?.visibility === 'visible') {
        try {
          mapInstance.moveLayer(props.layerId, newBefore);
        } catch (error) {
          console.error(
            `Error reordering vector layer ${props.layerId}:`,
            error,
          );
        }
      }
    },
  );
  watch(
    () => props.layer.layout?.visibility,
    (newVisibility) => {
      const mapInstance = getMapInstance();
      if (!mapInstance) return;

      const hasLayer = mapInstance.getLayer(props.layerId);

      if (!hasLayer) {
        // Only add layer if it doesn't exist
        try {
          if (!mapInstance.getSource(props.sourceId)) {
            mapInstance.addSource(props.sourceId, props.source);
          }
          mapInstance.addLayer(props.layer, props.before);
        } catch (error) {
          console.error(`[${props.layerId}] Error adding layer:`, error);
        }
      } else {
        // Just update visibility if layer exists
        try {
          mapInstance.setLayoutProperty(
            props.layerId,
            'visibility',
            newVisibility,
          );
        } catch (error) {
          console.error(`[${props.layerId}] Error updating visibility:`, error);
        }
      }
    },
    { immediate: true },
  );
  onMounted(() => {
    const mapInstance = getMapInstance();
    if (!mapInstance) {
      return;
    }
    try {
      addLayer();
    } catch (error) {
      console.error(`[${props.layerId}] Error setting up layer:`, error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
