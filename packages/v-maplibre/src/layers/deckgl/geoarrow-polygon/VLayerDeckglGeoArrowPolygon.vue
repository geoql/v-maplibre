<script setup lang="ts">
  /**
   * Render filled polygons with optional stroke from an Apache Arrow
   * `RecordBatch` containing GeoArrow polygon geometries (extension type
   * `geoarrow.polygon` or `geoarrow.multipolygon`).
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/layers`
   * @requires `@deck.gl/mapbox`
   * @requires `@geoarrow/deck.gl-geoarrow`
   * @requires `apache-arrow`
   * @requires `@math.gl/polygon`
   *
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @geoarrow/deck.gl-geoarrow apache-arrow @math.gl/polygon`
   */
  import { onMounted, onBeforeUnmount, watch, shallowRef, markRaw } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey, requirePeer } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  const GEOARROW_PEER_INSTALL =
    'pnpm add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @geoarrow/deck.gl-geoarrow apache-arrow @math.gl/polygon';

  type Props = {
    id: string;
    data: import('apache-arrow').RecordBatch | null | undefined;
    getPolygon?: unknown;
    getFillColor?: unknown;
    getLineColor?: unknown;
    getLineWidth?: unknown;
    getElevation?: unknown;
    lineWidthUnits?: 'meters' | 'common' | 'pixels';
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    stroked?: boolean;
    filled?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    elevationScale?: number;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    beforeId?: string;
    earcutWorkerUrl?: string | URL | null;
    /** Normalize polygons that cross the antimeridian. Default: true. */
    _normalize?: boolean;
    /** Wrap polygons across the antimeridian. Default: true. */
    wrapLongitude?: boolean;
  };

  const props = withDefaults(defineProps<Props>(), {
    visible: true,
    pickable: false,
    autoHighlight: false,
    stroked: true,
    filled: true,
    extruded: false,
    wireframe: false,
    // _normalize default left undefined — GeoArrow native data is already
    // normalized; setting true causes deck.gl to re-normalize Struct-based
    // coords and produces stretched polygons.
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const LayerClass = shallowRef<
    typeof import('@geoarrow/deck.gl-geoarrow').GeoArrowPolygonLayer | null
  >(null);

  const createLayer = () => {
    if (!LayerClass.value || !props.data) return null;
    const cfg: Record<string, unknown> = {
      id: props.id,
      data: props.data,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    };
    if (props.getPolygon !== undefined) cfg.getPolygon = props.getPolygon;
    if (props.getFillColor !== undefined) cfg.getFillColor = props.getFillColor;
    if (props.getLineColor !== undefined) cfg.getLineColor = props.getLineColor;
    if (props.getLineWidth !== undefined) cfg.getLineWidth = props.getLineWidth;
    if (props.getElevation !== undefined) cfg.getElevation = props.getElevation;
    if (props.lineWidthUnits !== undefined)
      cfg.lineWidthUnits = props.lineWidthUnits;
    if (props.lineWidthScale !== undefined)
      cfg.lineWidthScale = props.lineWidthScale;
    if (props.lineWidthMinPixels !== undefined)
      cfg.lineWidthMinPixels = props.lineWidthMinPixels;
    if (props.lineWidthMaxPixels !== undefined)
      cfg.lineWidthMaxPixels = props.lineWidthMaxPixels;
    if (props.stroked !== undefined) cfg.stroked = props.stroked;
    if (props.filled !== undefined) cfg.filled = props.filled;
    if (props.extruded !== undefined) cfg.extruded = props.extruded;
    if (props.wireframe !== undefined) cfg.wireframe = props.wireframe;
    if (props._normalize !== undefined) cfg._normalize = props._normalize;
    if (props.wrapLongitude !== undefined)
      cfg.wrapLongitude = props.wrapLongitude;
    if (props.elevationScale !== undefined)
      cfg.elevationScale = props.elevationScale;
    if (props.opacity !== undefined) cfg.opacity = props.opacity;
    if (props.visible !== undefined) cfg.visible = props.visible;
    if (props.pickable !== undefined) cfg.pickable = props.pickable;
    if (props.autoHighlight !== undefined)
      cfg.autoHighlight = props.autoHighlight;
    if (props.beforeId !== undefined) cfg.beforeId = props.beforeId;
    if (props.earcutWorkerUrl !== undefined)
      cfg.earcutWorkerUrl = props.earcutWorkerUrl;
    try {
      return markRaw(new LayerClass.value(cfg));
    } catch {
      return null;
    }
  };

  const initializeLayer = async () => {
    try {
      const mod = await requirePeer(
        '@geoarrow/deck.gl-geoarrow',
        () => import('@geoarrow/deck.gl-geoarrow'),
        GEOARROW_PEER_INSTALL,
      );
      LayerClass.value = markRaw(mod.GeoArrowPolygonLayer);
    } catch {
      // peer dep not installed — wrapper is inert
    }
  };

  onMounted(() => {
    // deck.gl layers (MapboxOverlay) don't need MapLibre style data but we
    // wait for the style to be loaded as a safety belt — matches all other
    // deck.gl wrappers in this library.
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', () => initializeLayer());
    }
  });

  // Create layer when LayerClass becomes available (handles async module load race condition).
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

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
