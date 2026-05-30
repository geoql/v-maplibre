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
    cargo: 3.5,
    tanker: 4,
    fishing: 2.5,
    naval: 3.5,
    passenger: 3.5,
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
    :radius-min-pixels="2"
    :radius-max-pixels="5"
    :stroked="false"
    :antialiasing="false"
  />

  <VLayerDeckglScatterplot
    id="ais-dark-positions"
    :data="darkData"
    :get-position="getVesselPosition"
    :get-fill-color="[255, 60, 50, 240]"
    :get-radius="4"
    radius-units="pixels"
    :radius-min-pixels="3"
    :radius-max-pixels="6"
    :stroked="false"
    :antialiasing="false"
  />

  <VLayerDeckglScatterplot
    id="ais-dark-ring"
    :data="darkData"
    :get-position="getVesselPosition"
    :get-radius="9"
    radius-units="pixels"
    :radius-min-pixels="8"
    :radius-max-pixels="11"
    :stroked="true"
    :get-line-color="[255, 50, 45, 210]"
    :line-width-min-pixels="1.5"
    :filled="false"
    :pickable="false"
    :antialiasing="false"
  />
</template>
