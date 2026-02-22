<script setup lang="ts">
  import {
    VMap,
    VControlLidar,
    VControlNavigation,
    VControlScale,
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
    <VControlNavigation position="top-left" />
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
          Multiple Point Clouds
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Load and manage multiple LiDAR datasets in a single viewer. Each point
          cloud can be styled, toggled, and navigated independently.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-left" />
              <VControlScale position="bottom-left" />
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

      <div class="mt-8 rounded-lg border bg-muted/30 p-6">
        <h3 class="mb-3 text-lg font-semibold">About This Example</h3>
        <p class="mb-4 text-muted-foreground">
          This example uses
          <a
            href="https://github.com/opengeos/maplibre-gl-lidar"
            target="_blank"
            class="text-primary hover:underline"
          >
            maplibre-gl-lidar
          </a>
          to load and manage multiple LiDAR datasets simultaneously. Each point
          cloud can be independently styled, toggled, and navigated.
        </p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>VControlLidar</strong> - Multi-dataset management with
              per-cloud controls
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Programmatic API: loadPointCloud, unloadPointCloud,
              flyToPointCloud
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Supports both COPC (.copc.laz) and EPT (ept.json) formats
            </span>
          </li>
        </ul>
      </div>

      <div class="mt-6 space-y-4">
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">How to Use</h3>
          <ol
            class="list-inside list-decimal space-y-1 text-sm text-muted-foreground"
          >
            <li>
              Use the control panel to load point clouds via URL input or file
              upload
            </li>
            <li>
              Each loaded dataset appears in the panel with its own controls
            </li>
            <li>Click on a dataset name to fly to its location</li>
            <li>Use the remove button to unload individual datasets</li>
          </ol>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">API Methods</h3>
          <ul
            class="list-inside list-disc space-y-1 text-sm text-muted-foreground"
          >
            <li>
              <code class="rounded-sm bg-muted px-1">loadPointCloud(url)</code>
              - Load a new point cloud
            </li>
            <li>
              <code class="rounded-sm bg-muted px-1">getPointClouds()</code> -
              Get list of loaded datasets
            </li>
            <li>
              <code class="rounded-sm bg-muted px-1">unloadPointCloud(id)</code>
              - Remove a specific dataset
            </li>
            <li>
              <code class="rounded-sm bg-muted px-1">flyToPointCloud(id)</code>
              - Navigate to a dataset
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">Sample Datasets to Try</h3>
          <ul
            class="list-inside list-disc space-y-1 text-sm text-muted-foreground"
          >
            <li>
              <strong>Autzen (COPC)</strong>:
              <code class="rounded-sm bg-muted px-1 text-xs"
                >https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz</code
              >
            </li>
            <li>
              <strong>Red Rocks (EPT)</strong>:
              <code class="rounded-sm bg-muted px-1 text-xs"
                >https://na-c.entwine.io/red-rocks/ept.json</code
              >
            </li>
            <li>
              <strong>Dublin (EPT)</strong>:
              <code class="rounded-sm bg-muted px-1 text-xs"
                >https://na-c.entwine.io/dublin/ept.json</code
              >
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Tip:</strong> Set
            <code class="rounded-sm bg-muted px-1">autoZoom: false</code> when
            working with multiple datasets to prevent the map from jumping each
            time a new dataset loads.
          </p>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Powered by:</strong>
            <a
              href="https://github.com/opengeos/maplibre-gl-lidar"
              class="text-primary hover:underline"
              target="_blank"
              >maplibre-gl-lidar</a
            >
            with multi-dataset support.
          </p>
        </div>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
