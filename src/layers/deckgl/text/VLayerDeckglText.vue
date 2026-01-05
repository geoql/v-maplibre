<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { TextLayer } from '@deck.gl/layers';
  import type { TextLayerProps } from '@deck.gl/layers';
  import type { PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import type { Color } from '../_shared/types';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getText: Accessor<D, string>;
    getSize?: Accessor<D, number>;
    getColor?: Accessor<D, Color>;
    getAngle?: Accessor<D, number>;
    getTextAnchor?: Accessor<D, 'start' | 'middle' | 'end'>;
    getAlignmentBaseline?: Accessor<D, 'top' | 'center' | 'bottom'>;
    getPixelOffset?: Accessor<D, [number, number]>;
    getBackgroundColor?: Accessor<D, Color>;
    getBorderColor?: Accessor<D, Color>;
    getBorderWidth?: Accessor<D, number>;
    background?: boolean;
    backgroundPadding?: [number, number] | [number, number, number, number];
    billboard?: boolean;
    sizeScale?: number;
    sizeUnits?: 'meters' | 'common' | 'pixels';
    sizeMinPixels?: number;
    sizeMaxPixels?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    lineHeight?: number;
    fontSettings?: object;
    wordBreak?: 'break-all' | 'break-word';
    maxWidth?: number;
    outlineWidth?: number;
    outlineColor?: Color;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    background: false,
    billboard: true,
    sizeScale: 1,
    sizeUnits: 'pixels',
    sizeMinPixels: 0,
    sizeMaxPixels: Number.MAX_SAFE_INTEGER,
    fontFamily: 'Monaco, monospace',
    fontWeight: 'normal',
    lineHeight: 1,
    wordBreak: 'break-word',
    maxWidth: -1,
    outlineWidth: 0,
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
    return new TextLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getText: props.getText,
      getSize: props.getSize ?? 32,
      getColor: props.getColor ?? [0, 0, 0, 255],
      getAngle: props.getAngle ?? 0,
      getTextAnchor: props.getTextAnchor ?? 'middle',
      getAlignmentBaseline: props.getAlignmentBaseline ?? 'center',
      getPixelOffset: props.getPixelOffset ?? [0, 0],
      getBackgroundColor: props.getBackgroundColor,
      getBorderColor: props.getBorderColor,
      getBorderWidth: props.getBorderWidth,
      background: props.background,
      backgroundPadding: props.backgroundPadding,
      billboard: props.billboard,
      sizeScale: props.sizeScale,
      sizeUnits: props.sizeUnits,
      sizeMinPixels: props.sizeMinPixels,
      sizeMaxPixels: props.sizeMaxPixels,
      fontFamily: props.fontFamily,
      fontWeight: props.fontWeight,
      lineHeight: props.lineHeight,
      fontSettings: props.fontSettings,
      wordBreak: props.wordBreak,
      maxWidth: props.maxWidth,
      outlineWidth: props.outlineWidth,
      outlineColor: props.outlineColor,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as TextLayerProps);
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
      props.getText,
      props.getSize,
      props.getColor,
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
