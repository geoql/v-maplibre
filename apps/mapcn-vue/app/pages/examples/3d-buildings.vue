<script setup lang="ts">
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';
  import { VLayer3DTiles } from '@geoql/v-maplibre/3d-tiles';

  usePageGeo({
    title: '3D Buildings - mapcn-vue Examples',
    description:
      'Stream 3D building geometry rendered by three.js via OGC 3D Tiles on a MapLibre basemap.',
  });

  defineOgImage('MapcnDoc', {
    title: '3D Buildings',
    description:
      'Stream 3D building geometry rendered by three.js via OGC 3D Tiles on a MapLibre basemap.',
    category: '3D Splats & Tiles',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  // AGI Headquarters — a free OGC 3D Tiles 1.0 photogrammetry tileset
  // with a real ECEF root transform. The tileset anchors near Exton, PA
  // (40.0388°N, 75.5966°W). Mesh tiles, REPLACE refinement, DRACO + KTX2.
  // Pinned to altitude 0 so the content sits on the flat basemap: without
  // a DEM the map's ground plane is 0 m.
  const tilesetUrl =
    'https://pelican-public.s3.amazonaws.com/3dtiles/agi-hq/tileset.json';

  const mapOptions = computed(() => ({
    container: `3d-buildings-example-${mapId}`,
    style: mapStyle.value,
    center: [-75.5966, 40.0388] as [number, number],
    zoom: 18,
    pitch: 60,
    bearing: -40,
    maxPitch: 85,
    maxZoom: 22,
    antialias: true,
  }));

  const loading = ref(true);

  const onLoadTileset = () => {
    loading.value = false;
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';
                import { VLayer3DTiles } from '@geoql/v-maplibre/3d-tiles';

                // Peers: pnpm add three 3d-tiles-renderer @dvt3d/maplibre-three-plugin \\
                //          @sparkjsdev/spark 3d-tiles-rendererjs-3dgs-plugin

                const mapOptions = {
                  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
                  center: [-75.5966, 40.0388],
                  zoom: 18,
                  pitch: 60,
                  bearing: -40,
                  maxPitch: 85,
                  antialias: true,
                };

                // Free OGC 3D Tiles 1.0 photogrammetry tileset (AGI HQ)
                const tilesetUrl =
                  'https://pelican-public.s3.amazonaws.com/3dtiles/agi-hq/tileset.json';
              ${SCRIPT_END}

              <template>
                <VMap :options="mapOptions" class="h-125 w-full">
                  <VControlNavigation position="top-right" />
                  <VLayer3DTiles
                    id="buildings"
                    :url="tilesetUrl"
                    :error-target="8"
                    :altitude="0"
                    :rotation="[90, 0, 0]"
                    :fade="true"
                    :splats="false"
                    @load-tileset="onLoadTileset"
                  />
                </VMap>
              </template>`;
</script>

<template>
  <ComponentDemo
    title="3D Buildings"
    description="Stream 3D building geometry rendered by three.js via OGC 3D Tiles. The tileset loads with LOD refinement and tile-fade transitions by NASA-AMMOS 3DTilesRendererJS. Inspired by UltraGlobe rendering a 125GB Protomaps vector tile dataset in three.js."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayer3DTiles
            id="buildings"
            :url="tilesetUrl"
            :error-target="8"
            :altitude="0"
            :rotation="[90, 0, 0]"
            :fade="true"
            :splats="false"
            @load-tileset="onLoadTileset"
          />
        </VMap>
      </ClientOnly>
      <div
        v-if="loading"
        class="bg-background/80 absolute top-3 left-1/2 -translate-x-1/2 rounded-md border px-3 py-1.5 font-mono text-xs backdrop-blur"
      >
        Streaming tileset…
      </div>
    </div>
  </ComponentDemo>
</template>
