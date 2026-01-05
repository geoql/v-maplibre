<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { GreatCircleLayer } from '@deck.gl/geo-layers';
  import type { GreatCircleLayerProps } from '@deck.gl/geo-layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getSourcePosition: Accessor<D, Position>;
    getTargetPosition: Accessor<D, Position>;
    getSourceColor?: Accessor<D, Color>;
    getTargetColor?: Accessor<D, Color>;
    getWidth?: Accessor<D, number>;
    getHeight?: Accessor<D, number>;
    getTilt?: Accessor<D, number>;
    numSegments?: number;
    widthUnits?: 'meters' | 'common' | 'pixels';
    widthScale?: number;
    widthMinPixels?: number;
    widthMaxPixels?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    numSegments: 50,
    widthUnits: 'pixels',
    widthScale: 1,
    widthMinPixels: 0,
    widthMaxPixels: Number.MAX_SAFE_INTEGER,
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
    return new GreatCircleLayer({
      id: props.id,
      data: props.data,
      getSourcePosition: props.getSourcePosition,
      getTargetPosition: props.getTargetPosition,
      getSourceColor: props.getSourceColor ?? [0, 0, 255],
      getTargetColor: props.getTargetColor ?? [0, 255, 0],
      getWidth: props.getWidth ?? 1,
      getHeight: props.getHeight ?? 1,
      getTilt: props.getTilt ?? 0,
      numSegments: props.numSegments,
      widthUnits: props.widthUnits,
      widthScale: props.widthScale,
      widthMinPixels: props.widthMinPixels,
      widthMaxPixels: props.widthMaxPixels,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as GreatCircleLayerProps);
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
      props.getSourcePosition,
      props.getTargetPosition,
      props.getSourceColor,
      props.getTargetColor,
      props.getWidth,
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
