<script setup lang="ts">
  /**
   * Render filled polygons with optional stroke from an Apache Arrow
   * `RecordBatch` containing GeoArrow polygon geometries (extension type
   * `geoarrow.polygon` or `geoarrow.multipolygon`).
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/layers`
   * @requires `@deck.gl/mapbox`
   * @requires `@geoarrow/deck.gl-geoarrow`
   * @requires `apache-arrow`
   * @requires `@math.gl/polygon`
   *
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @geoarrow/deck.gl-geoarrow apache-arrow @math.gl/polygon`
   */
  import { onMounted, onBeforeUnmount, watch, shallowRef, markRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const GEOARROW_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @geoarrow/deck.gl-geoarrow apache-arrow @math.gl/polygon';

  type Props = {
    id: string;
    data: import('apache-arrow').RecordBatch;
    getPolygon?: unknown;
    getFillColor?: unknown;
    getLineColor?: unknown;
    getLineWidth?: unknown;
    getElevation?: unknown;
    lineWidthUnits?: 'meters' | 'common' | 'pixels';
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    stroked?: boolean;
    filled?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    elevationScale?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    beforeId?: string;
  };

  const props = defineProps<Props>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const LayerClass = shallowRef<
    typeof import('@geoarrow/deck.gl-geoarrow').GeoArrowPolygonLayer | null
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
    LayerClass.value = markRaw(mod.GeoArrowPolygonLayer);
    const layer = createLayer();
    if (layer) addLayer(layer);
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

  watch(
    () => [
      props.data,
      props.getPolygon,
      props.getFillColor,
      props.getLineColor,
      props.getLineWidth,
      props.getElevation,
      props.opacity,
      props.visible,
      props.stroked,
      props.filled,
      props.extruded,
      props.wireframe,
    ],
    () => {
      if (!LayerClass.value) return;
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
