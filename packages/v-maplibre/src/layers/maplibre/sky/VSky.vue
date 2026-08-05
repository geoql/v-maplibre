<script setup lang="ts">
  import { onBeforeUnmount, onMounted, watch } from 'vue';
  import type { Map, SkySpecification } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';

  interface Props {
    /**
     * MapLibre sky specification (`sky-color`, `horizon-color`, `fog-color`,
     * `sky-horizon-blend`, `horizon-fog-blend`, `fog-ground-blend`,
     * `atmosphere-blend`). Omit for MapLibre's default sky.
     */
    sky?: SkySpecification;
  }

  const props = withDefaults(defineProps<Props>(), {
    sky: () => ({}) as SkySpecification,
  });

  const map = injectStrict(MapKey);

  let boundMap: Map | null = null;
  let styleLoadHandler: (() => void) | null = null;
  let idleHandler: (() => void) | null = null;
  let applied = false;

  const trySetSky = (): boolean => {
    if (applied) return true;

    const mapInstance = map.value;
    if (!mapInstance) return false;
    if (!mapInstance.isStyleLoaded()) return false;

    try {
      mapInstance.setSky(props.sky);
      applied = true;
      return true;
    } catch (error) {
      console.error('[VSky] Error setting sky:', error);
      return false;
    }
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

  const bindReadyHandlers = (mapInstance: Map): void => {
    if (boundMap === mapInstance) return;

    unbindReadyHandlers();
    boundMap = mapInstance;

    styleLoadHandler = () => {
      applied = false;
      trySetSky();
    };
    mapInstance.on('style.load', styleLoadHandler);

    idleHandler = () => {
      if (applied) {
        if (idleHandler && boundMap) boundMap.off('idle', idleHandler);
        idleHandler = null;
        return;
      }
      trySetSky();
    };
    mapInstance.on('idle', idleHandler);

    trySetSky();
  };

  watch(
    map,
    (newMap) => {
      if (newMap) {
        bindReadyHandlers(newMap);
      } else {
        unbindReadyHandlers();
        applied = false;
      }
    },
    { immediate: true },
  );

  watch(
    () => props.sky,
    () => {
      const mapInstance = map.value;
      if (!mapInstance || !applied) return;
      try {
        mapInstance.setSky(props.sky);
      } catch (error) {
        console.error('[VSky] Error updating sky:', error);
      }
    },
    { deep: true },
  );

  onMounted(() => {
    trySetSky();
  });

  onBeforeUnmount(() => {
    unbindReadyHandlers();
    const mapInstance = map.value;
    if (!mapInstance || !applied) return;
    try {
      mapInstance.setSky(undefined);
    } catch (error) {
      console.error('[VSky] Error during cleanup:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
