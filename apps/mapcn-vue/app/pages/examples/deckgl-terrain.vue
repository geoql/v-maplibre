<script setup lang="ts">
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';
  import { VLayerDeckglTerrain } from '@geoql/v-maplibre/deck.gl';

  usePageGeo({
    title: 'Terrain Layer (deck.gl) - mapcn-vue Examples',
    description: '3D terrain visualization with elevation data.',
  });

  defineOgImage('SiteDoc', {
    title: 'Terrain Layer (deck.gl)',
    description: '3D terrain visualization with elevation data.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const config = useRuntimeConfig();
  const mapsguruApiKey = config.public.mapsguruApiKey;
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `terrain-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.75] as [number, number],
    zoom: 11,
    pitch: 60,
    bearing: -17,
  }));

  // Terrain tile URL (using Mapzen/AWS terrain tiles)
  const TERRAIN_IMAGE =
    'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
  // Surface texture tiles — maps.guru satellite raster.
  //
  // NOT tile.openstreetmap.org: the OSM tile usage policy (§3.1) requires a
  // valid HTTP Referer from web pages and forbids a Referrer-Policy that
  // suppresses it, so OSM answers those requests with a 403 "Access blocked"
  // page. maps.guru serves satellite imagery from its own tile service and is
  // already the basemap provider for this site.
  const SURFACE_IMAGE = `https://tiles.maps.guru/v1/planet-raster/{z}/{x}/{y}.jpg?key=${mapsguruApiKey}`;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                    import { VLayerDeckglTerrain } from '@geoql/v-maplibre/deck.gl';

                    const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [-122.4, 37.75],
                    zoom: 11,
                    pitch: 60,
                    bearing: -17,
                    };

                    // Terrain elevation tiles (Mapzen Terrarium format)
                    const TERRAIN_IMAGE = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
                    // Surface texture tiles — maps.guru satellite raster.
                    // tile.openstreetmap.org is not used: the OSM tile usage policy
                    // requires a valid HTTP Referer and blocks requests without one.
                    const SURFACE_IMAGE = 'https://tiles.maps.guru/v1/planet-raster/{z}/{x}/{y}.jpg?key=YOUR_MAPS_GURU_API_KEY';
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VLayerDeckglTerrain
                        id="terrain-layer"
                        :elevation-data="TERRAIN_IMAGE"
                        :texture="SURFACE_IMAGE"
                        :elevation-decoder="{
                          rScaler: 256,
                          gScaler: 1,
                          bScaler: 1/256,
                          offset: -32768,
                        }"
                        :bounds="[-122.5, 37.6, -122.2, 37.9]"
                        :pickable="true"
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="Terrain Layer (deck.gl)"
    description="3D terrain visualization using elevation data and surface textures."
    :code="codeExample"
    registry="map-deckgl-geo"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerDeckglTerrain
            id="terrain-layer"
            :elevation-data="TERRAIN_IMAGE"
            :texture="SURFACE_IMAGE"
            :elevation-decoder="{
              rScaler: 256,
              gScaler: 1,
              bScaler: 1 / 256,
              offset: -32768,
            }"
            :bounds="[-122.5, 37.6, -122.2, 37.9]"
            :pickable="true"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
