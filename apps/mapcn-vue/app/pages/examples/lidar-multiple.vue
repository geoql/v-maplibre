<script setup lang="ts">
  import type { GradientLegendItem } from '@geoql/v-maplibre';
  import {
    VMap,
    VControlLidar,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Multiple Point Clouds - LiDAR Examples - mapcn-vue',
    description:
      'Load and manage multiple LiDAR point cloud datasets simultaneously.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Multiple Point Clouds',
    description:
      'Load and manage multiple LiDAR point cloud datasets simultaneously.',
    category: 'LiDAR',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const legendItems: GradientLegendItem[] = [
    {
      min: 0,
      max: 500,
      minLabel: 'Low',
      maxLabel: 'High',
      colors: ['#440154', '#31688e', '#35b779', '#fde725'],
    },
  ];

  const mapOptions = computed(() => ({
    container: `lidar-multiple-example-${mapId}`,
    style: mapStyle.value,
    center: [-105.5, 39.75] as [number, number],
    zoom: 10,
    pitch: 45,
    maxPitch: 85,
  }));

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
                  center: [-105.5, 39.75],
                  zoom: 10,
                  pitch: 45,
                  maxPitch: 85,
                  };

                  const lidarOptions = {
                  collapsed: false,
                  pointSize: 2,
                  colorScheme: 'elevation',
                  pickable: true,
                  autoZoom: false, // Don't auto-zoom to keep view stable
                  pointBudget: 2_000_000,
                  };

                  // Sample datasets
                  const datasets = [
                  {
                    name: 'Autzen',
                    url: 'https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz'
                  },
                  {
                    name: 'Red Rocks',
                    url: 'https://na-c.entwine.io/red-rocks/ept.json'
                  },
                  ];

                  // Load multiple datasets programmatically
                  const loadDataset = async (url: string) => {
                  await lidarRef.value?.loadPointCloud(url);
                  };

                  // Get list of loaded point clouds
                  const getPointClouds = () => {
                  return lidarRef.value?.getPointClouds() || [];
                  };

                  // Unload a specific point cloud
                  const unloadPointCloud = (id: string) => {
                  lidarRef.value?.unloadPointCloud(id);
                  };

                  // Fly to a specific point cloud
                  const flyTo = (id: string) => {
                  lidarRef.value?.flyToPointCloud(id);
                  };
                ${SCRIPT_END}

                <template>
                  <VMap :options="mapOptions" class="h-125 w-full">
                    <VControlNavigation position="top-right" />
                    <VControlLidar
                      ref="lidarRef"
                      position="top-right"
                      :options="lidarOptions"
                      @load="(info) => console.log('Loaded:', info.pointCloud.name)"
                    />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="Multiple Point Clouds"
    description="Load and manage multiple LiDAR datasets in a single viewer. Each point cloud can be styled, toggled, and navigated independently."
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
            type="gradient"
            title="Elevation"
            :items="legendItems"
            :interactive="false"
          />
          <VControlLidar
            position="top-right"
            :options="{
              collapsed: false,
              pointSize: 2,
              colorScheme: 'elevation',
              pickable: true,
              autoZoom: false,
              pointBudget: 2_000_000,
            }"
            @load="handleLoad"
            @loaderror="handleError"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
