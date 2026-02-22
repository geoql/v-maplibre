<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglCOG,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import type { Map } from 'maplibre-gl';

  useSeoMeta({
    title: 'Land Cover COG - mapcn-vue Examples',
    description:
      'Render NLCD Land Cover classification data with automatic colormap visualization.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Land Cover COG',
    description:
      'Render NLCD Land Cover classification data with automatic colormap visualization.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const mapInstance = shallowRef<Map | null>(null);

  const onMapLoaded = (map: Map) => {
    mapInstance.value = map;
  };

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
    <VMap :options="mapOptions" class="h-125 w-full">
      <VControlNavigation position="top-right" />
      <VLayerDeckglCOG
        id="landcover-layer"
        :geotiff="COG_URL"
      />
    </VMap>
  </template>`;

  const legendItems = [
    { color: 'bg-[#466b9f]', label: 'Open Water' },
    { color: 'bg-[#d1def8]', label: 'Perennial Ice/Snow' },
    { color: 'bg-[#dec5c5]', label: 'Developed, Open Space' },
    { color: 'bg-[#d99282]', label: 'Developed, Low Intensity' },
    { color: 'bg-[#eb0000]', label: 'Developed, Medium Intensity' },
    { color: 'bg-[#ab0000]', label: 'Developed, High Intensity' },
    { color: 'bg-[#b3ac9f]', label: 'Barren Land' },
    { color: 'bg-[#68ab5f]', label: 'Deciduous Forest' },
    { color: 'bg-[#1c5f2c]', label: 'Evergreen Forest' },
    { color: 'bg-[#b5c58f]', label: 'Mixed Forest' },
    { color: 'bg-[#ccb879]', label: 'Shrub/Scrub' },
    { color: 'bg-[#dfdfc2]', label: 'Grassland/Herbaceous' },
    { color: 'bg-[#dcd939]', label: 'Pasture/Hay' },
    { color: 'bg-[#ab6c28]', label: 'Cultivated Crops' },
    { color: 'bg-[#b8d9eb]', label: 'Woody Wetlands' },
    { color: 'bg-[#6c9fb8]', label: 'Emergent Herbaceous Wetlands' },
  ];
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Land Cover COG
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Visualize NLCD Land Cover classification data with automatic colormap
          rendering. A 1.3GB dataset streamed efficiently via COG tiling.
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
            href="https://www.mrlc.gov/data/nlcd-2024-land-cover-conus"
            target="_blank"
            class="text-primary hover:underline"
          >
            NLCD 2024 Land Cover (CONUS)
          </a>
          from USGS.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="space-y-4">
          <div class="h-125 min-w-0 overflow-hidden">
            <ClientOnly>
              <VMap
                :key="mapStyle"
                :options="mapOptions"
                class="size-full"
                @loaded="onMapLoaded"
              >
                <VControlNavigation position="top-right" />
                <VControlScale position="bottom-left" />
                <VLayerDeckglCOG
                  id="landcover-layer"
                  :geotiff="COG_URL"
                  @geotiff-load="handleGeotiffLoad"
                />
              </VMap>
            </ClientOnly>
          </div>

          <!-- Legend below the map -->
          <div class="bg-card p-4">
            <h3 class="mb-3 font-semibold">Land Cover Classes</h3>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div
                v-for="item in legendItems"
                :key="item.label"
                class="flex items-center gap-2"
              >
                <span
                  :class="[item.color, 'size-3 shrink-0 rounded-sm']"
                ></span>
                <span class="text-muted-foreground">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </ComponentDemo>

      <div class="mt-6 rounded-lg border border-border bg-card p-4">
        <h3 class="mb-3 font-semibold">Features</h3>
        <ul
          class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground"
        >
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            Auto colormap
          </li>
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            1.3GB streaming
          </li>
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            Overview selection
          </li>
          <li class="flex items-center gap-2">
            <Icon
              name="lucide:check"
              class="size-4 shrink-0 text-emerald-500"
            />
            GPU reprojection
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
