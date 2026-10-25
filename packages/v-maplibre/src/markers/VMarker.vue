<script setup lang="ts">
  import type { Ref } from 'vue';
  import { ref, watch, onMounted, onBeforeUnmount, useSlots } from 'vue';
  import type {
    LngLatLike,
    MarkerOptions,
    PointLike,
    PopupOptions,
    PositionAnchor,
    Map,
  } from 'maplibre-gl';
  import { Marker } from 'maplibre-gl';
  import VPopup from '../popups/VPopup.vue';
  import { markerDOMEvents, markerMapEvents } from '../constants/events';
  import { injectStrict, MapKey } from '../utils';

  const slots = useSlots();

  const props = withDefaults(
    defineProps<{
      coordinates: LngLatLike;
      options?: MarkerOptions;
      popupOptions?: PopupOptions;
      cursor?: string;
      /** Shorthand for `options.draggable`; wins over it when set. */
      draggable?: boolean;
      /** Shorthand for `options.anchor`; wins over it when set. */
      anchor?: PositionAnchor;
      /** Shorthand for `options.offset`; wins over it when set. */
      offset?: PointLike;
      /** Shorthand for `options.color`; wins over it when set. */
      color?: string;
      /** Shorthand for `options.scale`; wins over it when set. */
      scale?: number;
    }>(),
    {
      options: () => ({}),
      popupOptions: () => ({}),
      cursor: 'pointer',
      // Vue casts an absent boolean prop to `false`; keep it undefined so
      // `options.draggable` still applies when the shorthand is not used.
      draggable: undefined,
      anchor: undefined,
      offset: undefined,
      color: undefined,
      scale: undefined,
    },
  );

  // Top-level shorthands that were set, layered over `options`.
  const shorthandOptions = (): MarkerOptions => {
    const result: MarkerOptions = {};
    if (props.draggable !== undefined) result.draggable = props.draggable;
    if (props.anchor !== undefined) result.anchor = props.anchor;
    if (props.offset !== undefined) result.offset = props.offset;
    if (props.color !== undefined) result.color = props.color;
    if (props.scale !== undefined) result.scale = props.scale;
    return result;
  };

  const emit = defineEmits([
    'added',
    'update:coordinates',
    'removed',
    ...markerMapEvents,
    ...markerDOMEvents,
  ]);

  const map = injectStrict(MapKey);
  const marker: Ref<Marker | null> = ref(null);
  const loaded = ref(true);
  const isMarkerAvailable = ref(false);
  const slotRef = ref<HTMLElement | null>(null);

  // Helper function to safely get map instance
  const getMapInstance = (): Map | null => {
    return map.value || null;
  };

  // Setup functions
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

  const setSlotRef = (el: HTMLElement | Element | null) => {
    if (el instanceof HTMLElement) {
      slotRef.value = el;
    }
  };

  const setMarkerCoordinates = (markerInstance: Marker): void => {
    try {
      markerInstance.setLngLat(props.coordinates);
    } catch (error) {
      console.error('Error setting marker coordinates:', error);
    }
  };

  const setCursorPointer = (markerInstance: Marker): void => {
    try {
      markerInstance.getElement().style.cursor = props.cursor || 'default';
    } catch (error) {
      console.error('Error setting cursor:', error);
    }
  };

  const addToMap = (markerInstance: Marker): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      markerInstance.addTo(mapInstance);
      emit('added', { marker: markerInstance });
    } catch (error) {
      console.error('Error adding marker to map:', error);
    }
  };

  const removeFromMap = (markerInstance: Marker): void => {
    try {
      markerInstance.remove();
      emit('removed');
    } catch (error) {
      console.error('Error removing marker from map:', error);
    }
  };

  const listenMarkerEvents = (markerInstance: Marker): void => {
    try {
      let coordinates: LngLatLike;
      markerMapEvents.forEach((event) => {
        markerInstance.on(event, (e: { target: Marker }) => {
          if (event === 'dragend') {
            if (Array.isArray(props.coordinates)) {
              coordinates = [
                e.target.getLngLat().lng,
                e.target.getLngLat().lat,
              ];
            } else {
              coordinates = e.target.getLngLat();
            }
            emit('update:coordinates', coordinates);
          }
          emit(event, e);
        });
      });

      markerDOMEvents.forEach((event) => {
        markerInstance.getElement().addEventListener(event, (e) => {
          emit(event, e);
        });
      });
    } catch (error) {
      console.error('Error setting up marker events:', error);
    }
  };

  // Watchers
  watch(marker, (markerValue) => {
    isMarkerAvailable.value = markerValue !== null && '_map' in markerValue;
  });

  // Watch for map instance changes
  watch(
    map,
    (newMap) => {
      if (newMap) {
        setupMap(newMap);
      }
    },
    { immediate: true },
  );

  const initMarker = (element?: HTMLElement) => {
    if (!loaded.value || marker.value) return;

    try {
      const markerOptions: MarkerOptions = {
        ...props.options,
        ...shorthandOptions(),
        element: element || undefined,
      };
      marker.value = new Marker(markerOptions);
      setMarkerCoordinates(marker.value);
      addToMap(marker.value);
      setCursorPointer(marker.value);
      listenMarkerEvents(marker.value);
    } catch (error) {
      console.error('Error initializing marker:', error);
    }
  };

  // MapLibre can change these two on a live marker; the others need a new one.
  watch(
    () => props.draggable,
    (draggable) => {
      if (marker.value && draggable !== undefined) {
        marker.value.setDraggable(draggable);
      }
    },
  );
  watch(
    () => props.offset,
    (offset) => {
      if (marker.value && offset !== undefined) {
        marker.value.setOffset(offset);
      }
    },
  );

  watch(slotRef, (el) => {
    if (el && !marker.value) {
      initMarker(el);
    }
  });

  onMounted(() => {
    const hasCustomElement = !!slots.markers;
    if (!hasCustomElement) {
      initMarker();
    }
  });

  onBeforeUnmount(() => {
    if (marker.value) {
      removeFromMap(marker.value);
    }
  });
</script>

<template>
  <section :id="`marker-${Date.now()}`" class="absolute">
    <slot :set-ref="setSlotRef" name="markers"></slot>
    <template v-if="isMarkerAvailable && $slots.default">
      <v-popup
        :marker="marker!"
        :options="popupOptions"
        :coordinates="coordinates"
      >
        <slot></slot>
      </v-popup>
    </template>
  </section>
</template>

<style>
  .absolute {
    position: absolute !important;
  }
</style>
