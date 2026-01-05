<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
  import type { SimpleMeshLayerProps } from '@deck.gl/mesh-layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    mesh: string | object;
    getPosition: Accessor<D, Position>;
    getColor?: Accessor<D, Color>;
    getOrientation?: Accessor<D, [number, number, number]>;
    getScale?: Accessor<D, [number, number, number] | number>;
    getTranslation?: Accessor<D, [number, number, number]>;
    getTransformMatrix?: Accessor<D, number[]>;
    texture?: string | object;
    sizeScale?: number;
    wireframe?: boolean;
    material?: boolean | object;
    loaders?: object[];
    loadOptions?: object;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    sizeScale: 1,
    wireframe: false,
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
    return new SimpleMeshLayer({
      id: props.id,
      data: props.data,
      mesh: props.mesh,
      getPosition: props.getPosition,
      getColor: props.getColor ?? [255, 255, 255, 255],
      getOrientation: props.getOrientation ?? [0, 0, 0],
      getScale: props.getScale ?? [1, 1, 1],
      getTranslation: props.getTranslation ?? [0, 0, 0],
      getTransformMatrix: props.getTransformMatrix,
      texture: props.texture,
      sizeScale: props.sizeScale,
      wireframe: props.wireframe,
      material: props.material,
      loaders: props.loaders,
      loadOptions: props.loadOptions,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as SimpleMeshLayerProps);
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
      props.mesh,
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
