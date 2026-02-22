<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreStarfield,
    VControlNavigation,
  } from '@geoql/v-maplibre';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { SkyMode } from '~/types/globe';

  useSeoMeta({
    title: 'Globe Atmosphere - mapcn-vue Examples',
    description:
      'Interactive dawn, day, dusk, and night atmosphere modes on a 3D globe.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Globe Atmosphere',
    description:
      'Interactive dawn, day, dusk, and night atmosphere modes on a 3D globe.',
    category: 'Examples',
  });

  const mapId = useId();
  const {
    currentMode,
    currentPreset,
    sunAzimuth,
    sunAltitude,
    setMode,
    modes,
  } = useGlobeAtmosphere('night');

  const mapRef = ref<MaplibreMap | null>(null);

  const mapOptions = computed(() => ({
    container: `globe-atmosphere-${mapId}`,
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
        'atmosphere-blend': currentPreset.value.atmosphereBlend,
        'sky-color': currentPreset.value.skyColor,
      },
    },
    center: [0, 20] as [number, number],
    zoom: 1.5,
  }));

  function onMapLoaded(map: MaplibreMap) {
    mapRef.value = map;
  }

  function handleModeChange(mode: SkyMode) {
    setMode(mode);
    mapRef.value?.setSky({
      'atmosphere-blend': currentPreset.value.atmosphereBlend,
      'sky-color': currentPreset.value.skyColor,
    });
  }

  watch(currentPreset, (preset) => {
    mapRef.value?.setSky({
      'atmosphere-blend': preset.atmosphereBlend,
      'sky-color': preset.skyColor,
    });
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerMaplibreStarfield, VControlNavigation } from '@geoql/v-maplibre';

  const { sunAzimuth, sunAltitude, setMode, modes, currentMode } =
  useGlobeAtmosphere('night');
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VLayerMaplibreStarfield
      galaxy-texture-url="/milkyway.jpg"
      :sun-enabled="true"
      :sun-azimuth="sunAzimuth"
      :sun-altitude="sunAltitude"
      before="satellite"
    />
    <VControlNavigation position="top-right" />
  </VMap>
  <div class="flex gap-2 mt-4">
    <button v-for="mode in modes" :key="mode" @click="setMode(mode)">
      {{ mode }}
    </button>
  </div>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Globe Atmosphere
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Switch between dawn, day, dusk, and night modes with matching
          atmosphere and sun position.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="relative h-125 min-w-0 overflow-hidden bg-black">
          <div
            class="absolute left-3 top-3 z-10 flex gap-1.5 rounded-lg border border-white/10 bg-black/70 p-1.5 backdrop-blur-xl"
          >
            <button
              v-for="mode in modes"
              :key="mode"
              class="rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all"
              :class="
                currentMode === mode
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              "
              @click="handleModeChange(mode)"
            >
              {{ mode }}
            </button>
          </div>

          <ClientOnly>
            <VMap :options="mapOptions" class="size-full" @loaded="onMapLoaded">
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
            </VMap>
            <template #fallback>
              <div class="size-full bg-black"></div>
            </template>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <div class="mt-8 rounded-lg border bg-muted/30 p-6">
        <h3 class="mb-3 text-lg font-semibold">About This Example</h3>
        <p class="mb-4 text-muted-foreground">
          This example uses
          <a
            href="https://github.com/geoql/maplibre-gl-starfield"
            target="_blank"
            class="text-primary hover:underline"
          >
            @geoql/maplibre-gl-starfield
          </a>
          — a Three.js starfield and sun rendering custom layer for MapLibre GL
          JS globe projections. The atmosphere effect is achieved through
          MapLibre's built-in sky rendering combined with configurable sun
          position.
        </p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>VLayerMaplibreStarfield</strong> - Three.js starfield
              skybox with galaxy texture and configurable star density
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Dawn, day, dusk, and night atmosphere presets with smooth
              transitions
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Sun position control via azimuth and altitude parameters
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
