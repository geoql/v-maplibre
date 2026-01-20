<script setup lang="ts">
  import {
    VMap,
    VControlLidar,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Classification Filter - LiDAR Examples - mapcn-vue',
    description:
      'Filter LiDAR point clouds by ASPRS classification types like ground, buildings, and vegetation.',
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
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Classification Filter
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Filter LiDAR point clouds by ASPRS classification types. Show or hide
          ground, buildings, vegetation, and other classification categories
          interactively.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-left"></VControlNavigation>
              <VControlScale position="bottom-left"></VControlScale>
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
              ></VControlLidar>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ClassificationFilter.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 space-y-4">
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">ASPRS Classification Codes</h3>
          <div class="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-3 w-3 rounded"
                style="background-color: #a87832"
              ></span>
              <span><strong>2</strong> - Ground</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-3 w-3 rounded"
                style="background-color: #4caf50"
              ></span>
              <span><strong>3</strong> - Low Vegetation</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-3 w-3 rounded"
                style="background-color: #8bc34a"
              ></span>
              <span><strong>4</strong> - Medium Vegetation</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-3 w-3 rounded"
                style="background-color: #2e7d32"
              ></span>
              <span><strong>5</strong> - High Vegetation</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-3 w-3 rounded"
                style="background-color: #f44336"
              ></span>
              <span><strong>6</strong> - Building</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-3 w-3 rounded"
                style="background-color: #ff5722"
              ></span>
              <span><strong>7</strong> - Low Point (Noise)</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-3 w-3 rounded"
                style="background-color: #2196f3"
              ></span>
              <span><strong>9</strong> - Water</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-3 w-3 rounded"
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
    </div>
  </div>
</template>
