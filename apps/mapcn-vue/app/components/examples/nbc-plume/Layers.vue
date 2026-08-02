<script setup lang="ts">
  import type {
    HazardSource,
    PlumeZone,
    PlumeZoneDatum,
    PlumeLabelDatum,
    SourcePointDatum,
  } from '~/types/defense-nbc';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    source: HazardSource | null;
    plumeZones: PlumeZone[];
  }>();

  let PolygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getZonePolygon(d: unknown): [number, number][] {
    return (d as PlumeZoneDatum).polygon;
  }

  function getZoneFillColor(d: unknown): [number, number, number, number] {
    return (d as PlumeZoneDatum).color;
  }

  function getZoneLineColor(d: unknown): [number, number, number, number] {
    const c = (d as PlumeZoneDatum).color;
    return [c[0], c[1], c[2], 200];
  }

  function getSourcePosition(d: unknown): [number, number] {
    return (d as SourcePointDatum).position;
  }

  function getSourceColor(d: unknown): [number, number, number] {
    return (d as SourcePointDatum).color;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as PlumeLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as PlumeLabelDatum).text;
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const layersModule = await import('@deck.gl/layers');
    PolygonLayerClass = layersModule.PolygonLayer;
    ScatterplotLayerClass = layersModule.ScatterplotLayer;
    TextLayerClass = layersModule.TextLayer;
    initialized = true;
    syncLayers();
  }

  function buildZoneData(): PlumeZoneDatum[] {
    return props.plumeZones.map((zone) => ({
      polygon: zone.polygon,
      color: zone.color,
    }));
  }

  function buildLabelData(): PlumeLabelDatum[] {
    return props.plumeZones.map((zone) => {
      const poly = zone.polygon;
      const midIdx = Math.floor(poly.length / 2);
      const midPoint = poly[midIdx] ?? poly[0]!;
      return {
        position: midPoint,
        text: zone.label,
      };
    });
  }

  function buildSourceData(): SourcePointDatum[] {
    if (!props.source) return [];
    return [
      {
        position: props.source.position,
        color: [220, 38, 38] as [number, number, number],
      },
    ];
  }

  function syncLayers(): void {
    if (!PolygonLayerClass || !ScatterplotLayerClass || !TextLayerClass) return;

    const zoneLayer = new PolygonLayerClass({
      id: 'nbc-plume-zones',
      data: buildZoneData(),
      getPolygon: getZonePolygon,
      getFillColor: getZoneFillColor,
      getLineColor: getZoneLineColor,
      lineWidthMinPixels: 2,
      filled: true,
      stroked: true,
      pickable: false,
      opacity: 1,
    });
    updateLayer('nbc-plume-zones', zoneLayer);

    const sourceLayer = new ScatterplotLayerClass({
      id: 'nbc-source-point',
      data: buildSourceData(),
      getPosition: getSourcePosition,
      getFillColor: getSourceColor,
      getRadius: 10,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 230] as [number, number, number, number],
      lineWidthMinPixels: 3,
      pickable: false,
    });
    updateLayer('nbc-source-point', sourceLayer);

    const labelLayer = new TextLayerClass({
      id: 'nbc-zone-labels',
      data: buildLabelData(),
      getPosition: getLabelPosition,
      getText: getLabelText,
      getColor: [255, 255, 255, 230] as [number, number, number, number],
      getSize: 11,
      getPixelOffset: [0, 0] as [number, number],
      fontFamily: 'monospace',
      fontWeight: 700,
      outlineWidth: 3,
      outlineColor: [0, 0, 0, 200] as [number, number, number, number],
      billboard: true,
    });
    updateLayer('nbc-zone-labels', labelLayer);
  }

  watch([() => props.plumeZones, () => props.source], () => syncLayers(), {
    deep: true,
  });

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('nbc-plume-zones');
    removeLayer('nbc-source-point');
    removeLayer('nbc-zone-labels');
  });
</script>

<template>
  <slot></slot>
</template>
