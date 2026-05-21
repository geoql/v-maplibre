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
  import { extractPoints, filterDefined } from '../_shared/arrow';
  import type { ArrowTableLike } from '../_shared/types';

  const SCATTERPLOT_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers apache-arrow';

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

  const EXCLUDE = new Set(['id', 'data']);

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    const extracted = extractPoints(props.data);
    if (!extracted) {
      console.error(
        '[VLayerDeckglGeoArrowScatterplot] no GeoArrow point geometry column found in data',
      );
      return null;
    }
    try {
      const layer = new LayerClass.value({
        ...filterDefined(props as unknown as Record<string, unknown>, EXCLUDE),
        id: props.id,
        data: {
          length: extracted.length,
          attributes: {
            getPosition: { value: extracted.positions, size: 3 },
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
