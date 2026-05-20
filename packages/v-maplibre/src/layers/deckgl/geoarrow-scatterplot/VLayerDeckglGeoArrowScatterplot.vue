<script setup lang="ts">
  /**
   * Render circles at coordinate positions from an Apache Arrow `RecordBatch`
   * containing GeoArrow point geometries (extension type `geoarrow.point` or
   * `geoarrow.multipoint`).
   *
   * Wraps `GeoArrowScatterplotLayer` from `@geoarrow/deck.gl-geoarrow`. Use this
   * when your data is already in Arrow IPC / GeoParquet format — it avoids the
   * GeoJSON-parse cost and ships hundreds of thousands of points directly to
   * the GPU.
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/layers`
   * @requires `@deck.gl/mapbox`
   * @requires `@geoarrow/deck.gl-geoarrow`
   * @requires `apache-arrow`
   *
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @geoarrow/deck.gl-geoarrow apache-arrow`
   */
  import { onMounted, onBeforeUnmount, watch, shallowRef, markRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const GEOARROW_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @geoarrow/deck.gl-geoarrow apache-arrow';

  type Props = {
    id: string;
    data: import('apache-arrow').RecordBatch;
    getPosition?: unknown;
    getRadius?: unknown;
    getFillColor?: unknown;
    getLineColor?: unknown;
    getLineWidth?: unknown;
    radiusUnits?: 'meters' | 'common' | 'pixels';
    radiusScale?: number;
    radiusMinPixels?: number;
    radiusMaxPixels?: number;
    lineWidthUnits?: 'meters' | 'common' | 'pixels';
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    stroked?: boolean;
    filled?: boolean;
    billboard?: boolean;
    antialiasing?: boolean;
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
    stroked: false,
    filled: true,
    billboard: false,
    antialiasing: true,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const LayerClass = shallowRef<
    typeof import('@geoarrow/deck.gl-geoarrow').GeoArrowScatterplotLayer | null
  >(null);

  const createLayer = () => {
    if (!LayerClass.value) return null;
    const layer = new LayerClass.value({
      ...(props as object),
      id: props.id,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    });
    return markRaw(layer);
  };

  const initializeLayer = async () => {
    const mod = await requirePeer(
      '@geoarrow/deck.gl-geoarrow',
      () => import('@geoarrow/deck.gl-geoarrow'),
      GEOARROW_PEER_INSTALL,
    );
    LayerClass.value = markRaw(mod.GeoArrowScatterplotLayer);
  };

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', () => {
        initializeLayer();
      });
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

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
