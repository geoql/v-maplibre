<!-- web/app/lib/v-mapbox/layers/maplibre/geojson/VLayerMaplibreGeojson.vue -->
<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
  import type {
    GeoJSONSource,
    GeoJSONSourceSpecification,
    LayerSpecification,
    Map,
    MapLayerMouseEvent,
  } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';

  interface LayerClick {
    features: GeoJSON.Feature[];
    coordinates: {
      lng: number;
      lat: number;
    };
  }

  interface Props {
    sourceId?: string;
    layerId?: string;
    source: GeoJSONSourceSpecification;
    layer: LayerSpecification;
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    sourceId: 'maplibre-gl-geojson-source',
    layerId: 'maplibre-gl-geojson-layer',
    before: '',
  });

  const emit = defineEmits<{
    'on-click': [event: LayerClick];
  }>();

  const map = injectStrict(MapKey);

  // Helper to check if data is valid GeoJSON with features
  const hasValidData = (
    data: string | GeoJSON.GeoJSON | undefined,
  ): boolean => {
    if (!data || typeof data === 'string') return false;
    if (data && typeof data === 'object' && 'type' in data) {
      if (data.type === 'FeatureCollection' && 'features' in data) {
        return data.features.length > 0;
      }
      // Also valid for single Feature or Geometry
      return (
        data.type === 'Feature' ||
        data.type === 'Point' ||
        data.type === 'LineString' ||
        data.type === 'Polygon' ||
        data.type === 'MultiPoint' ||
        data.type === 'MultiLineString' ||
        data.type === 'MultiPolygon'
      );
    }
    return false;
  };

  // Helper function to safely get map instance
  const getMapInstance = (): Map | null => {
    const instance = map.value || null;
    return instance;
  };

  // Track if layer has been initialized to prevent duplicate setup
  const initialized = ref(false);

  // The bound style.load handler (if any) so it can be removed on unmount /
  // when the map ref is reassigned.
  let boundMap: Map | null = null;
  let styleLoadHandler: (() => void) | null = null;
  let dataHandler: (() => void) | null = null;

  // Single, idempotent entry point. Adds the source + layer + events exactly
  // once, but only when the style is loaded AND the data is valid. Safe to
  // call from any number of triggers (style.load, data, prop changes, mount).
  const tryAddLayer = (): boolean => {
    if (initialized.value) return true;

    const mapInstance = getMapInstance();
    if (!mapInstance) return false;

    // Style must be ready before sources/layers can be added.
    if (!mapInstance.isStyleLoaded()) return false;

    // Data must be valid before adding the source (clustering / async loads).
    if (!hasValidData(props.source.data)) return false;

    try {
      if (!mapInstance.getSource(props.sourceId)) {
        mapInstance.addSource(props.sourceId, props.source);
      }

      if (!mapInstance.getLayer(props.layerId)) {
        const layerSpec = {
          ...props.layer,
          id: props.layerId,
          source: props.sourceId,
        } as LayerSpecification;

        mapInstance.addLayer(layerSpec, props.before);
      }

      setupLayerEvents(mapInstance);
      initialized.value = true;
      return true;
    } catch (error) {
      console.error('Error adding GeoJSON layer:', error);
      return false;
    }
  };

  // Bind the readiness handlers to a map instance exactly once. This must
  // handle BOTH cases robustly:
  //   1. style.load fires AFTER we bind  -> the 'style.load' listener catches it
  //   2. style.load already fired BEFORE we bind (fast prod basemap) -> the
  //      synchronous tryAddLayer() below catches the already-loaded style; if
  //      the style reports not-yet-loaded only because sprite/glyph/source data
  //      is still in flight, the 'idle' listener retries once everything settles.
  const bindReadyHandlers = (mapInstance: Map): void => {
    if (boundMap === mapInstance) return;

    // Clean up any handlers bound to a previous map instance.
    unbindReadyHandlers();
    boundMap = mapInstance;

    // (1) Catch style.load firing after we bind (e.g. theme switch, late style).
    styleLoadHandler = () => {
      tryAddLayer();
    };
    mapInstance.on('style.load', styleLoadHandler);

    // (2) Catch the window where style.load already fired but the style was not
    // fully ready at this exact tick (sprite/glyph/source still loading). The
    // 'idle' event fires once the map has finished loading and rendering.
    dataHandler = () => {
      if (initialized.value) {
        if (dataHandler && boundMap) boundMap.off('idle', dataHandler);
        dataHandler = null;
        return;
      }
      tryAddLayer();
    };
    mapInstance.on('idle', dataHandler);

    // (3) Synchronous attempt for the already-fully-loaded case.
    tryAddLayer();
  };

  const unbindReadyHandlers = (): void => {
    if (boundMap) {
      if (styleLoadHandler) boundMap.off('style.load', styleLoadHandler);
      if (dataHandler) boundMap.off('idle', dataHandler);
    }
    boundMap = null;
    styleLoadHandler = null;
    dataHandler = null;
  };

  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      const source = mapInstance.getSource(props.sourceId) as
        | GeoJSONSource
        | undefined;

      if (source && 'setData' in source) {
        // CRITICAL FIX: Only update data if source doesn't have clustering
        // or if this is the first/primary layer for this source
        const existingLayers = mapInstance
          .getStyle()
          .layers.filter(
            (l) =>
              l.type !== 'background' &&
              'source' in l &&
              l.source === props.sourceId,
          );

        // Only update data if this is the first layer using this source
        // This prevents breaking clustering when multiple layers share a source
        if (
          existingLayers.length === 0 ||
          existingLayers[0]?.id === props.layerId
        ) {
          source.setData(props.source.data);
        }
      } else if (!source) {
        // If source doesn't exist, try to add the layer
        tryAddLayer();
      }
    } catch (error) {
      console.error('Error updating GeoJSON source:', error);
    }
  };

  const updateLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(props.layerId)) {
        // Update paint properties
        Object.entries(props.layer.paint || {}).forEach(([key, value]) => {
          mapInstance.setPaintProperty(props.layerId, key, value);
        });
        // Update layout properties
        Object.entries(props.layer.layout || {}).forEach(([key, value]) => {
          mapInstance.setLayoutProperty(props.layerId, key, value);
        });
      } else {
        // If layer doesn't exist, try to add it
        tryAddLayer();
      }
    } catch (error) {
      console.error('Error updating GeoJSON layer:', error);
    }
  };

  const setupLayerEvents = (mapInstance: Map) => {
    if (!mapInstance) {
      return;
    }

    try {
      // Add click handler for the specific layer
      mapInstance.on('click', props.layerId, (e: MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          emit('on-click', {
            features: e.features,
            coordinates: e.lngLat,
          });
        }
      });

      // Add hover effect to verify interactivity
      mapInstance.on('mouseenter', props.layerId, () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', props.layerId, () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    } catch (error) {
      console.error('Error in setupLayerEvents:', error);
    }
  };

  // Watch for map instance changes. Immediate so a map that already exists
  // when this component mounts is bound right away. bindReadyHandlers is
  // idempotent and handles the "style already loaded" race internally.
  watch(
    map,
    (newMap) => {
      if (newMap) {
        bindReadyHandlers(newMap);
      } else {
        // Map ref cleared (e.g. VMap unmounted / remounted on key change).
        unbindReadyHandlers();
        initialized.value = false;
      }
    },
    { immediate: true },
  );

  // Watchers for updates after initialization. Watching `props.source.data`
  // (not a deep watch on the whole object) catches the common case where the
  // page fetches GeoJSON asynchronously and assigns it AFTER the component has
  // mounted — at which point we either add the layer (if not yet added) or
  // update the existing source's data.
  watch(
    () => props.source.data,
    (newData, oldData) => {
      if (!hasValidData(newData)) {
        return;
      }

      // Layer not added yet: this data arrival may be the missing piece.
      if (!initialized.value) {
        const mapInstance = getMapInstance();
        if (mapInstance && !boundMap) {
          bindReadyHandlers(mapInstance);
        } else {
          tryAddLayer();
        }
        return;
      }

      // Layer already added: update the source data in place when it changed.
      if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
        updateSource();
      }
    },
  );

  watch(() => props.layer, updateLayer, { deep: true });

  // Watch for visibility changes
  watch(
    () => props.layer.layout?.visibility,
    (newVisibility) => {
      const mapInstance = getMapInstance();
      if (!mapInstance || !mapInstance.isStyleLoaded()) return;

      const hasLayer = mapInstance.getLayer(props.layerId);

      if (!hasLayer && newVisibility === 'visible') {
        // Add layer if it doesn't exist and should be visible
        if (hasValidData(props.source.data)) {
          tryAddLayer();
        }
      } else if (hasLayer) {
        // Update visibility of existing layer
        try {
          mapInstance.setLayoutProperty(
            props.layerId,
            'visibility',
            newVisibility,
          );
        } catch (error) {
          console.error(
            `Error updating visibility for ${props.layerId}:`,
            error,
          );
        }
      }
    },
    { immediate: true },
  );

  // Lifecycle hooks
  onMounted(() => {
    // Final attempt after Vue has finished mounting, in case the map + style +
    // data were all ready synchronously before the watchers settled.
    nextTick(() => {
      tryAddLayer();
    });
  });

  onBeforeUnmount(() => {
    unbindReadyHandlers();

    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      // Remove layer
      if (mapInstance.getLayer(props.layerId)) {
        mapInstance.removeLayer(props.layerId);
      }

      // Only remove source if no other layers are using it
      const layersUsingSource = mapInstance
        .getStyle()
        .layers.filter(
          (l) =>
            l.type !== 'background' &&
            'source' in l &&
            l.source === props.sourceId,
        );

      if (
        layersUsingSource.length === 0 &&
        mapInstance.getSource(props.sourceId)
      ) {
        mapInstance.removeSource(props.sourceId);
      }
    } catch (error) {
      console.error('Error cleaning up GeoJSON layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
