<script setup lang="ts">
  import type {
    CanvasSourceSpecification,
    LayerSpecification,
    Map,
  } from 'maplibre-gl';
  import type { Ref } from 'vue';
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
  import { injectStrict, MapKey } from '../../../utils';

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
        const layerSpec = {
          ...props.layer,
          id: props.layerId,
          source: props.sourceId,
        } as LayerSpecification;
        mapInstance.addLayer(layerSpec, props.before);
      }
    } catch (error) {
      console.error('Error adding Canvas layer:', error);
    }
  };

  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

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
        Object.entries(props.layer.paint || {}).forEach(([key, value]) => {
          mapInstance.setPaintProperty(props.layerId, key, value);
        });
        Object.entries(props.layer.layout || {}).forEach(([key, value]) => {
          mapInstance.setLayoutProperty(props.layerId, key, value);
        });
      }
    } catch (error) {
      console.error('Error updating Canvas layer:', error);
    }
  };

  // Watchers
  watch(() => props.source, updateSource, { deep: true });
  watch(() => props.layer, updateLayer, { deep: true });

  // Watch for map instance changes
  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
      }
    },
    { immediate: true },
  );

  // Watch loaded state
  watch(loaded, (value) => {
    if (value) {
      addLayer();
    }
  });

  // Lifecycle hooks
  onMounted(() => {
    const mapInstance = getMapInstance();
    if (mapInstance?.isStyleLoaded()) {
      addLayer();
    }
  });

  onBeforeUnmount(() => {
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
