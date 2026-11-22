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
   * VLayerZarr — GeoZarr tile rendering with reprojection.
   *
   * Wraps @developmentseed/deck.gl-zarr 0.10 ZarrLayer.
   * The caller passes a zarrita store, an opened Array/Group, or a
   * `ZarrSource` as `node`, plus `selection` for non-spatial dims, plus
   * `getTileData` + `renderTile` callbacks. This wrapper is intentionally
   * thin — ZarrLayer is data-format / shader-pipeline agnostic by design.
   *
   * @see https://github.com/developmentseed/deck.gl-raster/blob/main/examples/dynamical-zarr-ecmwf/src/App.tsx
   */
  import { onBeforeUnmount, watch, shallowRef, markRaw, toRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import type {
    MinimalTileData,
    RenderTileResult,
  } from '@developmentseed/deck.gl-raster';
  import type {
    GetTileDataOptions,
    SliceInput,
    ZarrInput,
    ZarrSource,
  } from '@developmentseed/deck.gl-zarr';
  import type * as zarr from 'zarrita';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const ZARR_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox @developmentseed/deck.gl-raster @developmentseed/deck.gl-zarr @developmentseed/proj zarrita';

  interface Props {
    id: string;
    /**
     * The data: a zarrita store (e.g. zarr.FetchStore +
     * withConsolidatedMetadata), an opened Array or Group, or a `ZarrSource`
     * from `ZarrSource.open()` (share one source across layers).
     */
    node: ZarrInput | ZarrSource;
    /**
     * Path to the array within a store or group (ZarrSource's `path`). An
     * array inherits its group's GeoZarr attributes. Ignored when `node` is a
     * `ZarrSource`.
     */
    variable?: string;
    /**
     * Selection for non-spatial dims. One entry per non-spatial dim.
     * Use a number to pin to an index, `zarr.Slice` for a range, or `null`
     * for zarrita's default. For pure spatial arrays, pass `{}`.
     */
    selection: Record<string, SliceInput>;
    /**
     * GeoZarr metadata to use instead of the store's attributes (ZarrSource's
     * `geoZarrMetadata`). Use it when the data lacks GeoZarr metadata.
     * Ignored when `node` is a `ZarrSource`.
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
    /** The data could not be opened or a tile failed. */
    error: [error: Error];
    /** The Zarr source was opened. */
    sourceLoad: [source: ZarrSource];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const ZarrLayerClass = shallowRef<
    typeof import('@developmentseed/deck.gl-zarr').ZarrLayer | null
  >(null);
  const ZarrSourceClass = shallowRef<
    typeof import('@developmentseed/deck.gl-zarr').ZarrSource | null
  >(null);
  // `path` and `geoZarrMetadata` are options of ZarrSource.open() in
  // deck.gl-zarr 0.10, so the source is opened here when either is set.
  const openedSource = shallowRef<ZarrSource | null>(null);
  let openRequest = 0;

  const isOpenedSource = (input: unknown): input is ZarrSource =>
    !!ZarrSourceClass.value && input instanceof ZarrSourceClass.value;

  const needsOwnSource = (): boolean =>
    (props.variable !== undefined || props.metadata !== undefined) &&
    !isOpenedSource(toRaw(props.node));

  const resolveSource = async (): Promise<void> => {
    if (!needsOwnSource()) {
      openedSource.value = null;
      return;
    }
    const request = ++openRequest;
    try {
      const source = await ZarrSourceClass.value!.open(
        toRaw(props.node) as ZarrInput,
        {
          path: toRaw(props.variable),
          geoZarrMetadata: toRaw(props.metadata),
        },
      );
      if (request !== openRequest) return;
      openedSource.value = markRaw(source);
      emit('sourceLoad', source);
    } catch (error) {
      if (request !== openRequest) return;
      emit('error', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const createLayer = () => {
    if (!ZarrLayerClass.value) return null;
    // Wait for the source this component is opening.
    if (needsOwnSource() && !openedSource.value) return null;

    const layerProps: Record<string, unknown> = {
      id: toRaw(props.id),
      source: openedSource.value ?? toRaw(props.node),
      selection: toRaw(props.selection),
      getTileData: props.getTileData,
      renderTile: props.renderTile,
      opacity: toRaw(props.opacity),
      visible: toRaw(props.visible),
      pickable: toRaw(props.pickable),
    };

    // Called only when the layer opens the source itself.
    layerProps.onSourceLoad = (source: ZarrSource) => {
      emit('sourceLoad', source);
    };
    layerProps.onError = (error: Error) => {
      emit('error', error);
    };
    if (props.beforeId !== undefined) {
      layerProps.beforeId = toRaw(props.beforeId);
    }

    const layer = new ZarrLayerClass.value(layerProps);
    return markRaw(layer);
  };

  const initializeLayer = async () => {
    try {
      const zarrModule = await requirePeer(
        '@developmentseed/deck.gl-zarr',
        () => import('@developmentseed/deck.gl-zarr'),
        ZARR_PEER_INSTALL,
      );

      ZarrLayerClass.value = markRaw(zarrModule.ZarrLayer);
      ZarrSourceClass.value = markRaw(zarrModule.ZarrSource);

      await resolveSource();
      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading ZarrLayer:', error);
      console.error(
        'Make sure @developmentseed/deck.gl-zarr and zarrita are installed',
      );
    }
  };

  watch(
    map,
    (mapInstance) => {
      if (!mapInstance) return;
      // Register unconditionally once the map exists. addLayer() routes through
      // useDeckOverlay's initOverlay(), which robustly waits for style.load via
      // its own once-listener + polling. Gating here on isStyleLoaded() was racy:
      // if style.load already fired before this watch ran, the one-shot
      // .once('style.load') never fired and the layer was never registered.
      initializeLayer();
    },
    { immediate: true },
  );

  const syncLayer = (): void => {
    const layer = createLayer();
    if (layer) updateLayer(props.id, layer);
  };

  watch(
    [() => props.node, () => props.variable, () => props.metadata],
    async () => {
      if (!ZarrLayerClass.value) return;
      await resolveSource();
      syncLayer();
    },
  );

  watch(
    [
      () => props.selection,
      () => props.opacity,
      () => props.visible,
      // Callbacks must be watched too: ZarrLayer captures `renderTile` and
      // `getTileData` at construction time, so consumers that swap closures
      // (e.g. AEF Mosaic rebuilding the SampleAefRgb shader pipeline with
      // new band indices) need the layer rebuilt to take effect.
      () => props.renderTile,
      () => props.getTileData,
    ],
    syncLayer,
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
