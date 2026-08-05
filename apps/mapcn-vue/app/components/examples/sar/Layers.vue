<script setup lang="ts">
  import type {
    SarSector,
    SarHelicopter,
    SarHelicopterPosition,
    SarTripDatum,
    SarSectorDatum,
    SarLabelDatum,
    SarPositionDatum,
  } from '~/types/defense-sar';
  import type { PickingInfo } from '@deck.gl/core';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    sectors: SarSector[];
    helicopters: SarHelicopter[];
    positions: Record<string, SarHelicopterPosition>;
    tripData: SarTripDatum[];
    loopedTime: number;
  }>();

  const emit = defineEmits<{
    sectorClick: [sectorId: string];
  }>();

  let PolygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getSectorColor(sector: SarSector): [number, number, number, number] {
    if (sector.status === 'searched') return [120, 120, 120, 100];
    const p = sector.probability;
    if (p > 0.65) return [220, 40, 40, 160];
    if (p > 0.35) return [240, 200, 0, 140];
    return [40, 180, 60, 120];
  }

  function getSectorLineColor(
    sector: SarSector,
  ): [number, number, number, number] {
    if (sector.status === 'searched') return [160, 160, 160, 180];
    return [255, 255, 255, 200];
  }

  function getPolygon(d: unknown): [number, number][] {
    return (d as SarSectorDatum).polygon;
  }

  function getPolygonFillColor(d: unknown): [number, number, number, number] {
    return (d as SarSectorDatum).fillColor;
  }

  function getPolygonLineColor(d: unknown): [number, number, number, number] {
    return (d as SarSectorDatum).lineColor;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as SarLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as SarLabelDatum).text;
  }

  function getLabelColor(d: unknown): [number, number, number, number] {
    return (d as SarLabelDatum).color;
  }

  function getHeloPosition(d: unknown): [number, number] {
    const datum = d as SarPositionDatum;
    return [datum.lng, datum.lat];
  }

  function getHeloFillColor(d: unknown): [number, number, number, number] {
    const datum = d as SarPositionDatum;
    const helo = props.helicopters.find((h) => h.id === datum.helicopterId);
    const c = helo?.color ?? [255, 255, 255];
    return [c[0], c[1], c[2], 240];
  }

  function getTripPath(d: unknown): [number, number][] {
    return (d as SarTripDatum).path;
  }

  function getTripTimestamps(d: unknown): number[] {
    return (d as SarTripDatum).timestamps;
  }

  function getTripColor(d: unknown): [number, number, number] {
    const datum = d as SarTripDatum;
    const helo = props.helicopters.find((h) => h.id === datum.helicopterId);
    return helo?.color ?? [255, 255, 255];
  }

  function handleSectorClick(info: PickingInfo): void {
    const datum = info.object as SarSectorDatum | undefined;
    if (datum?.sectorId) {
      emit('sectorClick', datum.sectorId);
    }
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const [layersModule, geoModule] = await Promise.all([
      import('@deck.gl/layers'),
      import('@deck.gl/geo-layers'),
    ]);
    PolygonLayerClass = layersModule.PolygonLayer;
    ScatterplotLayerClass = layersModule.ScatterplotLayer;
    TextLayerClass = layersModule.TextLayer;
    TripsLayerClass = geoModule.TripsLayer;
    initialized = true;
    syncLayers();
  }

  function sectorCenter(sector: SarSector): [number, number] {
    const b0 = sector.bounds[0]!;
    const b2 = sector.bounds[2]!;
    return [(b0[0] + b2[0]) / 2, (b0[1] + b2[1]) / 2];
  }

  function syncLayers(): void {
    if (
      !PolygonLayerClass ||
      !ScatterplotLayerClass ||
      !TextLayerClass ||
      !TripsLayerClass
    )
      return;

    const sectorData: SarSectorDatum[] = props.sectors.map((s) => ({
      polygon: s.bounds,
      fillColor: getSectorColor(s),
      lineColor: getSectorLineColor(s),
      sectorId: s.id,
    }));

    const polygonLayer = new PolygonLayerClass({
      id: 'sar-sectors',
      data: sectorData,
      getPolygon,
      getFillColor: getPolygonFillColor,
      getLineColor: getPolygonLineColor,
      getLineWidth: 2,
      lineWidthUnits: 'pixels' as const,
      filled: true,
      stroked: true,
      pickable: true,
      onClick: handleSectorClick,
      opacity: 0.8,
    });
    updateLayer('sar-sectors', polygonLayer);

    const labelData: SarLabelDatum[] = props.sectors.map((s) => ({
      position: sectorCenter(s),
      text: s.label,
      color:
        s.status === 'searched'
          ? ([180, 180, 180, 180] as [number, number, number, number])
          : ([255, 255, 255, 230] as [number, number, number, number]),
    }));

    const labelLayer = new TextLayerClass({
      id: 'sar-labels',
      data: labelData,
      getPosition: getLabelPosition,
      getText: getLabelText,
      getColor: getLabelColor,
      getSize: 13,
      fontFamily: 'monospace',
      fontWeight: 700,
      outlineWidth: 3,
      outlineColor: [0, 0, 0, 200] as [number, number, number, number],
      billboard: true,
    });
    updateLayer('sar-labels', labelLayer);

    for (const trip of props.tripData) {
      const trailLayer = new TripsLayerClass({
        id: `sar-trail-${trip.helicopterId}`,
        data: [trip],
        getPath: getTripPath,
        getTimestamps: getTripTimestamps,
        getColor: getTripColor,
        currentTime: props.loopedTime,
        trailLength: 60,
        fadeTrail: true,
        widthMinPixels: 4,
        capRounded: true,
        jointRounded: true,
        opacity: 0.8,
      });
      updateLayer(`sar-trail-${trip.helicopterId}`, trailLayer);
    }

    const heloData: SarPositionDatum[] = props.helicopters
      .map((h) => {
        const pos = props.positions[h.id];
        if (!pos) return null;
        return { lng: pos.lng, lat: pos.lat, helicopterId: h.id };
      })
      .filter((d): d is SarPositionDatum => d !== null);

    const heloLayer = new ScatterplotLayerClass({
      id: 'sar-helicopters',
      data: heloData,
      getPosition: getHeloPosition,
      getFillColor: getHeloFillColor,
      getRadius: 10,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 200] as [number, number, number, number],
      lineWidthMinPixels: 2,
    });
    updateLayer('sar-helicopters', heloLayer);

    const heloLabelData: SarLabelDatum[] = heloData.map((d) => {
      const helo = props.helicopters.find((h) => h.id === d.helicopterId);
      return {
        position: [d.lng, d.lat] as [number, number],
        text: helo?.callsign ?? '',
        color: [255, 255, 255, 230] as [number, number, number, number],
      };
    });

    const heloLabelLayer = new TextLayerClass({
      id: 'sar-helo-labels',
      data: heloLabelData,
      getPosition: getLabelPosition,
      getText: getLabelText,
      getColor: getLabelColor,
      getSize: 11,
      getPixelOffset: [0, -18] as [number, number],
      fontFamily: 'monospace',
      fontWeight: 700,
      outlineWidth: 2,
      outlineColor: [0, 0, 0, 180] as [number, number, number, number],
      billboard: true,
    });
    updateLayer('sar-helo-labels', heloLabelLayer);
  }

  watch(
    [
      () => props.sectors,
      () => props.positions,
      () => props.loopedTime,
      () => props.tripData,
    ],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('sar-sectors');
    removeLayer('sar-labels');
    removeLayer('sar-helicopters');
    removeLayer('sar-helo-labels');
    for (const trip of props.tripData) {
      removeLayer(`sar-trail-${trip.helicopterId}`);
    }
  });
</script>

<template>
  <slot></slot>
</template>
