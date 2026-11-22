<script setup lang="ts">
  /**
   * Multi-band split-resolution COG compositor (e.g. Sentinel-2 band combinations).
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/mapbox`
   * @requires `@deck.gl/layers`
   * @requires `@developmentseed/deck.gl-geotiff`
   * @requires `@developmentseed/deck.gl-raster`
   * @requires `@developmentseed/geotiff`
   * @requires `@developmentseed/proj`
   *
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj`
   */
  /**
   * VLayerMultiCog — multi-band split-resolution COG compositing.
   *
   * Wraps @developmentseed/deck.gl-geotiff MultiCOGLayer.
   * Use case: render Sentinel-2 or other multi-band imagery where bands live in
   * separate COGs at different native resolutions. The layer opens all sources
   * in parallel, picks the finest as the primary tileset, and the GPU
   * resamples lower-resolution bands to match.
   *
   * @see https://github.com/developmentseed/deck.gl-raster/blob/main/examples/sentinel-2/src/App.tsx
   */
  import { onBeforeUnmount, watch, shallowRef, markRaw, toRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import type { RasterModule } from '@developmentseed/deck.gl-raster';
  import type {
    COGInput,
    MultiCOGSource,
  } from '@developmentseed/deck.gl-geotiff';
  import type { ConcurrencyLimiter, GeoTIFF } from '@developmentseed/geotiff';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';

  const MULTICOG_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  /**
   * Maps source band names to RGB(A) output channels for the compositing step.
   */
  export interface MultiCogComposite {
    r: string;
    g?: string;
    b?: string;
    a?: string;
  }

  interface Props {
    id: string;
    /**
     * The files of one scene, keyed by band name: a URL, an ArrayBuffer or an
     * opened `GeoTIFF` per band. Pass at least one entry per band referenced
     * in `composite`. Or pass a `MultiCOGSource` from `MultiCOGSource.open()`.
     * All files must share one CRS and extent.
     */
    sources: Record<string, COGInput> | MultiCOGSource;
    /**
     * Map source band names to RGB(A) output channels. Defaults to passing
     * the first source through to all channels (greyscale) if omitted.
     */
    composite?: MultiCogComposite;
    /**
     * Post-processing render pipeline modules applied after band compositing
     * (e.g. LinearRescale, ColormapSprite, NDVI).
     */
    renderPipeline?: RasterModule[];
    /** Max reprojection error in pixels for mesh refinement. */
    maxError?: number;
    /** Maximum number of tiles to cache. */
    maxCacheSize?: number;
    /** Maximum cached tile byte size. */
    maxCacheByteSize?: number;
    /**
     * Maximum concurrent tile requests. Defaults to the library's 256; the
     * per-origin `concurrencyLimiter` caps the actual network requests.
     */
    maxRequests?: number;
    /** Tile fetch debounce (ms). */
    debounceTime?: number;
    /** Tile refinement strategy. */
    refinementStrategy?: 'best-available' | 'no-overlap' | 'never';
    /** Layer opacity (0-1). */
    opacity?: number;
    /** Layer visibility. */
    visible?: boolean;
    /** Enable picking. */
    pickable?: boolean;
    /** Auto-highlight on hover. */
    autoHighlight?: boolean;
    /** Insert layer before this layer id. */
    beforeId?: string;
    /** Show debug overlay on tiles. */
    debug?: boolean;
    /** Debug overlay opacity (0-1). */
    debugOpacity?: number;
    /** Debug verbosity: 1=coords, 2=+uv/tiles, 3=+stitched-size/meters/px. */
    debugLevel?: 1 | 2 | 3;
    /**
     * Per-origin request limiter shared by every file. Omit it to use the
     * library default (6 requests per origin); pass `null` to turn limiting
     * off for HTTP/2 or HTTP/3 sources. Ignored when `sources` is already a
     * `MultiCOGSource`.
     */
    concurrencyLimiter?: ConcurrencyLimiter | null;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxError: 0.125,
    refinementStrategy: 'best-available',
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
    debug: false,
    debugOpacity: 0.5,
    debugLevel: 1,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    /** A file could not be opened or a tile failed. */
    error: [error: Error];
    /** The scene was opened. */
    sourceLoad: [source: MultiCOGSource];
    geotiffLoad: [
      sources: ReadonlyMap<string, GeoTIFF>,
      options: {
        primaryKey: string;
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

  const MultiCOGLayerClass = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').MultiCOGLayer | null
  >(null);
  const MultiCOGSourceClass = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').MultiCOGSource | null
  >(null);
  // The scene opened here when a concurrencyLimiter is set, since that is an
  // option of MultiCOGSource.open() in deck.gl-geotiff 0.10.
  const openedSource = shallowRef<MultiCOGSource | null>(null);
  let openRequest = 0;

  const reportSource = (source: MultiCOGSource): void => {
    emit('sourceLoad', source);
    emit('geotiffLoad', source.geotiffs, {
      primaryKey: source.multiTilesetDescriptor.primaryKey,
      geographicBounds: source.geographicBounds,
    });
  };

  const isOpenedSource = (input: unknown): input is MultiCOGSource =>
    !!MultiCOGSourceClass.value && input instanceof MultiCOGSourceClass.value;

  const resolveSource = async (): Promise<void> => {
    const input = toRaw(props.sources);
    if (props.concurrencyLimiter === undefined || isOpenedSource(input)) {
      openedSource.value = null;
      return;
    }
    const request = ++openRequest;
    try {
      const source = await MultiCOGSourceClass.value!.open(input, {
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
    if (!MultiCOGLayerClass.value) return null;
    // Wait for the scene this component is opening.
    if (
      props.concurrencyLimiter !== undefined &&
      !openedSource.value &&
      !isOpenedSource(toRaw(props.sources))
    ) {
      return null;
    }

    const layerProps: Record<string, unknown> = {
      id: toRaw(props.id),
      source: openedSource.value ?? toRaw(props.sources),
      opacity: toRaw(props.opacity),
      visible: toRaw(props.visible),
      pickable: toRaw(props.pickable),
      autoHighlight: toRaw(props.autoHighlight),
      debug: toRaw(props.debug),
      debugOpacity: toRaw(props.debugOpacity),
      debugLevel: toRaw(props.debugLevel),
      maxError: toRaw(props.maxError),
    };

    if (props.composite) {
      layerProps.composite = toRaw(props.composite);
    }
    if (props.renderPipeline) {
      layerProps.renderPipeline = toRaw(props.renderPipeline);
    }
    if (props.maxCacheSize !== undefined)
      layerProps.maxCacheSize = toRaw(props.maxCacheSize);
    if (props.maxCacheByteSize !== undefined)
      layerProps.maxCacheByteSize = toRaw(props.maxCacheByteSize);
    if (props.maxRequests !== undefined)
      layerProps.maxRequests = toRaw(props.maxRequests);
    if (props.debounceTime !== undefined)
      layerProps.debounceTime = toRaw(props.debounceTime);
    if (props.refinementStrategy !== 'best-available')
      layerProps.refinementStrategy = toRaw(props.refinementStrategy);
    if (props.beforeId !== undefined)
      layerProps.beforeId = toRaw(props.beforeId);
    layerProps.onError = (error: Error) => {
      emit('error', error);
    };

    // Called only when the layer opens the scene itself.
    layerProps.onSourceLoad = (loaded: MultiCOGSource) => {
      reportSource(loaded);
    };

    const layer = new MultiCOGLayerClass.value(layerProps);
    return markRaw(layer);
  };

  const initializeLayer = async () => {
    try {
      const geotiffModule = await requirePeer(
        '@developmentseed/deck.gl-geotiff',
        () => import('@developmentseed/deck.gl-geotiff'),
        MULTICOG_PEER_INSTALL,
      );

      MultiCOGLayerClass.value = markRaw(geotiffModule.MultiCOGLayer);
      MultiCOGSourceClass.value = markRaw(geotiffModule.MultiCOGSource);

      await resolveSource();
      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading MultiCOGLayer:', error);
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

  const syncLayer = (): void => {
    const layer = createLayer();
    if (layer) updateLayer(props.id, layer);
  };

  watch(
    [() => props.sources, () => props.concurrencyLimiter],
    async () => {
      if (!MultiCOGLayerClass.value) return;
      await resolveSource();
      syncLayer();
    },
    { deep: true },
  );

  watch(
    [
      () => props.composite,
      () => props.renderPipeline,
      () => props.opacity,
      () => props.visible,
      () => props.debug,
      () => props.debugOpacity,
      () => props.debugLevel,
      () => props.maxError,
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
