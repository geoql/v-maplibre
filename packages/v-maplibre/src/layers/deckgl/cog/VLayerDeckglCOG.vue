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
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj`
   */
  import {
    onMounted,
    onBeforeUnmount,
    watch,
    shallowRef,
    toRaw,
    markRaw,
  } from 'vue';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const COG_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/layers @deck.gl/mapbox @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj';

  interface Props {
    id: string;
    /**
     * GeoTIFF source - URL string, ArrayBuffer, Blob, or geotiff.js instance
     */
    geotiff: string | ArrayBuffer | Blob | object;
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
     * Maximum concurrent requests
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
  }

  const props = withDefaults(defineProps<Props>(), {
    tileSize: 256,
    minZoom: 0,
    refinementStrategy: 'best-available',
    maxRequests: 6,
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
    geotiffLoad: [
      tiff: unknown,
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
  const epsgResolverFn = shallowRef<
    typeof import('@developmentseed/proj').epsgResolver | null
  >(null);

  const createLayer = () => {
    if (!COGLayerClass.value) return null;

    const layerProps: Record<string, unknown> = {
      id: toRaw(props.id),
      geotiff: toRaw(props.geotiff),
      opacity: toRaw(props.opacity),
      visible: toRaw(props.visible),
      pickable: toRaw(props.pickable),
      autoHighlight: toRaw(props.autoHighlight),
      debug: toRaw(props.debug),
      debugOpacity: toRaw(props.debugOpacity),
    };

    if (epsgResolverFn.value) {
      layerProps.epsgResolver = epsgResolverFn.value;
    }

    layerProps.onGeoTIFFLoad = (
      tiff: unknown,
      options: {
        geographicBounds: {
          west: number;
          south: number;
          east: number;
          north: number;
        };
      },
    ) => {
      emit('geotiffLoad', tiff, options);
    };

    if (props.tileSize !== 256) layerProps.tileSize = toRaw(props.tileSize);
    if (props.maxZoom !== undefined) layerProps.maxZoom = toRaw(props.maxZoom);
    if (props.minZoom !== 0) layerProps.minZoom = toRaw(props.minZoom);
    if (props.maxCacheSize !== undefined)
      layerProps.maxCacheSize = toRaw(props.maxCacheSize);
    if (props.refinementStrategy !== 'best-available')
      layerProps.refinementStrategy = toRaw(props.refinementStrategy);
    if (props.maxRequests !== 6)
      layerProps.maxRequests = toRaw(props.maxRequests);
    if (props.highlightColor !== undefined)
      layerProps.highlightColor = toRaw(props.highlightColor);
    if (props.beforeId !== undefined)
      layerProps.beforeId = toRaw(props.beforeId);

    const layer = new COGLayerClass.value(layerProps);
    return markRaw(layer);
  };

  const initializeLayer = async () => {
    try {
      const [geotiffModule, projModule] = await Promise.all([
        requirePeer(
          '@developmentseed/deck.gl-geotiff',
          () => import('@developmentseed/deck.gl-geotiff'),
          COG_PEER_INSTALL,
        ),
        requirePeer(
          '@developmentseed/proj',
          () => import('@developmentseed/proj'),
          COG_PEER_INSTALL,
        ),
      ]);

      COGLayerClass.value = markRaw(geotiffModule.COGLayer);
      epsgResolverFn.value = projModule.epsgResolver;

      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading COGLayer:', error);
      console.error('Make sure @developmentseed/deck.gl-geotiff is installed');
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
      props.geotiff,
      props.tileSize,
      props.maxZoom,
      props.minZoom,
      props.opacity,
      props.visible,
      props.debug,
      props.debugOpacity,
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
