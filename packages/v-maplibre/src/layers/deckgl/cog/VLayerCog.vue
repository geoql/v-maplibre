<script setup lang="ts">
  /**
   * Single Cloud-Optimized GeoTIFF (COG) viewer with automatic CRS reprojection.
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/mapbox`
   * @requires `@deck.gl/layers`
   * @requires `@developmentseed/deck.gl-geotiff`
   * @requires `@developmentseed/deck.gl-raster`
   * @requires `@developmentseed/geotiff`
   * @requires `@developmentseed/proj`
   *
   * Targets `@developmentseed/deck.gl-geotiff` 0.10: the layer takes its data
   * as `source` and reports it through `onSourceLoad`.
   *
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj`
   */
  import { onBeforeUnmount, watch, shallowRef, toRaw, markRaw } from 'vue';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import type { COGInput, COGSource } from '@developmentseed/deck.gl-geotiff';
  import type { ConcurrencyLimiter, GeoTIFF } from '@developmentseed/geotiff';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const COG_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj';

  interface Props {
    id: string;
    /**
     * The COG: a URL, an ArrayBuffer, an opened `GeoTIFF`, or a `COGSource`
     * from `COGSource.open()` (share one source across layers).
     */
    geotiff: COGInput | COGSource;
    /**
     * Tile size in pixels
     */
    tileSize?: number;
    /**
     * Maximum zoom level
     */
    maxZoom?: number;
    /**
     * Minimum zoom level
     */
    minZoom?: number;
    /**
     * Maximum number of tiles to cache
     */
    maxCacheSize?: number;
    /**
     * Refinement strategy for tile loading
     */
    refinementStrategy?: 'best-available' | 'no-overlap' | 'never';
    /**
     * Maximum concurrent tile requests. Defaults to the library's 256; the
     * per-origin `concurrencyLimiter` caps the actual network requests.
     */
    maxRequests?: number;
    /**
     * Layer opacity (0-1)
     */
    opacity?: number;
    /**
     * Layer visibility
     */
    visible?: boolean;
    /**
     * Enable picking on this layer
     */
    pickable?: boolean;
    /**
     * Auto highlight on hover
     */
    autoHighlight?: boolean;
    /**
     * Highlight color when autoHighlight is enabled
     */
    highlightColor?: Color;
    /**
     * Insert layer before this layer id
     */
    beforeId?: string;
    /**
     * Show debug overlay on tiles
     */
    debug?: boolean;
    /**
     * Opacity of debug overlay (0-1)
     */
    debugOpacity?: number;
    /**
     * Per-origin request limiter for tile fetches. Omit it to share the
     * library default (6 requests per origin, the HTTP/1.1 browser limit).
     * Pass `null` to turn limiting off for HTTP/2 or HTTP/3 sources, or a
     * `PerOriginSemaphore` from `@developmentseed/geotiff` for a custom limit.
     * Ignored when `geotiff` is already a `COGSource`.
     */
    concurrencyLimiter?: ConcurrencyLimiter | null;
  }

  const props = withDefaults(defineProps<Props>(), {
    tileSize: 256,
    minZoom: 0,
    refinementStrategy: 'best-available',
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
    debug: false,
    debugOpacity: 0.25,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    /** The COG could not be opened or a tile failed. */
    error: [error: Error];
    /** The COG source was opened. */
    sourceLoad: [source: COGSource];
    geotiffLoad: [
      tiff: GeoTIFF,
      options: {
        geographicBounds: {
          west: number;
          south: number;
          east: number;
          north: number;
        };
      },
    ];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  // Store module references
  const COGLayerClass = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').COGLayer | null
  >(null);
  const COGSourceClass = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').COGSource | null
  >(null);
  // The source opened here when a concurrencyLimiter is set, since that is
  // an option of COGSource.open() in deck.gl-geotiff 0.10.
  const openedSource = shallowRef<COGSource | null>(null);
  let openRequest = 0;

  const reportSource = (source: COGSource): void => {
    emit('sourceLoad', source);
    emit('geotiffLoad', source.geotiff, {
      geographicBounds: source.geographicBounds,
    });
  };

  const isOpenedSource = (input: unknown): input is COGSource =>
    !!COGSourceClass.value && input instanceof COGSourceClass.value;

  /**
   * Opens the COG here when `concurrencyLimiter` is set (it is an option of
   * `COGSource.open()`); otherwise the layer opens it itself.
   */
  const resolveSource = async (): Promise<void> => {
    const input = toRaw(props.geotiff);
    if (props.concurrencyLimiter === undefined || isOpenedSource(input)) {
      openedSource.value = null;
      return;
    }
    const request = ++openRequest;
    try {
      const source = await COGSourceClass.value!.open(input, {
        concurrencyLimiter: toRaw(props.concurrencyLimiter),
      });
      if (request !== openRequest) return;
      openedSource.value = markRaw(source);
      reportSource(source);
    } catch (error) {
      if (request !== openRequest) return;
      emit('error', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const createLayer = () => {
    if (!COGLayerClass.value) return null;
    // Wait for the source this component is opening.
    if (props.concurrencyLimiter !== undefined && !openedSource.value) {
      if (!isOpenedSource(toRaw(props.geotiff))) return null;
    }

    const source = openedSource.value ?? toRaw(props.geotiff);
    const layerProps: Record<string, unknown> = {
      id: toRaw(props.id),
      source,
      opacity: toRaw(props.opacity),
      visible: toRaw(props.visible),
      pickable: toRaw(props.pickable),
      autoHighlight: toRaw(props.autoHighlight),
      debug: toRaw(props.debug),
      debugOpacity: toRaw(props.debugOpacity),
    };

    // Called only when the layer opens the source itself.
    layerProps.onSourceLoad = (loaded: COGSource) => {
      reportSource(loaded);
    };
    layerProps.onError = (error: Error) => {
      emit('error', error);
    };

    if (props.tileSize !== 256) layerProps.tileSize = toRaw(props.tileSize);
    if (props.maxZoom !== undefined) layerProps.maxZoom = toRaw(props.maxZoom);
    if (props.minZoom !== 0) layerProps.minZoom = toRaw(props.minZoom);
    if (props.maxCacheSize !== undefined)
      layerProps.maxCacheSize = toRaw(props.maxCacheSize);
    if (props.refinementStrategy !== 'best-available')
      layerProps.refinementStrategy = toRaw(props.refinementStrategy);
    if (props.maxRequests !== undefined)
      layerProps.maxRequests = toRaw(props.maxRequests);
    if (props.highlightColor !== undefined)
      layerProps.highlightColor = toRaw(props.highlightColor);
    if (props.beforeId !== undefined)
      layerProps.beforeId = toRaw(props.beforeId);

    const layer = new COGLayerClass.value(layerProps);
    return markRaw(layer);
  };

  const syncLayer = (): void => {
    const layer = createLayer();
    if (layer) updateLayer(props.id, layer);
  };

  const initializeLayer = async () => {
    try {
      const geotiffModule = await requirePeer(
        '@developmentseed/deck.gl-geotiff',
        () => import('@developmentseed/deck.gl-geotiff'),
        COG_PEER_INSTALL,
      );

      COGLayerClass.value = markRaw(geotiffModule.COGLayer);
      COGSourceClass.value = markRaw(geotiffModule.COGSource);

      await resolveSource();
      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading COGLayer:', error);
      console.error('Make sure @developmentseed/deck.gl-geotiff is installed');
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

  watch([() => props.geotiff, () => props.concurrencyLimiter], async () => {
    if (!COGLayerClass.value) return;
    await resolveSource();
    syncLayer();
  });

  watch(
    [
      () => props.tileSize,
      () => props.maxZoom,
      () => props.minZoom,
      () => props.opacity,
      () => props.visible,
      () => props.debug,
      () => props.debugOpacity,
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
