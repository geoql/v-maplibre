<script setup lang="ts">
  import type {
    BattlefieldPath,
    BattlefieldPosition,
    BattlefieldUnit,
  } from '~/types/defense-terrain';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    paths: BattlefieldPath[];
    currentTime: number;
    positions: BattlefieldPosition[];
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

  function getPath(d: unknown): [number, number][] {
    return (d as BattlefieldPath).path;
  }

  function getTimestamps(d: unknown): number[] {
    return (d as BattlefieldPath).timestamps;
  }

  function getPathColor(d: unknown): [number, number, number] {
    const unitId = (d as BattlefieldPath).unitId;
    return UNITS_MAP[unitId]?.color ?? [255, 255, 255];
  }

  function getPositionCoords(d: unknown): [number, number] {
    const pos = d as BattlefieldPosition;
    return [pos.lng, pos.lat];
  }

  function getPositionColor(d: unknown): [number, number, number] {
    const pos = d as BattlefieldPosition;
    return UNITS_MAP[pos.unitId]?.color ?? [255, 255, 255];
  }

  function getCallsign(d: unknown): string {
    const pos = d as BattlefieldPosition;
    return UNITS_MAP[pos.unitId]?.callsign ?? '';
  }

  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

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

  const ALL_UNIT_IDS = [
    'alpha',
    'bravo',
    'charlie',
    'delta',
    'echo',
    'foxtrot',
  ];

  function syncLayers(): void {
    if (!TripsLayerClass || !ScatterplotLayerClass || !TextLayerClass) return;

    const activeIds = new Set(props.paths.map((p) => p.unitId));
    for (const uid of ALL_UNIT_IDS) {
      if (!activeIds.has(uid)) {
        removeLayer(`trail-${uid}`);
      }
    }

    for (const pathData of props.paths) {
      const unit = UNITS_MAP[pathData.unitId];
      if (!unit) continue;

      const trail = new TripsLayerClass({
        id: `trail-${pathData.unitId}`,
        data: [pathData],
        getPath,
        getTimestamps,
        getColor: getPathColor,
        currentTime: props.currentTime,
        trailLength: 60,
        fadeTrail: true,
        widthMinPixels: 4,
        capRounded: true,
        jointRounded: true,
        opacity: 0.85,
      });
      updateLayer(`trail-${pathData.unitId}`, trail);
    }

    const scatter = new ScatterplotLayerClass({
      id: 'unit-positions',
      data: props.positions,
      getPosition: getPositionCoords,
      getFillColor: getPositionColor,
      getRadius: 200,
      radiusMinPixels: 6,
      radiusMaxPixels: 20,
      opacity: 0.9,
      stroked: true,
      getLineColor: [255, 255, 255] as [number, number, number],
      lineWidthMinPixels: 2,
    });
    updateLayer('unit-positions', scatter);

    const labels = new TextLayerClass({
      id: 'unit-labels',
      data: props.positions,
      getPosition: getPositionCoords,
      getText: getCallsign,
      getSize: 14,
      getColor: [255, 255, 255, 230] as [number, number, number, number],
      getAngle: 0,
      getTextAnchor: 'start' as const,
      getAlignmentBaseline: 'center' as const,
      getPixelOffset: [12, 0] as [number, number],
      fontFamily: 'monospace',
      billboard: true,
      outlineWidth: 3,
      outlineColor: [0, 0, 0, 200] as [number, number, number, number],
    });
    updateLayer('unit-labels', labels);
  }

  watch(
    [() => props.paths, () => props.currentTime, () => props.positions],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    for (const p of props.paths) {
      removeLayer(`trail-${p.unitId}`);
    }
    removeLayer('unit-positions');
    removeLayer('unit-labels');
  });
</script>

<template>
  <slot></slot>
</template>
