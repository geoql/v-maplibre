<script setup lang="ts">
  /**
   * VLayerDeckglMultiCOG — multi-band split-resolution COG compositing.
   *
   * Wraps @developmentseed/deck.gl-geotiff MultiCOGLayer.
   * Use case: render Sentinel-2 or other multi-band imagery where bands live in
   * separate COGs at different native resolutions. The layer opens all sources
   * in parallel, picks the finest as the primary tileset, and the GPU
   * resamples lower-resolution bands to match.
   *
   * @see https://github.com/developmentseed/deck.gl-raster/blob/main/examples/sentinel-2/src/App.tsx
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
  import type { RasterModule } from '@developmentseed/deck.gl-raster';
  import type { MultiCOGSourceConfig } from '@developmentseed/deck.gl-geotiff';
  import type { GeoTIFF } from '@developmentseed/geotiff';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  /**
   * Maps source band names to RGB(A) output channels for the compositing step.
   */
  export interface MultiCOGComposite {
    r: string;
    g?: string;
    b?: string;
    a?: string;
  }

  interface Props {
    id: string;
    /**
     * Named sources — each key is the band name. Pass at least one entry per
     * band referenced in `composite`.
     */
    sources: Record<string, MultiCOGSourceConfig>;
    /**
     * Map source band names to RGB(A) output channels. Defaults to passing
     * the first source through to all channels (greyscale) if omitted.
     */
    composite?: MultiCOGComposite;
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
    /** Maximum concurrent tile requests. */
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
  }

  const props = withDefaults(defineProps<Props>(), {
    maxError: 0.125,
    maxRequests: 6,
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
    geotiffLoad: [
      sources: Map<string, GeoTIFF>,
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
  const epsgResolverFn = shallowRef<
    typeof import('@developmentseed/proj').epsgResolver | null
  >(null);

  const createLayer = () => {
    if (!MultiCOGLayerClass.value) return null;

    const layerProps: Record<string, unknown> = {
      id: toRaw(props.id),
      sources: toRaw(props.sources),
      opacity: toRaw(props.opacity),
      visible: toRaw(props.visible),
      pickable: toRaw(props.pickable),
      autoHighlight: toRaw(props.autoHighlight),
      debug: toRaw(props.debug),
      debugOpacity: toRaw(props.debugOpacity),
      debugLevel: toRaw(props.debugLevel),
      maxError: toRaw(props.maxError),
    };

    if (epsgResolverFn.value) {
      layerProps.epsgResolver = epsgResolverFn.value;
    }

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
    if (props.maxRequests !== 6)
      layerProps.maxRequests = toRaw(props.maxRequests);
    if (props.debounceTime !== undefined)
      layerProps.debounceTime = toRaw(props.debounceTime);
    if (props.refinementStrategy !== 'best-available')
      layerProps.refinementStrategy = toRaw(props.refinementStrategy);
    if (props.beforeId !== undefined)
      layerProps.beforeId = toRaw(props.beforeId);

    layerProps.onGeoTIFFLoad = (
      sources: Map<string, GeoTIFF>,
      options: {
        primaryKey: string;
        geographicBounds: {
          west: number;
          south: number;
          east: number;
          north: number;
        };
      },
    ) => {
      emit('geotiffLoad', sources, options);
    };

    const layer = new MultiCOGLayerClass.value(layerProps);
    return markRaw(layer);
  };

  const initializeLayer = async () => {
    try {
      const [geotiffModule, projModule] = await Promise.all([
        import('@developmentseed/deck.gl-geotiff'),
        import('@developmentseed/proj'),
      ]);

      MultiCOGLayerClass.value = markRaw(geotiffModule.MultiCOGLayer);
      epsgResolverFn.value = projModule.epsgResolver;

      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading MultiCOGLayer:', error);
      console.error(
        'Make sure @developmentseed/deck.gl-geotiff and @developmentseed/proj are installed',
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
      props.sources,
      props.composite,
      props.renderPipeline,
      props.opacity,
      props.visible,
      props.debug,
      props.debugOpacity,
      props.debugLevel,
      props.maxError,
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
