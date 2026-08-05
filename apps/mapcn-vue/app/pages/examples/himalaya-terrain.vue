<script setup lang="ts">
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VLayerMaplibreHillshade,
    VTerrain,
  } from '@geoql/v-maplibre';
  import type { Map, RasterDEMSourceSpecification } from 'maplibre-gl';

  usePageGeo({
    title: 'Himalaya 3D Terrain - mapcn-vue Examples',
    description:
      'Native MapLibre 3D terrain from a Terrain-RGB PMTiles archive: Garhwal Himalaya relief with hillshade and an OSM drape.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Himalaya 3D Terrain',
    description:
      'Native MapLibre setTerrain + hillshade from a geolith Terrain-RGB PMTiles archive.',
    category: 'MapLibre Layers',
  });

  const mapId = useId();
  const config = useRuntimeConfig();
  const assetsBase = config.public.r2AssetsBase;

  const terrainUrl = `pmtiles://${assetsBase}/terrain/garhwal-himalaya.pmtiles`;
  const EXAGGERATION = 1.25;

  // Two separate raster-dem sources: MapLibre cannot reliably drive both
  // setTerrain and a hillshade layer from one source. Bounds / zoom range
  // come from the PMTiles header via the protocol's TileJSON — never
  // hardcoded here.
  const terrainSource: RasterDEMSourceSpecification = {
    type: 'raster-dem',
    url: terrainUrl,
    tileSize: 512,
    encoding: 'mapbox',
  };

  const hillshadeSource: RasterDEMSourceSpecification = {
    type: 'raster-dem',
    url: terrainUrl,
    tileSize: 512,
    encoding: 'mapbox',
  };

  const mapOptions = computed(() => ({
    container: `himalaya-terrain-${mapId}`,
    style: {
      version: 8 as const,
      sources: {
        osm: {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-basemap',
          type: 'raster' as const,
          source: 'osm',
        },
      ],
    },
    center: [79.35, 30.55] as [number, number],
    zoom: 10.3,
    pitch: 64,
    bearing: 35,
    maxPitch: 85,
    maxZoom: 15,
  }));

  // Kedarnath Temple — a stable, known summit-town elevation (~3,583 m SRTM)
  // used as the live probe demonstrating queryTerrainElevation.
  const KEDARNATH: [number, number] = [79.0669, 30.7346];

  const probedElevation = ref<number | null>(null);
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const stopPolling = () => {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  };

  const onMapLoaded = (map: Map) => {
    stopPolling();
    let attempts = 0;
    pollTimer = setInterval(() => {
      attempts += 1;
      // queryTerrainElevation returns exaggerated metres, and reports 0 until
      // the DEM tile covering the point has actually loaded — so a zero is a
      // "not ready yet" signal, not a real sea-level reading in the Himalaya.
      const exaggerated = map.queryTerrainElevation(KEDARNATH);
      if (typeof exaggerated === 'number' && exaggerated > 0) {
        probedElevation.value = Math.round(exaggerated / EXAGGERATION);
        stopPolling();
      } else if (attempts > 60) {
        stopPolling();
      }
    }, 500);
  };

  onBeforeUnmount(() => {
    if (pollTimer) clearInterval(pollTimer);
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                import {
                  VMap,
                  VControlNavigation,
                  VLayerMaplibreHillshade,
                  VTerrain,
                } from '@geoql/v-maplibre';
                import type { RasterDEMSourceSpecification } from 'maplibre-gl';

                const terrainUrl =
                  'pmtiles://https://your-bucket.example.com/terrain.pmtiles';

                // Two separate raster-dem sources: one drives setTerrain,
                // the other backs the hillshade layer.
                const terrainSource: RasterDEMSourceSpecification = {
                  type: 'raster-dem',
                  url: terrainUrl,
                  tileSize: 512,
                  encoding: 'mapbox',
                };
                const hillshadeSource: RasterDEMSourceSpecification = {
                  ...terrainSource,
                };

                const mapOptions = {
                  style: {
                    version: 8,
                    sources: {
                      osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '© OpenStreetMap contributors',
                      },
                    },
                    layers: [{ id: 'osm-basemap', type: 'raster', source: 'osm' }],
                  },
                  center: [79.35, 30.55],
                  zoom: 10.3,
                  pitch: 64,
                  bearing: 35,
                  maxPitch: 85,
                };
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions" support-pmtiles class="h-125 w-full">
                  <VControlNavigation position="top-right" />
                  <VTerrain
                    source="terrain-dem"
                    :source-spec="terrainSource"
                    :exaggeration="1.25"
                  />
                  <VLayerMaplibreHillshade
                    source-id="hillshade-dem"
                    layer-id="hillshade"
                    :source="hillshadeSource"
                    :layer="{ paint: { 'hillshade-exaggeration': 0.6 } }"
                  />
                </VMap>
              </template>`;
</script>

<template>
  <ComponentDemo
    title="Himalaya 3D Terrain"
    description="Native MapLibre 3D terrain — no three.js, no deck.gl. A geolith-built Terrain-RGB PMTiles archive of the Garhwal Himalaya (Kedarnath, Badrinath, Chaukhamba, Valley of Flowers) drives setTerrain plus a hillshade layer, with an OSM raster basemap draped over the relief."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap
          :options="mapOptions"
          support-pmtiles
          class="size-full"
          @loaded="onMapLoaded"
        >
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VTerrain
            source="terrain-dem"
            :source-spec="terrainSource"
            :exaggeration="EXAGGERATION"
          />
          <VLayerMaplibreHillshade
            source-id="hillshade-dem"
            layer-id="hillshade"
            :source="hillshadeSource"
            :layer="{ paint: { 'hillshade-exaggeration': 0.6 } }"
          />
        </VMap>
      </ClientOnly>
      <div
        class="bg-background/80 absolute top-3 left-1/2 -translate-x-1/2 rounded-md border px-3 py-1.5 font-mono text-xs backdrop-blur"
        data-testid="elevation-probe"
      >
        <template v-if="probedElevation !== null">
          Kedarnath Temple · {{ probedElevation.toLocaleString() }} m
        </template>
        <template v-else>Loading terrain…</template>
      </div>
    </div>
  </ComponentDemo>
</template>
