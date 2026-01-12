<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { Tile3DLayer } from '@deck.gl/geo-layers';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface Props {
    id: string;
    data: string;
    loader?: object;
    loadOptions?: object;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    opacity?: number;
    visible?: boolean;
    pointSize?: number;
    getPointColor?: Color | ((d: unknown) => Color);
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    pointSize: 1,
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    tilesetLoad: [tileset: unknown];
    tileLoad: [tile: unknown];
    tileUnload: [tile: unknown];
    tileError: [error: Error, url: string, tile: unknown];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const createLayer = () => {
    const layerProps = {
      id: props.id,
      data: props.data,
      pointSize: props.pointSize,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
      onTilesetLoad: (tileset: unknown) => emit('tilesetLoad', tileset),
      onTileLoad: (tile: unknown) => emit('tileLoad', tile),
      onTileUnload: (tile: unknown) => emit('tileUnload', tile),
      onTileError: (error: Error, url: string, tile: unknown) =>
        emit('tileError', error, url, tile),
      // Only include optional props when defined to avoid deck.gl bugs
      ...(props.loader !== undefined && { loader: props.loader }),
      ...(props.loadOptions !== undefined && {
        loadOptions: props.loadOptions,
      }),
      ...(props.highlightColor !== undefined && {
        highlightColor: props.highlightColor,
      }),
      ...(props.getPointColor !== undefined && {
        getPointColor: props.getPointColor,
      }),
    };
    return new Tile3DLayer(
      layerProps as unknown as ConstructorParameters<typeof Tile3DLayer>[0],
    );
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
    () => [props.data, props.pointSize, props.opacity, props.visible],
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
