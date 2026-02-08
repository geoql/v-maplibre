<script setup lang="ts">
  import { ref, watch, onBeforeUnmount } from 'vue';
  import type { Map } from 'maplibre-gl';
  import { MaplibreStarfieldLayer } from '@geoql/maplibre-gl-starfield';
  import { injectStrict, MapKey } from '../../../../utils';

  interface Props {
    /** Unique layer ID (default: 'starfield') */
    id?: string;
    /** Number of individual point stars (default: 4000) */
    starCount?: number;
    /** Base point size for stars (default: 2.0) */
    starSize?: number;
    /** Hex color for point stars (default: 0xffffff) */
    starColor?: number;
    /** URL to a panoramic galaxy/milky-way texture (equirectangular) */
    galaxyTextureUrl?: string;
    /** Brightness multiplier for the galaxy texture (default: 0.35) */
    galaxyBrightness?: number;
    /** Render this layer before the specified layer */
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: 'starfield',
    starCount: 4000,
    starSize: 2.0,
    starColor: 0xffffff,
    galaxyBrightness: 0.35,
  });

  const map = injectStrict(MapKey);
  const loaded = ref(false);
  let layerInstance: MaplibreStarfieldLayer | null = null;

  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    try {
      // Remove existing layer if present
      if (mapInstance.getLayer(props.id)) {
        mapInstance.removeLayer(props.id);
      }

      layerInstance = new MaplibreStarfieldLayer({
        id: props.id,
        starCount: props.starCount,
        starSize: props.starSize,
        starColor: props.starColor,
        galaxyTextureUrl: props.galaxyTextureUrl,
        galaxyBrightness: props.galaxyBrightness,
      });

      mapInstance.addLayer(layerInstance, props.before || undefined);
    } catch (error) {
      console.error('Error adding starfield layer:', error);
    }
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

  // Watch for map instance changes
  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
        if (newMap.isStyleLoaded()) {
          loaded.value = true;
        }
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

  // Lifecycle cleanup
  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(props.id)) {
        mapInstance.removeLayer(props.id);
      }
    } catch (error) {
      console.error('Error cleaning up starfield layer:', error);
    }
    layerInstance = null;
  });
</script>

<template>
  <slot></slot>
</template>
