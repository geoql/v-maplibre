<script setup lang="ts">
  /**
   * GeoZarr tile renderer with optional reprojection (caller supplies the store).
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/mapbox`
   * @requires `@developmentseed/deck.gl-raster`
   * @requires `@developmentseed/deck.gl-zarr`
   * @requires `@developmentseed/proj`
   * @requires `zarrita`
   *
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox @developmentseed/deck.gl-raster @developmentseed/deck.gl-zarr @developmentseed/proj zarrita`
   */
  /**
   * VLayerDeckglZarr — GeoZarr tile rendering with reprojection.
   *
   * Wraps @developmentseed/deck.gl-zarr ZarrLayer.
   * The caller MUST open the zarr store with zarrita and pass the opened
   * Array/Group as `node`, plus `selection` for non-spatial dims, plus
   * `getTileData` + `renderTile` callbacks. This wrapper is intentionally
   * thin — ZarrLayer is data-format / shader-pipeline agnostic by design.
   *
   * @see https://github.com/developmentseed/deck.gl-raster/blob/main/examples/dynamical-zarr-ecmwf/src/App.tsx
   */
  import {
    onMounted,
    onBeforeUnmount,
    watch,
    shallowRef,
    markRaw,
    toRaw,
  } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import type {
    MinimalTileData,
    RenderTileResult,
  } from '@developmentseed/deck.gl-raster';
  import type {
    GetTileDataOptions,
    SliceInput,
  } from '@developmentseed/deck.gl-zarr';
  import type * as zarr from 'zarrita';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const ZARR_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox @developmentseed/deck.gl-raster @developmentseed/deck.gl-zarr @developmentseed/proj zarrita';

  interface Props {
    id: string;
    /**
     * Pre-opened zarrita Array OR Group. The caller builds the store
     * (e.g. zarr.FetchStore + withConsolidatedMetadata) and opens it.
     */
    node: zarr.Array<zarr.DataType, zarr.Readable> | zarr.Group<zarr.Readable>;
    /**
     * Optional path to a variable within the store. Only used when `node`
     * is a Group. Ignored for direct Array nodes.
     */
    variable?: string;
    /**
     * Selection for non-spatial dims. One entry per non-spatial dim.
     * Use a number to pin to an index, `zarr.Slice` for a range, or `null`
     * for zarrita's default. For pure spatial arrays, pass `{}`.
     */
    selection: Record<string, SliceInput>;
    /**
     * Optional raw group attrs override. Use when the data source lacks
     * GeoZarr metadata and you want to inject it.
     */
    metadata?: unknown;
    /**
     * Tile fetcher. Receives the zarr Array for the chosen zoom level and
     * a pre-built sliceSpec. Must return a tile-shaped `DataT`.
     */
    getTileData: (
      arr: zarr.Array<zarr.DataType, zarr.Readable>,
      options: GetTileDataOptions,
    ) => Promise<MinimalTileData>;
    /**
     * Convert a loaded tile into a `RenderTileResult` (either `{ image }`
     * or `{ renderPipeline }`).
     */
    renderTile: (data: MinimalTileData) => RenderTileResult;
    /** Layer opacity (0-1). */
    opacity?: number;
    /** Layer visibility. */
    visible?: boolean;
    /** Enable picking. */
    pickable?: boolean;
    /** Insert layer before this layer id. */
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    opacity: 1,
    visible: true,
    pickable: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const ZarrLayerClass = shallowRef<
    typeof import('@developmentseed/deck.gl-zarr').ZarrLayer | null
  >(null);
  const epsgResolverFn = shallowRef<
    typeof import('@developmentseed/proj').epsgResolver | null
  >(null);

  const createLayer = () => {
    if (!ZarrLayerClass.value) return null;

    const layerProps: Record<string, unknown> = {
      id: toRaw(props.id),
      node: toRaw(props.node),
      selection: toRaw(props.selection),
      getTileData: props.getTileData,
      renderTile: props.renderTile,
      opacity: toRaw(props.opacity),
      visible: toRaw(props.visible),
      pickable: toRaw(props.pickable),
    };

    if (epsgResolverFn.value) {
      layerProps.epsgResolver = epsgResolverFn.value;
    }
    if (props.variable !== undefined) {
      layerProps.variable = toRaw(props.variable);
    }
    if (props.metadata !== undefined) {
      layerProps.metadata = toRaw(props.metadata);
    }
    if (props.beforeId !== undefined) {
      layerProps.beforeId = toRaw(props.beforeId);
    }

    const layer = new ZarrLayerClass.value(layerProps);
    return markRaw(layer);
  };

  const initializeLayer = async () => {
    try {
      const [zarrModule, projModule] = await Promise.all([
        requirePeer(
          '@developmentseed/deck.gl-zarr',
          () => import('@developmentseed/deck.gl-zarr'),
          ZARR_PEER_INSTALL,
        ),
        requirePeer(
          '@developmentseed/proj',
          () => import('@developmentseed/proj'),
          ZARR_PEER_INSTALL,
        ),
      ]);

      ZarrLayerClass.value = markRaw(zarrModule.ZarrLayer);
      epsgResolverFn.value = projModule.epsgResolver;

      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading ZarrLayer:', error);
      console.error(
        'Make sure @developmentseed/deck.gl-zarr, @developmentseed/proj, and zarrita are installed',
      );
    }
  };

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', initializeLayer);
    }
  });

  watch(
    () => [
      props.node,
      props.variable,
      props.selection,
      props.metadata,
      props.opacity,
      props.visible,
    ],
    () => {
      const layer = createLayer();
      if (layer) {
        updateLayer(props.id, layer);
      }
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
