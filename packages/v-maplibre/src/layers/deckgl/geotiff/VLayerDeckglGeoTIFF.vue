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
     * Custom render pipeline (overrides inferred pipeline from metadata)
     */
    renderTile?: (params: object) => unknown;
    /**
     * Geographic bounds [west, south, east, north]
     * If not provided, will be inferred from GeoTIFF metadata
     */
    bounds?: [number, number, number, number];
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
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    load: [];
    error: [error: Error];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  // Store the GeoTIFFLayer class once imported
  const GeoTIFFLayerClass = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').GeoTIFFLayer | null
  >(null);

  const createLayer = () => {
    if (!GeoTIFFLayerClass.value) return null;

    return new GeoTIFFLayerClass.value({
      id: props.id,
      geotiff: props.geotiff,
      geoKeysParser: props.geoKeysParser,
      renderTile: props.renderTile,
      bounds: props.bounds,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as ConstructorParameters<
      typeof import('@developmentseed/deck.gl-geotiff').GeoTIFFLayer
    >[0]);
  };

  const initializeLayer = async () => {
    try {
      const module = await import('@developmentseed/deck.gl-geotiff');
      GeoTIFFLayerClass.value = module.GeoTIFFLayer;
      const layer = createLayer();
      if (layer) {
        addLayer(layer);
        emit('load');
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading GeoTIFFLayer:', error);
      emit('error', error as Error);
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
    () => [props.geotiff, props.bounds, props.opacity, props.visible],
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
