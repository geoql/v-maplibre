<script setup lang="ts">
  import type {
    LayerSpecification as AnyLayer,
    ImageSourceSpecification as ImageSourceRaw,
    ImageSource,
    Map,
  } from 'maplibre-gl';
  import type { PropType, Ref } from 'vue';
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
  import { injectStrict, MapKey } from '../../../utils';

  const props = defineProps({
    sourceId: {
      type: String,
      default: 'maplibre.gl-image-source',
      required: true,
    },
    layerId: {
      type: String,
      default: 'maplibre.gl-image-layer',
      required: true,
    },
    source: {
      type: Object as PropType<ImageSourceRaw>,
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
      console.error('Error adding Image layer:', error);
    }
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
      console.error('Error cleaning up Image layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
