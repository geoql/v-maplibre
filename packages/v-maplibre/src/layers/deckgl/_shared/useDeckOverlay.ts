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
import type { Map, MapMouseEvent } from 'maplibre-gl';
import { requirePeer } from '../../../utils';

export const DeckOverlayKey: InjectionKey<ShallowRef<MapboxOverlay | null>> =
  Symbol('DeckOverlay');

export const DeckLayersKey: InjectionKey<{
  addLayer: (layer: unknown) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, layer: unknown) => void;
  getLayers: () => unknown[];
}> = Symbol('DeckLayers');

interface UseDeckOverlayOptions {
  interleaved?: boolean;
  /**
   * Enable MapLibre globe projection. Implies `interleaved: true` (required for
   * deck.gl layers to share depth with the globe) and auto-injects
   * `parameters.cullMode = 'none'` on every layer so billboard-style layers
   * (Scatterplot / Trips / Icon / Text) don't clip off the sphere on pitch.
   */
  globe?: boolean;
}

interface UseDeckOverlayReturn {
  overlay: ShallowRef<MapboxOverlay | null>;
  layers: Ref<unknown[]>;
  isInitialized: Ref<boolean>;
  initOverlay: () => Promise<void>;
  addLayer: (layer: unknown) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, layer: unknown) => void;
  getLayers: () => unknown[];
}

