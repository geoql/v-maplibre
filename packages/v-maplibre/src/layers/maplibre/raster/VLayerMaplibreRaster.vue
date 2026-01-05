<script setup lang="ts">
  import type {
    RasterSourceSpecification,
    RasterLayerSpecification,
    Map,
  } from 'maplibre-gl';
  import type { Ref } from 'vue';
  import { onMounted, ref, watch } from 'vue';
  import { injectStrict, MapKey } from '../../../utils';

  const props = defineProps<{
    sourceId: string;
    source: RasterSourceSpecification;
    layerId: string;
    layer: RasterLayerSpecification;
    before?: string;
  }>();

  const map = injectStrict(MapKey);
  const loaded: Ref<boolean> = ref(false);

  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

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
    } catch (error) {
      console.error(`[${props.layerId}] Error setting up layer:`, error);
    }
  };

  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      // Store the current beforeId since we'll need to reuse it
      const beforeId = props.before;

      if (mapInstance.getLayer(props.layerId)) {
        mapInstance.removeLayer(props.layerId);
      }
      mapInstance.removeSource(props.sourceId);

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
        const paint = props.layer.paint || {};
        Object.entries(paint).forEach(([key, value]) => {
          mapInstance.setPaintProperty(props.layerId, key, value);
        });

        // Update layout properties
        const layout = props.layer.layout || {};
        Object.entries(layout).forEach(([key, value]) => {
          mapInstance.setLayoutProperty(props.layerId, key, value);
        });
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
  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
      }
    },
    { immediate: true },
  );
  watch(loaded, (value) => {
    if (value) {
      addLayer();
    }
  });
  watch(
    () => props.layer.layout?.visibility,
    (newVisibility) => {
      const mapInstance = getMapInstance();
      if (!mapInstance) return;

      const hasLayer = mapInstance.getLayer(props.layerId);

      if (!hasLayer) {
        // Add layer with proper ordering
        try {
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

  // Also add logging for source and layer setup
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
