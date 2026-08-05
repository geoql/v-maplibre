<script setup lang="ts">
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';
  import { VLayerSplat } from '@geoql/v-maplibre/splat';

  usePageGeo({
    title: 'Gaussian Splat Layer - mapcn-vue Examples',
    description:
      'Render a georeferenced Gaussian splat (.spz) on the map with Spark and three.js.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Gaussian Splat Layer',
    description:
      'Render a georeferenced Gaussian splat (.spz) on the map with Spark and three.js.',
    category: '3D Splats & Tiles',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const config = useRuntimeConfig();
  const assetsBase = config.public.r2AssetsBase;

  // geolith pipeline output (geolith/geolith#17): an outward-facing CC0
  // 3DGS capture (steam-studio.jp) at true metric scale, anchored near
  // Tokyo Tower. The subject is ~2.5 m tall, so the altitude lifts its
  // local origin enough that the base rests on the flat basemap.
  const anchor = { lng: 139.7454, lat: 35.6586, altitude: 1 };

  const splatUrl = `${assetsBase}/splat/cactus/scene.spz`;

  const mapOptions = computed(() => ({
    container: `splat-example-${mapId}`,
    style: mapStyle.value,
    center: [anchor.lng, anchor.lat] as [number, number],
    zoom: 20.5,
    pitch: 62,
    bearing: 25,
    maxPitch: 85,
    maxZoom: 23,
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

  const onError = () => {
    loading.value = false;
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                import { VLayerSplat } from '@geoql/v-maplibre/splat';

                // Peers: pnpm add three @sparkjsdev/spark @dvt3d/maplibre-three-plugin

                const mapOptions = {
                  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
                  center: [139.7454, 35.6586],
                  zoom: 20.5,
                  pitch: 62,
                  maxPitch: 85,
                  maxZoom: 23,
                };
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions" class="h-125 w-full">
                  <VControlNavigation position="top-right" />
                  <VLayerSplat
                    id="cactus-splat"
                    url="https://your-bucket.example.com/scene.spz"
                    :longitude="139.7454"
                    :latitude="35.6586"
                    :altitude="1"
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
    description="Render a georeferenced Gaussian splat scene (.ply / .spz / .splat / .ksplat / .sog) on the map. A geolith-converted outward-facing 3DGS capture (CC0, steam-studio.jp) anchored near Tokyo Tower, rendered by Spark with LOD streaming inside a shared three.js scene."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerSplat
            id="cactus-splat"
            :url="splatUrl"
            :longitude="anchor.lng"
            :latitude="anchor.lat"
            :altitude="anchor.altitude"
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
