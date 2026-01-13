<script setup lang="ts">
  import { VMap, VLayerDeckglCOG, VControlNavigation } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';

  useSeoMeta({
    title: 'Land Cover COG - mapcn-vue Examples',
    description:
      'Render NLCD Land Cover data with automatic colormap visualization.',
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

  // NLCD Land Cover COG - 1.3GB file streamed efficiently via COG tiling
  // Shows land use classification across the continental US
  const COG_URL =
    'https://s3.us-east-1.amazonaws.com/ds-deck.gl-raster-public/cog/Annual_NLCD_LndCov_2024_CU_C1V1.tif';

  const mapOptions = computed(() => ({
    container: `landcover-example-${mapId}`,
    style: mapStyle.value,
    center: [-98.5, 39.8] as [number, number],
    zoom: 4,
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
      '[Land Cover Example] COG loaded, bounds:',
      options.geographicBounds,
    );
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglCOG, VControlNavigation } from '@geoql/v-maplibre';

  const mapOptions = {
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    center: [-98.5, 39.8], // Continental US
    zoom: 4,
  };

  // NLCD Land Cover COG with automatic colormap
  const COG_URL = 'https://s3.us-east-1.amazonaws.com/.../NLCD_LndCov.tif';
  ${SCRIPT_END}

  <template>
    <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
      <VControlNavigation position="top-right" />
      <VLayerDeckglCOG
        id="landcover-layer"
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Land Cover COG</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Visualize NLCD Land Cover classification data with automatic colormap
          rendering. A 1.3GB dataset streamed efficiently via COG tiling.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          Data:
          <a
            href="https://www.mrlc.gov/data/nlcd-2024-land-cover-conus"
            target="_blank"
            class="text-primary hover:underline"
          >
            NLCD 2024 Land Cover (CONUS)
          </a>
          from USGS. See also:
          <NuxtLink
            to="/examples/deckgl-cog"
            class="text-primary hover:underline"
          >
            Sentinel-2 RGB COG example
          </NuxtLink>
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
                id="landcover-layer"
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
            filename="LandCoverCOG.vue"
          ></CodeBlock>

          <div class="mt-6 space-y-4">
            <div class="rounded-lg border border-border bg-card p-4">
              <h3 class="mb-2 font-semibold">Land Cover Classes</h3>
              <ul class="space-y-1 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-sm bg-green-700"></span>
                  Forest (Deciduous, Evergreen, Mixed)
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-sm bg-yellow-600"></span>
                  Shrub/Scrub, Grassland
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-sm bg-amber-800"></span>
                  Cultivated Crops, Pasture
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-sm bg-red-600"></span>
                  Developed (Low to High Intensity)
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-sm bg-blue-500"></span>
                  Open Water, Wetlands
                </li>
              </ul>
            </div>

            <div class="rounded-lg border border-border bg-card p-4">
              <h3 class="mb-2 font-semibold">Features</h3>
              <ul class="space-y-1 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <Icon
                    name="lucide:check"
                    class="h-4 w-4 text-emerald-500"
                  ></Icon>
                  Automatic colormap from embedded palette
                </li>
                <li class="flex items-center gap-2">
                  <Icon
                    name="lucide:check"
                    class="h-4 w-4 text-emerald-500"
                  ></Icon>
                  Efficient streaming of 1.3GB dataset
                </li>
                <li class="flex items-center gap-2">
                  <Icon
                    name="lucide:check"
                    class="h-4 w-4 text-emerald-500"
                  ></Icon>
                  Zoom-based overview selection
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
