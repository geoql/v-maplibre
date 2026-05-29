<script setup lang="ts">
  import type {
    OceanGridCell,
    CurrentSample,
    TripStreamline,
  } from '~/types/maritime-ocean';
  import type { Position, Color } from '@deck.gl/core';
  import { sstToColor } from '~/composables/use-maritime-ocean';
  import {
    VLayerDeckglScatterplot,
    VLayerDeckglTrips,
    VLayerDeckglText,
  } from '@geoql/v-maplibre';

  const props = defineProps<{
    oceanGrid: OceanGridCell[];
    currentSamples: CurrentSample[];
    streamlineTrips: TripStreamline[];
    showSst: boolean;
    showCurrents: boolean;
    sstOpacity: number;
    loopedTime: number;
  }>();

  const legendLabels = [
    { position: [60.5, 5.2], text: '22°C' },
    { position: [65.5, 5.2], text: '24°C' },
    { position: [70.5, 5.2], text: '27°C' },
    { position: [75.5, 5.2], text: '30°C' },
    { position: [78.0, 5.2], text: '32°C' },
  ];

  function getSstPosition(d: unknown): Position {
    const cell = d as OceanGridCell;
    return [cell.lng, cell.lat];
  }

  function getSstColor(d: unknown): Color {
    return sstToColor((d as OceanGridCell).sst);
  }

  function getTripPath(d: unknown): Position[] {
    return (d as TripStreamline).path;
  }

  function getTripTimestamps(d: unknown): number[] {
    return (d as TripStreamline).timestamps;
  }

  function getTripColor(d: unknown): Color {
    const trip = d as TripStreamline;
    const idx = Number.parseInt(trip.shipId.replace('current-', ''), 10);
    const sample = props.currentSamples[idx];
    if (!sample) return [0, 200, 255];
    const t = Math.min(sample.speed / 25, 1);
    return [
      Math.round(t * 255),
      Math.round(220 + (30 - 220) * t),
      Math.round(100 + (255 - 100) * t),
    ];
  }

  function getLabelPosition(d: unknown): Position {
    return (d as { position: number[] }).position;
  }

  function getLabelText(d: unknown): string {
    return (d as { text: string }).text;
  }
</script>

<template>
  <VLayerDeckglScatterplot
    v-if="showSst"
    id="ocean-sst-field"
    :data="oceanGrid"
    :get-position="getSstPosition"
    :get-fill-color="getSstColor"
    :get-radius="11"
    radius-units="pixels"
    :radius-min-pixels="4"
    :radius-max-pixels="40"
    :opacity="sstOpacity"
    :pickable="false"
  />

  <VLayerDeckglTrips
    v-if="showCurrents"
    id="ocean-currents"
    :data="streamlineTrips"
    :get-path="getTripPath"
    :get-timestamps="getTripTimestamps"
    :get-color="getTripColor"
    :current-time="loopedTime"
    :trail-length="20"
    :fade-trail="true"
    :width-min-pixels="2.5"
    :width-max-pixels="6"
    :cap-rounded="true"
    :joint-rounded="true"
    :opacity="0.95"
  />

  <VLayerDeckglText
    id="ocean-sst-labels"
    :data="legendLabels"
    :get-position="getLabelPosition"
    :get-text="getLabelText"
    :get-color="[200, 220, 255, 200]"
    :get-size="11"
    font-family="monospace"
    :font-weight="600"
  />
</template>
