<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglPointCloud,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Point Cloud Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render point cloud data on the map.',
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
    container: `point-cloud-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 15,
    pitch: 60,
    bearing: -17,
  }));

  interface PointData {
    position: [number, number, number];
    color: [number, number, number, number];
    normal: [number, number, number];
  }

  // Generate sample point cloud data (simulating a building scan)
  const generatePointCloud = (): PointData[] => {
    const points: PointData[] = [];
    const centerLng = -122.4;
    const centerLat = 37.78;

    // Create a cube-like point cloud
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        for (let z = 0; z < 15; z++) {
          // Only create points on the surface
          if (
            x === 0 ||
            x === 19 ||
            y === 0 ||
            y === 19 ||
            z === 0 ||
            z === 14
          ) {
            points.push({
              position: [
                centerLng + (x - 10) * 0.0001,
                centerLat + (y - 10) * 0.0001,
                z * 5,
              ],
              color: [
                Math.floor(50 + z * 10),
                Math.floor(100 + x * 7),
                Math.floor(150 + y * 5),
                255,
              ],
              normal: [0, 0, 1],
            });
          }
        }
      }
    }
    return points;
  };

  const pointCloudData = generatePointCloud();

  const getPosition = (d: unknown) => (d as PointData).position;
  const getColor = (d: unknown) => (d as PointData).color;
  const getNormal = (d: unknown) => (d as PointData).normal;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglPointCloud, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 15,
  pitch: 60,
};

interface PointData {
  position: [number, number, number];
  color: [number, number, number, number];
  normal: [number, number, number];
}

// Point cloud data (typically from LiDAR, photogrammetry, etc.)
const pointCloudData: PointData[] = [
  { position: [-122.4, 37.78, 10], color: [255, 0, 0, 255], normal: [0, 0, 1] },
  { position: [-122.401, 37.781, 15], color: [0, 255, 0, 255], normal: [0, 0, 1] },
  // ... more points
];

const getPosition = (d: unknown) => (d as PointData).position;
const getColor = (d: unknown) => (d as PointData).color;
const getNormal = (d: unknown) => (d as PointData).normal;
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglPointCloud
      id="point-cloud-layer"
      :data="pointCloudData"
      :get-position="getPosition"
      :get-color="getColor"
      :get-normal="getNormal"
      :point-size="3"
      size-units="pixels"
      :pickable="true"
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Point Cloud Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Visualize 3D point cloud data from LiDAR, photogrammetry, or other
          sources.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglPointCloud
                id="point-cloud-layer"
                :data="pointCloudData"
                :get-position="getPosition"
                :get-color="getColor"
                :get-normal="getNormal"
                :point-size="3"
                size-units="pixels"
                :pickable="true"
              ></VLayerDeckglPointCloud>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="PointCloudLayer.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> This example uses procedurally generated point
          cloud data. In production, you would typically load data from LAZ/LAS
          files, PLY, or other point cloud formats. The layer supports millions
          of points with WebGL-accelerated rendering.
        </p>
      </div>
    </div>
  </div>
</template>
