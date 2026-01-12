<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { ScenegraphLayer } from '@deck.gl/mesh-layers';
  import type { ScenegraphLayerProps } from '@deck.gl/mesh-layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    scenegraph: string | object;
    getPosition: Accessor<D, Position>;
    getColor?: Accessor<D, Color>;
    getOrientation?: Accessor<D, [number, number, number]>;
    getScale?: Accessor<D, [number, number, number] | number>;
    getTranslation?: Accessor<D, [number, number, number]>;
    getTransformMatrix?: Accessor<D, number[]>;
    sizeScale?: number;
    sizeMinPixels?: number;
    sizeMaxPixels?: number;
    animator?: object;
    loaders?: object[];
    loadOptions?: object;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
    // Animation and lighting options
    _animations?: Record<
      string,
      { playing?: boolean; speed?: number; startTime?: number }
    >;
    _lighting?: 'flat' | 'pbr';
  }

  const props = withDefaults(defineProps<Props>(), {
    sizeScale: 1,
    sizeMinPixels: 0,
    sizeMaxPixels: Number.MAX_SAFE_INTEGER,
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
    // Build layer props object, excluding undefined optional props to avoid deck.gl bugs
    // where it tries to call undefined as a function (e.g., getTransformMatrix)
    const layerProps = {
      id: props.id,
      data: props.data,
      scenegraph: props.scenegraph,
      getPosition: props.getPosition,
      getColor: props.getColor ?? [255, 255, 255, 255],
      getOrientation: props.getOrientation ?? [0, 0, 0],
      getScale: props.getScale ?? [1, 1, 1],
      getTranslation: props.getTranslation ?? [0, 0, 0],
      sizeScale: props.sizeScale,
      sizeMinPixels: props.sizeMinPixels,
      sizeMaxPixels: props.sizeMaxPixels,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
      // Only include optional props if defined
      ...(props.getTransformMatrix !== undefined && {
        getTransformMatrix: props.getTransformMatrix,
      }),
      ...(props.animator !== undefined && { animator: props.animator }),
      ...(props.loaders !== undefined && { loaders: props.loaders }),
      ...(props.loadOptions !== undefined && {
        loadOptions: props.loadOptions,
      }),
      ...(props.highlightColor !== undefined && {
        highlightColor: props.highlightColor,
      }),
      ...(props.beforeId !== undefined && { beforeId: props.beforeId }),
      ...(props._animations !== undefined && {
        _animations: props._animations,
      }),
      ...(props._lighting !== undefined && { _lighting: props._lighting }),
    };

    return new ScenegraphLayer(layerProps as ScenegraphLayerProps);
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
      props.scenegraph,
      props.getPosition,
      props.getColor,
      props.getOrientation,
      props.getScale,
      props.sizeScale,
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
