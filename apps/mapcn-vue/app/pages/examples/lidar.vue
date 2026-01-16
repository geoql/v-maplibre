<script setup lang="ts">
  import {
    VMap,
    VControlLidar,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'LiDAR Viewer - mapcn-vue Examples',
    description:
      'Visualize LiDAR point clouds with LAS/LAZ/COPC support and dynamic streaming.',
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
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">LiDAR Viewer</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Visualize LiDAR point clouds with LAS/LAZ/COPC support. Features
          dynamic streaming, multiple color schemes, and classification
          filtering.
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
            filename="LidarViewer.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 space-y-4">
        <div class="rounded-lg border border-border bg-muted/50 p-4">
          <h3 class="font-semibold mb-2">Features</h3>
          <ul
            class="text-sm text-muted-foreground space-y-1 list-disc list-inside"
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
          <h3 class="font-semibold mb-2">Installation</h3>
          <pre
            class="text-sm bg-muted p-2 rounded overflow-x-auto"
          ><code>bun add maplibre-gl-lidar</code></pre>
          <p class="text-sm text-muted-foreground mt-2">
            Don't forget to import the CSS:
          </p>
          <pre
            class="text-sm bg-muted p-2 rounded overflow-x-auto mt-1"
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
    </div>
  </div>
</template>
