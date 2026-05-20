<script setup lang="ts">
  /**
   * Render text labels from an Apache Arrow `RecordBatch` containing GeoArrow
   * point geometries.
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/layers`
   * @requires `@deck.gl/mapbox`
   * @requires `@geoarrow/deck.gl-geoarrow`
   * @requires `apache-arrow`
   */
  import { onMounted, onBeforeUnmount, watch, shallowRef, markRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const GEOARROW_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @geoarrow/deck.gl-geoarrow apache-arrow';

  type Props = {
    id: string;
    data: import('apache-arrow').RecordBatch | null | undefined;
    getPosition?: unknown;
    getText?: unknown;
    getColor?: unknown;
    getSize?: unknown;
    getAngle?: unknown;
    getTextAnchor?: unknown;
    getAlignmentBaseline?: unknown;
    sizeUnits?: 'meters' | 'common' | 'pixels';
    sizeScale?: number;
    sizeMinPixels?: number;
    sizeMaxPixels?: number;
    billboard?: boolean;
    fontFamily?: string;
    fontWeight?: number | string;
    characterSet?: 'auto' | string[] | Set<string>;
    background?: boolean;
    backgroundPadding?: [number, number] | [number, number, number, number];
    getBackgroundColor?: unknown;
    getBorderColor?: unknown;
    getBorderWidth?: unknown;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    beforeId?: string;
  };

  const props = withDefaults(defineProps<Props>(), {
    visible: true,
    pickable: false,
    autoHighlight: false,
    billboard: true,
    background: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const LayerClass = shallowRef<
    typeof import('@geoarrow/deck.gl-geoarrow')._GeoArrowTextLayer | null
  >(null);

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    try {
      return markRaw(
        new LayerClass.value({
          ...(props as object),
          id: props.id,
          onClick: (info: PickingInfo) => emit('click', info),
          onHover: (info: PickingInfo) => emit('hover', info),
        }),
      );
    } catch {
      return null;
    }
  };

  const initializeLayer = async () => {
    try {
      const mod = await requirePeer(
        '@geoarrow/deck.gl-geoarrow',
        () => import('@geoarrow/deck.gl-geoarrow'),
        GEOARROW_PEER_INSTALL,
      );
      LayerClass.value = markRaw(mod._GeoArrowTextLayer);
    } catch {
      // peer dep not installed — wrapper is inert
    }
  };

  onMounted(() => {
    // deck.gl layers (MapboxOverlay) don't need MapLibre style data but we
    // wait for the style to be loaded as a safety belt — matches all other
    // deck.gl wrappers in this library.
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', () => initializeLayer());
    }
  });

  watch(LayerClass, (cls) => {
    if (!cls || !props.data) return;
    const layer = createLayer();
    if (layer) addLayer(layer);
  });

  watch(
    () => props.data,
    () => {
      if (!LayerClass.value || !props.data) return;
      const layer = createLayer();
      if (layer) updateLayer(props.id, layer);
    },
  );

  onBeforeUnmount(() => removeLayer(props.id));
</script>

<template>
  <slot></slot>
</template>
