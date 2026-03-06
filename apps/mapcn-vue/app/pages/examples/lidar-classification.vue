<script setup lang="ts">
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import {
    VMap,
    VControlLidar,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Classification Filter - LiDAR Examples - mapcn-vue',
    description:
      'Filter LiDAR point clouds by ASPRS classification types like ground, buildings, and vegetation.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Classification Filter',
    description:
      'Filter LiDAR point clouds by ASPRS classification types like ground, buildings, and vegetation.',
    category: 'LiDAR',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const legendItems: CategoryLegendItem[] = [
    { value: 2, label: 'Ground', color: '#a87832' },
    { value: 3, label: 'Low Vegetation', color: '#4caf50' },
    { value: 4, label: 'Medium Vegetation', color: '#8bc34a' },
    { value: 5, label: 'High Vegetation', color: '#2e7d32' },
    { value: 6, label: 'Building', color: '#f44336' },
    { value: 9, label: 'Water', color: '#2196f3' },
  ];

  const mapOptions = computed(() => ({
    container: `lidar-classification-example-${mapId}`,
    style: mapStyle.value,
    center: [-123.075, 44.05] as [number, number],
    zoom: 14,
    pitch: 60,
    maxPitch: 85,
  }));

  // Autzen dataset has classification data
  const sampleCopcUrl =
    'https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz';

  const handleLoad = (info: unknown) => {
    console.log('Point cloud loaded:', info);
  };

  const handleError = (error: unknown) => {
    console.error('Failed to load point cloud:', error);
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { ref } from 'vue';
                    import { VMap, VControlLidar, VControlNavigation } from '@geoql/v-maplibre';
                    import 'maplibre-gl-lidar/style.css';

                    const lidarRef = ref<InstanceType<typeof VControlLidar> | null>(null);

                    const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [-123.075, 44.05],
                    zoom: 14,
                    pitch: 60,
                    maxPitch: 85,
                    };

                    const lidarOptions = {
                    collapsed: false,
                    pointSize: 2,
                    colorScheme: 'classification', // Use classification color scheme
                    pickable: true,
                    autoZoom: true,
                    };

                    const copcUrl = 'https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz';

                    // Programmatic classification control
                    const showOnlyBuildings = () => {
                    lidarRef.value?.hideAllClassifications();
                    lidarRef.value?.setClassificationVisibility(6, true); // Building
                    };

                    const showOnlyGround = () => {
                    lidarRef.value?.hideAllClassifications();
                    lidarRef.value?.setClassificationVisibility(2, true); // Ground
                    };

                    const showAll = () => {
                    lidarRef.value?.showAllClassifications();
                    };
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VControlLidar
                        ref="lidarRef"
                        position="top-right"
                        :options="lidarOptions"
                        :default-url="copcUrl"
                      />
                    </VMap>

                    <!-- Classification controls -->
                    <div class="mt-4 flex gap-2">
                      <button @click="showOnlyBuildings">Buildings Only</button>
                      <button @click="showOnlyGround">Ground Only</button>
                      <button @click="showAll">Show All</button>
                    </div>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="Classification Filter"
    description="Filter LiDAR point clouds by ASPRS classification types. Show or hide ground, buildings, vegetation, and other classification categories interactively."
    :code="codeExample"
    registry="map-control-lidar"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VControlLegend
            :layer-ids="['lidar-points']"
            position="bottom-left"
            type="category"
            title="ASPRS Classification"
            :items="legendItems"
            :interactive="false"
          />
          <VControlLidar
            position="top-right"
            :options="{
              collapsed: false,
              pointSize: 2,
              colorScheme: 'classification',
              pickable: true,
              autoZoom: true,
            }"
            :default-url="sampleCopcUrl"
            @load="handleLoad"
            @loaderror="handleError"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
