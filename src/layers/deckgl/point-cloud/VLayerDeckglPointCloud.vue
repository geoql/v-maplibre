<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { PointCloudLayer } from '@deck.gl/layers';
  import type { PointCloudLayerProps } from '@deck.gl/layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getColor?: Accessor<D, Color>;
    getNormal?: Accessor<D, [number, number, number]>;
    sizeUnits?: 'meters' | 'common' | 'pixels';
    pointSize?: number;
    material?: boolean | object;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    sizeUnits: 'pixels',
    pointSize: 10,
    opacity: 1,
    visible: true,
    pickable: true,
    autoHighlight: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const createLayer = () => {
    return new PointCloudLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getColor: props.getColor ?? [0, 0, 0, 255],
      getNormal: props.getNormal ?? [0, 0, 1],
      sizeUnits: props.sizeUnits,
      pointSize: props.pointSize,
      material: props.material,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as PointCloudLayerProps);
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
      props.getColor,
      props.pointSize,
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
