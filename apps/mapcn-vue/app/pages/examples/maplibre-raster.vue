<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreRaster,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  usePageGeo({
    title: 'Raster Layer - mapcn-vue Examples',
    description: 'Display raster tile layers on the map.',
  });

  defineOgImage('SiteDoc', {
    title: 'Raster Layer',
    description: 'Display raster tile layers on the map.',
    category: 'MapLibre',
  });

  const { mapStyle } = useMapStyle();
  const config = useRuntimeConfig();
  const mapsguruApiKey = config.public.mapsguruApiKey;
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `raster-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 20] as [number, number],
    zoom: 2,
  }));

  // Raster source configuration — maps.guru satellite raster tiles.
  //
  // NOT tile.openstreetmap.org: the OSM tile usage policy (§3.1) requires a
  // valid HTTP Referer from web pages and forbids a Referrer-Policy that
  // suppresses it, so OSM answers those requests with a 403 "Access blocked"
  // page. maps.guru serves the same imagery class from its own tile service
  // and is already the basemap provider for this site.
  const rasterSource = {
    type: 'raster' as const,
    tiles: [
      `https://tiles.maps.guru/v1/planet-raster/{z}/{x}/{y}.jpg?key=${mapsguruApiKey}`,
    ],
    tileSize: 256,
    maxzoom: 13,
    attribution:
      '© <a href="https://maps.guru">maps.guru</a> © <a href="https://www.maptiler.com/copyright/">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };

  // Raster layer configuration
  const rasterLayer = {
    id: 'satellite-raster',
    type: 'raster' as const,
    source: 'satellite-source',
    paint: {
      'raster-opacity': 0.7,
    },
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VLayerMaplibreRaster, VControlNavigation } from '@geoql/v-maplibre';

                    const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [0, 20],
                    zoom: 2,
                    };

                    // maps.guru satellite raster tiles (get a key at maps.guru/signup).
                    // tile.openstreetmap.org is not used: the OSM tile usage policy
                    // requires a valid HTTP Referer and blocks requests without one.
                    const rasterSource = {
                    type: 'raster',
                    tiles: ['https://tiles.maps.guru/v1/planet-raster/{z}/{x}/{y}.jpg?key=YOUR_MAPS_GURU_API_KEY'],
                    tileSize: 256,
                    maxzoom: 13,
                    attribution: '© maps.guru © MapTiler © OpenStreetMap contributors',
                    };

                    const rasterLayer = {
                    id: 'satellite-raster',
                    type: 'raster',
                    source: 'satellite-source',
                    paint: {
                      'raster-opacity': 0.7,
                    },
                    };
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VLayerMaplibreRaster
                        source-id="satellite-source"
                        layer-id="satellite-raster"
                        :source="rasterSource"
                        :layer="rasterLayer"
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="Raster Layer"
    description="Display raster tile layers from a permitted raster tile server — maps.guru satellite imagery."
    :code="codeExample"
    registry="map-layers"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerMaplibreRaster
            source-id="satellite-source"
            layer-id="satellite-raster"
            :source="rasterSource"
            :layer="rasterLayer"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
