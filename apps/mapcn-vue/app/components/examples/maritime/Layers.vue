<script setup lang="ts">
  import type {
    Ship,
    ShipPosition,
    ShipPositionDatum,
    ShipLabelDatum,
    EezBoundary,
    RadarCircleDatum,
    TripDatum,
  } from '~/types/defense-maritime';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    ships: Ship[];
    positions: Record<string, ShipPosition>;
    eezBoundary: EezBoundary;
    radars: {
      id: string;
      name: string;
      position: [number, number];
      rangeKm: number;
    }[];
    radarCircles: RadarCircleDatum[];
    tripData: TripDatum[];
    loopedTime: number;
  }>();

  let PathLayerClass: typeof import('@deck.gl/layers').PathLayer | null = null;
  let PolygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getEezPath(d: unknown): [number, number][] {
    return (d as { path: [number, number][] }).path;
  }

  function getRadarPolygon(d: unknown): [number, number][] {
    return (d as RadarCircleDatum).polygon;
  }

  function getTripPath(d: unknown): [number, number][] {
    return (d as TripDatum).path;
  }

  function getTripTimestamps(d: unknown): number[] {
    return (d as TripDatum).timestamps;
  }

  function getShipPosition(d: unknown): [number, number] {
    const datum = d as ShipPositionDatum;
    return [datum.lng, datum.lat];
  }

  function getShipFillColor(d: unknown): [number, number, number, number] {
    const datum = d as ShipPositionDatum;
    const ship = props.ships.find((s) => s.id === datum.shipId);
    const c = ship?.color ?? [255, 255, 255];
    return [c[0], c[1], c[2], 220];
  }

  function getShipRadius(d: unknown): number {
    const datum = d as ShipPositionDatum;
    return datum.type === 'suspicious' ? 10 : 7;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as ShipLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as ShipLabelDatum).text;
  }

  function getRadarStationPosition(d: unknown): [number, number] {
    return (d as { position: [number, number] }).position;
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const [geoModule, layersModule] = await Promise.all([
      import('@deck.gl/geo-layers'),
      import('@deck.gl/layers'),
    ]);
    TripsLayerClass = geoModule.TripsLayer;
    PathLayerClass = layersModule.PathLayer;
    PolygonLayerClass = layersModule.PolygonLayer;
    ScatterplotLayerClass = layersModule.ScatterplotLayer;
    TextLayerClass = layersModule.TextLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (
      !PathLayerClass ||
      !PolygonLayerClass ||
      !TripsLayerClass ||
      !ScatterplotLayerClass ||
      !TextLayerClass
    )
      return;

    const eezLayer = new PathLayerClass({
      id: 'maritime-eez',
      data: [{ path: props.eezBoundary.polygon }],
      getPath: getEezPath,
      getColor: [0, 120, 255, 180] as [number, number, number, number],
      widthMinPixels: 2,
      getDashArray: [8, 4],
      dashJustified: true,
      extensions: [],
    });
    updateLayer('maritime-eez', eezLayer);

    const radarLayer = new PolygonLayerClass({
      id: 'maritime-radar-coverage',
      data: props.radarCircles,
      getPolygon: getRadarPolygon,
      getFillColor: [0, 200, 100, 30] as [number, number, number, number],
      getLineColor: [0, 200, 100, 100] as [number, number, number, number],
      lineWidthMinPixels: 1,
      stroked: true,
      filled: true,
    });
    updateLayer('maritime-radar-coverage', radarLayer);

    const radarStationLayer = new ScatterplotLayerClass({
      id: 'maritime-radar-stations',
      data: props.radars,
      getPosition: getRadarStationPosition,
      getFillColor: [0, 200, 100, 200] as [number, number, number, number],
      getRadius: 6,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 180] as [number, number, number, number],
      lineWidthMinPixels: 2,
    });
    updateLayer('maritime-radar-stations', radarStationLayer);

    for (const trip of props.tripData) {
      const ship = props.ships.find((s) => s.id === trip.shipId);
      if (!ship) continue;

      const trailLayer = new TripsLayerClass({
        id: `maritime-trail-${trip.shipId}`,
        data: [trip],
        getPath: getTripPath,
        getTimestamps: getTripTimestamps,
        getColor: ship.color as [number, number, number],
        currentTime: props.loopedTime,
        trailLength: 60,
        fadeTrail: true,
        widthMinPixels: 3,
        capRounded: true,
        jointRounded: true,
        opacity: 0.7,
      });
      updateLayer(`maritime-trail-${trip.shipId}`, trailLayer);
    }

    const positionData: ShipPositionDatum[] = props.ships
      .map((s) => {
        const pos = props.positions[s.id];
        if (!pos) return null;
        return {
          lng: pos.lng,
          lat: pos.lat,
          shipId: s.id,
          type: s.type,
          selected: false,
        };
      })
      .filter((d): d is ShipPositionDatum => d !== null);

    const posLayer = new ScatterplotLayerClass({
      id: 'maritime-positions',
      data: positionData,
      getPosition: getShipPosition,
      getFillColor: getShipFillColor,
      getRadius: getShipRadius,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 180] as [number, number, number, number],
      lineWidthMinPixels: 2,
      pickable: true,
    });
    updateLayer('maritime-positions', posLayer);

    const labelData: ShipLabelDatum[] = positionData.map((d) => ({
      position: [d.lng, d.lat] as [number, number],
      text: props.ships.find((s) => s.id === d.shipId)?.callsign ?? '',
    }));

    const labelLayer = new TextLayerClass({
      id: 'maritime-labels',
      data: labelData,
      getPosition: getLabelPosition,
      getText: getLabelText,
      getColor: [255, 255, 255, 230] as [number, number, number, number],
      getSize: 11,
      getPixelOffset: [0, -18] as [number, number],
      fontFamily: 'monospace',
      fontWeight: 700,
      outlineWidth: 3,
      outlineColor: [0, 0, 0, 200] as [number, number, number, number],
      billboard: true,
    });
    updateLayer('maritime-labels', labelLayer);
  }

  watch(
    [() => props.loopedTime, () => props.positions, () => props.ships],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('maritime-eez');
    removeLayer('maritime-radar-coverage');
    removeLayer('maritime-radar-stations');
    removeLayer('maritime-positions');
    removeLayer('maritime-labels');
    for (const trip of props.tripData) {
      removeLayer(`maritime-trail-${trip.shipId}`);
    }
  });
</script>

<template>
  <slot></slot>
</template>
