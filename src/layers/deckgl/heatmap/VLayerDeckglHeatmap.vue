<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { HeatmapLayer } from '@deck.gl/aggregation-layers';
  import type { PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import type { Color } from '../_shared/types';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getWeight?: Accessor<D, number>;
    intensity?: number;
    radiusPixels?: number;
    colorRange?: Color[];
    threshold?: number;
    colorDomain?: [number, number];
    aggregation?: 'SUM' | 'MEAN';
    weightsTextureSize?: number;
    debounceTimeout?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    intensity: 1,
    radiusPixels: 30,
    threshold: 0.05,
    aggregation: 'SUM',
    weightsTextureSize: 2048,
    debounceTimeout: 500,
    opacity: 1,
    visible: true,
    pickable: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const createLayer = () => {
    return new HeatmapLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getWeight: props.getWeight ?? 1,
      intensity: props.intensity,
      radiusPixels: props.radiusPixels,
      colorRange: props.colorRange,
      threshold: props.threshold,
      colorDomain: props.colorDomain,
      aggregation: props.aggregation,
      weightsTextureSize: props.weightsTextureSize,
      debounceTimeout: props.debounceTimeout,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as unknown as ConstructorParameters<typeof HeatmapLayer>[0]);
  };

  const initializeLayer = () => {
    addLayer(createLayer());
  };

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', initializeLayer);
    }
  });

  watch(
    () => [
      props.data,
      props.getPosition,
      props.getWeight,
      props.intensity,
      props.radiusPixels,
      props.opacity,
      props.visible,
    ],
    () => updateLayer(props.id, createLayer()),
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
