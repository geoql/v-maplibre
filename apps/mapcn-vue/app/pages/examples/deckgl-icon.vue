<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglIcon,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Icon Layer (deck.gl) - mapcn-vue Examples',
    description: 'Render icons/sprites at geographic locations.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Icon Layer (deck.gl)',
    description: 'Render icons/sprites at geographic locations.',
    category: 'deck.gl',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `icon-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 12,
  }));

  // Icon atlas mapping
  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
  };

  // Generate icon data (points of interest)
  const iconData = [
    { position: [-122.42, 37.78], name: 'Location A', color: [255, 140, 0] },
    { position: [-122.38, 37.79], name: 'Location B', color: [0, 200, 150] },
    { position: [-122.4, 37.76], name: 'Location C', color: [138, 43, 226] },
    { position: [-122.44, 37.8], name: 'Location D', color: [255, 99, 71] },
    { position: [-122.36, 37.77], name: 'Location E', color: [30, 144, 255] },
    { position: [-122.41, 37.82], name: 'Location F', color: [255, 215, 0] },
    { position: [-122.39, 37.74], name: 'Location G', color: [50, 205, 50] },
    { position: [-122.45, 37.79], name: 'Location H', color: [255, 20, 147] },
  ];

  interface IconData {
    position: [number, number];
    name: string;
    color: [number, number, number];
  }

  const getPosition = (d: unknown) => (d as IconData).position;
  const getColor = (d: unknown) => (d as IconData).color;
  const getIcon = () => 'marker';

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglIcon, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 12,
};

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

const iconData = [
  { position: [-122.42, 37.78], name: 'Location A', color: [255, 140, 0] },
  { position: [-122.38, 37.79], name: 'Location B', color: [0, 200, 150] },
  // ... more points
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglIcon
      id="icon-layer"
      :data="iconData"
      :get-position="(d) => d.position"
      :get-icon="() => 'marker'"
      :get-color="(d) => d.color"
      :get-size="40"
      :icon-atlas="'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png'"
      :icon-mapping="ICON_MAPPING"
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
          Icon Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render icons and sprites at geographic locations for points of
          interest.
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
              <VLayerDeckglIcon
                id="icon-layer"
                :data="iconData"
                :get-position="getPosition"
                :get-icon="getIcon"
                :get-color="getColor"
                :get-size="40"
                icon-atlas="https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png"
                :icon-mapping="ICON_MAPPING"
                :pickable="true"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock :code="codeExample" lang="vue" filename="IconLayer.vue" />
        </div>
      </div>
    </div>
  </div>
</template>
