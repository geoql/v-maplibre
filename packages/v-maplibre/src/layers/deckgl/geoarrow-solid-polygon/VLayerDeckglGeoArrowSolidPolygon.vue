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
  import { onBeforeUnmount, watch, shallowRef, markRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import { useMapReady } from '../_shared/useMapReady';
  import {
    extractPolygons,
    extractMultiPolygons,
    polygonsToRingArrays,
    filterDefined,
  } from '../_shared/arrow';
  import type { ArrowTableLike } from '../_shared/types';

  const SOLID_POLYGON_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers apache-arrow @math.gl/polygon';

  type Props = {
    id: string;
    data: ArrowTableLike | null | undefined;
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
    typeof import('@deck.gl/layers').SolidPolygonLayer | null
  >(null);

  const EXCLUDE = new Set(['id', 'data', 'getPolygon']);

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    const multi = extractMultiPolygons(props.data);
    const single = multi ? null : extractPolygons(props.data);
    const geom = multi ?? single;
    if (!geom) {
      console.error(
        '[VLayerDeckglGeoArrowSolidPolygon] no GeoArrow polygon / multipolygon column found in data',
      );
      return null;
    }
    const rings = polygonsToRingArrays(geom);
    try {
      const layer = new LayerClass.value({
        ...filterDefined(props as unknown as Record<string, unknown>, EXCLUDE),
        id: props.id,
        data: rings,
        getPolygon: (ring: number[][]) => ring,
        _normalize: false,
        onClick: (info: PickingInfo) => emit('click', info),
        onHover: (info: PickingInfo) => emit('hover', info),
      });
      return markRaw(layer);
    } catch (err) {
      console.error(
        '[VLayerDeckglGeoArrowSolidPolygon] failed to construct layer:',
        err,
      );
      return null;
    }
  };

  const initializeLayer = async () => {
    const mod = await requirePeer(
      '@deck.gl/layers',
      () => import('@deck.gl/layers'),
      SOLID_POLYGON_PEER_INSTALL,
    );
    LayerClass.value = markRaw(mod.SolidPolygonLayer);
  };

  useMapReady(map, initializeLayer);

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

  watch(
    () => [
      props.getFillColor,
      props.getLineColor,
      props.getElevation,
      props.extruded,
      props.wireframe,
      props.filled,
      props.elevationScale,
      props.opacity,
      props.visible,
      props.pickable,
    ],
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