export function useDeckOverlay(
  map: Ref<Map | null>,
  options: UseDeckOverlayOptions = {},
): UseDeckOverlayReturn {
  const { interleaved = false, globe = false } = options;
  const useInterleaved = interleaved || globe;

  const applyGlobeParams = (layer: unknown): unknown => {
    if (!globe) return layer;
    const l = layer as {
      clone?: (props: Record<string, unknown>) => unknown;
      props?: { billboard?: boolean; parameters?: Record<string, unknown> };
    };
    if (typeof l.clone !== 'function') return layer;
    // Interleaved globe layers share MapLibre's depth buffer with the globe
    // sphere; deck billboards sit at the sphere-surface depth and z-fight it as
    // the camera moves, producing a motion-coupled diagonal hatch inside each
    // shape (deck.gl open bug visgl/deck.gl#10206). The maintainer-confirmed
    // workaround is depthCompare:'always' (luma.gl v9 WebGPU-style key — NOT the
    // legacy WebGL depthTest/depthWrite, which deck.gl 9 silently ignores) so
    // fragments always pass the depth test instead of fighting the sphere.
    // cullMode:'back' draws a single face. Both come straight from #10206.
    return l.clone({
      parameters: {
        depthCompare: 'always',
        cullMode: 'back',
        ...(l.props?.parameters ?? {}),
      },
    });
  };

  const existingOverlay = inject(DeckOverlayKey, null);
  const existingLayersRegistry = inject(DeckLayersKey, null);

  if (existingOverlay && existingLayersRegistry) {
    return {
      overlay: existingOverlay,
      isInitialized: ref(true),
      layers: ref([]),
      initOverlay: () => Promise.resolve(),
      ...existingLayersRegistry,
    };
  }

  const overlay = shallowRef<MapboxOverlay | null>(null);
  const layers = ref<unknown[]>([]);
  const isInitialized = ref(false);
  let initPromise: Promise<void> | null = null;
  let clickHandler: ((e: MapMouseEvent) => void) | null = null;

  /**
   * Workaround for deck.gl MapboxOverlay click events not reaching layer onClick
   * callbacks. The built-in path (_onPointerDown → _onEvent → getLastPickedObject)
   * fails to dispatch clicks. We register our own MapLibre click handler that uses
   * overlay.pickObject() for a fresh GPU pick and dispatches to the layer's onClick.
   */
  function registerClickHandler(mapInstance: Map): void {
    clickHandler = (e: MapMouseEvent) => {
      if (!overlay.value) return;
      const info = overlay.value.pickObject({
        x: e.point.x,
        y: e.point.y,
        radius: 5,
      });
      if (!info?.layer) return;

      const layerProps = info.layer.props as Record<string, unknown>;
      const onClick = layerProps.onClick as
        | ((i: unknown, ev: unknown) => boolean | void)
        | undefined;
      if (onClick) {
        onClick(info, e);
      }
    };
    mapInstance.on('click', clickHandler);
  }

  function removeClickHandler(mapInstance: Map | null): void {
    if (clickHandler && mapInstance) {
      mapInstance.off('click', clickHandler);
    }
    clickHandler = null;
  }

  // Queues syncLayers() calls made before overlay.value is set so they can be
  // flushed after initOverlay() resolves and overlay.value is assigned.
  const pendingSyncCalls: (() => void)[] = [];

  const initOverlay = (): Promise<void> => {
    const mapInstance = map.value;
    if (!mapInstance) return Promise.resolve();
    if (overlay.value) return Promise.resolve();
    if (initPromise) return initPromise;

    initPromise = requirePeer(
      '@deck.gl/mapbox',
      () => import('@deck.gl/mapbox'),
      'pnpm add @deck.gl/core @deck.gl/mapbox',
    )
      .then(({ MapboxOverlay }) => {
        if (overlay.value) return;

        if (globe && mapInstance.getProjection()?.type !== 'globe') {
          const center = mapInstance.getCenter();
          const zoom = mapInstance.getZoom();
          const pitch = mapInstance.getPitch();
          const bearing = mapInstance.getBearing();
          mapInstance.setProjection({ type: 'globe' });
          mapInstance.setCenter(center);
          mapInstance.setZoom(zoom);
          mapInstance.setPitch(pitch);
          mapInstance.setBearing(bearing);
        }

        overlay.value = new MapboxOverlay({
          interleaved: useInterleaved,
          layers: [],
          onError: (err: unknown) =>
            console.error('[useDeckOverlay] deck onError:', err),
        } as ConstructorParameters<typeof MapboxOverlay>[0]);

        mapInstance.addControl(overlay.value);
        registerClickHandler(mapInstance);
        isInitialized.value = true;

        // Flush any layers that registered before the overlay existed. Child
        // layer components mount before the parent VMap assigns map.value, so
        // their addLayer() calls land in the registry while overlay is null.
        // Without this flush they are silently dropped on first load and only
        // appear after a re-navigation warms the timing.
        syncLayers();
        mapInstance.triggerRepaint();

        // Flush any syncLayers() calls that raced ahead of initOverlay()
        // resolving (they called syncLayers() before overlay.value was set).
        while (pendingSyncCalls.length > 0) {
          pendingSyncCalls.shift()!();
        }
      })
      .catch((error) => {
        console.error('[deck.gl] Error initializing overlay:', error);
        initPromise = null;
      });

    return initPromise;
  };

  const getLayerId = (layer: unknown): string => {
    return (layer as { id: string }).id;
  };

  // Imperative id-keyed registry. A reactive array rebuilt via spread reads
  // races when N child layers mount in the same tick (all read the pre-write
  // value and clobber each other, leaving only the last layer). A Map mutated
  // in place is insertion-ordered and race-free, so every layer survives.
  const layerRegistry = new Map<string, unknown>();

  const syncLayers = () => {
    layers.value = [...layerRegistry.values()];
    if (overlay.value) {
      overlay.value.setProps({ layers: layers.value as never });
      // Only non-interleaved overlays need a forced composite. With
      // interleaved:false deck.gl renders to a SEPARATE canvas; setProps()
      // schedules a deck redraw but does NOT tell MapLibre to composite it, so a
      // fully-static overlay (no animation, no camera move) stays blank without
      // this triggerRepaint(). Interleaved overlays (globe) already draw inside
      // MapLibre's own render pass — forcing an extra repaint on every per-frame
      // updateLayer() races the compositor and produces flicker/smear on
      // animated layers, so it must be skipped there.
      // Guarded with typeof: test-env mock maps don't implement triggerRepaint.
      if (!useInterleaved && typeof map.value?.triggerRepaint === 'function') {
        map.value.triggerRepaint();
      }
    }
  };

  const addLayer = (rawLayer: unknown): void => {
    const layer = applyGlobeParams(rawLayer);
    layerRegistry.set(getLayerId(layer), layer);

    if (overlay.value) {
      syncLayers();
    } else {
      // Queue the call so initOverlay() can flush it after overlay.value is set.
      // Previously this did initOverlay().then(syncLayers), but that called
      // syncLayers() BEFORE overlay.value was assigned (race: the .then() fires
      // immediately if the promise is already resolved, AND the syncLayers() call
      // inside initOverlay's .then() also races ahead before overlay.value is set).
      // The queue ensures every syncLayers() call made before overlay exists
      // is replayed exactly once, after overlay.value is guaranteed to be set.
      pendingSyncCalls.push(syncLayers);
      initOverlay();
    }
  };

  const removeLayer = (layerId: string): void => {
    layerRegistry.delete(layerId);
    syncLayers();
  };

  const updateLayer = (layerId: string, rawLayer: unknown): void => {
    if (layerRegistry.has(layerId)) {
      layerRegistry.set(layerId, applyGlobeParams(rawLayer));
      syncLayers();
    } else {
      addLayer(rawLayer);
    }
  };

  const getLayers = (): unknown[] => {
    return [...layerRegistry.values()];
  };

  watch(
    map,
    (mapInstance) => {
      if (!mapInstance || overlay.value) return;
      if (mapInstance.isStyleLoaded()) {
        initOverlay();
        return;
      }
      mapInstance.once('style.load', () => initOverlay());
      const interval = setInterval(() => {
        if (overlay.value) {
          clearInterval(interval);
          return;
        }
        if (mapInstance.isStyleLoaded()) {
          clearInterval(interval);
          initOverlay();
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 10000);
    },
    { immediate: true },
  );

  provide(DeckOverlayKey, overlay);
  provide(DeckLayersKey, {
    addLayer,
    removeLayer,
    updateLayer,
    getLayers,
  });

  onUnmounted(() => {
    removeClickHandler(map.value);
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
    initPromise = null;
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
