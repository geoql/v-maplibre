<script setup lang="ts">
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';
  import { VLayerSplat } from '@geoql/v-maplibre/splat';
  import type { Map } from 'maplibre-gl';

  usePageGeo({
    title: 'Gaussian Splat Layer - mapcn-vue Examples',
    description:
      'Render a georeferenced Gaussian splat (.spz) on 3D terrain with Spark and three.js.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Gaussian Splat Layer',
    description:
      'Render a georeferenced Gaussian splat (.spz) on 3D terrain with Spark and three.js.',
    category: '3D Splats & Tiles',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const config = useRuntimeConfig();
  const assetsBase = config.public.r2AssetsBase;

  // geolith pipeline outputs (geolith/geolith#15): a 3DGS scan + Terrain-RGB
  // PMTiles of the Belvedere Glacier (Macugnaga, IT), anchored at the
  // terrain tileset's center. Altitude snaps to the real DEM elevation via
  // queryTerrainElevation once tiles are in.
  const anchor = { lng: 7.9173, lat: 45.9592 };
  const altitude = ref(1830);

  const splatUrl = `${assetsBase}/splat/bonsai/scene.spz`;
  const terrainUrl = `${assetsBase}/terrain/belvedere-glacier.pmtiles`;

  const mapOptions = computed(() => ({
    container: `splat-example-${mapId}`,
    style: mapStyle.value,
    center: [anchor.lng, anchor.lat] as [number, number],
    zoom: 17.8,
    pitch: 62,
    bearing: 25,
    maxPitch: 85,
  }));

  const loading = ref(true);
  const progress = ref(0);

  const onProgress = (event: ProgressEvent) => {
    if (event.lengthComputable && event.total > 0) {
      progress.value = Math.round((event.loaded / event.total) * 100);
    }
  };

  const onLoad = () => {
    loading.value = false;
  };

  const onError = (error: Error) => {
    console.error('[splat-demo] load error:', error);
  };

  const onMapLoaded = (map: Map) => {
    if (import.meta.dev)
      (window as unknown as Record<string, unknown>).__qaMap = map;
    map.addSource('belvedere-dem', {
      type: 'raster-dem',
      url: `pmtiles://${terrainUrl}`,
      encoding: 'mapbox',
      tileSize: 512,
    });
    map.setTerrain({ source: 'belvedere-dem', exaggeration: 1 });
    // DEM tiles stream in after style 'idle'; poll until the anchor has a
    // real elevation so the splat sits ON the glacier instead of 120 m
    // under it (terrain depth-occludes anything below the surface).
    const snapToTerrain = () => {
      const elevation = map.queryTerrainElevation([anchor.lng, anchor.lat]);
      if (typeof elevation === 'number' && Number.isFinite(elevation)) {
        altitude.value = Math.round(elevation);
      } else {
        setTimeout(snapToTerrain, 500);
      }
    };
    map.once('idle', snapToTerrain);
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                import { VLayerSplat } from '@geoql/v-maplibre/splat';
                import type { Map } from 'maplibre-gl';

                // Peers: pnpm add three @sparkjsdev/spark @dvt3d/maplibre-three-plugin

                const mapOptions = {
                  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
                  center: [7.9173, 45.9592],
                  zoom: 16.2,
                  pitch: 62,
                  maxPitch: 85,
                };

                // Optional: drape the map over Terrain-RGB PMTiles (geolith output)
                const onMapLoaded = (map: Map) => {
                  map.addSource('dem', {
                    type: 'raster-dem',
                    url: 'pmtiles://https://your-bucket.example.com/terrain.pmtiles',
                    encoding: 'mapbox',
                    tileSize: 512,
                  });
                  map.setTerrain({ source: 'dem', exaggeration: 1 });
                };
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions" :support-pmtiles="true" class="h-125 w-full" @loaded="onMapLoaded">
                  <VControlNavigation position="top-right" />
                  <VLayerSplat
                    id="glacier-splat"
                    url="https://your-bucket.example.com/scene.spz"
                    :longitude="7.9173"
                    :latitude="45.9592"
                    :altitude="1830"
                    :rotation="[-90, 0, 0]"
                    :lod="true"
                    @load="onLoad"
                    @progress="onProgress"
                  />
                </VMap>
              </template>`;
</script>

<template>
  <ComponentDemo
    title="Gaussian Splat Layer"
    description="Render a georeferenced Gaussian splat scene (.ply / .spz / .splat / .ksplat / .sog) on 3D terrain. A geolith-generated splat + Terrain-RGB PMTiles of the Belvedere Glacier, rendered by Spark with LOD streaming inside a shared three.js scene."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap
          :key="mapStyle"
          :options="mapOptions"
          :support-pmtiles="true"
          class="size-full"
          @loaded="onMapLoaded"
        >
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerSplat
            id="glacier-splat"
            :url="splatUrl"
            :longitude="anchor.lng"
            :latitude="anchor.lat"
            :altitude="altitude"
            :rotation="[-90, 0, 0]"
            :lod="true"
            @load="onLoad"
            @progress="onProgress"
            @error="onError"
          />
        </VMap>
      </ClientOnly>
      <div
        v-if="loading"
        class="bg-background/80 absolute top-3 left-1/2 -translate-x-1/2 rounded-md border px-3 py-1.5 font-mono text-xs backdrop-blur"
      >
        Loading splat… {{ progress }}%
      </div>
    </div>
  </ComponentDemo>
</template>
