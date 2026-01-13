<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglGeoTIFF,
    VControlNavigation,
  } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';

  useSeoMeta({
    title: 'GeoTIFF Layer (Non-tiled) - mapcn-vue Examples',
    description:
      'Render small, non-tiled GeoTIFF files directly in the browser with GPU acceleration.',
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

  // Small non-tiled GeoTIFF example
  // GeoTIFFLayer is designed for small images that fit entirely in memory
  // For this demo, we use a small sample GeoTIFF (~500KB)
  const GEOTIFF_URL =
    'https://s3.amazonaws.com/elevation-tiles-prod/geotiff/12/1241/1513.tif';

  const mapOptions = computed(() => ({
    container: `geotiff-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 20] as [number, number],
    zoom: 1,
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
      '[GeoTIFF Example] GeoTIFF loaded, bounds:',
      options.geographicBounds,
    );
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglGeoTIFF, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    center: [0, 20],
    zoom: 1,
  };

  // Small non-tiled GeoTIFF (loads entire image into memory)
  const GEOTIFF_URL = 'https://example.com/small-image.tif';
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
      <VControlNavigation position="top-right" />
      <VLayerDeckglGeoTIFF
        id="geotiff-layer"
        :geotiff="GEOTIFF_URL"
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
          GeoTIFF Layer (Non-tiled)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render small, non-tiled GeoTIFF files directly in the browser with GPU
          acceleration.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          For large Cloud-Optimized GeoTIFFs (COGs), use
          <NuxtLink
            to="/examples/deckgl-cog"
            class="text-primary hover:underline"
          >
            VLayerDeckglCOG
          </NuxtLink>
          instead.
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
              <VLayerDeckglGeoTIFF
                id="geotiff-layer"
                :geotiff="GEOTIFF_URL"
                @geotiff-load="handleGeotiffLoad"
              ></VLayerDeckglGeoTIFF>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="GeoTIFFLayer.vue"
          ></CodeBlock>

          <div class="mt-6 space-y-4">
            <div class="rounded-lg border border-border bg-card p-4">
              <h3 class="mb-2 font-semibold">When to Use</h3>
              <ul class="space-y-1 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <Icon
                    name="lucide:check"
                    class="h-4 w-4 text-emerald-500"
                  ></Icon>
                  Small images that fit in memory
                </li>
                <li class="flex items-center gap-2">
                  <Icon
                    name="lucide:check"
                    class="h-4 w-4 text-emerald-500"
                  ></Icon>
                  Strip-based (non-tiled) GeoTIFFs
                </li>
                <li class="flex items-center gap-2">
                  <Icon
                    name="lucide:check"
                    class="h-4 w-4 text-emerald-500"
                  ></Icon>
                  Images without overviews
                </li>
                <li class="flex items-center gap-2">
                  <Icon name="lucide:x" class="h-4 w-4 text-red-500"></Icon>
                  Large COGs (use VLayerDeckglCOG instead)
                </li>
              </ul>
            </div>

            <div
              class="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4"
            >
              <h3 class="mb-2 font-semibold text-amber-600 dark:text-amber-400">
                <Icon
                  name="lucide:alert-triangle"
                  class="mr-1 inline h-4 w-4"
                ></Icon>
                Performance Note
              </h3>
              <p class="text-sm text-muted-foreground">
                GeoTIFFLayer loads the entire image into memory at full
                resolution. For large rasters, use COGLayer which streams tiles
                on demand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
