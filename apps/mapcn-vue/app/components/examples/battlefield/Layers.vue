<script setup lang="ts">
  import type {
    BattlefieldUnit,
    ElevatedPath,
    ElevatedPosition,
  } from '~/types/defense-terrain';
  import {
    VLayerDeckglScatterplot,
    VLayerDeckglText,
    VLayerDeckglTrips,
  } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    paths: ElevatedPath[];
    currentTime: number;
    positions: ElevatedPosition[];
  }>();

  const UNITS_MAP: Record<string, BattlefieldUnit> = {
    alpha: {
      id: 'alpha',
      callsign: 'Alpha',
      type: 'infantry',
      color: [30, 144, 255],
      strength: 120,
    },
    bravo: {
      id: 'bravo',
      callsign: 'Bravo',
      type: 'infantry',
      color: [65, 170, 255],
      strength: 95,
    },
    charlie: {
      id: 'charlie',
      callsign: 'Charlie',
      type: 'armor',
      color: [255, 165, 0],
      strength: 14,
    },
    delta: {
      id: 'delta',
      callsign: 'Delta',
      type: 'armor',
      color: [255, 200, 60],
      strength: 12,
    },
    echo: {
      id: 'echo',
      callsign: 'Echo',
      type: 'patrol',
      color: [0, 200, 100],
      strength: 30,
    },
    foxtrot: {
      id: 'foxtrot',
      callsign: 'Foxtrot',
      type: 'recon',
      color: [180, 100, 255],
      strength: 8,
    },
  };

  // One TripsLayer for all units (not one per unit): the overlay redraws the
  // whole deck synchronously on every map render, so six trail layers meant
  // six times the draw cost per camera frame. A single layer renders all
  // trails in one pass and keeps zooming usable.
  const getPath = (d: ElevatedPath): [number, number, number][] => d.path;
  const getTimestamps = (d: ElevatedPath): number[] => d.timestamps;
  const getPathColor = (d: ElevatedPath): [number, number, number] =>
    UNITS_MAP[d.unitId]?.color ?? [255, 255, 255];
  const getPositionCoords = (d: ElevatedPosition): [number, number, number] => [
    d.lng,
    d.lat,
    d.z,
  ];
  const getPositionColor = (d: ElevatedPosition): [number, number, number] =>
    UNITS_MAP[d.unitId]?.color ?? [255, 255, 255];
  const getCallsign = (d: ElevatedPosition): string =>
    UNITS_MAP[d.unitId]?.callsign ?? '';
</script>

<template>
  <VLayerDeckglTrips
    id="unit-trails"
    :data="props.paths"
    :get-path="getPath"
    :get-timestamps="getTimestamps"
    :get-color="getPathColor"
    :current-time="props.currentTime"
    :trail-length="60"
    :fade-trail="true"
    :width-min-pixels="4"
    :cap-rounded="true"
    :joint-rounded="true"
    :opacity="0.85"
  />
  <VLayerDeckglScatterplot
    id="unit-positions"
    :data="props.positions"
    :get-position="getPositionCoords"
    :get-fill-color="getPositionColor"
    :get-radius="200"
    :radius-min-pixels="6"
    :radius-max-pixels="20"
    :opacity="0.9"
    :stroked="true"
    :get-line-color="[255, 255, 255]"
    :line-width-min-pixels="2"
  />
  <VLayerDeckglText
    id="unit-labels"
    :data="props.positions"
    :get-position="getPositionCoords"
    :get-text="getCallsign"
    :get-size="14"
    :get-color="[255, 255, 255, 230]"
    :get-pixel-offset="[12, 0]"
    get-text-anchor="start"
    get-alignment-baseline="center"
    font-family="monospace"
    :billboard="true"
    :outline-width="3"
    :outline-color="[0, 0, 0, 200]"
  />
</template>
