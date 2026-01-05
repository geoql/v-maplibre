<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { ScatterplotLayer } from '@deck.gl/layers';
  import type { ScatterplotLayerProps } from '@deck.gl/layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getRadius?: Accessor<D, number>;
    getFillColor?: Accessor<D, Color>;
    getLineColor?: Accessor<D, Color>;
    getLineWidth?: Accessor<D, number>;
    radiusUnits?: 'meters' | 'common' | 'pixels';
    radiusScale?: number;
    radiusMinPixels?: number;
    radiusMaxPixels?: number;
    lineWidthUnits?: 'meters' | 'common' | 'pixels';
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    stroked?: boolean;
    filled?: boolean;
    billboard?: boolean;
    antialiasing?: boolean;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    radiusUnits: 'meters',
    radiusScale: 1,
    radiusMinPixels: 0,
    radiusMaxPixels: Number.MAX_SAFE_INTEGER,
    lineWidthUnits: 'meters',
    lineWidthScale: 1,
    lineWidthMinPixels: 0,
    lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
    stroked: false,
    filled: true,
    billboard: false,
    antialiasing: true,
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
    return new ScatterplotLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getRadius: props.getRadius ?? 1,
      getFillColor: props.getFillColor ?? [255, 140, 0],
      getLineColor: props.getLineColor ?? [0, 0, 0],
      getLineWidth: props.getLineWidth ?? 1,
      radiusUnits: props.radiusUnits,
      radiusScale: props.radiusScale,
      radiusMinPixels: props.radiusMinPixels,
      radiusMaxPixels: props.radiusMaxPixels,
      lineWidthUnits: props.lineWidthUnits,
      lineWidthScale: props.lineWidthScale,
      lineWidthMinPixels: props.lineWidthMinPixels,
      lineWidthMaxPixels: props.lineWidthMaxPixels,
      stroked: props.stroked,
      filled: props.filled,
      billboard: props.billboard,
      antialiasing: props.antialiasing,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as ScatterplotLayerProps);
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
      props.getRadius,
      props.getFillColor,
      props.getLineColor,
      props.radiusScale,
      props.opacity,
      props.visible,
      props.stroked,
      props.filled,
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
