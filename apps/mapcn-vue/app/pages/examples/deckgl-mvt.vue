<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglMVT,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'MVT Layer (deck.gl) - mapcn-vue Examples',
    description: 'Mapbox Vector Tiles visualization with deck.gl.',
  });

  defineOgImage('MapcnDoc', {
    title: 'MVT Layer (deck.gl)',
    description: 'Mapbox Vector Tiles visualization with deck.gl.',
    category: 'deck.gl',
  });

  const mapId = useId();
  const { mapStyle } = useMapStyle();

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

  const legendItems: CategoryLegendItem[] = [
    { value: 'building', label: 'Building', color: '#4a5057' },
    { value: 'water', label: 'Water', color: '#40a4df' },
    { value: 'park', label: 'Park', color: '#4caf50' },
    { value: 'other', label: 'Other', color: '#c8c8c8' },
  ];

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
  <VMap :options="mapOptions" class="h-125 w-full">
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
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          MVT Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
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

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
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
              <VControlLegend
                :layer-ids="['mvt-layer']"
                position="bottom-left"
                type="category"
                title="Feature Type"
                :items="legendItems"
                :interactive="false"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <ExampleNavigation />
    </div>
  </div>
</template>
