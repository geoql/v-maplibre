<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { IconLayer } from '@deck.gl/layers';
  import type { IconLayerProps } from '@deck.gl/layers';
  import type { PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import type { Color } from '../_shared/types';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface IconMapping {
    [key: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
      anchorX?: number;
      anchorY?: number;
      mask?: boolean;
    };
  }

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getIcon?: Accessor<D, string | object>;
    getSize?: Accessor<D, number>;
    getColor?: Accessor<D, Color>;
    getAngle?: Accessor<D, number>;
    iconAtlas?: string;
    iconMapping?: IconMapping | string;
    sizeScale?: number;
    sizeUnits?: 'meters' | 'common' | 'pixels';
    sizeMinPixels?: number;
    sizeMaxPixels?: number;
    billboard?: boolean;
    alphaCutoff?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    sizeScale: 1,
    sizeUnits: 'pixels',
    sizeMinPixels: 0,
    sizeMaxPixels: Number.MAX_SAFE_INTEGER,
    billboard: true,
    alphaCutoff: 0.05,
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
    return new IconLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getIcon: props.getIcon ?? 'marker',
      getSize: props.getSize ?? 1,
      getColor: props.getColor ?? [255, 255, 255, 255],
      getAngle: props.getAngle ?? 0,
      iconAtlas: props.iconAtlas,
      iconMapping: props.iconMapping,
      sizeScale: props.sizeScale,
      sizeUnits: props.sizeUnits,
      sizeMinPixels: props.sizeMinPixels,
      sizeMaxPixels: props.sizeMaxPixels,
      billboard: props.billboard,
      alphaCutoff: props.alphaCutoff,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as IconLayerProps);
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
      props.getIcon,
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
