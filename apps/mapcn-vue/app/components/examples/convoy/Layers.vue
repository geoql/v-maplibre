<script setup lang="ts">
  import type {
    ConvoyUnit,
    ConvoyRoute,
    ConvoyCheckpoint,
    ConvoyPositionDatum,
    ConvoyLabelDatum,
    CheckpointDatum,
  } from '~/types/defense-convoy';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    convoys: ConvoyUnit[];
    routes: ConvoyRoute[];
    positions: Record<string, { lng: number; lat: number }>;
    activeCheckpoints: ConvoyCheckpoint[];
    loopedTime: number;
    selectedConvoyId: string | null;
  }>();

  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  const CHECKPOINT_COLORS: Record<string, [number, number, number, number]> = {
    cleared: [0, 200, 100, 220],
    next: [255, 200, 0, 220],
    pending: [150, 150, 150, 160],
  };

  function getPathFromRoute(d: unknown): [number, number][] {
    return (d as ConvoyRoute).path;
  }

  function getTimestampsFromRoute(d: unknown): number[] {
    return (d as ConvoyRoute).timestamps;
  }

  function getConvoyPosition(d: unknown): [number, number] {
    const datum = d as ConvoyPositionDatum;
    return [datum.lng, datum.lat];
  }

  function getConvoyFillColor(d: unknown): [number, number, number, number] {
    const datum = d as ConvoyPositionDatum;
    const unit = props.convoys.find((c) => c.id === datum.convoyId);
    const c = unit?.color ?? [255, 255, 255];
    return [c[0], c[1], c[2], 230];
  }

  function getConvoyRadius(d: unknown): number {
    const datum = d as ConvoyPositionDatum;
    return datum.selected ? 14 : 9;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as ConvoyLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as ConvoyLabelDatum).text;
  }

  function getCheckpointPosition(d: unknown): [number, number] {
    return (d as CheckpointDatum).position;
  }

  function getCheckpointFillColor(
    d: unknown,
  ): [number, number, number, number] {
    const datum = d as CheckpointDatum;
    return CHECKPOINT_COLORS[datum.status] ?? [150, 150, 150, 160];
  }

  function getCheckpointRadius(d: unknown): number {
    const datum = d as CheckpointDatum;
    return datum.status === 'next' ? 7 : 5;
  }

  function getCheckpointLabelPosition(d: unknown): [number, number] {
    return (d as CheckpointDatum).position;
  }

  function getCheckpointLabelText(d: unknown): string {
    return (d as CheckpointDatum).label;
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

    for (const route of props.routes) {
      const unit = props.convoys.find((c) => c.id === route.convoyId);
      if (!unit) continue;

      const trailLayer = new TripsLayerClass({
        id: `convoy-trail-${route.convoyId}`,
        data: [route],
        getPath: getPathFromRoute,
        getTimestamps: getTimestampsFromRoute,
        getColor: unit.color as [number, number, number],
        currentTime: props.loopedTime,
        trailLength: 80,
        fadeTrail: true,
        widthMinPixels: 4,
        capRounded: true,
        jointRounded: true,
        opacity: 0.8,
      });
      updateLayer(`convoy-trail-${route.convoyId}`, trailLayer);
    }

    const positionData: ConvoyPositionDatum[] = props.convoys
      .map((c) => {
        const pos = props.positions[c.id];
        if (!pos) return null;
        return {
          lng: pos.lng,
          lat: pos.lat,
          convoyId: c.id,
          selected: c.id === props.selectedConvoyId,
        };
      })
      .filter((d): d is ConvoyPositionDatum => d !== null);

    const posLayer = new ScatterplotLayerClass({
      id: 'convoy-positions',
      data: positionData,
      getPosition: getConvoyPosition,
      getFillColor: getConvoyFillColor,
      getRadius: getConvoyRadius,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 200] as [number, number, number, number],
      lineWidthMinPixels: 2,
      pickable: true,
    });
    updateLayer('convoy-positions', posLayer);

    const labelData: ConvoyLabelDatum[] = positionData.map((d) => ({
      position: [d.lng, d.lat] as [number, number],
      text: props.convoys.find((c) => c.id === d.convoyId)?.callsign ?? '',
    }));

    const labelLayer = new TextLayerClass({
      id: 'convoy-labels',
      data: labelData,
      getPosition: getLabelPosition,
      getText: getLabelText,
      getColor: [255, 255, 255, 230] as [number, number, number, number],
      getSize: 12,
      getPixelOffset: [0, -22] as [number, number],
      fontFamily: 'monospace',
      fontWeight: 700,
      outlineWidth: 3,
      outlineColor: [0, 0, 0, 200] as [number, number, number, number],
      billboard: true,
    });
    updateLayer('convoy-labels', labelLayer);

    const checkpointData: CheckpointDatum[] = props.activeCheckpoints.map(
      (cp) => ({
        position: cp.position,
        status: cp.status,
        label: cp.label,
      }),
    );

    const cpLayer = new ScatterplotLayerClass({
      id: 'convoy-checkpoints',
      data: checkpointData,
      getPosition: getCheckpointPosition,
      getFillColor: getCheckpointFillColor,
      getRadius: getCheckpointRadius,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 140] as [number, number, number, number],
      lineWidthMinPixels: 1,
    });
    updateLayer('convoy-checkpoints', cpLayer);

    const cpLabelLayer = new TextLayerClass({
      id: 'convoy-checkpoint-labels',
      data: checkpointData,
      getPosition: getCheckpointLabelPosition,
      getText: getCheckpointLabelText,
      getColor: [220, 220, 220, 200] as [number, number, number, number],
      getSize: 10,
      getPixelOffset: [0, 14] as [number, number],
      fontFamily: 'monospace',
      fontWeight: 500,
      outlineWidth: 2,
      outlineColor: [0, 0, 0, 180] as [number, number, number, number],
      billboard: true,
    });
    updateLayer('convoy-checkpoint-labels', cpLabelLayer);
  }

  watch(
    [
      () => props.loopedTime,
      () => props.positions,
      () => props.selectedConvoyId,
      () => props.activeCheckpoints,
    ],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    for (const route of props.routes) {
      removeLayer(`convoy-trail-${route.convoyId}`);
    }
    removeLayer('convoy-positions');
    removeLayer('convoy-labels');
    removeLayer('convoy-checkpoints');
    removeLayer('convoy-checkpoint-labels');
  });
</script>

<template>
  <slot></slot>
</template>
