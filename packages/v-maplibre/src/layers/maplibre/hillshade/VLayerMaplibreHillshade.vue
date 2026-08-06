<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import type {
    HillshadeLayerSpecification,
    Map,
    RasterDEMSourceSpecification,
  } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';

  interface Props {
    sourceId?: string;
    layerId?: string;
    source: RasterDEMSourceSpecification;
    layer?: Partial<HillshadeLayerSpecification>;
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    sourceId: 'maplibre.gl-hillshade-source',
    layerId: 'maplibre.gl-hillshade-layer',
    layer: () => ({}) as Partial<HillshadeLayerSpecification>,
    before: '',
  });

  const map = injectStrict(MapKey);

  const initialized = ref(false);

  let boundMap: Map | null = null;
  let styleLoadHandler: (() => void) | null = null;
  let idleHandler: (() => void) | null = null;

  const buildLayerSpec = (): HillshadeLayerSpecification =>
    ({
      ...props.layer,
      id: props.layerId,
      type: 'hillshade',
      source: props.sourceId,
    }) as HillshadeLayerSpecification;

  const tryAddLayer = (): boolean => {
    if (initialized.value) return true;

    const mapInstance = map.value;
    if (!mapInstance) return false;
    if (!mapInstance.isStyleLoaded()) return false;

    try {
      if (!mapInstance.getSource(props.sourceId)) {
        mapInstance.addSource(props.sourceId, props.source);
      }
      if (!mapInstance.getLayer(props.layerId)) {
        if (props.before && mapInstance.getLayer(props.before)) {
          mapInstance.addLayer(buildLayerSpec(), props.before);
        } else {
          mapInstance.addLayer(buildLayerSpec());
        }
      }
      initialized.value = true;
      return true;
    } catch (error) {
      console.error(`[${props.layerId}] Error setting up hillshade:`, error);
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
      initialized.value = false;
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

    tryAddLayer();
  };

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

  watch(
    () => props.layer,
    () => {
      const mapInstance = map.value;
      if (!mapInstance || !mapInstance.getLayer(props.layerId)) return;
      try {
        const paint = props.layer.paint ?? {};
        for (const [key, value] of Object.entries(paint)) {
          mapInstance.setPaintProperty(props.layerId, key, value);
        }
        const layout = props.layer.layout ?? {};
        for (const [key, value] of Object.entries(layout)) {
          mapInstance.setLayoutProperty(props.layerId, key, value);
        }
      } catch (error) {
        console.error(`[${props.layerId}] Error updating hillshade:`, error);
      }
    },
    { deep: true },
  );

  onMounted(() => {
    tryAddLayer();
  });

  onBeforeUnmount(() => {
    unbindReadyHandlers();
    const mapInstance = map.value;
    if (!mapInstance) return;
    try {
      if (mapInstance.getLayer(props.layerId)) {
        mapInstance.removeLayer(props.layerId);
      }
      if (mapInstance.getSource(props.sourceId)) {
        mapInstance.removeSource(props.sourceId);
      }
    } catch (error) {
      console.error(`[${props.layerId}] Error during cleanup:`, error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
