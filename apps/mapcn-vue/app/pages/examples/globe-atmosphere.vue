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
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Globe Atmosphere</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Switch between dawn, day, dusk, and night modes with matching
          atmosphere and sun position.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="relative h-125 min-w-0 overflow-hidden rounded-lg bg-black">
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

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="GlobeAtmosphere.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
