<script setup lang="ts">
  import {
    onMounted,
    onBeforeUnmount,
    watch,
    shallowRef,
    toRaw,
    markRaw,
  } from 'vue';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface Props {
    id: string;
    /**
     * GeoTIFF source - URL string, ArrayBuffer, Blob, or geotiff.js instance
     */
    geotiff: string | ArrayBuffer | Blob | object;
    /**
     * Geographic bounds [west, south, east, north]
     * If not provided, will be inferred from GeoTIFF metadata
     */
    bounds?: [number, number, number, number];
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
  }

  const props = withDefaults(defineProps<Props>(), {
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
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
    error: [error: Error];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  // Store module references
  const GeoTIFFLayerClass = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').GeoTIFFLayer | null
  >(null);
  const projModule = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').proj | null
  >(null);
  const toProj4Fn = shallowRef<
    typeof import('geotiff-geokeys-to-proj4').toProj4 | null
  >(null);

  // Create geoKeysParser using geotiff-geokeys-to-proj4
  const createGeoKeysParser = () => {
    if (!projModule.value || !toProj4Fn.value) return undefined;

    const proj = projModule.value;
    const toProj4 = toProj4Fn.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (geoKeys: any) => {
      const projDefinition = toProj4(geoKeys);
      return {
        def: projDefinition.proj4,
        parsed: proj.parseCrs(projDefinition.proj4),
        coordinatesUnits: projDefinition.coordinatesUnits as 'degree' | 'metre',
      };
    };
  };

  const createLayer = () => {
    if (!GeoTIFFLayerClass.value) return null;

    const geoKeysParser = createGeoKeysParser();

    // Use toRaw() to unwrap Vue reactive proxies - required for web worker serialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layerProps: Record<string, any> = {
      id: toRaw(props.id),
      geotiff: toRaw(props.geotiff),
      opacity: toRaw(props.opacity),
      visible: toRaw(props.visible),
      pickable: toRaw(props.pickable),
      autoHighlight: toRaw(props.autoHighlight),
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    };

    if (geoKeysParser) {
      layerProps.geoKeysParser = geoKeysParser;
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

    // Only add optional props if they are defined
    if (props.bounds !== undefined) layerProps.bounds = toRaw(props.bounds);
    if (props.highlightColor !== undefined)
      layerProps.highlightColor = toRaw(props.highlightColor);
    if (props.beforeId !== undefined)
      layerProps.beforeId = toRaw(props.beforeId);

    const layer = new GeoTIFFLayerClass.value(layerProps);
    return markRaw(layer);
  };

  const initializeLayer = async () => {
    try {
      const [geotiffModule, proj4Module] = await Promise.all([
        import('@developmentseed/deck.gl-geotiff'),
        import('geotiff-geokeys-to-proj4'),
      ]);

      GeoTIFFLayerClass.value = markRaw(geotiffModule.GeoTIFFLayer);
      projModule.value = markRaw(geotiffModule.proj);
      toProj4Fn.value = markRaw(proj4Module.toProj4);

      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading GeoTIFFLayer:', error);
      emit('error', error as Error);
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
    () => [props.geotiff, props.bounds, props.opacity, props.visible],
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
