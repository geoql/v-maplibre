<script setup lang="ts">
  import { Map, addProtocol } from 'maplibre-gl';
  import { Protocol } from 'pmtiles';
  import { onMounted, onUnmounted, provide, ref, shallowRef, watch } from 'vue';
  import type {
    DragRotateOptions,
    MapOptions,
    MapEventType,
  } from 'maplibre-gl';
  import type { Ref } from 'vue';
  import { mapEvents } from '../constants/events';
  import { MapKey, PMTileProtocolKey } from '../utils/symbols';
  import { installMaplibreWorkerUrl } from '../utils/maplibre-worker-url';
  import { provideDeckOverlay } from '../layers/deckgl/_shared/deckOverlayContext';

  const props = withDefaults(
    defineProps<{
      options?: MapOptions;
      supportPmtiles?: boolean;
      projection?: 'globe' | 'mercator';
      deckUseDevicePixels?: number | boolean;
      /**
       * Reactive values for the style's `global-state` expressions. Applied
       * as the initial state (overriding the style's `state` defaults) and
       * kept in sync afterwards: a changed key calls
       * `map.setGlobalStateProperty`, a removed key resets to the style
       * default. Takes precedence over `options.globalState`.
       */
      globalState?: Record<string, unknown>;
      /**
       * Reactive drag-to-rotate behaviour: `false` disables it, `true` uses
       * the defaults, and an object picks the pivot, for example
       * `{ around: 'pointer' }` or `{ around: 'center', movement: 'linear' }`.
       * Takes precedence over `options.dragRotate`.
       */
      dragRotate?: boolean | DragRotateOptions;
    }>(),
    {
      options: () => ({ container: 'map' }) as MapOptions,
      supportPmtiles: false,
      projection: 'mercator',
      deckUseDevicePixels: true,
      globalState: undefined,
      dragRotate: undefined,
    },
  );
  const emit = defineEmits(['loaded', ...mapEvents]);

  if (props.supportPmtiles) {
    const protocol = new Protocol({ metadata: true });
    addProtocol('pmtiles', protocol.tile);
    provide(PMTileProtocolKey, protocol);
  }

  const map: Ref<Map | null> = shallowRef(null); // Initialize as null
  // The element this component renders. It is the map container when
  // `options.container` is not set.
  const containerEl = ref<HTMLElement | null>(null);
  const loaded: Ref<boolean> = ref(false);
  const events: Ref<Array<keyof MapEventType>> = ref(mapEvents);

  // Provide the map reference immediately
  provide(MapKey, map);

  // Initialize deck.gl overlay at VMap level so all children can access it
  // This provides DeckOverlayKey and DeckLayersKey to all descendants
  provideDeckOverlay(map, {
    globe: props.projection === 'globe',
    useDevicePixels: props.deckUseDevicePixels,
  });

  // MapLibre v6 removed `map.transform` (internal at `map._camera.transform`
  // until 6.18, gone in 6.19), but @deck.gl/mapbox (incl. 9.4 alpha) still
  // reads `map.transform.height/elevation/_nearZ/_farZ` for terrain and
  // interleaved overlays. Without this getter the deck overlay throws there.
  const restoreTransformCompat = (instance: Map): void => {
    const compat = instance as Map & {
      transform?: unknown;
      _camera?: { transform?: unknown };
    };
    if (compat.transform !== undefined) return;
    // maplibre-gl 6.19 keeps the camera in a state store and has no
    // transform object at all. Build the fields deck.gl reads (height,
    // elevation; _nearZ / _farZ stay undefined, so deck uses its own planes
    // or the render call's nearZ / farZ) from the public API.
    const fromPublicApi = {
      get width(): number {
        return instance.getContainer().clientWidth;
      },
      get height(): number {
        return instance.getContainer().clientHeight;
      },
      get elevation(): number {
        return instance.getCenterElevation();
      },
    };
    Object.defineProperty(instance, 'transform', {
      get: () => compat._camera?.transform ?? fromPublicApi,
      configurable: true,
    });
  };

  onMounted(() => {
    installMaplibreWorkerUrl();
    const container = props.options.container ?? containerEl.value;
    if (!container) return;
    const options: MapOptions = { ...props.options, container };
    if (props.globalState !== undefined) {
      options.globalState = snapshotGlobalState();
    }
    if (props.dragRotate !== undefined) {
      options.dragRotate = props.dragRotate;
    }
    const instance = new Map(options);
    restoreTransformCompat(instance);
    map.value = instance;
    loaded.value = true;
    listenMapEvents();
  });

  // Map#remove() releases the WebGL context (WEBGL_lose_context), the tile
  // cache and the worker pool. Without it every unmounted VMap (route change,
  // v-if, a list of map cards) kept its GPU context alive: iOS Safari kills
  // the tab after a few, and Chrome evicts the oldest live map once 16
  // contexts exist. Registered after provideDeckOverlay() above, so the deck.gl
  // overlay is finalized first; children (layers, controls, markers) have
  // already unmounted by the time this runs.
  onUnmounted(() => {
    const instance = map.value;
    if (!instance) return;
    map.value = null;
    loaded.value = false;
    instance.remove();
  });

  // Global-state values are style-spec JSON, so a JSON snapshot gives a
  // detached copy: nested edits (an array item, an object field) show up as
  // a changed key instead of comparing equal by reference.
  const snapshotGlobalState = (): Record<string, unknown> | undefined =>
    props.globalState === undefined
      ? undefined
      : (JSON.parse(JSON.stringify(props.globalState)) as Record<
          string,
          unknown
        >);

  watch(snapshotGlobalState, (next, prev) => {
    const instance = map.value;
    if (!instance) return;
    const before = prev ?? {};
    const after = next ?? {};
    for (const key of Object.keys(after)) {
      if (JSON.stringify(after[key]) !== JSON.stringify(before[key])) {
        instance.setGlobalStateProperty(key, after[key]);
      }
    }
    // `null` resets a property to the default in the style's `state`.
    for (const key of Object.keys(before)) {
      if (!(key in after)) instance.setGlobalStateProperty(key, null);
    }
  });

  watch(
    () => props.dragRotate,
    (next) => {
      const instance = map.value;
      if (!instance || next === undefined) return;
      if (next === false) {
        instance.dragRotate.disable();
      } else {
        instance.dragRotate.enable(next);
      }
    },
    { deep: true },
  );

  const listenMapEvents = () => {
    if (!map.value) return;

    events.value.forEach((e) => {
      map.value?.on(e, (evt) => {
        switch (e) {
          case 'load':
            emit('loaded', map.value);
            break;
          default:
            emit(e, evt);
            break;
        }
      });
    });
  };
</script>

<template>
  <div
    ref="containerEl"
    :id="typeof options?.container === 'string' ? options.container : undefined"
    class="v-map-container"
  >
    <slot v-if="loaded">
      <slot></slot>
    </slot>
  </div>
</template>

<style scoped>
  canvas {
    outline: none;
  }

  .v-map-container {
    width: 100%;
    height: 100%;
  }
</style>
