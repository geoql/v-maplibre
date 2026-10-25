<script setup lang="ts">
  import type {
    RasterSourceSpecification,
    RasterLayerSpecification,
    Map,
  } from 'maplibre-gl';
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
  import {
    injectStrict,
    MapKey,
    setLayoutProperties,
    setPaintProperties,
  } from '../../../utils';

  const props = defineProps<{
    sourceId: string;
    source: RasterSourceSpecification;
    layerId: string;
    layer: RasterLayerSpecification;
    before?: string;
  }>();

  const map = injectStrict(MapKey);

  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  // Track if layer has been initialized to prevent duplicate setup
  const initialized = ref(false);

  // Bound readiness handlers so they can be removed on unmount / map rebind.
  let boundMap: Map | null = null;
  let styleLoadHandler: (() => void) | null = null;
  let idleHandler: (() => void) | null = null;

  // Single, idempotent entry point. Adds the source + layer exactly once, but
  // only when the style is loaded. Safe to call from any trigger.
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
        // Always add with proper ordering
        mapInstance.addLayer(props.layer, props.before);

        // Set initial visibility
        if (props.layer.layout?.visibility) {
          mapInstance.setLayoutProperty(
            props.layerId,
            'visibility',
            props.layer.layout.visibility,
          );
        }
      }
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
    // The style must be ready before sources/layers can be mutated. When it is
    // not, tryAddLayer() (bound to style.load / idle) adds the CURRENT props
    // later, so the update is not lost.
    if (!mapInstance.isStyleLoaded()) return;

    try {
      // Store the current beforeId since we'll need to reuse it
      const beforeId = props.before;

      if (mapInstance.getLayer(props.layerId)) {
        mapInstance.removeLayer(props.layerId);
      }
      if (mapInstance.getSource(props.sourceId)) {
        mapInstance.removeSource(props.sourceId);
      }

      mapInstance.addSource(props.sourceId, props.source);
      const layerSpec = {
        ...props.layer,
        id: props.layerId,
        type: 'raster',
        source: props.sourceId,
      } as RasterLayerSpecification;

      // Explicitly check if the beforeId layer exists before adding
      if (beforeId && mapInstance.getLayer(beforeId)) {
        mapInstance.addLayer(layerSpec, beforeId);
      } else {
        mapInstance.addLayer(layerSpec);
      }
    } catch (error) {
      console.error('Error updating Raster source:', error);
    }
  };

  const updateLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(props.layerId)) {
        // Update paint properties
        setPaintProperties(mapInstance, props.layerId, props.layer.paint);

        // Update layout properties
        setLayoutProperties(mapInstance, props.layerId, props.layer.layout);
      }
    } catch (error) {
      console.error('Error updating Raster layer:', error);
    }
  };

  // Watchers
  watch(
    () => props.source.tiles?.[0], // Usually raster sources have a single tile URL
    (newTileUrl, oldTileUrl) => {
      if (newTileUrl !== oldTileUrl) {
        updateSource();
      }
    },
  );
  watch(() => props.layer, updateLayer, { deep: true });
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
    () => props.layer.layout?.visibility,
    (newVisibility) => {
      const mapInstance = getMapInstance();
      if (!mapInstance) return;

      const hasLayer = mapInstance.getLayer(props.layerId);

      if (!hasLayer) {
        // The layer is not on the map yet. Route through the idempotent,
        // style-guarded entry point instead of calling addLayer() directly:
        // MapLibre throws "Style is not done loading." for any mutation issued
        // before the style is parsed, and this watcher runs immediately at
        // mount — long before the style request resolves.
        tryAddLayer();
      } else {
        try {
          // Update visibility
          mapInstance.setLayoutProperty(
            props.layerId,
            'visibility',
            newVisibility,
          );

          // If becoming visible, ensure proper layer ordering
          if (newVisibility === 'visible' && props.before) {
            mapInstance.moveLayer(props.layerId, props.before);
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

      // Only move layer if it's visible
      if (props.layer.layout?.visibility === 'visible') {
        try {
          console.log(`[${props.layerId}] Moving layer before:`, newBefore);
          mapInstance.moveLayer(props.layerId, newBefore);
        } catch (error) {
          console.error(`[${props.layerId}] Error moving layer:`, error);
        }
      }
    },
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
