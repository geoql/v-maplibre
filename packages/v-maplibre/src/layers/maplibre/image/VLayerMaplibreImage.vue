<script setup lang="ts">
  import type {
    LayerSpecification as AnyLayer,
    ImageSourceSpecification as ImageSourceRaw,
    ImageSource,
    Map,
  } from 'maplibre-gl';
  import type { PropType } from 'vue';
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
  import { injectStrict, MapKey } from '../../../utils';

  const props = defineProps({
    sourceId: {
      type: String,
      default: 'maplibre.gl-image-source',
    },
    layerId: {
      type: String,
      default: 'maplibre.gl-image-layer',
    },
    source: {
      type: Object as PropType<ImageSourceRaw>,
      required: true,
    },
    layer: {
      type: Object as PropType<AnyLayer>,
      default: () => ({}),
    },
    before: {
      type: String,
      default: '',
      required: false,
    },
  });

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
        } as AnyLayer;
        mapInstance.addLayer(layerSpec, props.before);
      }
      initialized.value = true;
      return true;
    } catch (error) {
      console.error('Error adding Image layer:', error);
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
      const source = mapInstance.getSource(props.sourceId) as ImageSource;
      if (source) {
        // For image sources, we need to update coordinates and url
        if (source.updateImage) {
          source.updateImage({
            url: props.source.url,
            coordinates: props.source.coordinates,
          });
        } else {
          // If updateImage is not available, remove and re-add the source and layer
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
          } as AnyLayer;
          mapInstance.addLayer(layerSpec, props.before);
        }
      }
    } catch (error) {
      console.error('Error updating Image source:', error);
    }
  };

  const updateLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(props.layerId)) {
        Object.entries(props.layer.paint || {}).forEach(([key, value]) => {
          mapInstance.setPaintProperty(props.layerId, key, value);
        });
        Object.entries(props.layer.layout || {}).forEach(([key, value]) => {
          mapInstance.setLayoutProperty(props.layerId, key, value);
        });
      }
    } catch (error) {
      console.error('Error updating Image layer:', error);
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
      console.error('Error cleaning up Image layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
