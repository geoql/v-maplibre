import {
  inject,
  provide,
  ref,
  shallowRef,
  onUnmounted,
  watch,
  type InjectionKey,
  type Ref,
  type ShallowRef,
} from 'vue';
import type { MapboxOverlay } from '@deck.gl/mapbox';
import type { Map } from 'maplibre-gl';

export const DeckOverlayKey: InjectionKey<ShallowRef<MapboxOverlay | null>> =
  Symbol('DeckOverlay');

export const DeckLayersKey: InjectionKey<{
  addLayer: (layer: unknown) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, layer: unknown) => void;
}> = Symbol('DeckLayers');

interface UseDeckOverlayOptions {
  interleaved?: boolean;
}

interface UseDeckOverlayReturn {
  overlay: ShallowRef<MapboxOverlay | null>;
  layers: Ref<unknown[]>;
  isInitialized: Ref<boolean>;
  initOverlay: () => void;
  addLayer: (layer: unknown) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, layer: unknown) => void;
  getLayers: () => unknown[];
}

export function useDeckOverlay(
  map: Ref<Map | null>,
  options: UseDeckOverlayOptions = {},
): UseDeckOverlayReturn {
  const { interleaved = false } = options;

  const existingOverlay = inject(DeckOverlayKey, null);
  const existingLayersRegistry = inject(DeckLayersKey, null);

  if (existingOverlay && existingLayersRegistry) {
    return {
      overlay: existingOverlay,
      isInitialized: ref(true),
      layers: ref([]),
      initOverlay: () => {},
      getLayers: () => [],
      ...existingLayersRegistry,
    };
  }

  const overlay = shallowRef<MapboxOverlay | null>(null);
  const layers = ref<unknown[]>([]);
  const isInitialized = ref(false);

  const initOverlay = () => {
    const mapInstance = map.value;
    if (!mapInstance || overlay.value) return;

    try {
      import('@deck.gl/mapbox').then(({ MapboxOverlay }) => {
        overlay.value = new MapboxOverlay({
          interleaved,
          layers: [],
        });

        mapInstance.addControl(overlay.value);
        isInitialized.value = true;
      });
    } catch (error) {
      console.error('[deck.gl] Error initializing overlay:', error);
    }
  };

  const getLayerId = (layer: unknown): string => {
    return (layer as { id: string }).id;
  };

  const addLayer = (layer: unknown): void => {
    if (!overlay.value) {
      initOverlay();
    }

    const layerId = getLayerId(layer);
    const existingIndex = layers.value.findIndex(
      (l) => getLayerId(l) === layerId,
    );

    if (existingIndex >= 0) {
      layers.value = [
        ...layers.value.slice(0, existingIndex),
        layer,
        ...layers.value.slice(existingIndex + 1),
      ];
    } else {
      layers.value = [...layers.value, layer];
    }

    overlay.value?.setProps({ layers: layers.value as never });
  };

  const removeLayer = (layerId: string): void => {
    layers.value = layers.value.filter((l) => getLayerId(l) !== layerId);
    overlay.value?.setProps({ layers: layers.value as never });
  };

  const updateLayer = (layerId: string, newLayer: unknown): void => {
    const index = layers.value.findIndex((l) => getLayerId(l) === layerId);
    if (index >= 0) {
      layers.value = [
        ...layers.value.slice(0, index),
        newLayer,
        ...layers.value.slice(index + 1),
      ];
      overlay.value?.setProps({ layers: layers.value as never });
    } else {
      addLayer(newLayer);
    }
  };

  const getLayers = (): unknown[] => {
    return [...layers.value];
  };

  watch(
    map,
    (mapInstance) => {
      if (mapInstance && !overlay.value) {
        if (mapInstance.isStyleLoaded()) {
          initOverlay();
        } else {
          mapInstance.once('style.load', () => {
            initOverlay();
          });
        }
      }
    },
    { immediate: true },
  );

  provide(DeckOverlayKey, overlay);
  provide(DeckLayersKey, {
    addLayer,
    removeLayer,
    updateLayer,
  });

  onUnmounted(() => {
    if (overlay.value && map.value) {
      try {
        map.value.removeControl(overlay.value);
        overlay.value.finalize();
      } catch (error) {
        console.error('[deck.gl] Error cleaning up overlay:', error);
      }
    }
    overlay.value = null;
    layers.value = [];
    isInitialized.value = false;
  });

  return {
    overlay,
    layers,
    isInitialized,
    initOverlay,
    addLayer,
    removeLayer,
    updateLayer,
    getLayers,
  };
}

export function useDeckLayers() {
  const registry = inject(DeckLayersKey, null);
  const overlay = inject(DeckOverlayKey, null);

  if (!registry) {
    throw new Error(
      '[deck.gl] useDeckLayers must be used within a component that has initialized useDeckOverlay',
    );
  }

  return {
    ...registry,
    overlay,
  };
}
