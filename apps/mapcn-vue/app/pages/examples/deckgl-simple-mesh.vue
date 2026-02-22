<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglSimpleMesh,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import { CubeGeometry } from '@luma.gl/engine';

  useSeoMeta({
    title: 'Simple Mesh Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render instanced 3D meshes on the map.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Simple Mesh Layer (deck.gl)',
    description: 'Render instanced 3D meshes on the map.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `simple-mesh-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 13,
    pitch: 45,
    bearing: 30,
  }));

  // Create a simple cube mesh
  const cubeMesh = new CubeGeometry();

  interface CubeData {
    position: [number, number, number];
    color: [number, number, number, number];
    scale: number;
    orientation: [number, number, number];
  }

  // Sample cube positions
  const cubes: CubeData[] = [
    {
      position: [-122.405, 37.785, 0],
      color: [64, 192, 255, 255],
      scale: 100,
      orientation: [0, 0, 0],
    },
    {
      position: [-122.4, 37.78, 0],
      color: [255, 140, 64, 255],
      scale: 150,
      orientation: [0, 0, 45],
    },
    {
      position: [-122.395, 37.775, 0],
      color: [128, 255, 128, 255],
      scale: 80,
      orientation: [0, 0, 90],
    },
    {
      position: [-122.41, 37.782, 0],
      color: [255, 64, 128, 255],
      scale: 120,
      orientation: [0, 0, 135],
    },
    {
      position: [-122.398, 37.788, 0],
      color: [192, 128, 255, 255],
      scale: 90,
      orientation: [0, 0, 180],
    },
  ];

  const legendItems: CategoryLegendItem[] = [
    { value: 'cube-1', label: 'Cube 1', color: '#40c0ff' },
    { value: 'cube-2', label: 'Cube 2', color: '#ff8c40' },
    { value: 'cube-3', label: 'Cube 3', color: '#80ff80' },
    { value: 'cube-4', label: 'Cube 4', color: '#ff4080' },
    { value: 'cube-5', label: 'Cube 5', color: '#c080ff' },
  ];

  const getPosition = (d: unknown) => (d as CubeData).position;
  const getColor = (d: unknown) => (d as CubeData).color;
  const getScale = (d: unknown) => {
    const scale = (d as CubeData).scale;
    return [scale, scale, scale] as [number, number, number];
  };
  const getOrientation = (d: unknown) => (d as CubeData).orientation;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VLayerDeckglSimpleMesh, VControlNavigation } from '@geoql/v-maplibre';
  import { CubeGeometry } from '@luma.gl/engine';

  const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 13,
  pitch: 45,
  };

  // Create a cube mesh
  const cubeMesh = new CubeGeometry();

  interface CubeData {
  position: [number, number, number];
  color: [number, number, number, number];
  scale: number;
  orientation: [number, number, number];
  }

  const cubes: CubeData[] = [
  { position: [-122.405, 37.785, 0], color: [64, 192, 255, 255], scale: 100, orientation: [0, 0, 0] },
  { position: [-122.4, 37.78, 0], color: [255, 140, 64, 255], scale: 150, orientation: [0, 0, 45] },
  ];

  const legendItems: CategoryLegendItem[] = [
    { value: 'cube-1', label: 'Cube 1', color: '#40c0ff' },
    { value: 'cube-2', label: 'Cube 2', color: '#ff8c40' },
    { value: 'cube-3', label: 'Cube 3', color: '#80ff80' },
    { value: 'cube-4', label: 'Cube 4', color: '#ff4080' },
    { value: 'cube-5', label: 'Cube 5', color: '#c080ff' },
  ];

  const getPosition = (d: unknown) => (d as CubeData).position;
  const getColor = (d: unknown) => (d as CubeData).color;
  const getScale = (d: unknown) => {
  const scale = (d as CubeData).scale;
  return [scale, scale, scale];
  };
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full">
    <VControlNavigation position="top-right" />
    <VLayerDeckglSimpleMesh
      id="simple-mesh-layer"
      :data="cubes"
      :mesh="cubeMesh"
      :get-position="getPosition"
      :get-color="getColor"
      :get-scale="getScale"
      :get-orientation="getOrientation"
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
          Simple Mesh Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Render instanced 3D meshes using luma.gl geometries or custom OBJ
          models.
        </p>
      </div>

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglSimpleMesh
                id="simple-mesh-layer"
                :data="cubes"
                :mesh="cubeMesh"
                :get-position="getPosition"
                :get-color="getColor"
                :get-scale="getScale"
                :get-orientation="getOrientation"
                :pickable="true"
              />
              <VControlLegend
                position="bottom-left"
                type="category"
                title="Mesh Instances"
                :layer-ids="['simple-mesh-layer']"
                :items="legendItems"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> SimpleMeshLayer is ideal for rendering many
          instances of the same 3D object efficiently. For complex glTF models,
          use ScenegraphLayer instead. Supports luma.gl geometries (Cube,
          Sphere, Cone) and OBJ file URLs.
        </p>
      </div>

      <ExampleNavigation />
    </div>
  </div>
</template>
