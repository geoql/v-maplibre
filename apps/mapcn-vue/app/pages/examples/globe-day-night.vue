<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreStarfield,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Globe Day/Night - mapcn-vue Examples',
    description:
      'Real-time sun tracking based on your location and current time.',
  });

  const mapId = useId();
  const { sunAzimuth, sunAltitude, skyMode } = useSunPosition();

  const mapOptions = computed(() => ({
    container: `globe-day-night-${mapId}`,
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

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerMaplibreStarfield, VControlNavigation } from '@geoql/v-maplibre';

// Computes sun azimuth & altitude from current time + browser geolocation
const { sunAzimuth, sunAltitude, skyMode } = useSunPosition();
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
  <p>Current mode: {{ skyMode }}</p>
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Globe Day/Night</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Real-time sun tracking based on your location and current time. Stars
          fade automatically during daytime.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="relative h-125 min-w-0 overflow-hidden rounded-lg bg-black">
          <div
            class="absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-xl"
          >
            <p class="text-xs text-white/70">
              <span class="mr-1 font-medium text-white capitalize">{{
                skyMode
              }}</span>
              &middot; Az {{ sunAzimuth }}&deg; &middot; Alt
              {{ sunAltitude }}&deg;
            </p>
          </div>

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
            filename="GlobeDayNight.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
