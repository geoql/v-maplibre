<script setup lang="ts">
  import type { GradientLegendItem } from '@geoql/v-maplibre';
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import { VControlLidar } from '@geoql/v-maplibre/lidar';

  usePageGeo({
    title: 'Multiple Point Clouds - LiDAR Examples - mapcn-vue',
    description:
      'Load and manage multiple LiDAR point cloud datasets simultaneously.',
  });

  defineOgImage('SiteDoc', {
    title: 'Multiple Point Clouds',
    description:
      'Load and manage multiple LiDAR point cloud datasets simultaneously.',
    category: 'LiDAR',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();
  const lidarRef = ref<InstanceType<typeof VControlLidar> | null>(null);

  // Two datasets from different providers and formats, both loaded into the
  // same viewer: an Entwine Point Tile index (Red Rocks, Colorado) and a
  // Cloud-Optimized Point Cloud file (Autzen, Oregon).
  const DATASETS = [
    {
      name: 'Red Rocks',
      url: 'https://na-c.entwine.io/red-rocks/ept.json',
    },
    {
      name: 'Autzen',
      url: 'https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz',
    },
  ];

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
    // Red Rocks EPT bounds (EPSG:26913) span ~880 m centred here.
    center: [-105.205048, 39.6653] as [number, number],
    zoom: 15.5,
    pitch: 45,
    maxPitch: 85,
  }));

  const handleLoad = (info: unknown) => {
    console.log('Point cloud loaded:', info);
  };

  const handleError = (error: unknown) => {
    console.error('Failed to load point cloud:', error);
  };

  // The control is created asynchronously (the maplibre-gl-lidar peer is
  // dynamically imported) and it only accepts loads once its internal
  // instance exists, so wait for it before handing over the dataset URLs.
  async function waitForControl(): Promise<boolean> {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (lidarRef.value?.getControl()) return true;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  }

  async function loadDatasets(): Promise<void> {
    if (!(await waitForControl())) {
      console.error('LiDAR control did not initialise in time');
      return;
    }
    for (const dataset of DATASETS) {
      try {
        await lidarRef.value?.loadPointCloud(dataset.url);
      } catch (error) {
        console.error(`Failed to load ${dataset.name}:`, error);
      }
    }
  }

  onMounted(() => {
    void loadDatasets();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                  import { ref } from 'vue';
                  import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                  import { VControlLidar } from '@geoql/v-maplibre/lidar';
                  import 'maplibre-gl-lidar/style.css';

                  const lidarRef = ref<InstanceType<typeof VControlLidar> | null>(null);

                  const mapOptions = {
                  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                  center: [-105.205048, 39.6653],
                  zoom: 15.5,
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

                  // The control is created asynchronously, so wait for it before
                  // handing over the dataset URLs.
                  const waitForControl = async () => {
                  for (let attempt = 0; attempt < 100; attempt++) {
                  if (lidarRef.value?.getControl()) return true;
                  await new Promise((resolve) => setTimeout(resolve, 100));
                  }
                  return false;
                  };

                  // Load them all once the control is ready
                  onMounted(async () => {
                  await waitForControl();
                  for (const dataset of datasets) {
                  await loadDataset(dataset.url);
                  }
                  });

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
            ref="lidarRef"
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
