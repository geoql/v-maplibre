<script setup lang="ts">
  import type {
    DriftMode,
    ParticlePositionDatum,
    ProbabilityHullDatum,
    TripDatum,
    VectorDatum,
  } from '~/types/maritime-drift';
  import type { Position, Color } from '@deck.gl/core';
  import {
    VLayerDeckglPolygon,
    VLayerDeckglTrips,
    VLayerDeckglScatterplot,
    VLayerDeckglPath,
    VLayerDeckglHeatmap,
  } from '@geoql/v-maplibre';

  const props = defineProps<{
    particlePositionData: ParticlePositionDatum[];
    tripData: TripDatum[];
    probabilityHull: ProbabilityHullDatum;
    vectorData: VectorDatum[];
    datumLng: number;
    datumLat: number;
    mode: DriftMode;
    currentTime: number;
    showHeatmap: boolean;
  }>();

  const isSar = computed(() => props.mode === 'sar');

  const loopedTime = computed(() => {
    const ts = props.tripData[0]?.timestamps;
    const max = ts && ts.length > 0 ? ts[ts.length - 1]! : 1;
    return props.currentTime * max;
  });

  const hull = computed(() => [props.probabilityHull]);
  const hullFill = computed<Color>(() =>
    isSar.value ? [255, 191, 0, 35] : [40, 20, 10, 40],
  );
  const hullLine = computed<Color>(() =>
    isSar.value ? [255, 191, 0, 120] : [80, 50, 20, 100],
  );
  const trailColor = computed<Color>(() =>
    isSar.value ? [255, 191, 0, 160] : [60, 40, 20, 120],
  );
  const particleColor = computed<Color>(() =>
    isSar.value ? [255, 191, 0, 200] : [40, 20, 10, 200],
  );
  const particleRadius = computed(() => (isSar.value ? 5 : 8));

  const datumData = computed(() => [
    { position: [props.datumLng, props.datumLat] as Position },
  ]);

  const heatColorRange = computed<Color[]>(() =>
    isSar.value
      ? [
          [255, 255, 178],
          [255, 200, 0],
          [255, 140, 0],
          [255, 60, 0],
        ]
      : [
          [80, 60, 40],
          [60, 40, 20],
          [30, 20, 10],
        ],
  );

  function getHullPolygon(d: unknown): Position[] {
    return (d as ProbabilityHullDatum).polygon;
  }

  function getTripPath(d: unknown): Position[] {
    return (d as TripDatum).path;
  }

  function getTripTimestamps(d: unknown): number[] {
    return (d as TripDatum).timestamps;
  }

  function getParticlePosition(d: unknown): Position {
    const p = d as ParticlePositionDatum;
    return [p.lng, p.lat];
  }

  function getDatumPosition(d: unknown): Position {
    return (d as { position: Position }).position;
  }

  function getVectorPath(d: unknown): Position[] {
    const v = d as VectorDatum;
    const lengthKm = Math.min(v.magnitude * 2, 80);
    const rad = (v.angleDeg * Math.PI) / 180;
    const cosLat = Math.cos((v.position[1] * Math.PI) / 180);
    const dLng = (lengthKm * Math.sin(rad)) / (111.32 * cosLat);
    const dLat = (lengthKm * Math.cos(rad)) / 111.32;
    return [
      [v.position[0], v.position[1]],
      [v.position[0] + dLng, v.position[1] + dLat],
    ];
  }

  function getVectorColor(d: unknown): Color {
    return (d as VectorDatum).label === 'Current'
      ? [0, 180, 255, 220]
      : [230, 230, 235, 210];
  }
</script>

<template>
  <VLayerDeckglPolygon
    id="drift-hull"
    :data="hull"
    :get-polygon="getHullPolygon"
    :get-fill-color="hullFill"
    :get-line-color="hullLine"
    :line-width-min-pixels="2"
  />

  <VLayerDeckglTrips
    id="drift-trails"
    :data="tripData"
    :get-path="getTripPath"
    :get-timestamps="getTripTimestamps"
    :get-color="trailColor"
    :current-time="loopedTime"
    :trail-length="0.4"
    :fade-trail="true"
    :width-min-pixels="1.5"
    :cap-rounded="true"
    :joint-rounded="true"
    :opacity="0.6"
  />

  <VLayerDeckglScatterplot
    id="drift-positions"
    :data="particlePositionData"
    :get-position="getParticlePosition"
    :get-fill-color="particleColor"
    :get-radius="particleRadius"
    radius-units="pixels"
    :opacity="0.85"
  />

  <VLayerDeckglScatterplot
    id="drift-datum"
    :data="datumData"
    :get-position="getDatumPosition"
    :get-fill-color="[0, 255, 180, 255]"
    :get-radius="8"
    radius-units="pixels"
    :stroked="true"
    :get-line-color="[255, 255, 255, 255]"
    :line-width-min-pixels="2"
  />

  <VLayerDeckglPath
    id="drift-vectors"
    :data="vectorData"
    :get-path="getVectorPath"
    :get-color="getVectorColor"
    :width-min-pixels="2"
    :cap-rounded="true"
    :joint-rounded="true"
    :billboard="true"
  />

  <VLayerDeckglHeatmap
    v-if="showHeatmap"
    id="drift-heatmap"
    :data="particlePositionData"
    :get-position="getParticlePosition"
    :radius-pixels="40"
    :intensity="1.2"
    :threshold="0.05"
    :color-range="heatColorRange"
  />
</template>
