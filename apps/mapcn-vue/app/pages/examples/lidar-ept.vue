<script setup lang="ts">
  import {
    VMap,
    VControlLidar,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'EPT Streaming - LiDAR Examples - mapcn-vue',
    description:
      'Entwine Point Tile (EPT) streaming for large point cloud datasets with viewport-based loading.',
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
    container: `lidar-ept-example-${mapId}`,
    style: mapStyle.value,
    center: [-6.26, 53.34] as [number, number],
    zoom: 14,
    pitch: 60,
    maxPitch: 85,
  }));

  // Dublin, Ireland EPT dataset from Entwine
  const eptUrl = 'https://na-c.entwine.io/dublin/ept.json';

  const handleLoad = (info: unknown) => {
    console.log('EPT point cloud loaded:', info);
  };

  const handleError = (error: unknown) => {
    console.error('Failed to load EPT point cloud:', error);
  };

  const handleStreamingProgress = (progress: unknown) => {
    console.log('Streaming progress:', progress);
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VControlLidar, VControlNavigation } from '@geoql/v-maplibre';
import 'maplibre-gl-lidar/style.css';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-6.26, 53.34], // Dublin, Ireland
  zoom: 14,
  pitch: 60,
  maxPitch: 85,
};

const lidarOptions = {
  collapsed: false,
  pointSize: 2,
  colorScheme: 'elevation',
  pickable: true,
  autoZoom: true,
  streamingPointBudget: 5_000_000, // 5 million points max
};

// Dublin EPT dataset from Entwine
const eptUrl = 'https://na-c.entwine.io/dublin/ept.json';
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-left" />
    <VControlLidar
      position="top-right"
      :options="lidarOptions"
      :default-url="eptUrl"
      @load="(info) => console.log('Loaded:', info)"
      @streamingprogress="(p) => console.log('Progress:', p)"
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">EPT Streaming</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Entwine Point Tile (EPT) is a directory-based format for serving large
          point clouds over HTTP. Points stream dynamically based on your
          viewport, enabling visualization of datasets with billions of points.
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
                  colorScheme: 'elevation',
                  pickable: true,
                  autoZoom: true,
                  streamingPointBudget: 5_000_000,
                }"
                :default-url="eptUrl"
                @load="handleLoad"
                @loaderror="handleError"
                @streamingprogress="handleStreamingProgress"
              ></VControlLidar>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="EptStreaming.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 space-y-4">
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">EPT Format Features</h3>
          <ul
            class="list-inside list-disc space-y-1 text-sm text-muted-foreground"
          >
            <li>
              <strong>Directory-based</strong> - Metadata in ept.json, hierarchy
              in ept-hierarchy/, data in ept-data/
            </li>
            <li>
              <strong>Viewport streaming</strong> - Points load based on current
              map view
            </li>
            <li>
              <strong>LAZ compression</strong> - Efficient data transfer using
              LAZ compression
            </li>
            <li>
              <strong>Auto CRS transformation</strong> - Coordinates transformed
              from source CRS to WGS84
            </li>
            <li>
              <strong>Level-of-detail</strong> - Automatic detail selection
              based on zoom level
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">Sample EPT Datasets</h3>
          <ul
            class="list-inside list-disc space-y-1 text-sm text-muted-foreground"
          >
            <li>
              <strong>Dublin, Ireland</strong> -
              <code class="rounded bg-muted px-1"
                >https://na-c.entwine.io/dublin/ept.json</code
              >
            </li>
            <li>
              <strong>New York City (4.7B points)</strong> -
              <code class="rounded bg-muted px-1"
                >https://na-c.entwine.io/nyc/ept.json</code
              >
            </li>
            <li>
              <strong>Red Rocks</strong> -
              <code class="rounded bg-muted px-1"
                >https://na-c.entwine.io/red-rocks/ept.json</code
              >
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Data source:</strong> This example uses the Dublin, Ireland
            EPT dataset from
            <a
              href="https://entwine.io"
              class="text-primary hover:underline"
              target="_blank"
              >Entwine</a
            >. Pan and zoom to stream more points dynamically.
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
            v0.8.0+ with EPT support.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
