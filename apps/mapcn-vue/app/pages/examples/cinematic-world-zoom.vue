<script setup lang="ts">
  // Camera choreography inspired by
  // https://github.com/Makio64/threejs-cinematic-world-zoom (MIT)
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VControlScale, VMap, VMarker } from '@geoql/v-maplibre';
  import { VLayer3DTiles } from '@geoql/v-maplibre/3d-tiles';
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
      'A single continuous camera shot from orbit down to real streamed 3D Tiles — great-circle flight, dramatic pitched descent, and a soft orbiting landing on geolith-generated OGC 3D Tiles rendered through three.js. Camera choreography inspired by https://github.com/Makio64/threejs-cinematic-world-zoom (MIT).',
  });

  defineOgImage('MapcnDoc', {
    title: 'Cinematic World Zoom',
    description:
      'Fly from orbit down to real 3D Tiles streamed through three.js into MapLibre. Inspired by Makio64/threejs-cinematic-world-zoom (MIT).',
    category: '3D Splats & Tiles',
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
    maxZoom: 23,
    projection: 'globe' as const,
  }));

  const selected = ref<string>(CINEMATIC_DESTINATIONS[0]!.name);

  function resolveDestination(name: string): CinematicDestination {
    return (
      CINEMATIC_DESTINATIONS.find((d) => d.name === name) ??
      CINEMATIC_DESTINATIONS[0]!
    );
  }

  // The tileset streamed for the currently-selected destination (the place we
  // are about to fly to / have arrived at). Switching the selector swaps it.
  const assetsBase = config.public.r2AssetsBase;
  const activeTileset = computed(
    () => `${assetsBase}${resolveDestination(selected.value).tilesetPath}`,
  );
  const tilesLoading = ref(true);

  const { phase, currentDestination, fly, replay } = useCinematicZoom({
    map: mapRef,
    onHud: (hud) => hudRef.value?.update(hud),
  });

  function handleFly(): void {
    fly(resolveDestination(selected.value));
  }

  function handleReplay(): void {
    replay();
  }

  function handleMapLoad(map: MaplibreMap): void {
    mapRef.value = map;
    // The maps.guru 3D style ships a DEM terrain source. During the fast
    // flight, jumpTo() samples DEM elevation at the moving camera target, and
    // the DEM tile for the new center is usually not loaded yet — maplibre
    // then throws "Out of range source coordinates for DEM data", which aborts
    // the jumpTo mid-frame and freezes the flight. We do not need basemap
    // terrain here (the depth cue is the streamed 3D Tiles + fill-extrusion
    // buildings, and the tileset sits on the altitude:0 ground plane), so
    // disable it for a stable, throw-free flight.
    map.setTerrain(null);
    // QA hook: headless assertions read live camera state through this.
    window.__cinematicMap = map;
  }

  function handleTilesetLoaded(): void {
    tilesLoading.value = false;
  }

  watch(activeTileset, () => {
    tilesLoading.value = true;
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { ref } from 'vue';
                    import type { Map } from 'maplibre-gl';
                    import { VMap, VControlScale } from '@geoql/v-maplibre';
                    import { VLayer3DTiles } from '@geoql/v-maplibre/3d-tiles';
                    import { useCinematicZoom } from '~/composables/use-cinematic-zoom';
                    import { CINEMATIC_DESTINATIONS, WORLD_START } from '~/utils/cinematic-zoom/shot';

                    // Peers: pnpm add three 3d-tiles-renderer \\
                    //          @sparkjsdev/spark 3d-tiles-rendererjs-3dgs-plugin

                    const mapRef = ref<Map | null>(null);
                    const { fly } = useCinematicZoom({ map: mapRef });
                    const tileset = 'https://your-bucket.example.com/tileset.json';

                    const mapOptions = {
                      container: 'cinematic-map',
                      style: 'https://maps.guru/api/v1/styles/standard/3d_day/style.json?key=YOUR_KEY',
                      center: WORLD_START.center,
                      zoom: 1.6,
                      zoomSnap: 0,
                      maxPitch: 70,
                      projection: 'globe',
                    };
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="size-full" @loaded="(m) => (mapRef = m)">
                      <VControlScale position="bottom-left" />
                      <!-- Real OGC 3D Tiles streamed through three.js into MapLibre's WebGL context -->
                      <VLayer3DTiles :url="tileset" :altitude="0" :rotation="[90, 0, 0]" />
                    </VMap>
                    <button @click="fly(CINEMATIC_DESTINATIONS[0])">Fly to Tokyo</button>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="Cinematic World Zoom"
    description="A single continuous camera shot from orbit down to real streamed 3D Tiles. The great-circle flight, dramatic pitched descent and soft orbiting landing are driven by MapLibre camera curves, while geolith-generated OGC 3D Tiles stream through NASA-AMMOS 3DTilesRendererJS + three.js into the same WebGL context. Camera choreography inspired by Makio64/threejs-cinematic-world-zoom (MIT)."
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
          <VLayer3DTiles
            :key="activeTileset"
            :url="activeTileset"
            :error-target="8"
            :altitude="0"
            :rotation="[90, 0, 0]"
            :fade="true"
            :splats="true"
            @load-tileset="handleTilesetLoaded"
          />
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

      <div
        v-if="tilesLoading && phase !== 'idle'"
        class="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-border bg-background/80 px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur"
      >
        <Icon name="lucide:loader-2" class="size-3.5 animate-spin" />
        Streaming 3D Tiles…
      </div>

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
