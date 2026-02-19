<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglSimpleMesh,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
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

const getPosition = (d: unknown) => (d as CubeData).position;
const getColor = (d: unknown) => (d as CubeData).color;
const getScale = (d: unknown) => {
  const scale = (d as CubeData).scale;
  return [scale, scale, scale];
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
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
  <div class="container max-w-screen-2xl overflow-x-hidden py-10">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 size-4" />
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Simple Mesh Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render instanced 3D meshes using luma.gl geometries or custom OBJ
          models.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
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
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="SimpleMeshLayer.vue"
          />
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> SimpleMeshLayer is ideal for rendering many
          instances of the same 3D object efficiently. For complex glTF models,
          use ScenegraphLayer instead. Supports luma.gl geometries (Cube,
          Sphere, Cone) and OBJ file URLs.
        </p>
      </div>
    </div>
  </div>
</template>
