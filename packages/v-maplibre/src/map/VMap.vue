<script setup lang="ts">
  import maplibregl, { Map } from 'maplibre-gl';
  import { Protocol } from 'pmtiles';
  import { onMounted, provide, ref, shallowRef } from 'vue';
  import type { MapOptions, MapEventType } from 'maplibre-gl';
  import type { Ref } from 'vue';
  import { mapEvents } from '../constants/events';
  import { MapKey, PMTileProtocolKey } from '../utils/symbols';
  import { useDeckOverlay } from '../layers/deckgl/_shared/useDeckOverlay';

  const props = withDefaults(
    defineProps<{
      options: MapOptions;
      supportPmtiles?: boolean;
    }>(),
    {
      options: () => ({ container: 'map' }) as MapOptions,
      supportPmtiles: false,
    },
  );
  const emit = defineEmits(['loaded', ...mapEvents]);

  if (props.supportPmtiles) {
    const protocol = new Protocol({ metadata: true });
    maplibregl.addProtocol('pmtiles', protocol.tile);
    provide(PMTileProtocolKey, protocol);
  }

  const map: Ref<Map | null> = shallowRef(null); // Initialize as null
  const loaded: Ref<boolean> = ref(false);
  const events: Ref<Array<keyof MapEventType>> = ref(mapEvents);

  // Provide the map reference immediately
  provide(MapKey, map);

  // Initialize deck.gl overlay at VMap level so all children can access it
  // This provides DeckOverlayKey and DeckLayersKey to all descendants
  useDeckOverlay(map);

  onMounted(() => {
    map.value = new Map(props.options);
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
