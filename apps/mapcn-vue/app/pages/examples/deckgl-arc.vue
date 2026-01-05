<script setup lang="ts">
  import { VMap, VLayerDeckglArc, VControlNavigation } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Arc Layer (deck.gl) - mapcn-vue Examples',
    description: 'Origin-destination arc visualization.',
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
    container: `arc-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 30] as [number, number],
    zoom: 1.5,
  }));

  const arcData = [
    {
      source: [-122.4, 37.8],
      target: [139.7, 35.7],
      name: 'San Francisco to Tokyo',
    },
    {
      source: [-122.4, 37.8],
      target: [-0.1, 51.5],
      name: 'San Francisco to London',
    },
    {
      source: [-122.4, 37.8],
      target: [2.3, 48.9],
      name: 'San Francisco to Paris',
    },
    {
      source: [-74.0, 40.7],
      target: [116.4, 39.9],
      name: 'New York to Beijing',
    },
    { source: [-74.0, 40.7], target: [77.2, 28.6], name: 'New York to Delhi' },
    { source: [151.2, -33.9], target: [-43.2, -22.9], name: 'Sydney to Rio' },
  ];

  const getSourcePosition = (d: any) => d.source;
  const getTargetPosition = (d: any) => d.target;
  const getSourceColor = (): [number, number, number, number] => [
    0, 180, 216, 200,
  ];
  const getTargetColor = (): [number, number, number, number] => [
    114, 239, 221, 200,
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglArc, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [0, 30],
  zoom: 1.5,
};

const arcData = [
  { source: [-122.4, 37.8], target: [139.7, 35.7], name: 'SF to Tokyo' },
  { source: [-122.4, 37.8], target: [-0.1, 51.5], name: 'SF to London' },
  // ... more arcs
];
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglArc
      id="arcs"
      :data="arcData"
      :get-source-position="(d) => d.source"
      :get-target-position="(d) => d.target"
      :get-source-color="[0, 180, 216, 200]"
      :get-target-color="[114, 239, 221, 200]"
      :get-width="2"
      :great-circle="true"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
    <div class="mx-auto max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4"></Icon>
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Arc Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Origin-destination arc visualization with great circle paths.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="h-125 overflow-hidden rounded-lg border border-border">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglArc
                id="arcs"
                :data="arcData"
                :get-source-position="getSourcePosition"
                :get-target-position="getTargetPosition"
                :get-source-color="getSourceColor"
                :get-target-color="getTargetColor"
                :get-width="2"
                :great-circle="true"
              ></VLayerDeckglArc>
            </VMap>
          </ClientOnly>
        </div>

        <div>
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="ArcLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
