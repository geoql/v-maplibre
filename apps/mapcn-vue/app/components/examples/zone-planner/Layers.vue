<script setup lang="ts">
  import type {
    DangerZone,
    ZonePolygonDatum,
    ZoneLabelDatum,
    ZoneCenterDatum,
  } from '~/types/defense-zone-planner';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    zones: DangerZone[];
  }>();

  const OUTLINE_COLORS: Record<string, [number, number, number]> = {
    minefield: [255, 60, 60],
    restricted: [255, 165, 0],
    hazard: [255, 200, 0],
  };

  const { polygonCentroid } = useZonePlanner();

  let polygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let scatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let textLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getPolygon(d: unknown): [number, number][] {
    return (d as ZonePolygonDatum).polygon;
  }

  function getFillColor(d: unknown): [number, number, number, number] {
    return (d as ZonePolygonDatum).color;
  }

  function getLineColor(d: unknown): [number, number, number] {
    return (d as ZonePolygonDatum).outlineColor;
  }

  function getCenterPosition(d: unknown): [number, number] {
    return (d as ZoneCenterDatum).position;
  }

  function getCenterColor(d: unknown): [number, number, number] {
    return (d as ZoneCenterDatum).color;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as ZoneLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as ZoneLabelDatum).text;
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const layersModule = await import('@deck.gl/layers');
    polygonLayerClass = layersModule.PolygonLayer;
    scatterplotLayerClass = layersModule.ScatterplotLayer;
    textLayerClass = layersModule.TextLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (!polygonLayerClass || !scatterplotLayerClass || !textLayerClass) return;

    const polygonData: ZonePolygonDatum[] = props.zones.map((z) => ({
      polygon: z.polygon,
      color: z.color,
      outlineColor: OUTLINE_COLORS[z.type] ?? [255, 255, 255],
    }));

    const polyLayer = new polygonLayerClass({
      id: 'zone-polygons',
      data: polygonData,
      getPolygon,
      getFillColor,
      getLineColor,
      getLineWidth: 2,
      lineWidthUnits: 'pixels' as const,
      stroked: true,
      filled: true,
      pickable: false,
    });
    updateLayer('zone-polygons', polyLayer);

    const centerData: ZoneCenterDatum[] = props.zones.map((z) => ({
      position: polygonCentroid(z.polygon),
      color: OUTLINE_COLORS[z.type] ?? [255, 255, 255],
    }));

    const centerLayer = new scatterplotLayerClass({
      id: 'zone-centers',
      data: centerData,
      getPosition: getCenterPosition,
      getFillColor: getCenterColor,
      getRadius: 5,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 180] as [number, number, number, number],
      lineWidthMinPixels: 1,
    });
    updateLayer('zone-centers', centerLayer);

    const labelData: ZoneLabelDatum[] = props.zones.map((z) => ({
      position: polygonCentroid(z.polygon),
      text: z.label,
    }));

    const labelLayer = new textLayerClass({
      id: 'zone-labels',
      data: labelData,
      getPosition: getLabelPosition,
      getText: getLabelText,
      getColor: [255, 255, 255, 230] as [number, number, number, number],
      getSize: 13,
      getPixelOffset: [0, -16] as [number, number],
      fontFamily: 'monospace',
      fontWeight: 700,
      outlineWidth: 3,
      outlineColor: [0, 0, 0, 200] as [number, number, number, number],
      billboard: true,
    });
    updateLayer('zone-labels', labelLayer);
  }

  watch(
    () => props.zones,
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('zone-polygons');
    removeLayer('zone-centers');
    removeLayer('zone-labels');
  });
</script>

<template>
  <slot></slot>
</template>
