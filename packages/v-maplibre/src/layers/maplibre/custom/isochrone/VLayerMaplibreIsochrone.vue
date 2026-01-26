<script setup lang="ts">
  import type { Ref } from 'vue';
  import {
    onMounted,
    onBeforeUnmount,
    ref,
    watch,
    computed,
    nextTick,
  } from 'vue';
  import type {
    GeoJSONSource,
    Map,
    MapLayerMouseEvent,
    FillLayerSpecification,
    LineLayerSpecification,
  } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../../utils';

  interface IsochroneFeature {
    type: 'Feature';
    properties: {
      color: string;
      contour?: number;
      metric?: string;
      [key: string]: unknown;
    };
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  }

  interface IsochroneData {
    type: 'FeatureCollection';
    features: IsochroneFeature[];
  }

  interface IsochroneClick {
    feature: IsochroneFeature;
    coordinates: {
      lng: number;
      lat: number;
    };
  }

  interface Props {
    /** Unique identifier for the isochrone layer */
    id?: string;
    /** GeoJSON FeatureCollection with isochrone polygons (from Valhalla, OSRM, etc.) */
    data: IsochroneData | null;
    /** Fill opacity (0-1) */
    fillOpacity?: number;
    /** Line width in pixels for polygon outlines */
    lineWidth?: number;
    /** Line opacity (0-1) */
    lineOpacity?: number;
    /** Whether the layer is visible */
    visible?: boolean;
    /** Whether the layer is interactive (shows pointer cursor on hover) */
    interactive?: boolean;
    /** Render this layer before the specified layer */
    before?: string;
    /** Whether to reverse the feature order (for proper stacking of overlapping polygons) */
    reverseOrder?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: () => `isochrone-${Math.random().toString(36).slice(2, 9)}`,
    fillOpacity: 0.4,
    lineWidth: 2,
    lineOpacity: 0.8,
    visible: true,
    interactive: true,
    before: '',
    reverseOrder: true,
  });

  const emit = defineEmits<{
    click: [event: IsochroneClick];
    mouseenter: [feature: IsochroneFeature];
    mouseleave: [];
  }>();

  const map = injectStrict(MapKey);
  const loaded: Ref<boolean> = ref(false);
  const initialized = ref(false);

  const sourceId = computed(() => `${props.id}-source`);
  const fillLayerId = computed(() => `${props.id}-fill`);
  const lineLayerId = computed(() => `${props.id}-line`);

  /**
   * Process the GeoJSON data:
   * 1. Optionally reverse feature order for proper polygon stacking
   * 2. Add fillColor property with # prefix (Valhalla returns colors without #)
   */
  const processedData = computed((): IsochroneData | null => {
    if (!props.data || !props.data.features || props.data.features.length === 0)
      return null;

    const features = props.reverseOrder
      ? [...props.data.features].reverse()
      : props.data.features;

    return {
      type: 'FeatureCollection',
      features: features.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          // Add # prefix if color doesn't have it (Valhalla format)
          fillColor: f.properties.color.startsWith('#')
            ? f.properties.color
            : `#${f.properties.color}`,
        },
      })),
    };
  });

  // Helper function to safely get map instance
  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  // Setup map style load listener
  const setupMap = (mapInstance: Map) => {
    if (!mapInstance) return;

    mapInstance.on('style.load', () => {
      const styleTimeout = () => {
        if (!mapInstance.isStyleLoaded()) {
          loaded.value = false;
          setTimeout(styleTimeout, 200);
        } else {
          loaded.value = true;
        }
      };
      styleTimeout();
    });
  };

  const addLayers = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    const data = processedData.value;
    if (!data) return;

    try {
      // Add source if it doesn't exist
      if (!mapInstance.getSource(sourceId.value)) {
        mapInstance.addSource(sourceId.value, {
          type: 'geojson',
          data,
        });
      }

      // Add fill layer
      if (!mapInstance.getLayer(fillLayerId.value)) {
        const fillLayerSpec: FillLayerSpecification = {
          id: fillLayerId.value,
          type: 'fill',
          source: sourceId.value,
          layout: {
            visibility: props.visible ? 'visible' : 'none',
          },
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': props.fillOpacity,
          },
        };

        mapInstance.addLayer(fillLayerSpec, props.before || undefined);
      }

      // Add line layer
      if (!mapInstance.getLayer(lineLayerId.value)) {
        const lineLayerSpec: LineLayerSpecification = {
          id: lineLayerId.value,
          type: 'line',
          source: sourceId.value,
          layout: {
            visibility: props.visible ? 'visible' : 'none',
          },
          paint: {
            'line-color': ['get', 'fillColor'],
            'line-width': props.lineWidth,
            'line-opacity': props.lineOpacity,
          },
        };

        mapInstance.addLayer(lineLayerSpec, props.before || undefined);
      }
    } catch (error) {
      console.error('Error adding isochrone layers:', error);
    }
  };

  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      const source = mapInstance.getSource(sourceId.value) as
        | GeoJSONSource
        | undefined;

      const data = processedData.value;

      if (source && 'setData' in source) {
        if (data) {
          source.setData(data);
        }
      } else if (!source && data) {
        addLayers();
      }
    } catch (error) {
      console.error('Error updating isochrone source:', error);
    }
  };

  const updateLayerStyle = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      // Update fill layer
      if (mapInstance.getLayer(fillLayerId.value)) {
        mapInstance.setPaintProperty(
          fillLayerId.value,
          'fill-opacity',
          props.fillOpacity,
        );
        mapInstance.setLayoutProperty(
          fillLayerId.value,
          'visibility',
          props.visible ? 'visible' : 'none',
        );
      }

      // Update line layer
      if (mapInstance.getLayer(lineLayerId.value)) {
        mapInstance.setPaintProperty(
          lineLayerId.value,
          'line-width',
          props.lineWidth,
        );
        mapInstance.setPaintProperty(
          lineLayerId.value,
          'line-opacity',
          props.lineOpacity,
        );
        mapInstance.setLayoutProperty(
          lineLayerId.value,
          'visibility',
          props.visible ? 'visible' : 'none',
        );
      }
    } catch (error) {
      console.error('Error updating isochrone layer style:', error);
    }
  };

  const setupLayerEvents = (mapInstance: Map) => {
    if (!mapInstance || !props.interactive) return;

    try {
      // Click handler on fill layer
      mapInstance.on('click', fillLayerId.value, (e: MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          emit('click', {
            feature: e.features[0] as unknown as IsochroneFeature,
            coordinates: e.lngLat,
          });
        }
      });

      // Hover effects
      mapInstance.on(
        'mouseenter',
        fillLayerId.value,
        (e: MapLayerMouseEvent) => {
          mapInstance.getCanvas().style.cursor = 'pointer';
          if (e.features && e.features.length > 0) {
            emit('mouseenter', e.features[0] as unknown as IsochroneFeature);
          }
        },
      );

      mapInstance.on('mouseleave', fillLayerId.value, () => {
        mapInstance.getCanvas().style.cursor = '';
        emit('mouseleave');
      });
    } catch (error) {
      console.error('Error setting up isochrone layer events:', error);
    }
  };

  // Single initialization function to prevent race conditions
  const initializeLayers = async () => {
    if (initialized.value) return;

    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;
    if (!processedData.value) return;

    // Wait for next tick to ensure all watchers are set up
    await nextTick();

    // Double-check we haven't been initialized during the tick
    if (initialized.value) return;

    addLayers();
    setupLayerEvents(mapInstance);
    initialized.value = true;
  };

  // Watch for data changes
  watch(
    () => props.data,
    () => {
      const mapInstance = getMapInstance();
      if (mapInstance?.isStyleLoaded()) {
        if (!mapInstance.getSource(sourceId.value)) {
          addLayers();
        } else {
          updateSource();
        }
      }
    },
    { deep: true },
  );

  // Watch for style changes
  watch(
    () => [
      props.fillOpacity,
      props.lineWidth,
      props.lineOpacity,
      props.visible,
    ],
    () => updateLayerStyle(),
    { deep: true },
  );

  // IMPORTANT: watch(loaded) must be defined BEFORE watch(map) with immediate: true
  // Otherwise, when map watcher sets loaded.value = true, this watcher won't catch it
  watch(loaded, (value) => {
    if (value) {
      initializeLayers();
    }
  });

  // Watch for map instance changes
  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
        if (newMap.isStyleLoaded()) {
          loaded.value = true;
          // Also call initializeLayers directly in case loaded watcher already ran
          initializeLayers();
        }
      }
    },
    { immediate: true },
  );

  // Lifecycle hooks
  onMounted(() => {
    // Use nextTick to ensure all watchers are registered
    nextTick(() => {
      initializeLayers();
    });
  });

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      // Remove layers
      if (mapInstance.getLayer(lineLayerId.value)) {
        mapInstance.removeLayer(lineLayerId.value);
      }
      if (mapInstance.getLayer(fillLayerId.value)) {
        mapInstance.removeLayer(fillLayerId.value);
      }
      // Remove source
      if (mapInstance.getSource(sourceId.value)) {
        mapInstance.removeSource(sourceId.value);
      }
    } catch (error) {
      console.error('Error cleaning up isochrone layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
