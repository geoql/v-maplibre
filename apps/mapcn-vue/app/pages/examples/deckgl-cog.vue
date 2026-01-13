<script setup lang="ts">
  import { VMap, VLayerDeckglCOG, VControlNavigation } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';

  useSeoMeta({
    title: 'COG Layer (deck.gl-raster) - mapcn-vue Examples',
    description:
      'GPU-accelerated Cloud-Optimized GeoTIFF visualization with automatic reprojection.',
  });

  const colorMode = useColorMode();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const COG_URL =
    'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif';

  const mapOptions = computed(() => ({
    container: `cog-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 0] as [number, number],
    zoom: 2,
  }));

  const handleGeotiffLoad = (
    _tiff: unknown,
    options: {
      geographicBounds: {
        west: number;
        south: number;
        east: number;
        north: number;
      };
    },
  ) => {
    console.log(
      '[COG Example] GeoTIFF loaded, bounds:',
      options.geographicBounds,
    );
    const { west, south, east, north } = options.geographicBounds;
    mapInstance.value?.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      { padding: 40, duration: 1000 },
    );
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglCOG, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    center: [31.5, 30.0], // Egypt/Nile area
    zoom: 8,
  };

  // Sentinel-2 RGB imagery COG
  const COG_URL = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif';
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
      <VControlNavigation position="top-right" />
      <VLayerDeckglCOG
        id="cog-layer"
        :geotiff="COG_URL"
      />
    </VMap>
  </template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4"></Icon>
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          COG Layer (deck.gl-raster)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          GPU-accelerated Cloud-Optimized GeoTIFF visualization with automatic
          reprojection and intelligent tile streaming.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          Powered by
          <a
            href="https://github.com/developmentseed/deck.gl-raster"
            target="_blank"
            class="text-primary hover:underline"
            >@developmentseed/deck.gl-raster</a
          >
          - fully client-side, no server required. Data:
          <a
            href="https://registry.opendata.aws/sentinel-2-l2a-cogs/"
            target="_blank"
            class="text-primary hover:underline"
            >Sentinel-2 L2A COGs</a
          >.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap
              :key="mapStyle"
              :options="mapOptions"
              class="h-full w-full"
              @loaded="onMapLoaded"
            >
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglCOG
                id="cog-layer"
                :geotiff="COG_URL"
                @geotiff-load="handleGeotiffLoad"
              ></VLayerDeckglCOG>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="COGLayer.vue"
          ></CodeBlock>

          <div class="mt-6 rounded-lg border border-border bg-card p-4">
            <h3 class="mb-3 font-semibold">Features</h3>
            <ul
              class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground"
            >
              <li class="flex items-center gap-2">
                <Icon
                  name="lucide:check"
                  class="h-4 w-4 shrink-0 text-emerald-500"
                ></Icon>
                Fully client-side
              </li>
              <li class="flex items-center gap-2">
                <Icon
                  name="lucide:check"
                  class="h-4 w-4 shrink-0 text-emerald-500"
                ></Icon>
                GPU-accelerated
              </li>
              <li class="flex items-center gap-2">
                <Icon
                  name="lucide:check"
                  class="h-4 w-4 shrink-0 text-emerald-500"
                ></Icon>
                Auto reprojection
              </li>
              <li class="flex items-center gap-2">
                <Icon
                  name="lucide:check"
                  class="h-4 w-4 shrink-0 text-emerald-500"
                ></Icon>
                Tile streaming
              </li>
              <li class="flex items-center gap-2">
                <Icon
                  name="lucide:check"
                  class="h-4 w-4 shrink-0 text-emerald-500"
                ></Icon>
                Auto overview selection
              </li>
              <li class="flex items-center gap-2">
                <Icon
                  name="lucide:check"
                  class="h-4 w-4 shrink-0 text-emerald-500"
                ></Icon>
                No server required
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
