<script setup lang="ts">
  import type {
    Vessel,
    VesselPosition,
    VesselPositionDatum,
  } from '~/types/maritime-ais';
  import type { Position, Color } from '@deck.gl/core';
  import { VLayerDeckglScatterplot } from '@geoql/v-maplibre';

  const props = defineProps<{
    vessels: Vessel[];
    positions: Record<string, VesselPosition>;
  }>();

  const RADIUS_BY_TYPE: Record<string, number> = {
    cargo: 8,
    tanker: 9,
    fishing: 6,
    naval: 7,
    passenger: 8,
  };

  const colorById = computed(() => {
    const m = new Map<string, [number, number, number]>();
    for (const v of props.vessels) m.set(v.id, v.color);
    return m;
  });

  function toDatum(v: Vessel): VesselPositionDatum | null {
    const pos = props.positions[v.id];
    if (!pos) return null;
    return {
      lng: pos.lng,
      lat: pos.lat,
      vesselId: v.id,
      type: v.type,
      dark: v.dark,
    };
  }

  const positionData = computed(() =>
    props.vessels
      .filter((v) => !v.dark)
      .map(toDatum)
      .filter((d): d is VesselPositionDatum => d !== null),
  );

  const darkData = computed(() =>
    props.vessels
      .filter((v) => v.dark)
      .map(toDatum)
      .filter((d): d is VesselPositionDatum => d !== null),
  );

  function getVesselPosition(d: unknown): Position {
    const datum = d as VesselPositionDatum;
    return [datum.lng, datum.lat];
  }

  function getVesselFillColor(d: unknown): Color {
    const c = colorById.value.get((d as VesselPositionDatum).vesselId) ?? [
      200, 200, 200,
    ];
    return [c[0], c[1], c[2], 220];
  }

  function getVesselRadius(d: unknown): number {
    return RADIUS_BY_TYPE[(d as VesselPositionDatum).type] ?? 7;
  }
</script>

<template>
  <VLayerDeckglScatterplot
    id="ais-positions"
    :data="positionData"
    :get-position="getVesselPosition"
    :get-fill-color="getVesselFillColor"
    :get-radius="getVesselRadius"
    radius-units="pixels"
    :stroked="true"
    :get-line-color="[255, 255, 255, 160]"
    :line-width-min-pixels="1.5"
  />

  <VLayerDeckglScatterplot
    id="ais-dark-positions"
    :data="darkData"
    :get-position="getVesselPosition"
    :get-fill-color="[60, 10, 10, 220]"
    :get-radius="7"
    radius-units="pixels"
    :stroked="true"
    :get-line-color="[255, 50, 50, 200]"
    :line-width-min-pixels="2"
  />

  <VLayerDeckglScatterplot
    id="ais-dark-ring"
    :data="darkData"
    :get-position="getVesselPosition"
    :get-fill-color="[255, 30, 30, 0]"
    :get-radius="16"
    radius-units="pixels"
    :stroked="true"
    :get-line-color="[255, 40, 40, 200]"
    :line-width-min-pixels="2"
    :filled="false"
    :pickable="false"
  />
</template>
