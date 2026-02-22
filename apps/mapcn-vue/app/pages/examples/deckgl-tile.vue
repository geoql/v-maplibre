<script setup lang="ts">
  import {
    VMap,
    VLayerDeckglTile,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import { BitmapLayer } from '@deck.gl/layers';

  useSeoMeta({
    title: 'Tile Layer (deck.gl) - mapcn-vue Examples',
    description: 'Generic tile layer for loading raster or vector tiles.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Tile Layer (deck.gl)',
    description: 'Generic tile layer for loading raster or vector tiles.',
    category: 'deck.gl',
  });

  const mapId = useId();
  const { mapStyle } = useMapStyle();

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
  <VMap :options="mapOptions" class="h-125 w-full">
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
      <div class="mb-4">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Examples
        </NuxtLink>
        <h1 class="mt-1.5 text-xl font-semibold tracking-tight">
          Tile Layer (deck.gl)
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
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

      <ComponentDemo :code="codeExample" full-width class="h-125">
        <div class="h-125 min-w-0 overflow-hidden">
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="size-full">
              <VControlNavigation position="top-right" />
              <VControlScale position="bottom-left" />
              <VLayerDeckglTile
                id="tile-layer"
                :data="TILE_URL"
                :render-sub-layers="renderSubLayers"
                :min-zoom="0"
                :max-zoom="19"
                :tile-size="256"
              />
            </VMap>
          </ClientOnly>
        </div>
      </ComponentDemo>

      <ExampleNavigation />
    </div>
  </div>
</template>
