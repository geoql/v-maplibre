<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglScenegraph,
    VControlNavigation,
  } from '@geoql/v-maplibre';
  import { GLTFLoader } from '@loaders.gl/gltf';
  import { registerLoaders } from '@loaders.gl/core';

  // Register GLTFLoader globally so deck.gl can find it
  registerLoaders([GLTFLoader]);

  useSeoMeta({
    title: 'Scenegraph Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render 3D glTF/GLB models on the map.',
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
    container: `scenegraph-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.8] as [number, number],
    zoom: 11,
    pitch: 45,
    bearing: 0,
  }));

  // 3D airplane model
  const MODEL_URL =
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';

  interface AirplaneData {
    position: [number, number, number];
    orientation: [number, number, number];
  }

  // Sample airplane positions over San Francisco Bay
  const airplanes: AirplaneData[] = [
    { position: [-122.4, 37.8, 1000], orientation: [0, 0, 90] },
    { position: [-122.35, 37.75, 1500], orientation: [0, 0, 180] },
    { position: [-122.45, 37.85, 800], orientation: [0, 0, 45] },
    { position: [-122.5, 37.78, 1200], orientation: [0, 0, 270] },
    { position: [-122.38, 37.82, 900], orientation: [0, 0, 135] },
  ];

  const getPosition = (d: unknown) => (d as AirplaneData).position;
  const getOrientation = (d: unknown) => (d as AirplaneData).orientation;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglScenegraph, VControlNavigation } from '@geoql/v-maplibre';
import { GLTFLoader } from '@loaders.gl/gltf';
import { registerLoaders } from '@loaders.gl/core';

// Register GLTFLoader globally so deck.gl can find it
registerLoaders([GLTFLoader]);

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.8],
  zoom: 11,
  pitch: 45,
};

// 3D airplane model
const MODEL_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';

interface AirplaneData {
  position: [number, number, number];
  orientation: [number, number, number];
}

// Airplane positions with altitude and heading
const airplanes: AirplaneData[] = [
  { position: [-122.4, 37.8, 1000], orientation: [0, 0, 90] },
  { position: [-122.35, 37.75, 1500], orientation: [0, 0, 180] },
  { position: [-122.45, 37.85, 800], orientation: [0, 0, 45] },
];

const getPosition = (d: unknown) => (d as AirplaneData).position;
const getOrientation = (d: unknown) => (d as AirplaneData).orientation;
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglScenegraph
      id="scenegraph-layer"
      :data="airplanes"
      :scenegraph="MODEL_URL"
      :get-position="getPosition"
      :get-orientation="getOrientation"
      :size-scale="500"
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
          Scenegraph Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render glTF/GLB 3D models with full orientation and scale control.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglScenegraph
                id="scenegraph-layer"
                :data="airplanes"
                :scenegraph="MODEL_URL"
                :get-position="getPosition"
                :get-orientation="getOrientation"
                :size-scale="500"
                :pickable="true"
              ></VLayerDeckglScenegraph>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ScenegraphLayer.vue"
          ></CodeBlock>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Data source:</strong> Airplane model from
          <a
            href="https://github.com/visgl/deck.gl-data"
            target="_blank"
            class="text-primary hover:underline"
            >deck.gl-data</a
          >. Requires
          <code class="rounded bg-muted px-1">@loaders.gl/gltf</code> package
          for loading GLB/glTF files. Supports glTF 2.0 and GLB formats with
          animations, textures, and PBR materials.
        </p>
      </div>
    </div>
  </div>
</template>
