<script setup lang="ts">
  /**
   * Render polylines from an Apache Arrow `RecordBatch` containing GeoArrow
   * line geometries (extension type `geoarrow.linestring` or
   * `geoarrow.multilinestring`).
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
  import {
    extractLineStrings,
    extractMultiLineStrings,
    filterDefined,
  } from '../_shared/arrow';
  import type { ArrowTableLike } from '../_shared/types';

  const PATH_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers apache-arrow';

  type Props = {
    id: string;
    data: ArrowTableLike | null | undefined;
    getPath?: unknown;
    getColor?: unknown;
    getWidth?: unknown;
    widthUnits?: 'meters' | 'common' | 'pixels';
    widthScale?: number;
    widthMinPixels?: number;
    widthMaxPixels?: number;
    jointRounded?: boolean;
    capRounded?: boolean;
    miterLimit?: number;
    billboard?: boolean;
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
    jointRounded: false,
    capRounded: false,
    billboard: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const LayerClass = shallowRef<
    typeof import('@deck.gl/layers').PathLayer | null
  >(null);

  const EXCLUDE = new Set(['id', 'data', 'getPath']);

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    const extracted =
      extractLineStrings(props.data) ?? extractMultiLineStrings(props.data);
    if (!extracted) {
      console.error(
        '[VLayerDeckglGeoArrowPath] no GeoArrow linestring / multilinestring column found in data',
      );
      return null;
    }
    try {
      const layer = new LayerClass.value({
        ...filterDefined(props as unknown as Record<string, unknown>, EXCLUDE),
        id: props.id,
        data: {
          length: extracted.length,
          startIndices: extracted.startIndices,
          attributes: {
            getPath: { value: extracted.positions, size: 3 },
          },
        },
        _pathType: 'open',
        onClick: (info: PickingInfo) => emit('click', info),
        onHover: (info: PickingInfo) => emit('hover', info),
      });
      return markRaw(layer);
    } catch (err) {
      console.error(
        '[VLayerDeckglGeoArrowPath] failed to construct layer:',
        err,
      );
      return null;
    }
  };

  const initializeLayer = async () => {
    const mod = await requirePeer(
      '@deck.gl/layers',
      () => import('@deck.gl/layers'),
      PATH_PEER_INSTALL,
    );
    LayerClass.value = markRaw(mod.PathLayer);
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
      props.getColor,
      props.getWidth,
      props.widthUnits,
      props.widthScale,
      props.widthMinPixels,
      props.widthMaxPixels,
      props.jointRounded,
      props.capRounded,
      props.miterLimit,
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
