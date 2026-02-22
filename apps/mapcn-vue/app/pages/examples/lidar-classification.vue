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
    <VControlNavigation position="top-left" />
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
          Classification Filter
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Filter LiDAR point clouds by ASPRS classification types. Show or hide
          ground, buildings, vegetation, and other classification categories
          interactively.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-left" />
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
          to filter and visualize LiDAR point clouds by ASPRS classification
          types. Interactively toggle ground, buildings, vegetation, and other
          categories.
        </p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>VControlLidar</strong> - Classification-aware viewer with
              ASPRS standard colors
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Interactive legend with per-class toggle, show all, and hide all
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Programmatic classification control via
              setClassificationVisibility
            </span>
          </li>
        </ul>
      </div>

      <div class="mt-6 space-y-4">
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">ASPRS Classification Codes</h3>
          <div class="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-sm"
                style="background-color: #a87832"
              ></span>
              <span><strong>2</strong> - Ground</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-sm"
                style="background-color: #4caf50"
              ></span>
              <span><strong>3</strong> - Low Vegetation</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-sm"
                style="background-color: #8bc34a"
              ></span>
              <span><strong>4</strong> - Medium Vegetation</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-sm"
                style="background-color: #2e7d32"
              ></span>
              <span><strong>5</strong> - High Vegetation</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-sm"
                style="background-color: #f44336"
              ></span>
              <span><strong>6</strong> - Building</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-sm"
                style="background-color: #ff5722"
              ></span>
              <span><strong>7</strong> - Low Point (Noise)</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-sm"
                style="background-color: #2196f3"
              ></span>
              <span><strong>9</strong> - Water</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-3 rounded-sm"
                style="background-color: #9c27b0"
              ></span>
              <span><strong>17</strong> - Bridge Deck</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">How to Use</h3>
          <ol
            class="list-inside list-decimal space-y-1 text-sm text-muted-foreground"
          >
            <li>
              Select <strong>"Classification"</strong> from the Color By
              dropdown in the control panel
            </li>
            <li>
              Use the checkboxes in the legend to toggle individual
              classification types
            </li>
            <li>
              Click <strong>"Show All"</strong> or
              <strong>"Hide All"</strong> for bulk operations
            </li>
            <li>
              Hover over points with pickable enabled to see classification
              details
            </li>
          </ol>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Tip:</strong> The classification legend automatically
            detects which classifications are present in the loaded data. For
            COPC files, classifications update as data streams in.
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
            with ASPRS standard classification colors.
          </p>
        </div>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
