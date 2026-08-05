<script setup lang="ts">
  import type {
    BattlefieldPath,
    BattlefieldPosition,
    ElevatedPath,
    ElevatedPosition,
  } from '~/types/defense-terrain';
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VLayerMaplibreHillshade,
    VSky,
    VTerrain,
  } from '@geoql/v-maplibre';
  import type {
    Map,
    RasterDEMSourceSpecification,
    SkySpecification,
  } from 'maplibre-gl';

  const props = defineProps<{
    paths: BattlefieldPath[];
    currentTime: number;
    positions: BattlefieldPosition[];
  }>();

  const mapId = useId();
  const mapInstance = ref<Map | null>(null);
  const elevationTick = ref(0);

  const onMapLoaded = (m: Map) => {
    mapInstance.value = m;
    // Re-run the elevation enrichment whenever the map settles: DEM tiles
    // arrive asynchronously, so elevations start at 0 and fill in over time.
    m.on('idle', () => {
      elevationTick.value += 1;
    });
    elevationTick.value += 1;
  };

  // deck.gl renders on a single elevation plane; without per-vertex z the
  // units and trails sit at sea level while the terrain surface is thousands
  // of metres up, so at high pitch they drift down-screen away from their
  // geospatial position. queryTerrainElevation returns EXAGGERATED metres,
  // which is exactly the mesh the map renders, so it can be used directly.
  const terrainElevation = (ll: [number, number]): number => {
    void elevationTick.value;
    return mapInstance.value?.queryTerrainElevation(ll) ?? 0;
  };

  const elevatedPaths = computed<ElevatedPath[]>(() =>
    props.paths.map((p) => ({
      ...p,
      path: p.path.map((ll) => [...ll, terrainElevation(ll)]),
    })),
  );

  const elevatedPositions = computed<ElevatedPosition[]>(() =>
    props.positions.map((p) => ({
      ...p,
      z: terrainElevation([p.lng, p.lat]),
    })),
  );

  // Terrain pages pin the LIGHT basemap in both colour modes: the dark
  // high-contrast style renders shaded relief as near-black on near-black,
  // so the 3D terrain is effectively invisible in dark mode.
  const { mapsguruLightStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `battlefield-${mapId}`,
    style: mapsguruLightStyle.value,
    center: [78.2, 34.2] as [number, number],
    zoom: 11,
    pitch: 62,
    bearing: 24,
    maxPitch: 85,
  }));

  // AWS Terrain Tiles (terrarium encoding) — global coverage, so it reaches
  // Ladakh, which sits outside the Garhwal Terrain-RGB archive's footprint.
  const TERRARIUM_TILES =
    'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

  // At high pitch the terrain meets empty canvas without a sky, so the
  // horizon reads as a hard black void. fog-color requires 3D terrain.
  const sky: SkySpecification = {
    'sky-color': '#8fbdf0',
    'sky-horizon-blend': 0.6,
    'horizon-color': '#dfeaf6',
    'horizon-fog-blend': 0.7,
    'fog-color': '#eaf1f8',
    'fog-ground-blend': 0.6,
  };

  const demSource = (): RasterDEMSourceSpecification => ({
    type: 'raster-dem',
    tiles: [TERRARIUM_TILES],
    tileSize: 256,
    maxzoom: 13,
    encoding: 'terrarium',
    attribution:
      'Elevation: <a href="https://registry.opendata.aws/terrain-tiles/">AWS Terrain Tiles</a>',
  });
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap :options="mapOptions" class="size-full" @loaded="onMapLoaded">
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <VSky :sky="sky" />
        <VTerrain
          source="battlefield-dem"
          :source-spec="demSource()"
          :exaggeration="1.4"
        />
        <VLayerMaplibreHillshade
          source-id="battlefield-hillshade-dem"
          layer-id="battlefield-hillshade"
          :source="demSource()"
          :layer="{ paint: { 'hillshade-exaggeration': 0.55 } }"
        />
        <ExamplesBattlefieldLayers
          :paths="elevatedPaths"
          :current-time="props.currentTime"
          :positions="elevatedPositions"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
