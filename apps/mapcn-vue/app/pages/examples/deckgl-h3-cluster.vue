<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglH3Cluster,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'H3 Cluster Layer (deck.gl) - mapcn-vue Examples',
    description: 'Visualize clustered H3 hexagon regions.',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `h3-cluster-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 10,
    pitch: 45,
    bearing: 0,
  }));

  interface H3ClusterData {
    hexagons: string[];
    value: number;
    name: string;
  }

  // Sample H3 cluster data - each cluster contains multiple H3 cells
  // These form contiguous regions
  const h3ClusterData: H3ClusterData[] = [
    {
      name: 'Downtown Cluster',
      hexagons: [
        '882830829bfffff',
        '88283082d7fffff',
        '88283082d3fffff',
        '88283082dbfffff',
        '882830829ffffff',
      ],
      value: 3000,
    },
    {
      name: 'Mission Cluster',
      hexagons: [
        '8828308281fffff',
        '8828308285fffff',
        '882830828dfffff',
        '8828308289fffff',
      ],
      value: 2200,
    },
    {
      name: 'Marina Cluster',
      hexagons: ['882830828bfffff', '8828308283fffff', '88283082c5fffff'],
      value: 1500,
    },
    {
      name: 'Sunset Cluster',
      hexagons: [
        '88283095a9fffff',
        '88283095adfffff',
        '88283095a1fffff',
        '88283095a5fffff',
        '88283095b1fffff',
      ],
      value: 1800,
    },
    {
      name: 'Richmond Cluster',
      hexagons: [
        '882830958dfffff',
        '8828309589fffff',
        '8828309585fffff',
        '88283095c1fffff',
      ],
      value: 1200,
    },
  ];

  const getHexagons = (d: unknown) => (d as H3ClusterData).hexagons;
  const getElevation = (d: unknown) => (d as H3ClusterData).value;
  const getFillColor = (d: unknown) => {
    const value = (d as H3ClusterData).value;
    const t = (value - 1000) / 2500;
    // Gradient from teal to coral
    return [
      Math.floor(80 + 175 * t),
      Math.floor(200 - 80 * t),
      Math.floor(200 - 100 * t),
      180,
    ] as [number, number, number, number];
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglH3Cluster, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-122.4, 37.78],
  zoom: 10,
  pitch: 45,
};

interface H3ClusterData {
  hexagons: string[];  // Array of H3 cell IDs forming a cluster
  value: number;
  name: string;
}

// H3 clusters - groups of contiguous hexagons
const h3ClusterData: H3ClusterData[] = [
  {
    name: 'Downtown Cluster',
    hexagons: [
      '882830829bfffff',
      '88283082d7fffff',
      '88283082d3fffff',
    ],
    value: 3000,
  },
  // ... more clusters
];

const getHexagons = (d: unknown) => (d as H3ClusterData).hexagons;
const getElevation = (d: unknown) => (d as H3ClusterData).value;
const getFillColor = (d: unknown) => {
  const t = ((d as H3ClusterData).value - 1000) / 2500;
  return [80 + 175 * t, 200 - 80 * t, 200 - 100 * t, 180];
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglH3Cluster
      id="h3-cluster-layer"
      :data="h3ClusterData"
      :get-hexagons="getHexagons"
      :get-fill-color="getFillColor"
      :get-elevation="getElevation"
      :extruded="true"
      :pickable="true"
      :auto-highlight="true"
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
          H3 Cluster Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Render grouped H3 hexagons as merged cluster regions with shared
          properties.
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
              <VLayerDeckglH3Cluster
                id="h3-cluster-layer"
                :data="h3ClusterData"
                :get-hexagons="getHexagons"
                :get-fill-color="getFillColor"
                :get-elevation="getElevation"
                :extruded="true"
                :pickable="true"
                :auto-highlight="true"
              />
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="H3ClusterLayer.vue"
          />
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          <strong>Note:</strong> H3ClusterLayer merges multiple H3 hexagons into
          a single polygon. This is useful for visualizing regions, service
          areas, or any grouped spatial data. Unlike H3HexagonLayer which
          renders individual cells, clusters share a single color and elevation.
        </p>
      </div>
    </div>
  </div>
</template>
