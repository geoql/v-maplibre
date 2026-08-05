<script setup lang="ts">
  import { onBeforeUnmount, onMounted, watch } from 'vue';
  import type { Map, RasterDEMSourceSpecification } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';

  interface Props {
    /** Id of the raster-dem source to drive `map.setTerrain`. */
    source: string;
    /**
     * Optional raster-dem source definition. When provided and no source with
     * the given id exists yet, VTerrain adds (and later removes) it itself,
     * so a single component enables 3D terrain end-to-end.
     */
    sourceSpec?: RasterDEMSourceSpecification;
    exaggeration?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    sourceSpec: undefined,
    exaggeration: 1,
  });

  const map = injectStrict(MapKey);

  let boundMap: Map | null = null;
  let styleLoadHandler: (() => void) | null = null;
  let idleHandler: (() => void) | null = null;
  let terrainSet = false;
  let addedSource = false;

  const tryEnableTerrain = (): boolean => {
    if (terrainSet) return true;

    const mapInstance = map.value;
    if (!mapInstance) return false;
    if (!mapInstance.isStyleLoaded()) return false;

    try {
      if (!mapInstance.getSource(props.source)) {
        // Without a spec we wait for a sibling component to add the source
        // (the idle handler keeps retrying until it appears).
        if (!props.sourceSpec) return false;
        mapInstance.addSource(props.source, props.sourceSpec);
        addedSource = true;
      }
      mapInstance.setTerrain({
        source: props.source,
        exaggeration: props.exaggeration,
      });
      terrainSet = true;
      return true;
    } catch (error) {
      console.error('[VTerrain] Error enabling terrain:', error);
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
      // A style swap wipes terrain state; re-enable against the new style.
      terrainSet = false;
      addedSource = false;
      tryEnableTerrain();
    };
    mapInstance.on('style.load', styleLoadHandler);

    idleHandler = () => {
      if (terrainSet) {
        if (idleHandler && boundMap) boundMap.off('idle', idleHandler);
        idleHandler = null;
        return;
      }
      tryEnableTerrain();
    };
    mapInstance.on('idle', idleHandler);

    tryEnableTerrain();
  };

  watch(
    map,
    (newMap) => {
      if (newMap) {
        bindReadyHandlers(newMap);
      } else {
        unbindReadyHandlers();
        terrainSet = false;
        addedSource = false;
      }
    },
    { immediate: true },
  );

  watch([() => props.exaggeration, () => props.source], () => {
    const mapInstance = map.value;
    if (!mapInstance || !terrainSet) return;
    try {
      mapInstance.setTerrain({
        source: props.source,
        exaggeration: props.exaggeration,
      });
    } catch (error) {
      console.error('[VTerrain] Error updating terrain:', error);
    }
  });

  onMounted(() => {
    tryEnableTerrain();
  });

  onBeforeUnmount(() => {
    unbindReadyHandlers();
    const mapInstance = map.value;
    if (!mapInstance) return;
    try {
      if (terrainSet) {
        mapInstance.setTerrain(null);
      }
      if (addedSource && mapInstance.getSource(props.source)) {
        mapInstance.removeSource(props.source);
      }
    } catch (error) {
      console.error('[VTerrain] Error during cleanup:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
