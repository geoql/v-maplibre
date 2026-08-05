<script setup lang="ts">
  import type {
    BattlefieldPath,
    BattlefieldPosition,
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
    RasterDEMSourceSpecification,
    SkySpecification,
  } from 'maplibre-gl';

  const props = defineProps<{
    paths: BattlefieldPath[];
    currentTime: number;
    positions: BattlefieldPosition[];
  }>();

  const mapId = useId();
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
      <VMap :options="mapOptions" class="size-full">
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
          :paths="props.paths"
          :current-time="props.currentTime"
          :positions="props.positions"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
