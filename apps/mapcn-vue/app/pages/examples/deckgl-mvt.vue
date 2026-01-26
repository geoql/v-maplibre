<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglMVT,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'MVT Layer (deck.gl) - mapcn-vue Examples',
    description: 'Mapbox Vector Tiles visualization with deck.gl.',
  });

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `mvt-example-${mapId}`,
    style: mapStyle.value,
    center: [-74.01, 40.707] as [number, number],
    zoom: 14,
    pitch: 45,
  }));

  const MVT_URL =
    'https://tiles.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt';

  interface MVTFeature {
    properties: {
      layerName?: string;
    };
  }

  const getFillColor = (f: unknown): [number, number, number, number] => {
    const feature = f as MVTFeature;
    const layer = feature.properties?.layerName;
    if (layer === 'building') return [74, 80, 87, 200];
    if (layer === 'water') return [64, 164, 223, 200];
    if (layer === 'park') return [76, 175, 80, 200];
    return [200, 200, 200, 100];
  };

  const getLineColor = (): [number, number, number] => [255, 255, 255];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglMVT, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-74.01, 40.707],
  zoom: 14,
  pitch: 45,
};

// CARTO vector tiles
const MVT_URL = 'https://tiles.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt';

const getFillColor = (f) => {
  const layer = f.properties?.layerName;
  if (layer === 'building') return [74, 80, 87, 200];
  if (layer === 'water') return [64, 164, 223, 200];
  if (layer === 'park') return [76, 175, 80, 200];
  return [200, 200, 200, 100];
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglMVT
      id="mvt-layer"
      :data="MVT_URL"
      :get-fill-color="getFillColor"
      :get-line-color="[255, 255, 255]"
      :line-width-min-pixels="1"
      :pickable="true"
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
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          MVT Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render Mapbox Vector Tiles with custom styling using deck.gl.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          Data source:
          <a
            href="https://carto.com/"
            target="_blank"
            class="text-primary hover:underline"
            >CARTO</a
          >
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglMVT
                id="mvt-layer"
                :data="MVT_URL"
                :get-fill-color="getFillColor"
                :get-line-color="getLineColor"
                :line-width-min-pixels="1"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock :code="codeExample" lang="vue" filename="MVTLayer.vue" />
        </div>
      </div>
    </div>
  </div>
</template>
