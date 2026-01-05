<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { TileLayer } from '@deck.gl/geo-layers';
  import type { TileLayerProps } from '@deck.gl/geo-layers';
  import type { Color, PickingInfo, Layer } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface TileData {
    x: number;
    y: number;
    z: number;
    url: string;
    signal: AbortSignal;
    bbox: {
      west: number;
      north: number;
      east: number;
      south: number;
    };
  }

  interface Props {
    id: string;
    data?: string | string[] | ((tileData: TileData) => Promise<unknown>);
    getTileData?: (tileData: TileData) => Promise<unknown>;
    renderSubLayers?: (props: object) => Layer | Layer[] | null;
    tileSize?: number;
    maxZoom?: number;
    minZoom?: number;
    maxCacheSize?: number;
    maxCacheByteSize?: number;
    refinementStrategy?: 'best-available' | 'no-overlap' | 'never';
    zRange?: [number, number];
    maxRequests?: number;
    extent?: [number, number, number, number];
    loadOptions?: object;
    zoomOffset?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    tileSize: 512,
    minZoom: 0,
    refinementStrategy: 'best-available',
    maxRequests: 6,
    zoomOffset: 0,
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    viewportLoad: [tiles: unknown[]];
    tileLoad: [tile: unknown];
    tileUnload: [tile: unknown];
    tileError: [error: Error, tile: unknown];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const createLayer = () => {
    return new TileLayer({
      id: props.id,
      data: props.data,
      getTileData: props.getTileData,
      renderSubLayers: props.renderSubLayers,
      tileSize: props.tileSize,
      maxZoom: props.maxZoom,
      minZoom: props.minZoom,
      maxCacheSize: props.maxCacheSize,
      maxCacheByteSize: props.maxCacheByteSize,
      refinementStrategy: props.refinementStrategy,
      zRange: props.zRange,
      maxRequests: props.maxRequests,
      extent: props.extent,
      loadOptions: props.loadOptions,
      zoomOffset: props.zoomOffset,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
      onViewportLoad: (tiles: unknown[]) => emit('viewportLoad', tiles),
      onTileLoad: (tile: unknown) => emit('tileLoad', tile),
      onTileUnload: (tile: unknown) => emit('tileUnload', tile),
      onTileError: (error: Error, tile: unknown) =>
        emit('tileError', error, tile),
    } as TileLayerProps);
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
      props.tileSize,
      props.maxZoom,
      props.minZoom,
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
