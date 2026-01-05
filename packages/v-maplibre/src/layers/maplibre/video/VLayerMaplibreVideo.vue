<script setup lang="ts">
  import type {
    LayerSpecification as AnyLayer,
    VideoSourceSpecification,
    VideoSource,
    Map,
  } from 'maplibre-gl';
  import type { PropType, Ref } from 'vue';
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
  import { injectStrict, MapKey } from '../../../utils';

  const props = defineProps({
    sourceId: {
      type: String,
      default: 'maplibre.gl-video-source',
      required: true,
    },
    layerId: {
      type: String,
      default: 'maplibre.gl-video-layer',
      required: true,
    },
    source: {
      type: Object as PropType<VideoSourceSpecification>,
      required: true,
    },
    layer: {
      type: Object as PropType<AnyLayer>,
      default: () => ({}),
      required: true,
    },
    before: {
      type: String,
      default: '',
      required: false,
    },
  });

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
        } as AnyLayer;
        mapInstance.addLayer(layerSpec, props.before);
      }
    } catch (error) {
      console.error('Error adding Video layer:', error);
    }
  };

  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      const source = mapInstance.getSource(props.sourceId) as VideoSource;
      if (source) {
        // For video sources, we need to remove and re-add since there's no direct update method
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

        // Additional video-specific operations if needed
        if (source.getVideo) {
          const videoElement = source.getVideo();
          if (videoElement) {
            // Handle video element updates if needed
            videoElement.play().catch((error) => {
              console.error('Error playing video:', error);
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating Video source:', error);
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
      console.error('Error updating Video layer:', error);
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
      const source = mapInstance.getSource(props.sourceId) as VideoSource;
      if (source?.getVideo) {
        const videoElement = source.getVideo();
        if (videoElement) {
          // Stop and cleanup video if needed
          videoElement.pause();
          videoElement.remove();
        }
      }

      if (mapInstance.getLayer(props.layerId)) {
        mapInstance.removeLayer(props.layerId);
      }
      if (mapInstance.getSource(props.sourceId)) {
        mapInstance.removeSource(props.sourceId);
      }
    } catch (error) {
      console.error('Error cleaning up Video layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
