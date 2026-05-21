<script setup lang="ts">
  /**
   * Render animated trips from an Apache Arrow `RecordBatch` containing
   * GeoArrow linestring geometries with per-vertex timestamps.
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/layers`
   * @requires `@deck.gl/geo-layers`
   * @requires `@deck.gl/mapbox`
   * @requires `@geoarrow/deck.gl-geoarrow`
   * @requires `apache-arrow`
   */
  import { onBeforeUnmount, watch, shallowRef, markRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import { useMapReady } from '../_shared/useMapReady';
  import { extractLineStrings, filterDefined } from '../_shared/arrow';
  import type { ArrowTableLike } from '../_shared/types';

  const TRIPS_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @deck.gl/geo-layers apache-arrow';

  type Props = {
    id: string;
    data: ArrowTableLike | null | undefined;
    timestampsColumn?: string;
    getPath?: unknown;
    getTimestamps?: unknown;
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
    currentTime?: number;
    trailLength?: number;
    fadeTrail?: boolean;
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
    fadeTrail: true,
    trailLength: 180,
    currentTime: 0,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const LayerClass = shallowRef<
    typeof import('@deck.gl/geo-layers').TripsLayer | null
  >(null);

  const EXCLUDE = new Set([
    'id',
    'data',
    'getPath',
    'getTimestamps',
    'timestampsColumn',
  ]);

  type Trip = { path: number[][]; timestamps: number[] };

  const buildTrips = (
    table: ArrowTableLike,
    timestampsColumn: string,
  ): Trip[] | null => {
    const extracted = extractLineStrings(table);
    if (!extracted) return null;
    const tsListColumn = (
      table as unknown as {
        getChild: (k: string) => {
          data: { valueOffsets?: Int32Array; values?: ArrayLike<number> }[];
        } | null;
      }
    ).getChild(timestampsColumn);
    const tsList = tsListColumn?.data[0];
    const tsOffsets = tsList?.valueOffsets;
    const tsValues = tsList?.values;
    const trips: Trip[] = [];
    for (let i = 0; i < extracted.length; i++) {
      const start = extracted.startIndices[i] ?? 0;
      const end = extracted.startIndices[i + 1] ?? 0;
      const path: number[][] = [];
      for (let v = start; v < end; v++) {
        path.push([
          extracted.positions[v * 3] ?? 0,
          extracted.positions[v * 3 + 1] ?? 0,
        ]);
      }
      const timestamps: number[] = [];
      if (tsOffsets && tsValues) {
        const tStart = tsOffsets[i] ?? 0;
        const tEnd = tsOffsets[i + 1] ?? 0;
        for (let t = tStart; t < tEnd; t++) {
          timestamps.push(Number(tsValues[t] ?? 0));
        }
      }
      trips.push({ path, timestamps });
    }
    return trips;
  };

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    const trips = buildTrips(
      props.data,
      props.timestampsColumn ?? 'timestamps',
    );
    if (!trips) {
      console.error(
        '[VLayerDeckglGeoArrowTrips] no GeoArrow linestring column found in data',
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
          data: trips,
          getPath: (d: Trip) => d.path,
          getTimestamps: (d: Trip) => d.timestamps,
          onClick: (info: PickingInfo) => emit('click', info),
          onHover: (info: PickingInfo) => emit('hover', info),
        }),
      );
    } catch (err) {
      console.error(
        '[VLayerDeckglGeoArrowTrips] failed to construct layer:',
        err,
      );
      return null;
    }
  };

  const initializeLayer = async () => {
    const mod = await requirePeer(
      '@deck.gl/geo-layers',
      () => import('@deck.gl/geo-layers'),
      TRIPS_PEER_INSTALL,
    );
    LayerClass.value = markRaw(mod.TripsLayer);
  };

  useMapReady(map, initializeLayer);

  watch(LayerClass, (cls) => {
    if (!cls || !props.data) return;
    const layer = createLayer();
    if (layer) addLayer(layer);
  });

  watch(
    () => [
      props.data,
      props.currentTime,
      props.trailLength,
      props.fadeTrail,
      props.getPath,
      props.getTimestamps,
      props.getColor,
      props.getWidth,
      props.widthUnits,
      props.widthScale,
      props.widthMinPixels,
      props.widthMaxPixels,
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
