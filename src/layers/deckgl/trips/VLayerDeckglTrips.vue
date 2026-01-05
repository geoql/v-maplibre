<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { TripsLayer } from '@deck.gl/geo-layers';
  import type { TripsLayerProps } from '@deck.gl/geo-layers';
  import type { PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import type { Color } from '../_shared/types';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPath: Accessor<D, Position[]>;
    getTimestamps?: Accessor<D, number[]>;
    getColor?: Accessor<D, Color>;
    getWidth?: Accessor<D, number>;
    currentTime?: number;
    trailLength?: number;
    fadeTrail?: boolean;
    widthUnits?: 'meters' | 'common' | 'pixels';
    widthScale?: number;
    widthMinPixels?: number;
    widthMaxPixels?: number;
    capRounded?: boolean;
    jointRounded?: boolean;
    billboard?: boolean;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    currentTime: 0,
    trailLength: 120,
    fadeTrail: true,
    widthUnits: 'pixels',
    widthScale: 1,
    widthMinPixels: 0,
    widthMaxPixels: Number.MAX_SAFE_INTEGER,
    capRounded: false,
    jointRounded: false,
    billboard: false,
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
    return new TripsLayer({
      id: props.id,
      data: props.data,
      getPath: props.getPath,
      getTimestamps: props.getTimestamps,
      getColor: props.getColor ?? [253, 128, 93],
      getWidth: props.getWidth ?? 1,
      currentTime: props.currentTime,
      trailLength: props.trailLength,
      fadeTrail: props.fadeTrail,
      widthUnits: props.widthUnits,
      widthScale: props.widthScale,
      widthMinPixels: props.widthMinPixels,
      widthMaxPixels: props.widthMaxPixels,
      capRounded: props.capRounded,
      jointRounded: props.jointRounded,
      billboard: props.billboard,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as TripsLayerProps);
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
      props.getPath,
      props.currentTime,
      props.trailLength,
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
