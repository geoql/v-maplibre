<script setup lang="ts">
  import { ref, nextTick } from 'vue';
  import {
    VMap,
    VLayerMaplibreCluster,
    VControlNavigation,
    VPopup,
  } from '@geoql/v-maplibre';
  import type { Map, GeoJSONSource, LngLatLike } from 'maplibre-gl';

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

  // Popup state
  const showPopup = ref(false);
  const popupCoordinates = ref<LngLatLike>([-74.006, 40.7128]);
  const popupContent = ref<{ id: number } | null>(null);

  const onMapLoaded = (map: Map) => {
    mapRef.value = map;

    // Close popup when clicking on empty map space
    map.on('click', (e) => {
      // Check if click is on a cluster or point layer
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters-clusters', 'clusters-unclustered-point'],
      });
      // Only close if not clicking on a feature
      if (features.length === 0) {
        showPopup.value = false;
      }
    });
  };

  // Handle cluster click - zoom to expand
  const handleClusterClick = async (event: {
    features: GeoJSON.Feature[];
    coordinates: { lng: number; lat: number };
  }) => {
    // Close any open popup
    showPopup.value = false;

    if (!mapRef.value || !event.features[0]) return;

    const feature = event.features[0];
    const clusterId = feature.properties?.cluster_id;
    const source = mapRef.value.getSource('cluster-source') as GeoJSONSource;

    // Get cluster center from feature geometry
    const geometry = feature.geometry as GeoJSON.Point;
    const clusterCenter = geometry.coordinates as [number, number];

    if (source && clusterId !== undefined) {
      try {
        // Use Promise-based API (modern MapLibre)
        const zoom = await source.getClusterExpansionZoom(clusterId);
        mapRef.value?.easeTo({
          center: clusterCenter,
          zoom: zoom ?? 14,
          duration: 500,
        });
      } catch (err) {
        console.error('Error getting cluster expansion zoom:', err);
      }
    }
  };

  // Handle individual point click - show popup
  const handlePointClick = async (event: {
    features: GeoJSON.Feature[];
    coordinates: { lng: number; lat: number };
  }) => {
    if (!mapRef.value || !event.features[0]) return;

    const feature = event.features[0];
    const geometry = feature.geometry as GeoJSON.Point;
    const pointCenter = geometry.coordinates as [number, number];

    // Close existing popup first, then reopen with new data
    showPopup.value = false;
    await nextTick();

    // Show popup at the point location
    popupCoordinates.value = pointCenter;
    popupContent.value = { id: feature.properties?.id ?? 0 };
    showPopup.value = true;
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
import { VMap, VLayerMaplibreCluster, VControlNavigation, VPopup } from '@geoql/v-maplibre';
import type { Map, GeoJSONSource, LngLatLike } from 'maplibre-gl';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-74.006, 40.7128],
  zoom: 10,
};

// GeoJSON FeatureCollection with Point features
const pointsData = { type: 'FeatureCollection', features: [...] };

const mapRef = ref<Map | null>(null);
const showPopup = ref(false);
const popupCoordinates = ref<LngLatLike>([-74.006, 40.7128]);
const popupContent = ref<{ id: number } | null>(null);

// Handle cluster click - zoom to expand
const handleClusterClick = async (event) => {
  if (!mapRef.value || !event.features[0]) return;
  const feature = event.features[0];
  const clusterId = feature.properties?.cluster_id;
  const source = mapRef.value.getSource('cluster-source') as GeoJSONSource;
  const zoom = await source.getClusterExpansionZoom(clusterId);
  mapRef.value?.easeTo({
    center: feature.geometry.coordinates,
    zoom: zoom ?? 14,
    duration: 500,
  });
};

// Handle point click - show popup
const handlePointClick = (event) => {
  if (!event.features[0]) return;
  const feature = event.features[0];
  popupCoordinates.value = feature.geometry.coordinates;
  popupContent.value = { id: feature.properties?.id ?? 0 };
  showPopup.value = true;
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-full w-full" @loaded="(map) => mapRef = map">
    <VControlNavigation position="top-right" />
    <VLayerMaplibreCluster
      source-id="cluster-source"
      base-layer-id="clusters"
      :source="{ type: 'geojson', data: pointsData }"
      :cluster-paint="{ colors: ['#10b981', '#059669', '#047857'], radii: [15, 22, 30] }"
      :unclustered-paint="{ color: '#10b981', radius: 5 }"
      @cluster-click="handleClusterClick"
      @point-click="handlePointClick"
    />
    <VPopup
      v-if="showPopup && popupContent"
      :coordinates="popupCoordinates"
      :options="{ closeButton: true }"
      @close="showPopup = false"
    >
      <div class="p-2">Point #{{ popupContent.id }}</div>
    </VPopup>
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
                @point-click="handlePointClick"
              ></VLayerMaplibreCluster>
              <VPopup
                v-if="showPopup && popupContent"
                :key="`popup-${popupContent.id}`"
                :coordinates="popupCoordinates"
                :options="{ closeButton: false, closeOnClick: false }"
                @close="showPopup = false"
              >
                <div
                  class="min-w-48 rounded-xl border border-border bg-popover/95 px-4 py-3 shadow-lg backdrop-blur-md"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15"
                    >
                      <div
                        class="h-2.5 w-2.5 rounded-full bg-emerald-500"
                      ></div>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-popover-foreground">
                        Point #{{ popupContent.id }}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        {{
                          (popupCoordinates as [number, number])[1].toFixed(4)
                        }}°,
                        {{
                          (popupCoordinates as [number, number])[0].toFixed(4)
                        }}°
                      </p>
                    </div>
                  </div>
                </div>
              </VPopup>
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

<style>
  /* Override MapLibre's default popup styles */
  .maplibregl-popup-content {
    background: transparent !important;
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .maplibregl-popup-tip {
    display: none !important;
  }

  .maplibregl-popup-close-button {
    display: none !important;
  }
</style>
