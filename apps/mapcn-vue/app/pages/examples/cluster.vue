<script setup lang="ts">
  import { ref } from 'vue';
  import {
    VMap,
    VLayerMaplibreCluster,
    VControlNavigation,
  } from '@geoql/v-maplibre';
  import type { Map, GeoJSONSource } from 'maplibre-gl';

  useSeoMeta({
    title: 'Clustered Points - mapcn-vue Examples',
    description: 'Cluster large datasets of points.',
  });

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `cluster-example-${mapId}`,
    style: mapStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 10,
  }));

  // Store map reference for cluster expansion
  const mapRef = ref<Map | null>(null);

  const onMapLoaded = (map: Map) => {
    mapRef.value = map;
  };

  // Handle cluster click - zoom to expand
  const handleClusterClick = (event: {
    features: GeoJSON.Feature[];
    coordinates: { lng: number; lat: number };
  }) => {
    if (!mapRef.value || !event.features[0]) return;

    const clusterId = event.features[0].properties?.cluster_id;
    const source = mapRef.value.getSource('cluster-source') as GeoJSONSource;

    if (source && clusterId !== undefined) {
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !mapRef.value) return;

        mapRef.value.easeTo({
          center: [event.coordinates.lng, event.coordinates.lat],
          zoom: zoom ?? 14,
          duration: 500,
        });
      });
    }
  };

  // Generate random points around NYC
  const generatePoints = (): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = [];
    for (let i = 0; i < 500; i++) {
      features.push({
        type: 'Feature',
        properties: { id: i },
        geometry: {
          type: 'Point',
          coordinates: [
            -74.006 + (Math.random() - 0.5) * 0.3,
            40.7128 + (Math.random() - 0.5) * 0.2,
          ],
        },
      });
    }
    return { type: 'FeatureCollection', features };
  };

  const pointsData = generatePoints();

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { ref } from 'vue';
import { VMap, VLayerMaplibreCluster, VControlNavigation } from '@geoql/v-maplibre';
import type { Map, GeoJSONSource } from 'maplibre-gl';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-74.006, 40.7128],
  zoom: 10,
};

// GeoJSON FeatureCollection with Point features
const pointsData = { type: 'FeatureCollection', features: [...] };

const mapRef = ref<Map | null>(null);

// Handle cluster click - zoom to expand
const handleClusterClick = (event) => {
  if (!mapRef.value || !event.features[0]) return;
  
  const clusterId = event.features[0].properties?.cluster_id;
  const source = mapRef.value.getSource('cluster-source') as GeoJSONSource;
  
  source.getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;
    mapRef.value.easeTo({
      center: [event.coordinates.lng, event.coordinates.lat],
      zoom: zoom ?? 14,
      duration: 500,
    });
  });
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg" @loaded="(map) => mapRef = map">
    <VControlNavigation position="top-right" />
    <VLayerMaplibreCluster
      source-id="cluster-source"
      base-layer-id="clusters"
      :source="{ type: 'geojson', data: pointsData }"
      :cluster-paint="{ colors: ['#10b981', '#059669', '#047857'], radii: [15, 22, 30] }"
      :unclustered-paint="{ color: '#10b981', radius: 5 }"
      @cluster-click="handleClusterClick"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10 overflow-x-hidden">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4"></Icon>
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Clustered Points</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Cluster large datasets of points for better performance. Click on a
          cluster to expand it, or zoom in to see individual points.
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
              <VLayerMaplibreCluster
                source-id="cluster-source"
                base-layer-id="clusters"
                :source="{ type: 'geojson', data: pointsData }"
                :cluster-paint="{
                  colors: ['#10b981', '#059669', '#047857'],
                  radii: [15, 22, 30],
                }"
                :unclustered-paint="{
                  color: '#10b981',
                  radius: 5,
                }"
                @cluster-click="handleClusterClick"
              ></VLayerMaplibreCluster>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ClusterMap.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
