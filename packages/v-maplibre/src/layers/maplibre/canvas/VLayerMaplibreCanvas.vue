<script setup lang="ts">
  import type {
    CanvasSourceSpecification,
    LayerSpecification,
    Map,
  } from 'maplibre-gl';
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
  import {
    injectStrict,
    MapKey,
    setLayoutProperties,
    setPaintProperties,
  } from '../../../utils';

  const props = withDefaults(
    defineProps<{
      source: CanvasSourceSpecification;
      layer: LayerSpecification;
      sourceId?: string;
      layerId?: string;
      before?: string;
    }>(),
    {
      sourceId: 'maplibre.gl-canvas-source',
      layerId: 'maplibre.gl-canvas-layer',
      before: '',
    },
  );

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
        const layerSpec = {
          ...props.layer,
          id: props.layerId,
          source: props.sourceId,
        } as LayerSpecification;
        mapInstance.addLayer(layerSpec, props.before);
      }
      initialized.value = true;
      return true;
    } catch (error) {
      console.error('Error adding Canvas layer:', error);
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
      // For canvas sources, we need to remove and re-add both source and layer
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
        source: props.sourceId,
      } as LayerSpecification;
      mapInstance.addLayer(layerSpec, props.before);
    } catch (error) {
      console.error('Error updating Canvas source:', error);
    }
  };

  const updateLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(props.layerId)) {
        setPaintProperties(mapInstance, props.layerId, props.layer.paint);
        setLayoutProperties(mapInstance, props.layerId, props.layer.layout);
      }
    } catch (error) {
      console.error('Error updating Canvas layer:', error);
    }
  };

  // Watchers
  watch(() => props.source, updateSource, { deep: true });
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

  // Lifecycle hooks
  onMounted(() => {
    // Final attempt after mount, in case map + style were ready synchronously.
    tryAddLayer();
  });

  onBeforeUnmount(() => {
    unbindReadyHandlers();

    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(props.layerId)) {
        mapInstance.removeLayer(props.layerId);
      }
      if (mapInstance.getSource(props.sourceId)) {
        mapInstance.removeSource(props.sourceId);
      }
    } catch (error) {
      console.error('Error cleaning up Canvas layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
