<script setup lang="ts">
  useSeoMeta({
    title: 'Clustered Points - mapcn-vue Examples',
    description: 'Cluster large datasets of points.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Clustered Points',
    description: 'Cluster large datasets of points.',
    category: 'Examples',
  });

  const {
    showPopup,
    popupCoordinates,
    popupContent,
    generatePoints,
    onMapLoaded,
    handleClusterClick,
    handlePointClick,
  } = useClusterData();

  const pointsData = generatePoints();

  function closePopup(): void {
    showPopup.value = false;
  }

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

  const pointsData = { type: 'FeatureCollection', features: [...] };

  const mapRef = ref<Map | null>(null);
  const showPopup = ref(false);
  const popupCoordinates = ref<LngLatLike>([-74.006, 40.7128]);
  const popupContent = ref<{ id: number } | null>(null);

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
  <div class="container max-w-screen-2xl overflow-x-hidden py-4">
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
          Clustered Points
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Cluster large datasets of points for better performance. Click on a
          cluster to expand it, or zoom in to see individual points.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <ExamplesClusterMapContainer
          :points-data="pointsData"
          :show-popup="showPopup"
          :popup-coordinates="popupCoordinates"
          :popup-content="popupContent"
          @loaded="onMapLoaded"
          @cluster-click="handleClusterClick"
          @point-click="handlePointClick"
          @close-popup="closePopup"
        />
      </ComponentDemo>
    </div>
  </div>
</template>
