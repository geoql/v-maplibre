<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglPointCloud,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { GradientLegendItem } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Point Cloud Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render point cloud data on the map.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Point Cloud Layer (deck.gl)',
    description: 'Render point cloud data on the map.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

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

  const legendItems: GradientLegendItem[] = [
    {
      min: 0,
      max: 70,
      minLabel: 'Low',
      maxLabel: 'High',
      colors: ['#326496', '#beebf5'],
    },
  ];

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

  const legendItems: GradientLegendItem[] = [
    {
      min: 0,
      max: 70,
      minLabel: 'Low',
      maxLabel: 'High',
      colors: ['#326496', '#beebf5'],
    },
  ];

  const getPosition = (d: unknown) => (d as PointData).position;
  const getColor = (d: unknown) => (d as PointData).color;
  const getNormal = (d: unknown) => (d as PointData).normal;
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
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
          Point Cloud Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Visualize 3D point cloud data from LiDAR, photogrammetry, or other
          sources.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
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
              <VControlLegend
                position="bottom-left"
                type="gradient"
                title="Elevation"
                :layer-ids="['point-cloud-layer']"
                :items="legendItems"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> This example uses procedurally generated point
          cloud data. In production, you would typically load data from LAZ/LAS
          files, PLY, or other point cloud formats. The layer supports millions
          of points with WebGL-accelerated rendering.
        </p>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
