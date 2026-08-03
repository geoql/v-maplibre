<script setup lang="ts">
  import { Map, addProtocol } from 'maplibre-gl';
  import { Protocol } from 'pmtiles';
  import { onMounted, provide, ref, shallowRef } from 'vue';
  import type { MapOptions, MapEventType } from 'maplibre-gl';
  import type { Ref } from 'vue';
  import { mapEvents } from '../constants/events';
  import { MapKey, PMTileProtocolKey } from '../utils/symbols';
  import { useDeckOverlay } from '../layers/deckgl/_shared/useDeckOverlay';

  const props = withDefaults(
    defineProps<{
      options?: MapOptions;
      supportPmtiles?: boolean;
      projection?: 'globe' | 'mercator';
    }>(),
    {
      options: () => ({ container: 'map' }) as MapOptions,
      supportPmtiles: false,
      projection: 'mercator',
    },
  );
  const emit = defineEmits(['loaded', ...mapEvents]);

  if (props.supportPmtiles) {
    const protocol = new Protocol({ metadata: true });
    addProtocol('pmtiles', protocol.tile);
    provide(PMTileProtocolKey, protocol);
  }

  const map: Ref<Map | null> = shallowRef(null); // Initialize as null
  const loaded: Ref<boolean> = ref(false);
  const events: Ref<Array<keyof MapEventType>> = ref(mapEvents);

  // Provide the map reference immediately
  provide(MapKey, map);

  // Initialize deck.gl overlay at VMap level so all children can access it
  // This provides DeckOverlayKey and DeckLayersKey to all descendants
  useDeckOverlay(map, { globe: props.projection === 'globe' });

  // MapLibre v6 removed `map.transform` (now internal at `map._camera.transform`),
  // but @deck.gl/mapbox (incl. 9.4 alpha) still reads `map.transform.height/_nearZ/_farZ`
  // during every render. Without this getter the deck overlay throws inside the
  // map's render loop and blanks the entire canvas.
  const restoreTransformCompat = (instance: Map): void => {
    const compat = instance as Map & {
      transform?: unknown;
      _camera?: { transform: unknown };
    };
    if (compat.transform === undefined && compat._camera) {
      Object.defineProperty(instance, 'transform', {
        get: () => compat._camera!.transform,
        configurable: true,
      });
    }
  };

  onMounted(() => {
    const instance = new Map(props.options);
    restoreTransformCompat(instance);
    map.value = instance;
    loaded.value = true;
    listenMapEvents();
  });

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
  <div :id="`${options?.container}`" class="v-map-container">
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
