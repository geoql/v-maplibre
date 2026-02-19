<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglText,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Text Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render text labels at geographic locations.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Text Layer (deck.gl)',
    description: 'Render text labels at geographic locations.',
    category: 'deck.gl',
  });

  const mapId = useId();
  const { mapStyle } = useMapStyle();
  const colorMode = useColorMode();

  const mapOptions = computed(() => ({
    container: `text-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 12,
  }));

  const textColor = computed<[number, number, number, number]>(() =>
    colorMode.value === 'dark' ? [255, 255, 255, 255] : [0, 0, 0, 255],
  );

  // Generate text data (place names)
  const textData = [
    { coordinates: [-122.42, 37.78], name: 'Downtown' },
    { coordinates: [-122.38, 37.79], name: 'Marina District' },
    { coordinates: [-122.4, 37.76], name: 'Mission Bay' },
    { coordinates: [-122.44, 37.8], name: 'Presidio' },
    { coordinates: [-122.36, 37.77], name: 'Potrero Hill' },
    { coordinates: [-122.41, 37.82], name: "Fisherman's Wharf" },
    { coordinates: [-122.39, 37.74], name: 'Bayview' },
    { coordinates: [-122.45, 37.79], name: 'Richmond' },
    { coordinates: [-122.43, 37.775], name: 'SOMA' },
  ];

  interface TextData {
    coordinates: [number, number];
    name: string;
  }

  const getPosition = (d: unknown) => (d as TextData).coordinates;
  const getText = (d: unknown) => (d as TextData).name;

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglText, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 12,
};

const textData = [
  { coordinates: [-122.42, 37.78], name: 'Downtown' },
  { coordinates: [-122.38, 37.79], name: 'Marina District' },
  // ... more labels
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglText
      id="text-layer"
      :data="textData"
      :get-position="(d) => d.coordinates"
      :get-text="(d) => d.name"
      :get-size="20"
      :get-color="[255, 255, 255, 255]"
      font-family="Arial"
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
          Text Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render text labels at geographic locations for place names and
          annotations.
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
              <VLayerDeckglText
                id="text-layer"
                :data="textData"
                :get-position="getPosition"
                :get-text="getText"
                :get-size="20"
                :get-color="textColor"
                font-family="Arial"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock :code="codeExample" lang="vue" filename="TextLayer.vue" />
        </div>
      </div>
    </div>
  </div>
</template>
