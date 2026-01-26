<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglScenegraph,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import { GLTFLoader } from '@loaders.gl/gltf';
  import { registerLoaders } from '@loaders.gl/core';

  // Register GLTFLoader globally so deck.gl can find it
  registerLoaders([GLTFLoader]);

  useSeoMeta({
    title: 'Scenegraph Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render 3D glTF/GLB models on the map.',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `scenegraph-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.74] as [number, number],
    zoom: 11,
    pitch: 45,
    bearing: 0,
  }));

  // Animated box model from Khronos glTF samples
  const MODEL_URL =
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb';

  // BART stations data
  const DATA_URL =
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json';

  interface StationData {
    name: string;
    coordinates: [number, number];
  }

  const getPosition = (d: unknown) => (d as StationData).coordinates;
  const getOrientation = () =>
    [0, Math.random() * 180, 90] as [number, number, number];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglScenegraph, VControlNavigation } from '@geoql/v-maplibre';
import { GLTFLoader } from '@loaders.gl/gltf';
import { registerLoaders } from '@loaders.gl/core';

// Register GLTFLoader globally
registerLoaders([GLTFLoader]);

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.74],
  zoom: 11,
  pitch: 45,
};

// Animated box model from Khronos glTF samples
const MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb';

// BART stations data
const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json';

const getPosition = (d) => d.coordinates;
const getOrientation = () => [0, Math.random() * 180, 90];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglScenegraph
      id="bart-stations"
      :data="DATA_URL"
      :scenegraph="MODEL_URL"
      :get-position="getPosition"
      :get-orientation="getOrientation"
      :size-scale="500"
      :_animations="{ '*': { speed: 5 } }"
      :_lighting="'pbr'"
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
          Scenegraph Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render animated glTF/GLB 3D models at data points with PBR lighting.
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
              <VLayerDeckglScenegraph
                id="bart-stations"
                :data="DATA_URL"
                :scenegraph="MODEL_URL"
                :get-position="getPosition"
                :get-orientation="getOrientation"
                :size-scale="500"
                :_animations="{ '*': { speed: 5 } }"
                :_lighting="'pbr'"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ScenegraphLayer.vue"
          />
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Data source:</strong> BART station locations from
          <a
            href="https://github.com/visgl/deck.gl-data"
            target="_blank"
            class="text-primary hover:underline"
            >deck.gl-data</a
          >
          with animated BoxAnimated model from
          <a
            href="https://github.com/KhronosGroup/glTF-Sample-Models"
            target="_blank"
            class="text-primary hover:underline"
            >Khronos glTF samples</a
          >. Supports glTF 2.0 animations and PBR materials.
        </p>
      </div>
    </div>
  </div>
</template>
