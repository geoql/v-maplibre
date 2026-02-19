<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglScatterplot,
    VLayerMaplibreStarfield,
    VControlNavigation,
  } from '@geoql/v-maplibre';
  import type { PickingInfo } from '@deck.gl/core';
  import type { EarthquakeData } from '~/types/earthquake';

  useSeoMeta({
    title: 'Earthquake Globe - mapcn-vue Examples',
    description: 'Live 3D globe showing worldwide seismic activity from USGS.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Earthquake Globe',
    description: 'Live 3D globe showing worldwide seismic activity from USGS.',
    category: 'Examples',
  });

  const mapId = useId();
  const { sunAzimuth, sunAltitude } = useSunPosition();

  const mapOptions = computed(() => ({
    container: `earthquake-globe-${mapId}`,
    style: {
      version: 8 as const,
      projection: { type: 'globe' as const },
      sources: {
        satellite: {
          type: 'raster' as const,
          tiles: [
            'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
          ],
          tileSize: 256,
        },
      },
      layers: [
        { id: 'satellite', type: 'raster' as const, source: 'satellite' },
      ],
      sky: {
        'atmosphere-blend': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          1,
          5,
          1,
          7,
          0,
        ],
      },
    },
    center: [0, 20] as [number, number],
    zoom: 1.5,
  }));

  const {
    earthquakeData,
    selectedQuake,
    loading,
    selectQuake,
    clearSelection,
    getQuakeColor,
  } = useEarthquakeGlobe();

  function getPosition(d: unknown) {
    return (d as EarthquakeData).coordinates;
  }

  function getRadius(d: unknown) {
    return Math.pow(2, (d as EarthquakeData).magnitude) * 1000;
  }

  function getFillColor(d: unknown) {
    return getQuakeColor((d as EarthquakeData).magnitude);
  }

  function handleClick(info: PickingInfo) {
    if (info.object) selectQuake(info.object as EarthquakeData);
  }

  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleString();
  }

  const magnitudeBarWidth = computed(() =>
    selectedQuake.value
      ? `${Math.min((selectedQuake.value.magnitude / 10) * 100, 100)}%`
      : '0%',
  );

  const depthBarWidth = computed(() =>
    selectedQuake.value
      ? `${Math.min((selectedQuake.value.depth / 700) * 100, 100)}%`
      : '0%',
  );

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import {
  VMap,
  VLayerDeckglScatterplot,
  VLayerMaplibreStarfield,
  VControlNavigation,
} from '@geoql/v-maplibre';

// Sun position computed from current time + browser geolocation
const { sunAzimuth, sunAltitude } = useSunPosition();

const mapOptions = {
  style: {
    version: 8,
    projection: { type: 'globe' },
    sources: {
      satellite: {
        type: 'raster',
        tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'],
        tileSize: 256,
      },
    },
    layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
    sky: { 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0] },
  },
  center: [0, 20],
  zoom: 1.5,
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VLayerMaplibreStarfield
      galaxy-texture-url="/milkyway.jpg"
      :star-count="5000"
      :star-size="2.5"
      :sun-enabled="true"
      :sun-azimuth="sunAzimuth"
      :sun-altitude="sunAltitude"
      before="satellite"
    />
    <VControlNavigation position="top-right" />
    <VLayerDeckglScatterplot
      id="earthquakes"
      :data="earthquakeData"
      :get-position="getPosition"
      :get-radius="getRadius"
      :get-fill-color="getFillColor"
      :radius-min-pixels="4"
      :radius-max-pixels="45"
      :opacity="0.9"
      :pickable="true"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Earthquake Globe</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Live 3D globe visualization of worldwide seismic activity from USGS.
          Click any point to see earthquake details.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          <strong>Powered by:</strong>
          <a
            href="https://github.com/geoql/maplibre-gl-starfield"
            class="text-primary hover:underline"
            target="_blank"
            >@geoql/maplibre-gl-starfield</a
          >
          - Three.js starfield skybox custom layer for MapLibre GL JS globe
          projections.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Globe with starfield -->
        <div class="relative h-125 min-w-0 overflow-hidden rounded-lg bg-black">
          <!-- Map with Three.js starfield custom layer -->
          <ClientOnly>
            <VMap :options="mapOptions" class="size-full">
              <VLayerMaplibreStarfield
                galaxy-texture-url="/milkyway.jpg"
                :star-count="5000"
                :star-size="2.5"
                :sun-enabled="true"
                :sun-azimuth="sunAzimuth"
                :sun-altitude="sunAltitude"
                before="satellite"
              />
              <VControlNavigation position="top-right" />
              <VLayerDeckglScatterplot
                v-if="!loading && earthquakeData.length"
                id="earthquakes"
                :data="earthquakeData"
                :get-position="getPosition"
                :get-radius="getRadius"
                :get-fill-color="getFillColor"
                :radius-min-pixels="4"
                :radius-max-pixels="45"
                :opacity="0.9"
                :pickable="true"
                :antialiasing="true"
                @click="handleClick"
              />
            </VMap>
            <template #fallback>
              <div class="size-full bg-black"></div>
            </template>
          </ClientOnly>

          <!-- Earthquake info panel -->
          <Transition name="slide-up">
            <div
              v-if="selectedQuake"
              class="absolute bottom-3 left-3 z-10 max-w-[calc(100%-24px)] rounded-lg border border-cyan-500/20 bg-gray-950/90 p-4 shadow-[0_0_30px_rgba(0,200,255,0.06)] backdrop-blur-xl sm:w-72"
            >
              <button
                class="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                @click="clearSelection"
              >
                <Icon name="lucide:x" class="size-3.5" />
              </button>

              <h3
                class="mb-3 pr-7 text-sm font-bold uppercase leading-tight tracking-wider text-cyan-400"
              >
                {{ selectedQuake.place }}
              </h3>

              <div class="mb-3 space-y-1 text-xs text-white/70">
                <p>Magnitude: {{ selectedQuake.magnitude.toFixed(1) }}</p>
                <p>Depth: {{ selectedQuake.depth.toFixed(0) }} km</p>
                <p>Time: {{ formatTime(selectedQuake.time) }}</p>
              </div>

              <div class="space-y-2.5">
                <div>
                  <div class="mb-1 flex items-center justify-between text-xs">
                    <span class="font-medium tracking-wider text-white/40"
                      >MAGNITUDE</span
                    >
                    <span class="font-mono text-xs font-bold text-cyan-400">{{
                      selectedQuake.magnitude.toFixed(1)
                    }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-white/5">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all duration-500"
                      :style="{ width: magnitudeBarWidth }"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="mb-1 flex items-center justify-between text-xs">
                    <span class="font-medium tracking-wider text-white/40"
                      >DEPTH</span
                    >
                    <span class="font-mono text-xs font-bold text-orange-400"
                      >{{ selectedQuake.depth.toFixed(0) }} km</span
                    >
                  </div>
                  <div class="h-2 rounded-full bg-white/5">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all duration-500"
                      :style="{ width: depthBarWidth }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Loading overlay -->
          <div
            v-if="loading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div class="text-center">
              <Icon
                name="lucide:loader-2"
                class="mb-2 size-8 animate-spin text-cyan-400"
              />
              <p class="text-sm text-white/60">Loading earthquake data...</p>
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="EarthquakeGlobe.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s ease;
  }
  .slide-up-enter-from,
  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>
