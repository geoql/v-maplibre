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
    Map as MapLibreMap,
    RasterDEMSourceSpecification,
    SkySpecification,
  } from 'maplibre-gl';

  const props = defineProps<{
    paths: BattlefieldPath[];
    currentTime: number;
    positions: BattlefieldPosition[];
  }>();

  const mapId = useId();
  const mapInstance = ref<MapLibreMap | null>(null);
  const elevationTick = ref(0);
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  // The six units sit in a tight formation (~2km apart), so their labels
  // collide below ~z12.3. Hide labels until zoomed in - map convention.
  const zoom = ref(11);
  const labelsVisible = computed(() => zoom.value >= 12.3);

  onBeforeUnmount(() => {
    if (refreshTimer) clearTimeout(refreshTimer);
  });

  const onMapLoaded = (m: MapLibreMap) => {
    mapInstance.value = m;
    m.on('zoom', () => {
      zoom.value = m.getZoom();
    });
    // Re-run the elevation enrichment when DEM tiles land. This must NOT be
    // 'idle': a recompute feeds new data arrays into the deck wrappers, which
    // call updateLayer → triggerRepaint → another render → another idle,
    // forming an infinite repaint loop (page becomes unresponsive, memory
    // grows). sourcedata only fires on actual tile loads, so it is bounded.
    m.on('sourcedata', (e) => {
      if (e.sourceId !== 'battlefield-dem' || !e.isSourceLoaded) return;
      // Debounce: a zoom streams tile-load events; recomputing on each one
      // re-triggers the whole wrapper update -> triggerRepaint chain per event
      // (measured 1219ms worst frame while zooming). One recompute shortly
      // after the camera settles is visually identical and cheap.
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        elevationTick.value += 1;
      }, 300);
    });
    elevationTick.value += 1;
  };

  // deck.gl renders on a single elevation plane; without per-vertex z the
  // units and trails sit at sea level while the terrain surface is thousands
  // of metres up, so at high pitch they drift down-screen away from their
  // geospatial position. queryTerrainElevation returns EXAGGERATED metres,
  // which is exactly the mesh the map renders, so it can be used directly.
  // The z cache keeps the per-tick cost to a handful of lookups instead of
  // one per vertex per frame (paths have dozens of vertices).
  const zCache = new Map<string, { z: number; at: number }>();
  const terrainElevation = (ll: [number, number]): number => {
    void elevationTick.value;
    const key = `${ll[0].toFixed(4)},${ll[1].toFixed(4)}`;
    const cached = zCache.get(key);
    if (cached && performance.now() - cached.at < 500) {
      return cached.z;
    }
    if (zCache.size > 500) {
      // Interpolated positions generate a new coordinate key every tick;
      // cap the cache so long playbacks don't grow memory unbounded.
      zCache.clear();
    }
    const z = mapInstance.value?.queryTerrainElevation(ll) ?? 0;
    zCache.set(key, { z, at: performance.now() });
    return z;
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

  // Publish the animated data at 30fps instead of the simulation's 60fps:
  // every published frame pushes fresh arrays through the deck wrappers
  // (updateLayer + triggerRepaint), so halving the rate halves the per-tick
  // map-render load during playback — especially while the camera moves and
  // terrain rendering already saturates the frame budget. Trails animate
  // from timestamps, so 30fps currentTime looks identical.
  const publishedPositions = ref<ElevatedPosition[]>([]);
  const publishedTime = ref(0);
  let lastPublish = 0;
  const publishFrame = () => {
    const now = performance.now();
    if (now - lastPublish < 33) return;
    lastPublish = now;
    publishedPositions.value = elevatedPositions.value;
    publishedTime.value = props.currentTime;
  };
  watch(
    [() => props.positions, () => props.currentTime, () => elevationTick.value],
    () => publishFrame(),
    { immediate: true },
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
    maxPitch: 80,
    // Terrain + deck at full retina DPR is 4x the fragment fill; at high
    // pitch the whole viewport is terrain. 1.5 keeps text crisp while
    // nearly halving the render cost (this page was unplayable on weaker
    // GPUs at DPR 2). MapLibre v6 renamed the option to `pixelRatio`.
    pixelRatio: 1.5,
    // Bound the canvas on large displays: render cost scales with pixel
    // count, so a 5K window was dropping to 6fps. maxCanvasSize caps the
    // canvas dimensions regardless of viewport (content upscales via CSS).
    maxCanvasSize: [1400, 1400] as [number, number],
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
    // Native AWS resolution (256px): a 512 tileSize makes MapLibre build
    // 4x the terrain-mesh vertices per tile, which is the cold-tile hitch.
    tileSize: 256,
    maxzoom: 12,
    encoding: 'terrarium',
    attribution:
      'Elevation: <a href="https://registry.opendata.aws/terrain-tiles/">AWS Terrain Tiles</a>',
  });

  // Half-resolution sampling for the hillshade pass: it only tints the
  // relief, so coarser DEM tiles (1/16 the count) are visually fine while
  // cutting the per-tile main-thread raster work that stalled zooming.
  const hillshadeSource = (): RasterDEMSourceSpecification => ({
    type: 'raster-dem',
    tiles: [TERRARIUM_TILES],
    tileSize: 1024,
    maxzoom: 12,
    encoding: 'terrarium',
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
          :source="hillshadeSource()"
          :layer="{ paint: { 'hillshade-exaggeration': 0.55 } }"
        />
        <ExamplesBattlefieldLayers
          :paths="elevatedPaths"
          :current-time="publishedTime"
          :positions="publishedPositions"
          :labels-visible="labelsVisible"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
