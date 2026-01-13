<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface Props {
    id: string;
    /**
     * GeoTIFF source - URL string, ArrayBuffer, Blob, or geotiff.js instance
     */
    geotiff: string | ArrayBuffer | Blob | object;
    /**
     * Custom parser for GeoTIFF geo keys (default: uses epsg.io)
     */
    geoKeysParser?: (geoKeys: object) => Promise<string>;
    /**
     * Custom tile data loader (overrides default COG tile loading)
     */
    getTileData?: (params: object) => Promise<unknown>;
    /**
     * Custom render pipeline (overrides inferred pipeline from metadata)
     */
    renderTile?: (params: object) => unknown;
    /**
     * Tile size in pixels
     */
    tileSize?: number;
    /**
     * Maximum zoom level
     */
    maxZoom?: number;
    /**
     * Minimum zoom level
     */
    minZoom?: number;
    /**
     * Maximum number of tiles to cache
     */
    maxCacheSize?: number;
    /**
     * Refinement strategy for tile loading
     */
    refinementStrategy?: 'best-available' | 'no-overlap' | 'never';
    /**
     * Maximum concurrent requests
     */
    maxRequests?: number;
    /**
     * Layer opacity (0-1)
     */
    opacity?: number;
    /**
     * Layer visibility
     */
    visible?: boolean;
    /**
     * Enable picking on this layer
     */
    pickable?: boolean;
    /**
     * Auto highlight on hover
     */
    autoHighlight?: boolean;
    /**
     * Highlight color when autoHighlight is enabled
     */
    highlightColor?: Color;
    /**
     * Insert layer before this layer id
     */
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    tileSize: 256,
    minZoom: 0,
    refinementStrategy: 'best-available',
    maxRequests: 6,
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

  // Store the COGLayer class once imported
  const COGLayerClass = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').COGLayer | null
  >(null);

  const createLayer = () => {
    if (!COGLayerClass.value) return null;

    // Only include defined props to avoid overriding library defaults
    const layerProps: Record<string, unknown> = {
      id: props.id,
      geotiff: props.geotiff,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
      onViewportLoad: (tiles: unknown[]) => emit('viewportLoad', tiles),
      onTileLoad: (tile: unknown) => emit('tileLoad', tile),
      onTileUnload: (tile: unknown) => emit('tileUnload', tile),
      onTileError: (error: Error, tile: unknown) =>
        emit('tileError', error, tile),
    };

    // Only add optional props if they are defined
    if (props.geoKeysParser !== undefined)
      layerProps.geoKeysParser = props.geoKeysParser;
    if (props.getTileData !== undefined)
      layerProps.getTileData = props.getTileData;
    if (props.renderTile !== undefined)
      layerProps.renderTile = props.renderTile;
    if (props.tileSize !== undefined) layerProps.tileSize = props.tileSize;
    if (props.maxZoom !== undefined) layerProps.maxZoom = props.maxZoom;
    if (props.minZoom !== undefined) layerProps.minZoom = props.minZoom;
    if (props.maxCacheSize !== undefined)
      layerProps.maxCacheSize = props.maxCacheSize;
    if (props.refinementStrategy !== undefined)
      layerProps.refinementStrategy = props.refinementStrategy;
    if (props.maxRequests !== undefined)
      layerProps.maxRequests = props.maxRequests;
    if (props.highlightColor !== undefined)
      layerProps.highlightColor = props.highlightColor;
    if (props.beforeId !== undefined) layerProps.beforeId = props.beforeId;

    return new COGLayerClass.value(
      layerProps as ConstructorParameters<
        typeof import('@developmentseed/deck.gl-geotiff').COGLayer
      >[0],
    );
  };

  const initializeLayer = async () => {
    try {
      const module = await import('@developmentseed/deck.gl-geotiff');
      COGLayerClass.value = module.COGLayer;
      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading COGLayer:', error);
    }
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
      props.geotiff,
      props.tileSize,
      props.maxZoom,
      props.minZoom,
      props.opacity,
      props.visible,
    ],
    () => {
      const layer = createLayer();
      if (layer) {
        updateLayer(props.id, layer);
      }
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
