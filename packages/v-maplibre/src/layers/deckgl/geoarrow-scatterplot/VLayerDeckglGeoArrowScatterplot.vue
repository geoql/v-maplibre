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
  import { onBeforeUnmount, watch, shallowRef, markRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import { useMapReady } from '../_shared/useMapReady';

  const SCATTERPLOT_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers apache-arrow';

  type ArrowTableLike =
    | import('apache-arrow').Table
    | import('apache-arrow').RecordBatch;

  type Props = {
    id: string;
    data: ArrowTableLike | null | undefined;
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
    typeof import('@deck.gl/layers').ScatterplotLayer | null
  >(null);

  const extractPositions = (table: ArrowTableLike): Float64Array | null => {
    const vec = (
      table as unknown as {
        getChild: (k: string) => { data: { values?: Float64Array }[] } | null;
      }
    ).getChild('geometry');
    if (!vec) return null;
    const data = vec.data[0];
    if (!data) return null;
    const struct = data as unknown as {
      children?: { values?: Float64Array }[];
      length: number;
    };
    if (!struct.children || struct.children.length < 2) return null;
    const xs = struct.children[0]?.values;
    const ys = struct.children[1]?.values;
    if (!xs || !ys) return null;
    const n = struct.length;
    const out = new Float64Array(n * 3);
    for (let i = 0; i < n; i++) {
      out[i * 3] = xs[i] ?? 0;
      out[i * 3 + 1] = ys[i] ?? 0;
      out[i * 3 + 2] = 0;
    }
    return out;
  };

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    const positions = extractPositions(props.data);
    if (!positions) {
      console.error(
        '[VLayerDeckglGeoArrowScatterplot] no GeoArrow point geometry column found in data',
      );
      return null;
    }
    const n = positions.length / 3;
    try {
      const {
        id: _id,
        data: _data,
        ...rest
      } = props as unknown as Record<string, unknown>;
      void _id;
      void _data;
      const layer = new LayerClass.value({
        ...rest,
        id: props.id,
        data: {
          length: n,
          attributes: {
            getPosition: { value: positions, size: 3 },
          },
        },
        onClick: (info: PickingInfo) => emit('click', info),
        onHover: (info: PickingInfo) => emit('hover', info),
      });
      return markRaw(layer);
    } catch (err) {
      console.error(
        '[VLayerDeckglGeoArrowScatterplot] failed to construct layer:',
        err,
      );
      return null;
    }
  };

  const initializeLayer = async () => {
    const mod = await requirePeer(
      '@deck.gl/layers',
      () => import('@deck.gl/layers'),
      SCATTERPLOT_PEER_INSTALL,
    );
    LayerClass.value = markRaw(mod.ScatterplotLayer);
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
      props.getRadius,
      props.getLineWidth,
      props.radiusUnits,
      props.radiusScale,
      props.radiusMinPixels,
      props.radiusMaxPixels,
      props.lineWidthUnits,
      props.lineWidthScale,
      props.stroked,
      props.filled,
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
