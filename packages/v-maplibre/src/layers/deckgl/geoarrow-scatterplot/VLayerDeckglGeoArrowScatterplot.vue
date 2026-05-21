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

  const GEOARROW_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @geoarrow/deck.gl-geoarrow apache-arrow';

  type Props = {
    id: string;
    data: import('apache-arrow').RecordBatch | null | undefined;
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
    /** 'XY' for 2D GeoArrow point data, 'XYZ' for 3D. Default 'XY'. */
    positionFormat?: 'XY' | 'XYZ';
  };

  const props = withDefaults(defineProps<Props>(), {
    visible: true,
    pickable: false,
    autoHighlight: false,
    stroked: false,
    filled: true,
    billboard: false,
    antialiasing: true,
    positionFormat: 'XY',
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
    if (!LayerClass.value || !props.data) return null;
    try {
      const layer = new LayerClass.value({
        ...(props as object),
        id: props.id,
        onClick: (info: PickingInfo) => emit('click', info),
        onHover: (info: PickingInfo) => emit('hover', info),
      });
      console.log(
        '[GAS] createLayer ok, id=',
        props.id,
        'dataType=',
        props.data?.constructor?.name,
      );
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
    console.log('[GAS] initializeLayer start, id=', props.id);
    const mod = await requirePeer(
      '@geoarrow/deck.gl-geoarrow',
      () => import('@geoarrow/deck.gl-geoarrow'),
      GEOARROW_PEER_INSTALL,
    );
    console.log(
      '[GAS] requirePeer ok, hasClass=',
      !!mod.GeoArrowScatterplotLayer,
    );
    LayerClass.value = markRaw(mod.GeoArrowScatterplotLayer);
  };

  useMapReady(map, initializeLayer);

  watch(LayerClass, (cls) => {
    console.log(
      '[GAS] LayerClass watcher, cls=',
      !!cls,
      'data=',
      !!props.data,
      'dataT=',
      props.data?.constructor?.name,
    );
    if (!cls || !props.data) return;
    const layer = createLayer();
    console.log('[GAS] addLayer call, layer=', !!layer);
    if (layer) addLayer(layer);
  });

  watch(
    () => props.data,
    () => {
      console.log('[GAS] data watcher, dataT=', props.data?.constructor?.name);
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
