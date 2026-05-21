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
  import { onBeforeUnmount, watch, shallowRef, markRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import { useMapReady } from '../_shared/useMapReady';
  import { extractPoints, filterDefined } from '../_shared/arrow';
  import type { ArrowTableLike } from '../_shared/types';

  const TEXT_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers apache-arrow';

  type Props = {
    id: string;
    data: ArrowTableLike | null | undefined;
    textColumn?: string;
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
    typeof import('@deck.gl/layers').TextLayer | null
  >(null);

  const EXCLUDE = new Set([
    'id',
    'data',
    'getPosition',
    'getText',
    'textColumn',
  ]);

  type ItemWithLabel = { position: [number, number]; label: string };

  const buildItems = (
    table: ArrowTableLike,
    textColumn: string,
  ): ItemWithLabel[] | null => {
    const extracted = extractPoints(table);
    if (!extracted) return null;
    const labelColumn = (
      table as unknown as {
        getChild: (
          k: string,
        ) => { toArray?: () => unknown[]; get?: (i: number) => unknown } | null;
      }
    ).getChild(textColumn);
    const labels: string[] = [];
    if (labelColumn) {
      const arr = labelColumn.toArray?.();
      if (arr) {
        for (let i = 0; i < extracted.length; i++) {
          labels.push(String(arr[i] ?? ''));
        }
      } else if (labelColumn.get) {
        for (let i = 0; i < extracted.length; i++) {
          labels.push(String(labelColumn.get(i) ?? ''));
        }
      }
    }
    const items: ItemWithLabel[] = [];
    for (let i = 0; i < extracted.length; i++) {
      items.push({
        position: [
          extracted.positions[i * 3] ?? 0,
          extracted.positions[i * 3 + 1] ?? 0,
        ],
        label: labels[i] ?? '',
      });
    }
    return items;
  };

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    const items = buildItems(props.data, props.textColumn ?? 'name');
    if (!items) {
      console.error(
        '[VLayerDeckglGeoArrowText] no GeoArrow point geometry column found in data',
      );
      return null;
    }
    try {
      return markRaw(
        new LayerClass.value({
          ...filterDefined(
            props as unknown as Record<string, unknown>,
            EXCLUDE,
          ),
          id: props.id,
          data: items,
          getPosition: (d: ItemWithLabel) => d.position,
          getText: (d: ItemWithLabel) => d.label,
          onClick: (info: PickingInfo) => emit('click', info),
          onHover: (info: PickingInfo) => emit('hover', info),
        }),
      );
    } catch (err) {
      console.error(
        '[VLayerDeckglGeoArrowText] failed to construct layer:',
        err,
      );
      return null;
    }
  };

  const initializeLayer = async () => {
    const mod = await requirePeer(
      '@deck.gl/layers',
      () => import('@deck.gl/layers'),
      TEXT_PEER_INSTALL,
    );
    LayerClass.value = markRaw(mod.TextLayer);
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
      props.getText,
      props.getPosition,
      props.getColor,
      props.getSize,
      props.getAngle,
      props.getTextAnchor,
      props.getAlignmentBaseline,
      props.sizeUnits,
      props.sizeScale,
      props.sizeMinPixels,
      props.sizeMaxPixels,
      props.billboard,
      props.fontFamily,
      props.fontWeight,
      props.background,
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

  onBeforeUnmount(() => removeLayer(props.id));
</script>

<template>
  <slot></slot>
</template>
