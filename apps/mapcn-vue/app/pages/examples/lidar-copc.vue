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
    title: 'COPC Streaming - LiDAR Examples - mapcn-vue',
    description:
      'Cloud-Optimized Point Cloud with dynamic viewport-based loading for large LiDAR datasets.',
  });

  defineOgImage('MapcnDoc', {
    title: 'COPC Streaming',
    description:
      'Cloud-Optimized Point Cloud with dynamic viewport-based loading for large LiDAR datasets.',
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
    container: `lidar-example-${mapId}`,
    style: mapStyle.value,
    center: [-123.075, 44.05] as [number, number],
    zoom: 14,
    pitch: 60,
    maxPitch: 85,
  }));

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
  import { VMap, VControlLidar, VControlNavigation } from '@geoql/v-maplibre';
  import 'maplibre-gl-lidar/style.css';

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
  colorScheme: 'elevation',
  pickable: true,
  autoZoom: true,
  };

  const copcUrl = 'https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz';
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-left" />
    <VControlLidar
      position="top-right"
      :options="lidarOptions"
      :default-url="copcUrl"
      @load="(info) => console.log('Loaded:', info)"
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
          COPC Streaming
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Cloud-Optimized Point Cloud (COPC) with dynamic viewport-based
          loading. Only points visible in the current view are loaded,
          dramatically reducing memory usage for large datasets.
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
          by
          <a
            href="https://github.com/opengeos"
            target="_blank"
            class="text-primary hover:underline"
          >
            opengeos
          </a>
          to visualize Cloud-Optimized Point Cloud (COPC) LiDAR data with
          dynamic viewport-based streaming.
        </p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              <strong>VControlLidar</strong> - Full-featured LiDAR viewer with
              file upload, URL loading, and interactive controls
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              COPC streaming loads only visible points, reducing memory for
              large datasets
            </span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="lucide:check" class="mt-0.5 size-4 text-primary" />
            <span>
              Multiple color schemes: elevation, intensity, classification, RGB
            </span>
          </li>
        </ul>
      </div>

      <div class="mt-6 space-y-4">
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">Features</h3>
          <ul
            class="list-inside list-disc space-y-1 text-sm text-muted-foreground"
          >
            <li>LAS/LAZ/COPC file support (LAS 1.0 - 1.4)</li>
            <li>Dynamic COPC streaming for large point clouds</li>
            <li>Color schemes: elevation, intensity, classification, RGB</li>
            <li>Interactive classification legend with toggle</li>
            <li>Point picking with attribute tooltips</li>
            <li>Z-offset adjustment for alignment</li>
            <li>
              Automatic coordinate transformation (projected CRS to WGS84)
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="mb-2 font-semibold">Installation</h3>
          <pre
            class="overflow-x-auto rounded-sm bg-muted p-2 text-sm"
          ><code>bun add maplibre-gl-lidar</code></pre>
          <p class="mt-2 text-sm text-muted-foreground">
            Don't forget to import the CSS:
          </p>
          <pre
            class="mt-1 overflow-x-auto rounded-sm bg-muted p-2 text-sm"
          ><code>import 'maplibre-gl-lidar/style.css';</code></pre>
        </div>

        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            <strong>Note:</strong> This example uses the Autzen COPC dataset
            from
            <a
              href="https://hobu.co"
              class="text-primary hover:underline"
              target="_blank"
              >Hobu, Inc</a
            >. The control panel on the right allows you to load your own
            LAS/LAZ/COPC files or enter a URL.
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
            - A MapLibre GL JS plugin for visualizing LiDAR point clouds,
            developed by
            <a
              href="https://github.com/opengeos"
              class="text-primary hover:underline"
              target="_blank"
              >opengeos</a
            >.
          </p>
        </div>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
