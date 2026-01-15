<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import { WindParticleLayer, generateWindTexture } from 'maplibre-gl-wind';
  import type { ColorStop, WindDataPoint } from 'maplibre-gl-wind';
  import type { Color } from '../_shared/types';

  interface Props {
    id: string;
    imageUrl?: string;
    windData?: WindDataPoint[];
    bounds?: [number, number, number, number];
    uMin?: number;
    uMax?: number;
    vMin?: number;
    vMax?: number;
    numParticles?: number;
    maxAge?: number;
    speedFactor?: number;
    color?: Color;
    colorRamp?: ColorStop[];
    speedRange?: [number, number];
    width?: number;
    animate?: boolean;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    bounds: () => [-180, -90, 180, 90],
    uMin: -50,
    uMax: 50,
    vMin: -50,
    vMax: 50,
    numParticles: 8192,
    maxAge: 30,
    speedFactor: 50,
    color: () => [255, 255, 255, 200] as Color,
    colorRamp: () =>
      [
        [0.0, [59, 130, 189, 255]],
        [0.1, [102, 194, 165, 255]],
        [0.2, [171, 221, 164, 255]],
        [0.3, [230, 245, 152, 255]],
        [0.4, [254, 224, 139, 255]],
        [0.5, [253, 174, 97, 255]],
        [0.6, [244, 109, 67, 255]],
        [1.0, [213, 62, 79, 255]],
      ] as ColorStop[],
    speedRange: () => [0, 30],
    width: 1.5,
    animate: true,
    opacity: 1,
    visible: true,
    pickable: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    loaded: [];
    error: [error: Error];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const isLayerAdded = ref(false);
  const currentImageUrl = ref<string | null>(null);
  const windMetadata = ref({
    uMin: props.uMin,
    uMax: props.uMax,
    vMin: props.vMin,
    vMax: props.vMax,
  });

  const imageUnscale = computed(() => {
    const uRange = windMetadata.value.uMax - windMetadata.value.uMin;
    const vRange = windMetadata.value.vMax - windMetadata.value.vMin;
    return [Math.min(uRange, vRange) * -1, Math.max(uRange, vRange)];
  });

  const createLayer = () => {
    if (!currentImageUrl.value) return null;

    return new WindParticleLayer({
      id: props.id,
      image: currentImageUrl.value,
      bounds: props.bounds,
      imageUnscale: imageUnscale.value,
      numParticles: props.numParticles,
      maxAge: props.maxAge,
      speedFactor: props.speedFactor,
      color: props.color,
      colorRamp: props.colorRamp,
      speedRange: props.speedRange,
      width: props.width,
      animate: props.animate,
      wrapLongitude: true,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    });
  };

  const processWindData = (data: WindDataPoint[]) => {
    try {
      const result = generateWindTexture(data, {
        width: 360,
        height: 180,
        bounds: props.bounds,
      });

      windMetadata.value = {
        uMin: result.uMin,
        uMax: result.uMax,
        vMin: result.vMin,
        vMax: result.vMax,
      };

      currentImageUrl.value = result.canvas.toDataURL('image/png');
      return true;
    } catch (err) {
      emit('error', err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  const initializeLayer = () => {
    if (props.windData && props.windData.length > 0) {
      if (!processWindData(props.windData)) return;
    } else if (props.imageUrl) {
      currentImageUrl.value = props.imageUrl;
      windMetadata.value = {
        uMin: props.uMin,
        uMax: props.uMax,
        vMin: props.vMin,
        vMax: props.vMax,
      };
    } else {
      return;
    }

    const layer = createLayer();
    if (layer) {
      addLayer(layer);
      isLayerAdded.value = true;
      emit('loaded');
    }
  };

  const updateWindLayer = () => {
    if (!isLayerAdded.value) return;

    const layer = createLayer();
    if (layer) {
      updateLayer(props.id, layer);
    }
  };

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', initializeLayer);
    }
  });

  watch(
    () => props.windData,
    (newData) => {
      if (newData && newData.length > 0) {
        if (processWindData(newData)) {
          updateWindLayer();
        }
      }
    },
    { deep: true },
  );

  watch(
    () => props.imageUrl,
    (newUrl) => {
      if (newUrl && !props.windData) {
        currentImageUrl.value = newUrl;
        windMetadata.value = {
          uMin: props.uMin,
          uMax: props.uMax,
          vMin: props.vMin,
          vMax: props.vMax,
        };
        updateWindLayer();
      }
    },
  );

  watch(
    () => [
      props.numParticles,
      props.maxAge,
      props.speedFactor,
      props.color,
      props.colorRamp,
      props.speedRange,
      props.width,
      props.animate,
      props.opacity,
      props.visible,
    ],
    () => {
      updateWindLayer();
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
