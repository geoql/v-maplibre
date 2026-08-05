<script setup lang="ts">
  import {
    onMounted,
    onBeforeUnmount,
    onWatcherCleanup,
    ref,
    watch,
  } from 'vue';
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

  // Helper function to safely get map instance
  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  // Track if layer has been initialized to prevent duplicate setup
  const initialized = ref(false);

  // Bound readiness handlers so they can be removed on unmount / map rebind.
  let boundMap: Map | null = null;
  let styleLoadHandler: (() => void) | null = null;
  let idleHandler: (() => void) | null = null;

  // Single, idempotent entry point. Adds the source + layer + events exactly
  // once, but only when the style is loaded. Safe to call from any trigger.
  const tryAddLayer = (): boolean => {
    if (initialized.value) return true;

    const mapInstance = getMapInstance();
    if (!mapInstance) return false;

    // Style must be ready before sources/layers can be added.
    if (!mapInstance.isStyleLoaded()) return false;

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
      setupLayerEvents(mapInstance);
      initialized.value = true;
      return true;
    } catch (error) {
      console.error(`[${props.layerId}] Error setting up layer:`, error);
      return false;
    }
  };

  // Bind readiness handlers exactly once, handling BOTH the "style.load fires
  // after we bind" case (style.load listener) AND the "style.load already fired
  // before we bind" case (synchronous attempt + idle fallback). This fixes the
  // production race where the basemap style loads before the layer mounts
  // (mapbox-gl-js#6707).
  const bindReadyHandlers = (mapInstance: Map): void => {
    if (boundMap === mapInstance) return;

    unbindReadyHandlers();
    boundMap = mapInstance;

    styleLoadHandler = () => {
      tryAddLayer();
    };
    mapInstance.on('style.load', styleLoadHandler);

    idleHandler = () => {
      if (initialized.value) {
        if (idleHandler && boundMap) boundMap.off('idle', idleHandler);
        idleHandler = null;
        return;
      }
      tryAddLayer();
    };
    mapInstance.on('idle', idleHandler);

    // Synchronous attempt for the already-fully-loaded case.
    tryAddLayer();
  };

  const unbindReadyHandlers = (): void => {
    if (boundMap) {
      if (styleLoadHandler) boundMap.off('style.load', styleLoadHandler);
      if (idleHandler) boundMap.off('idle', idleHandler);
    }
    boundMap = null;
    styleLoadHandler = null;
    idleHandler = null;
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
  // Watch for map instance changes. Immediate so an already-present map is
  // bound right away; bindReadyHandlers is idempotent and handles the
  // already-loaded style race internally.
  watch(
    map,
    (newMap) => {
      if (newMap) {
        bindReadyHandlers(newMap);
      } else {
        unbindReadyHandlers();
        initialized.value = false;
      }
    },
    { immediate: true },
  );
  watch(
    () => JSON.stringify(props.source.tiles),
    (newTiles, oldTiles) => {
      if (newTiles !== oldTiles) {
        updateSource();
      }
    },
  );
  watch(
    // Serialised so Vue compares by value: the getter would otherwise build a
    // fresh object every tick and re-fire on every unrelated reactive change.
    // Visibility is excluded because the watcher below handles it separately.
    () =>
      JSON.stringify({
        paint: props.layer.paint,
        layout: props.layer.layout
          ? { ...props.layer.layout, visibility: undefined }
          : undefined,
      }),
    () => {
      updateLayer();
    },
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
            const reorder = setTimeout(() => {
              mapInstance.moveLayer(props.layerId, props.before);
            }, 0);
            onWatcherCleanup(() => clearTimeout(reorder));
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
    // Final attempt after mount, in case map + style were ready synchronously.
    tryAddLayer();
  });

  onBeforeUnmount(() => {
    unbindReadyHandlers();
  });
</script>

<template>
  <slot></slot>
</template>
