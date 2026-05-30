<script setup lang="ts">
  import type {
    Vessel,
    VesselPosition,
    VesselPositionDatum,
    TripDatum,
    WakeArcDatum,
  } from '~/types/maritime-ais';
  import type { Position, Color } from '@deck.gl/core';
  import { VLayerDeckglScatterplot, VLayerDeckglArc } from '@geoql/v-maplibre';

  const props = defineProps<{
    vessels: Vessel[];
    positions: Record<string, VesselPosition>;
    tripData: TripDatum[];
    loopedTime: number;
    cameraLng: number;
    cameraLat: number;
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

  const DEG = Math.PI / 180;

  // The depthCompare:'always' globe fix (visgl/deck.gl#10206) disables depth
  // occlusion, so deck dots on the FAR hemisphere bleed through the sphere.
  // deck.gl's own workaround (#9554) is a camera-space cull: a point is visible
  // only if it shares the camera-facing hemisphere. cameraVec is the unit vector
  // of the viewport-centre lng/lat; a vessel is on the near side when its unit
  // vector dotted with cameraVec is positive (angle < 90° = in front of the
  // globe's horizon).
  const cameraVec = computed<[number, number, number]>(() => {
    const latR = props.cameraLat * DEG;
    const lngR = props.cameraLng * DEG;
    const cl = Math.cos(latR);
    return [cl * Math.cos(lngR), cl * Math.sin(lngR), Math.sin(latR)];
  });

  function isNearSide(lng: number, lat: number): boolean {
    const latR = lat * DEG;
    const lngR = lng * DEG;
    const cl = Math.cos(latR);
    const v = cameraVec.value;
    return (
      v[0] * cl * Math.cos(lngR) +
        v[1] * cl * Math.sin(lngR) +
        v[2] * Math.sin(latR) >
      0
    );
  }

  function toDatum(v: Vessel): VesselPositionDatum | null {
    const pos = props.positions[v.id];
    if (!pos) return null;
    if (!isNearSide(pos.lng, pos.lat)) return null;
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
    return [c[0], c[1], c[2], 255];
  }

  function getVesselRadius(d: unknown): number {
    return RADIUS_BY_TYPE[(d as VesselPositionDatum).type] ?? 7;
  }

  // deck.gl PathLayer/TripsLayer geometry does not render on a MapLibre globe
  // (visgl/deck.gl#2302, #5143 — segments collapse to vertical lines / flipped
  // faces). ArcLayer DOES render correctly on the globe (camera-facing 3D
  // strips), so the wake is one ArcLayer arc per vessel from its position
  // TRAIL_SPAN ago to its current position, with ArcLayer's built-in
  // source→target colour gradient giving the transparent-tail → opaque-head
  // fade for free. One arc per vessel keeps it at 250 arcs / 60fps; over this
  // short span the great-circle approximation of the gently-curving track is
  // visually indistinguishable from chaining many segments.
  const TRAIL_SPAN = 6;
  const TRAIL_ALPHA = 200;

  // Clamp (do NOT wrap) the sampled time to [0, span]. The track is an open
  // line, not a closed loop, so a negative time (just after the loop restarts)
  // must NOT wrap to the track's end — that produced a giant arc spanning the
  // whole track from end back to start. Clamping shortens the wake at the loop
  // boundary instead, keeping it trailing correctly behind the vessel.
  function interpAtTime(trip: TripDatum, time: number): [number, number] {
    const path = trip.path;
    const maxIdx = path.length - 1;
    const span = trip.timestamps[maxIdx] || 1;
    const clamped = time < 0 ? 0 : time > span ? span : time;
    const f = (clamped / span) * maxIdx;
    const idx = f | 0;
    const frac = f - idx;
    const p = path[idx]!;
    const n = path[idx + 1 > maxIdx ? maxIdx : idx + 1]!;
    return [p[0] + (n[0] - p[0]) * frac, p[1] + (n[1] - p[1]) * frac];
  }

  const wakeData = computed<WakeArcDatum[]>(() => {
    const t = props.loopedTime;
    const colors = colorById.value;
    const arcs: WakeArcDatum[] = [];
    for (const trip of props.tripData) {
      const target = interpAtTime(trip, t);
      if (!isNearSide(target[0], target[1])) continue;
      const c = colors.get(trip.vesselId) ?? [200, 200, 200];
      arcs.push({
        source: interpAtTime(trip, t - TRAIL_SPAN),
        target,
        sourceColor: [c[0], c[1], c[2], 0],
        targetColor: [c[0], c[1], c[2], TRAIL_ALPHA],
      });
    }
    return arcs;
  });

  function getWakeSource(d: unknown): Position {
    return (d as WakeArcDatum).source;
  }

  function getWakeTarget(d: unknown): Position {
    return (d as WakeArcDatum).target;
  }

  function getWakeSourceColor(d: unknown): Color {
    return (d as WakeArcDatum).sourceColor;
  }

  function getWakeTargetColor(d: unknown): Color {
    return (d as WakeArcDatum).targetColor;
  }
</script>

<template>
  <VLayerDeckglArc
    id="ais-trails"
    :data="wakeData"
    :get-source-position="getWakeSource"
    :get-target-position="getWakeTarget"
    :get-source-color="getWakeSourceColor"
    :get-target-color="getWakeTargetColor"
    :get-width="2"
    :get-height="0"
    :num-segments="2"
    width-units="pixels"
    :width-min-pixels="1.5"
  />

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
  />

  <VLayerDeckglScatterplot
    id="ais-dark-positions"
    :data="darkData"
    :get-position="getVesselPosition"
    :get-fill-color="[255, 60, 50, 255]"
    :get-radius="4"
    radius-units="pixels"
    :radius-min-pixels="3"
    :radius-max-pixels="6"
    :stroked="false"
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
    :get-line-color="[255, 50, 45, 255]"
    :line-width-min-pixels="1.5"
    :filled="false"
    :pickable="false"
  />
</template>
