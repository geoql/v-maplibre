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

  defineOgImage('MapcnDoc', {
    title: 'Globe Day/Night',
    description:
      'Real-time sun tracking based on your location and current time.',
    category: 'Examples',
  });

  const mapId = useId();
  const { sunAzimuth, sunAltitude, localSunAltitude, skyMode } = useSunPosition();

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
      layers: [{ id: 'satellite', type: 'raster' as const, source: 'satellite' }],
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
                    // Geocentric sun position (subsolar lng + declination) + local altitude for fading
                    const { sunAzimuth, sunAltitude, localSunAltitude, skyMode } = useSunPosition();
                  ${SCRIPT_END}
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VLayerMaplibreStarfield
                        galaxy-texture-url="/milkyway.jpg"
                        :sun-enabled="true"
                        :sun-azimuth="sunAzimuth"
                        :sun-altitude="sunAltitude"
                        :fade-altitude="localSunAltitude"
                        before="satellite"
                      />
                      <VControlNavigation position="top-right" />
                    </VMap>
                    <p>Current mode: {{ skyMode }}</p>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="Globe Day/Night"
    description="Real-time sun tracking based on your location and current time. Stars fade automatically during daytime."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden bg-black">
      <div
        class="absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-xl"
      >
        <p class="text-xs text-white/70">
          <span class="mr-1 font-medium text-white capitalize">{{
            skyMode
          }}</span>
          &middot; Lng {{ sunAzimuth }}&deg; &middot; Decl
          {{ sunAltitude }}&deg; &middot; Local {{ localSunAltitude }}&deg;
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
            :fade-altitude="localSunAltitude"
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
</template>
