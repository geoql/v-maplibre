<script setup lang="ts">
  import type { Ref } from 'vue';
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
  import type { LngLatLike, Marker, PopupOptions, Map } from 'maplibre-gl';
  import { Popup } from 'maplibre-gl';
  import { popupEvents } from '../constants/events';
  import { injectStrict, MapKey } from '../utils';

  const props = withDefaults(
    defineProps<{
      options: PopupOptions;
      coordinates: LngLatLike;
      marker?: Marker;
    }>(),
    {
      options: () => ({}) as PopupOptions,
      coordinates: () => ({}) as LngLatLike,
      marker: () => ({}) as Marker,
    },
  );

  const emit = defineEmits<{
    (e: 'added', payload: { popup: Popup }): void;
    (e: 'removed' | 'open' | 'close'): void;
  }>();

  const map = injectStrict(MapKey);
  const popup = new Popup(props.options);
  const loaded: Ref<boolean> = ref(true);
  const content = ref<HTMLElement | null>(null);

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

  const setPopupContent = (): void => {
    try {
      if (content.value) {
        popup.setDOMContent(content.value);
      }
    } catch (error) {
      console.error('Error setting popup content:', error);
    }
  };

  const setPopupCoordinates = (): void => {
    try {
      popup.setLngLat(props.coordinates);
    } catch (error) {
      console.error('Error setting popup coordinates:', error);
    }
  };

  const addToMarker = (): void => {
    const mapInstance = getMapInstance();
    if (!mapInstance) return;

    try {
      if ('setPopup' in props.marker) {
        props.marker.setPopup(popup);
      } else {
        popup.addTo(mapInstance);
      }
      emit('added', { popup });
    } catch (error) {
      console.error('Error adding popup to marker:', error);
    }
  };

  const remove = (): void => {
    try {
      popup.remove();
      emit('removed');
    } catch (error) {
      console.error('Error removing popup:', error);
    }
  };

  const listenPopupEvents = (): void => {
    try {
      popupEvents.forEach((event) => {
        popup.on(event, () => {
          emit(event);
        });
      });
    } catch (error) {
      console.error('Error setting up popup events:', error);
    }
  };

  const removePopupEvents = (): void => {
    try {
      popupEvents.forEach((event) => {
        popup.off(event, () => {
          emit(event);
        });
      });
    } catch (error) {
      console.error('Error removing popup events:', error);
    }
  };

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

  // Watch for coordinates changes
  watch(
    () => props.coordinates,
    () => {
      setPopupCoordinates();
    },
    { deep: true },
  );

  // Lifecycle hooks
  onMounted(() => {
    if (loaded.value) {
      try {
        setPopupContent();
        setPopupCoordinates();
        addToMarker();
        listenPopupEvents();
      } catch (error) {
        console.error('Error initializing popup:', error);
      }
    } else {
      remove();
      removePopupEvents();
    }
  });

  onBeforeUnmount(() => {
    remove();
    removePopupEvents();
  });
</script>

<template>
  <section :id="`popup-${Date.now()}`" ref="content">
    <slot></slot>
  </section>
</template>
