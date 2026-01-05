<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { BitmapLayer } from '@deck.gl/layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface Props {
    id: string;
    image:
      | string
      | HTMLImageElement
      | ImageBitmap
      | HTMLCanvasElement
      | ImageData
      | HTMLVideoElement;
    bounds:
      | [number, number, number, number]
      | [Position, Position, Position, Position];
    loadOptions?: object;
    textureParameters?: object;
    desaturate?: number;
    transparentColor?: Color;
    tintColor?: Color;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    desaturate: 0,
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
    return new BitmapLayer({
      id: props.id,
      image: props.image,
      bounds: props.bounds,
      loadOptions: props.loadOptions,
      textureParameters: props.textureParameters,
      desaturate: props.desaturate,
      transparentColor: props.transparentColor ?? [0, 0, 0, 0],
      tintColor: props.tintColor ?? [255, 255, 255],
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as unknown as ConstructorParameters<typeof BitmapLayer>[0]);
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
      props.image,
      props.bounds,
      props.desaturate,
      props.tintColor,
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
