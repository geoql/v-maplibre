<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { TerrainLayer } from '@deck.gl/geo-layers';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface Props {
    id: string;
    elevationData:
      | string
      | ((tileData: { x: number; y: number; z: number }) => string);
    texture?:
      | string
      | ((tileData: { x: number; y: number; z: number }) => string);
    meshMaxError?: number;
    elevationDecoder?: {
      rScaler: number;
      gScaler: number;
      bScaler: number;
      offset: number;
    };
    bounds?: [number, number, number, number];
    loadOptions?: object;
    workerUrl?: string;
    color?: Color;
    wireframe?: boolean;
    material?: boolean | object;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    meshMaxError: 4.0,
    wireframe: false,
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const createLayer = () => {
    return new TerrainLayer({
      id: props.id,
      elevationData: props.elevationData,
      texture: props.texture,
      meshMaxError: props.meshMaxError,
      elevationDecoder: props.elevationDecoder,
      bounds: props.bounds,
      loadOptions: props.loadOptions,
      workerUrl: props.workerUrl,
      color: props.color ?? [255, 255, 255],
      wireframe: props.wireframe,
      material: props.material,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as unknown as ConstructorParameters<typeof TerrainLayer>[0]);
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
      props.elevationData,
      props.texture,
      props.meshMaxError,
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
