<script setup lang="ts">
  // Camera choreography inspired by
  // https://github.com/Makio64/threejs-cinematic-world-zoom (MIT)
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VControlScale, VMap, VMarker } from '@geoql/v-maplibre';
  import type { CinematicDestination } from '~/types/cinematic-zoom';
  import {
    CINEMATIC_DESTINATIONS,
    WORLD_START,
  } from '~/utils/cinematic-zoom/shot';
  import { ExamplesCinematicWorldZoomControlsBar } from '#components';
  import { ExamplesCinematicWorldZoomHud } from '#components';

  declare global {
    interface Window {
      __cinematicMap?: MaplibreMap;
    }
  }

  usePageGeo({
    title: 'Cinematic World Zoom - mapcn-vue Examples',
    description:
      'A single continuous camera shot from orbit to street level — great-circle flight, dramatic pitched descent, and a soft landing across six global cities. Camera choreography inspired by https://github.com/Makio64/threejs-cinematic-world-zoom (MIT).',
  });

  defineOgImage('MapcnDoc', {
    title: 'Cinematic World Zoom',
    description:
      'Fly from orbit to street level in one continuous shot. Camera choreography inspired by Makio64/threejs-cinematic-world-zoom (MIT).',
    category: 'MapLibre',
  });

  const colorMode = useColorMode();
  const config = useRuntimeConfig();
  const mapId = useId();
  const mapRef = ref<MaplibreMap | null>(null);
  const hudRef = ref<InstanceType<typeof ExamplesCinematicWorldZoomHud> | null>(
    null,
  );

  const cinematicStyle = computed(() => {
    const key = config.public.mapsguruApiKey;
    return colorMode.value === 'dark'
      ? `https://maps.guru/api/v1/styles/standard/3d_dusk/style.json?key=${key}`
      : `https://maps.guru/api/v1/styles/standard/3d_day/style.json?key=${key}`;
  });

  const mapOptions = computed(() => ({
    container: `cinematic-map-${mapId}`,
    style: cinematicStyle.value,
    center: WORLD_START.center,
    zoom: WORLD_START.zoom,
    pitch: 0,
    bearing: 0,
    zoomSnap: 0,
    maxPitch: 70,
    projection: 'globe' as const,
  }));

  const selected = ref<string>(CINEMATIC_DESTINATIONS[0]!.name);

  const { phase, currentDestination, fly, replay } = useCinematicZoom({
    map: mapRef,
    onHud: (hud) => hudRef.value?.update(hud),
  });

  function resolveDestination(name: string): CinematicDestination {
    return (
      CINEMATIC_DESTINATIONS.find((d) => d.name === name) ??
      CINEMATIC_DESTINATIONS[0]!
    );
  }

  function handleFly(): void {
    fly(resolveDestination(selected.value));
  }

  function handleReplay(): void {
    replay();
  }

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    // QA hook: headless assertions read live camera state through this.
    window.__cinematicMap = map;
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { ref } from 'vue';
                    import type { Map } from 'maplibre-gl';
                    import { VMap, VControlScale } from '@geoql/v-maplibre';
                    import { useCinematicZoom } from '~/composables/use-cinematic-zoom';
                    import { CINEMATIC_DESTINATIONS, WORLD_START } from '~/utils/cinematic-zoom/shot';

                    const mapRef = ref<Map | null>(null);
                    const { phase, fly, replay } = useCinematicZoom({ map: mapRef });

                    const mapOptions = {
                      container: 'cinematic-map',
                      style: 'https://maps.guru/api/v1/styles/standard/3d_day/style.json?key=YOUR_KEY',
                      center: WORLD_START.center,
                      zoom: 1.6,
                      pitch: 0,
                      zoomSnap: 0,
                      maxPitch: 70,
                      projection: 'globe',
                    };

                    function handleMapLoad(map: Map) {
                      mapRef.value = map;
                    }
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="size-full" @loaded="handleMapLoad">
                      <VControlScale position="bottom-left" />
                    </VMap>
                    <button @click="fly(CINEMATIC_DESTINATIONS[0])">Fly to New York</button>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="Cinematic World Zoom"
    description="A single continuous camera shot from orbit to street level — great-circle flight, dramatic pitched descent, and a soft landing across six global cities. Camera choreography inspired by Makio64/threejs-cinematic-world-zoom (MIT)."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap
          :key="cinematicStyle"
          :options="mapOptions"
          class="size-full"
          @loaded="handleMapLoad"
        >
          <VControlScale position="bottom-left" />
          <VMarker
            v-if="phase === 'arrived' && currentDestination"
            :key="currentDestination.name"
            :coordinates="currentDestination.coordinates"
          />
        </VMap>
        <template #fallback>
          <div class="flex h-full items-center justify-center bg-muted">
            <Icon
              name="lucide:loader-2"
              class="size-8 animate-spin text-muted-foreground"
            />
          </div>
        </template>
      </ClientOnly>

      <div
        aria-hidden="true"
        class="vignette pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        :class="phase === 'flying' ? 'opacity-100' : 'opacity-0'"
      />

      <ExamplesCinematicWorldZoomHud
        ref="hudRef"
        :phase="phase"
        :destination="currentDestination"
      />
      <ExamplesCinematicWorldZoomControlsBar
        v-model="selected"
        :destinations="CINEMATIC_DESTINATIONS"
        :phase="phase"
        @fly="handleFly"
        @replay="handleReplay"
      />
    </div>
  </ComponentDemo>
</template>

<style scoped>
  .vignette {
    background: radial-gradient(
      ellipse at center,
      transparent 55%,
      rgb(0 0 0 / 0.35) 100%
    );
  }
</style>
