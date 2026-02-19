<script setup lang="ts">
  import {
    VMap,
    VLayerMaplibreGeojson,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'GeoJSON Layer - mapcn-vue Examples',
    description: 'Render GeoJSON data on the map.',
  });

  defineOgImage('MapcnDoc', {
    title: 'GeoJSON Layer',
    description: 'Render GeoJSON data on the map.',
    category: 'Examples',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `geojson-example-${mapId}`,
    style: mapStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 11,
  }));

  const geojsonData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Central Park' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-73.9819, 40.7681],
              [-73.958, 40.8006],
              [-73.9498, 40.7969],
              [-73.9737, 40.7644],
              [-73.9819, 40.7681],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: { name: 'Manhattan' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [-74.0179, 40.7029],
            [-73.9712, 40.7831],
            [-73.9339, 40.8506],
          ],
        },
      },
    ],
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerMaplibreGeojson, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-74.006, 40.7128],
  zoom: 11,
};

const geojsonData = { type: 'FeatureCollection', features: [...] };

const source = { type: 'geojson', data: geojsonData };
const fillLayer = {
  id: 'geojson-fill',
  type: 'fill',
  source: 'geojson-source',
  paint: { 'fill-color': '#10b981', 'fill-opacity': 0.5 },
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerMaplibreGeojson
      source-id="geojson-source"
      layer-id="geojson-fill"
      :source="source"
      :layer="fillLayer"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">GeoJSON Layer</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render GeoJSON polygons and lines on the map.
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
              <VLayerMaplibreGeojson
                source-id="geojson-source"
                layer-id="geojson-fill"
                :source="{ type: 'geojson', data: geojsonData }"
                :layer="{
                  id: 'geojson-fill',
                  type: 'fill',
                  source: 'geojson-source',
                  paint: {
                    'fill-color': '#10b981',
                    'fill-opacity': 0.5,
                  },
                }"
              />
              <VLayerMaplibreGeojson
                source-id="geojson-line-source"
                layer-id="geojson-line"
                :source="{ type: 'geojson', data: geojsonData }"
                :layer="{
                  id: 'geojson-line',
                  type: 'line',
                  source: 'geojson-line-source',
                  paint: {
                    'line-color': '#10b981',
                    'line-width': 3,
                  },
                }"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="GeoJSONLayer.vue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
