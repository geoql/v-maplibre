<script setup lang="ts">
  import type { Ref } from 'vue';
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
  import type {
    LngLatLike,
    MarkerOptions,
    PopupOptions,
    Map,
  } from 'maplibre-gl';
  import { Marker } from 'maplibre-gl';
  import VPopup from '../popups/VPopup.vue';
  import { markerDOMEvents, markerMapEvents } from '../constants/events';
  import { injectStrict, MapKey } from '../utils';

  const props = withDefaults(
    defineProps<{
      coordinates: LngLatLike | null;
      options?: MarkerOptions;
      popupOptions?: PopupOptions;
      cursor?: string;
    }>(),
    {
      coordinates: null,
      options: () => ({}),
      popupOptions: () => ({}),
      cursor: 'pointer',
    },
  );

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
    if (props.coordinates !== null) {
      try {
        markerInstance.setLngLat(props.coordinates);
      } catch (error) {
        console.error('Error setting marker coordinates:', error);
      }
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
      markerMapEvents.forEach((event: string) => {
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

      markerDOMEvents.forEach((event: string) => {
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

  // Lifecycle hooks
  onMounted(() => {
    if (loaded.value) {
      try {
        const markerOptions: MarkerOptions = {
          ...props.options,
          element: slotRef.value || undefined,
        };
        marker.value = new Marker(markerOptions);
        setMarkerCoordinates(marker.value);
        addToMap(marker.value);
        setCursorPointer(marker.value);
        listenMarkerEvents(marker.value);
      } catch (error) {
        console.error('Error initializing marker:', error);
      }
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
    <template v-if="isMarkerAvailable">
      <v-popup
        :marker="marker!"
        :options="popupOptions"
        :coordinates="coordinates!"
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
