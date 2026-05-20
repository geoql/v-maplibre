<script setup lang="ts">
  /**
   * Render extruded (3D) polygons from an Apache Arrow `RecordBatch` containing
   * GeoArrow polygon geometries (extension type `geoarrow.polygon` or
   * `geoarrow.multipolygon`).
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
    getElevation?: unknown;
    extruded?: boolean;
    wireframe?: boolean;
    filled?: boolean;
    elevationScale?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    metrics?: boolean;
    beforeId?: string;
  };

  const props = withDefaults(defineProps<Props>(), {
    visible: true,
    pickable: false,
    autoHighlight: false,
    extruded: false,
    wireframe: false,
    filled: true,
    metrics: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const LayerClass = shallowRef<
    typeof import('@geoarrow/deck.gl-geoarrow').GeoArrowSolidPolygonLayer | null
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
    LayerClass.value = markRaw(mod.GeoArrowSolidPolygonLayer);
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
