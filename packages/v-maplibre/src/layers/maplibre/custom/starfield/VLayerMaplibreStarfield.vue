<script setup lang="ts">
  import { ref, watch, onBeforeUnmount } from 'vue';
  import type { Map } from 'maplibre-gl';
  import { MaplibreStarfieldLayer } from '@geoql/maplibre-gl-starfield';
  import { injectStrict, MapKey } from '../../../../utils';

  interface Props {
    id?: string;
    starCount?: number;
    starSize?: number;
    starColor?: number;
    galaxyTextureUrl?: string;
    galaxyBrightness?: number;
    before?: string;
    sunEnabled?: boolean;
    sunAzimuth?: number;
    sunAltitude?: number;
    sunSize?: number;
    sunColor?: number;
    sunIntensity?: number;
    autoFadeStars?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: 'starfield',
    starCount: 4000,
    starSize: 2.0,
    starColor: 0xffffff,
    galaxyBrightness: 0.35,
    sunEnabled: false,
    sunAzimuth: 180,
    sunAltitude: 45,
    sunSize: 100,
    sunColor: 0xffeeaa,
    sunIntensity: 1.5,
    autoFadeStars: true,
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
        sunEnabled: props.sunEnabled,
        sunAzimuth: props.sunAzimuth,
        sunAltitude: props.sunAltitude,
        sunSize: props.sunSize,
        sunColor: props.sunColor,
        sunIntensity: props.sunIntensity,
        autoFadeStars: props.autoFadeStars,
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

  watch(loaded, (value) => {
    if (value) {
      addLayer();
    }
  });

  watch(
    () => [props.sunAzimuth, props.sunAltitude],
    ([az, alt]) => {
      layerInstance?.setSunPosition(az as number, alt as number);
    },
  );

  watch(
    () => props.sunEnabled,
    (enabled) => {
      layerInstance?.setSunEnabled(enabled);
    },
  );

  watch(
    () => props.sunIntensity,
    (intensity) => {
      layerInstance?.setSunIntensity(intensity);
    },
  );

  watch(
    () => props.sunSize,
    (size) => {
      layerInstance?.setSunSize(size);
    },
  );

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
