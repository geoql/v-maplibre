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

  const POLYGON_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers apache-arrow @math.gl/polygon';

  type Props = {
    id: string;
    data: ArrowTableLike | null | undefined;
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
    earcutWorkerUrl?: string | URL | null;
    /** Normalize polygons that cross the antimeridian. Default: true. */
    _normalize?: boolean;
    /** Wrap polygons across the antimeridian. Default: true. */
    wrapLongitude?: boolean;
  };

  const props = withDefaults(defineProps<Props>(), {
    visible: true,
    pickable: false,
    autoHighlight: false,
    stroked: true,
    filled: true,
    extruded: false,
    wireframe: false,
    // _normalize default left undefined — GeoArrow native data is already
    // normalized; setting true causes deck.gl to re-normalize Struct-based
    // coords and produces stretched polygons.
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const LayerClass = shallowRef<
    typeof import('@deck.gl/layers').PolygonLayer | null
  >(null);

  const EXCLUDE = new Set([
    'id',
    'data',
    'getPolygon',
    'earcutWorkerUrl',
    '_normalize',
  ]);

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    const multi = extractMultiPolygons(props.data);
    const single = multi ? null : extractPolygons(props.data);
    const geom = multi ?? single;
    if (!geom) {
      console.error(
        '[VLayerDeckglGeoArrowPolygon] no GeoArrow polygon / multipolygon column found in data',
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
        '[VLayerDeckglGeoArrowPolygon] failed to construct layer:',
        err,
      );
      return null;
    }
  };

  const initializeLayer = async () => {
    const mod = await requirePeer(
      '@deck.gl/layers',
      () => import('@deck.gl/layers'),
      POLYGON_PEER_INSTALL,
    );
    LayerClass.value = markRaw(mod.PolygonLayer);
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

  // Reactive props that should rebuild the layer when changed (extruded toggle,
  // elevation slider, opacity slider, etc.). deck.gl Layer instances are
  // immutable — we have to recreate the layer on any reactive change.
  watch(
    () => [
      props.extruded,
      props.getElevation,
      props.elevationScale,
      props.opacity,
      props.stroked,
      props.filled,
      props.wireframe,
      props.getFillColor,
      props.getLineColor,
      props.getLineWidth,
      props.lineWidthMinPixels,
      props.lineWidthMaxPixels,
      props.lineWidthScale,
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
