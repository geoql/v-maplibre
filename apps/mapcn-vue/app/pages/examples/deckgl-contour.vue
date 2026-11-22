<script setup lang="ts">
  import {
    VMap,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';
  import { VLayerDeckglContour } from '@geoql/v-maplibre/deck.gl';
  import type { GradientLegendItem } from '@geoql/v-maplibre';
  import type { ContourCluster, ContourPoint } from '~/types/contour';

  usePageGeo({
    title: 'Contour Layer (deck.gl) - mapcn-vue Examples',
    description: 'Contour lines for density visualization.',
  });

  defineOgImage('SiteDoc', {
    title: 'Contour Layer (deck.gl)',
    description: 'Contour lines for density visualization.',
    category: 'deck.gl',
  });

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapOptions = computed(() => ({
    container: `contour-example-${mapId}`,
    style: mapStyle.value,
    center: [-122.4, 37.78] as [number, number],
    zoom: 11,
  }));

  // Deterministic point data.
  //
  // A seeded PRNG keeps the dataset identical on every load — and identical
  // between the SSR pass and the client — which is what makes the contour
  // thresholds below meaningful instead of a moving target.
  function createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Four Gaussian clusters around the SF peninsula. The Gaussian falloff is
  // what turns the aggregation into nested density rings instead of a flat
  // plateau with ragged edges.
  const CLUSTERS: ContourCluster[] = [
    { center: [-122.42, 37.78], count: 700, sigmaLng: 0.013, sigmaLat: 0.009 },
    { center: [-122.38, 37.79], count: 700, sigmaLng: 0.013, sigmaLat: 0.009 },
    { center: [-122.45, 37.77], count: 700, sigmaLng: 0.013, sigmaLat: 0.009 },
    { center: [-122.4, 37.8], count: 700, sigmaLng: 0.013, sigmaLat: 0.009 },
  ];

  function generateData(): ContourPoint[] {
    const random = createRandom(20240517);
    const data: ContourPoint[] = [];
    for (const cluster of CLUSTERS) {
      for (let i = 0; i < cluster.count; i++) {
        // Box–Muller: two uniform samples -> one standard normal sample.
        const u1 = Math.max(random(), Number.EPSILON);
        const u2 = random();
        const radius = Math.sqrt(-2 * Math.log(u1));
        const angle = 2 * Math.PI * u2;
        data.push({
          position: [
            cluster.center[0] + radius * Math.cos(angle) * cluster.sigmaLng,
            cluster.center[1] + radius * Math.sin(angle) * cluster.sigmaLat,
          ],
        });
      }
    }
    return data;
  }

  const contourData = generateData();

  const getPosition = (d: unknown) => (d as ContourPoint).position;

  // Contour thresholds are counts of points per aggregation cell, and the cell
  // size is in metres. A 50 m grid over this dataset put ~1 point in a cell,
  // so every threshold above 1 was unreachable and the single reachable one
  // produced sub-pixel noise instead of readable contours. 350 m cells put
  // ~12 points in the peak cell, which gives five distinct density levels.
  const CELL_SIZE = 350;

  const contours = [
    {
      threshold: [2, 9] as [number, number],
      color: [255, 255, 178, 70] as [number, number, number, number],
      zIndex: 0,
    },
    {
      threshold: [9, 19] as [number, number],
      color: [253, 141, 60, 80] as [number, number, number, number],
      zIndex: 1,
    },
    {
      threshold: 2,
      color: [254, 217, 118, 220] as [number, number, number, number],
      strokeWidth: 1,
      zIndex: 2,
    },
    {
      threshold: 5,
      color: [254, 204, 92, 230] as [number, number, number, number],
      strokeWidth: 2,
      zIndex: 3,
    },
    {
      threshold: 9,
      color: [253, 141, 60, 240] as [number, number, number, number],
      strokeWidth: 2,
      zIndex: 4,
    },
    {
      threshold: 14,
      color: [240, 59, 32, 245] as [number, number, number, number],
      strokeWidth: 3,
      zIndex: 5,
    },
    {
      threshold: 19,
      color: [189, 0, 38, 255] as [number, number, number, number],
      strokeWidth: 3,
      zIndex: 6,
    },
  ];

  const legendItems: GradientLegendItem[] = [
    {
      min: 0,
      max: 20,
      minLabel: 'Low',
      maxLabel: 'High',
      colors: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
    },
  ];

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                  import { VMap, VControlNavigation } from '@geoql/v-maplibre';
                  import { VLayerDeckglContour } from '@geoql/v-maplibre/deck.gl';

                  const mapOptions = {
                  style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
                  center: [-122.4, 37.78],
                  zoom: 11,
                  };

                  const contourData = [
                  { position: [-122.42, 37.78] },
                  { position: [-122.38, 37.79] },
                  // ... many more points
                  ];

                  const contours = [
                  { threshold: [2, 9], color: [255, 255, 178, 70] },
                  { threshold: [9, 19], color: [253, 141, 60, 80] },
                  { threshold: 5, color: [254, 204, 92, 230], strokeWidth: 2 },
                  { threshold: 9, color: [253, 141, 60, 240], strokeWidth: 2 },
                  { threshold: 14, color: [240, 59, 32, 245], strokeWidth: 3 },
                  ];
                ${SCRIPT_END}

                <template>
                  <VMap :options="mapOptions" class="h-125 w-full">
                    <VControlNavigation position="top-right" />
                    <VLayerDeckglContour
                      id="contour-layer"
                      :data="contourData"
                      :get-position="(d) => d.position"
                      :contours="contours"
                      :cell-size="50"
                      :pickable="true"
                    />
                  </VMap>
                </template>`;
</script>

<template>
  <ComponentDemo
    title="Contour Layer (deck.gl)"
    description="Contour lines showing density thresholds for point data."
    :code="codeExample"
    registry="map-deckgl-aggregation"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VLayerDeckglContour
            id="contour-layer"
            :data="contourData"
            :get-position="getPosition"
            :contours="contours"
            :cell-size="CELL_SIZE"
            :pickable="true"
          />
          <VControlLegend
            :layer-ids="['contour-layer']"
            position="bottom-left"
            type="gradient"
            title="Point Density"
            :items="legendItems"
            :interactive="false"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
