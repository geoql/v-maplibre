<script setup lang="ts">
  import type {
    C2Unit,
    C2PatrolPath,
    C2UnitPosition,
    C2PositionDatum,
    C2LabelDatum,
    C2Waypoint,
  } from '~/types/defense-drone-c2';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    units: C2Unit[];
    patrolPaths: C2PatrolPath[];
    positions: Record<string, C2UnitPosition>;
    waypoints: C2Waypoint[];
    loopedTime: number;
    selectedUnitId: string | null;
  }>();

  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getPathFromTrip(d: unknown): [number, number][] {
    return (d as C2PatrolPath).path;
  }

  function getTimestampsFromTrip(d: unknown): number[] {
    return (d as C2PatrolPath).timestamps;
  }

  function getPositionFromDatum(d: unknown): [number, number] {
    const datum = d as C2PositionDatum;
    return [datum.lng, datum.lat];
  }

  function getPositionFillColor(d: unknown): [number, number, number, number] {
    const datum = d as C2PositionDatum;
    const unit = props.units.find((u) => u.id === datum.unitId);
    const c = unit?.color ?? [255, 255, 255];
    return [c[0], c[1], c[2], 220];
  }

  function getPositionRadius(d: unknown): number {
    const datum = d as C2PositionDatum;
    return datum.selected ? 12 : 7;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as C2LabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as C2LabelDatum).text;
  }

  function getWaypointPosition(d: unknown): [number, number] {
    return (d as C2Waypoint).position;
  }

  function getWaypointColor(): [number, number, number, number] {
    return [255, 255, 255, 100];
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const [geoModule, layersModule] = await Promise.all([
      import('@deck.gl/geo-layers'),
      import('@deck.gl/layers'),
    ]);
    TripsLayerClass = geoModule.TripsLayer;
    ScatterplotLayerClass = layersModule.ScatterplotLayer;
    TextLayerClass = layersModule.TextLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (!TripsLayerClass || !ScatterplotLayerClass || !TextLayerClass) return;

    for (const patrol of props.patrolPaths) {
      const unit = props.units.find((u) => u.id === patrol.unitId);
      if (!unit) continue;

      const trailLayer = new TripsLayerClass({
        id: `c2-trail-${patrol.unitId}`,
        data: [patrol],
        getPath: getPathFromTrip,
        getTimestamps: getTimestampsFromTrip,
        getColor: unit.color as [number, number, number],
        currentTime: props.loopedTime,
        trailLength: 60,
        fadeTrail: true,
        widthMinPixels: 3,
        capRounded: true,
        jointRounded: true,
        opacity: 0.7,
      });
      updateLayer(`c2-trail-${patrol.unitId}`, trailLayer);
    }

    const positionData: C2PositionDatum[] = props.units
      .map((u) => {
        const pos = props.positions[u.id];
        if (!pos) return null;
        return {
          lng: pos.lng,
          lat: pos.lat,
          unitId: u.id,
          selected: u.id === props.selectedUnitId,
        };
      })
      .filter((d): d is C2PositionDatum => d !== null);

    const posLayer = new ScatterplotLayerClass({
      id: 'c2-positions',
      data: positionData,
      getPosition: getPositionFromDatum,
      getFillColor: getPositionFillColor,
      getRadius: getPositionRadius,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 180] as [number, number, number, number],
      lineWidthMinPixels: 2,
      pickable: true,
    });
    updateLayer('c2-positions', posLayer);

    const labelData: C2LabelDatum[] = positionData.map((d) => ({
      position: [d.lng, d.lat] as [number, number],
      text: props.units.find((u) => u.id === d.unitId)?.callsign ?? '',
    }));

    const labelLayer = new TextLayerClass({
      id: 'c2-labels',
      data: labelData,
      getPosition: getLabelPosition,
      getText: getLabelText,
      getColor: [255, 255, 255, 230] as [number, number, number, number],
      getSize: 12,
      getPixelOffset: [0, -20] as [number, number],
      fontFamily: 'monospace',
      fontWeight: 700,
      outlineWidth: 3,
      outlineColor: [0, 0, 0, 200] as [number, number, number, number],
      billboard: true,
    });
    updateLayer('c2-labels', labelLayer);

    const waypointLayer = new ScatterplotLayerClass({
      id: 'c2-waypoints',
      data: props.waypoints,
      getPosition: getWaypointPosition,
      getFillColor: getWaypointColor,
      getRadius: 4,
      radiusUnits: 'pixels' as const,
    });
    updateLayer('c2-waypoints', waypointLayer);
  }

  watch(
    [() => props.loopedTime, () => props.positions, () => props.selectedUnitId],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    for (const patrol of props.patrolPaths) {
      removeLayer(`c2-trail-${patrol.unitId}`);
    }
    removeLayer('c2-positions');
    removeLayer('c2-labels');
    removeLayer('c2-waypoints');
  });
</script>

<template>
  <slot></slot>
</template>
