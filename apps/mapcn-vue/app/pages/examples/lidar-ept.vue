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

  defineOgImage('MapcnDoc', {
    title: 'EPT Streaming',
    description:
      'Entwine Point Tile (EPT) streaming for large point cloud datasets with viewport-based loading.',
    category: 'LiDAR',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

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
  <VMap :options="mapOptions" class="h-125 w-full">
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
          EPT Streaming
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Entwine Point Tile (EPT) is a directory-based format for serving large
          point clouds over HTTP. Points stream dynamically based on your
          viewport, enabling visualization of datasets with billions of points.
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
                  autoZoom: true,
                  streamingPointBudget: 5_000_000,
                }"
                :default-url="eptUrl"
                @load="handleLoad"
                @loaderror="handleError"
                @streamingprogress="handleStreamingProgress"
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
          to stream Entwine Point Tile (EPT) datasets. EPT is a directory-based
          format for serving large point clouds over HTTP, enabling
          visualization of datasets with billions of points.
        </p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>VControlLidar</strong> - EPT streaming with automatic
              viewport-based point loading
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Configurable streaming point budget (default 5M points) for memory
              management
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Auto CRS transformation from source coordinate system to WGS84
            </span>
          </li>
        </ul>
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
              <code class="rounded-sm bg-muted px-1"
                >https://na-c.entwine.io/dublin/ept.json</code
              >
            </li>
            <li>
              <strong>New York City (4.7B points)</strong> -
              <code class="rounded-sm bg-muted px-1"
                >https://na-c.entwine.io/nyc/ept.json</code
              >
            </li>
            <li>
              <strong>Red Rocks</strong> -
              <code class="rounded-sm bg-muted px-1"
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
