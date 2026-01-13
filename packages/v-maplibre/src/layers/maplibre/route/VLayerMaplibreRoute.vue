<script setup lang="ts">
  import type { Ref } from 'vue';
  import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
  import type {
    GeoJSONSource,
    Map,
    MapLayerMouseEvent,
    LineLayerSpecification,
  } from 'maplibre-gl';
  import { injectStrict, MapKey } from '../../../utils';

  interface RouteClick {
    coordinates: {
      lng: number;
      lat: number;
    };
  }

  interface Props {
    /** Unique identifier for the route */
    id?: string;
    /** Array of [longitude, latitude] coordinate pairs defining the route */
    coordinates: [number, number][];
    /** Line color as CSS color value */
    color?: string;
    /** Line width in pixels */
    width?: number;
    /** Line opacity (0-1) */
    opacity?: number;
    /** Line cap style */
    lineCap?: 'butt' | 'round' | 'square';
    /** Line join style */
    lineJoin?: 'bevel' | 'round' | 'miter';
    /** Whether the route is visible */
    visible?: boolean;
    /** Whether the route is interactive (shows pointer cursor on hover) */
    interactive?: boolean;
    /** Render this layer before the specified layer */
    before?: string;
    /** Line dash array for dashed lines */
    dashArray?: number[];
    /** Line blur in pixels */
    blur?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: () => `route-${Math.random().toString(36).slice(2, 9)}`,
    color: '#4285F4',
    width: 4,
    opacity: 1,
    lineCap: 'round',
    lineJoin: 'round',
    visible: true,
    interactive: true,
    before: '',
    blur: 0,
  });

  const emit = defineEmits<{
    click: [event: RouteClick];
    mouseenter: [];
    mouseleave: [];
  }>();

  const map = injectStrict(MapKey);
  const loaded: Ref<boolean> = ref(false);

  const sourceId = computed(() => `${props.id}-source`);
  const layerId = computed(() => `${props.id}-layer`);

  // Create GeoJSON data from coordinates
  const geojsonData = computed(
    (): GeoJSON.FeatureCollection<GeoJSON.LineString> => ({
      type: 'FeatureCollection',
      features:
        props.coordinates.length >= 2
          ? [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: props.coordinates,
                },
              },
            ]
          : [],
    }),
  );

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

  const addLayer = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    // Don't add if no valid coordinates
    if (props.coordinates.length < 2) return;

    try {
      // Only add source if it doesn't exist
      if (!mapInstance.getSource(sourceId.value)) {
        mapInstance.addSource(sourceId.value, {
          type: 'geojson',
          data: geojsonData.value,
        });
      }

      // Only add layer if it doesn't exist
      if (!mapInstance.getLayer(layerId.value)) {
        const layerSpec: LineLayerSpecification = {
          id: layerId.value,
          type: 'line',
          source: sourceId.value,
          layout: {
            'line-cap': props.lineCap,
            'line-join': props.lineJoin,
            visibility: props.visible ? 'visible' : 'none',
          },
          paint: {
            'line-color': props.color,
            'line-width': props.width,
            'line-opacity': props.opacity,
            ...(props.blur > 0 && { 'line-blur': props.blur }),
            ...(props.dashArray && { 'line-dasharray': props.dashArray }),
          },
        };

        mapInstance.addLayer(layerSpec, props.before || undefined);
      }
    } catch (error) {
      console.error('Error adding route layer:', error);
    }
  };

  const updateSource = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      const source = mapInstance.getSource(sourceId.value) as
        | GeoJSONSource
        | undefined;

      if (source && 'setData' in source) {
        source.setData(geojsonData.value);
      } else if (!source && props.coordinates.length >= 2) {
        addLayer();
      }
    } catch (error) {
      console.error('Error updating route source:', error);
    }
  };

  const updateLayerStyle = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance || !mapInstance.getLayer(layerId.value)) return;

    try {
      // Update paint properties
      mapInstance.setPaintProperty(layerId.value, 'line-color', props.color);
      mapInstance.setPaintProperty(layerId.value, 'line-width', props.width);
      mapInstance.setPaintProperty(
        layerId.value,
        'line-opacity',
        props.opacity,
      );

      if (props.blur > 0) {
        mapInstance.setPaintProperty(layerId.value, 'line-blur', props.blur);
      }
      if (props.dashArray) {
        mapInstance.setPaintProperty(
          layerId.value,
          'line-dasharray',
          props.dashArray,
        );
      }

      // Update layout properties
      mapInstance.setLayoutProperty(layerId.value, 'line-cap', props.lineCap);
      mapInstance.setLayoutProperty(layerId.value, 'line-join', props.lineJoin);
      mapInstance.setLayoutProperty(
        layerId.value,
        'visibility',
        props.visible ? 'visible' : 'none',
      );
    } catch (error) {
      console.error('Error updating route layer style:', error);
    }
  };

  const setupLayerEvents = (mapInstance: Map) => {
    if (!mapInstance || !props.interactive) return;

    try {
      // Click handler
      mapInstance.on('click', layerId.value, (e: MapLayerMouseEvent) => {
        emit('click', {
          coordinates: e.lngLat,
        });
      });

      // Hover effects
      mapInstance.on('mouseenter', layerId.value, () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
        emit('mouseenter');
      });

      mapInstance.on('mouseleave', layerId.value, () => {
        mapInstance.getCanvas().style.cursor = '';
        emit('mouseleave');
      });
    } catch (error) {
      console.error('Error setting up route layer events:', error);
    }
  };

  // Watch for coordinate changes
  watch(
    () => props.coordinates,
    () => {
      const mapInstance = getMapInstance();
      if (mapInstance?.isStyleLoaded()) {
        if (!mapInstance.getSource(sourceId.value)) {
          addLayer();
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
      props.color,
      props.width,
      props.opacity,
      props.lineCap,
      props.lineJoin,
      props.visible,
      props.blur,
      props.dashArray,
    ],
    () => updateLayerStyle(),
    { deep: true },
  );

  // Watch for map instance changes
  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
        if (newMap.isStyleLoaded()) {
          loaded.value = true;
        }
      }
    },
    { immediate: true },
  );

  // Watch loaded state
  watch(loaded, (value) => {
    if (value && props.coordinates.length >= 2) {
      const mapInstance = getMapInstance();
      if (mapInstance) {
        addLayer();
        setupLayerEvents(mapInstance);
      }
    }
  });

  // Lifecycle hooks
  onMounted(() => {
    try {
      const mapInstance = getMapInstance();
      if (mapInstance?.isStyleLoaded() && props.coordinates.length >= 2) {
        addLayer();
        setupLayerEvents(mapInstance);
      }
    } catch (error) {
      console.error('Error mounting route layer:', error);
    }
  });

  onBeforeUnmount(() => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if (mapInstance.getLayer(layerId.value)) {
        mapInstance.removeLayer(layerId.value);
      }
      if (mapInstance.getSource(sourceId.value)) {
        mapInstance.removeSource(sourceId.value);
      }
    } catch (error) {
      console.error('Error cleaning up route layer:', error);
    }
  });
</script>

<template>
  <slot></slot>
</template>
