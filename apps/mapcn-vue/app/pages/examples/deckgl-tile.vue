<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglTile,
    VControlNavigation,
  } from '@geoql/v-maplibre';
  import { BitmapLayer } from '@deck.gl/layers';

  useSeoMeta({
    title: 'Tile Layer (deck.gl) - mapcn-vue Examples',
    description: 'Generic tile layer for loading raster or vector tiles.',
  });

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `tile-example-${mapId}`,
    style: mapStyle.value,
    center: [0, 0] as [number, number],
    zoom: 2,
  }));

  const TILE_URL = 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png';

  interface TileProps {
    tile: {
      boundingBox: [[number, number], [number, number]];
    };
    data: string;
  }

  const renderSubLayers = (props: unknown) => {
    const tileProps = props as TileProps;
    const {
      tile: { boundingBox },
      data,
    } = tileProps;

    const [min, max] = boundingBox;

    return new BitmapLayer({
      ...tileProps,
      data: undefined,
      image: data,
      bounds: [min[0], min[1], max[0], max[1]] as [
        number,
        number,
        number,
        number,
      ],
    });
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VLayerDeckglTile, VControlNavigation } from '@geoql/v-maplibre';
import { BitmapLayer } from '@deck.gl/layers';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  center: [0, 0],
  zoom: 2,
};

const TILE_URL = 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png';

const renderSubLayers = (props) => {
  const { tile: { boundingBox }, data } = props;
  const [min, max] = boundingBox;

  return new BitmapLayer({
    ...props,
    data: undefined,
    image: data,
    bounds: [min[0], min[1], max[0], max[1]],
  });
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerDeckglTile
      id="tile-layer"
      :data="TILE_URL"
      :render-sub-layers="renderSubLayers"
      :min-zoom="0"
      :max-zoom="19"
      :tile-size="256"
    />
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10">
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
          Tile Layer (deck.gl)
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Generic tile layer for loading and rendering tiled data with custom
          sublayers.
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          Data source:
          <a
            href="https://www.openstreetmap.org/"
            target="_blank"
            class="text-primary hover:underline"
            >OpenStreetMap</a
          >
          contributors
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>
              <VLayerDeckglTile
                id="tile-layer"
                :data="TILE_URL"
                :render-sub-layers="renderSubLayers"
                :min-zoom="0"
                :max-zoom="19"
                :tile-size="256"
              ></VLayerDeckglTile>
            </VMap>
          </ClientOnly>
        </div>

        <div class="min-w-0">
          <CodeBlock
            :code="codeExample"
            lang="vue"
            filename="TileLayer.vue"
          ></CodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>
