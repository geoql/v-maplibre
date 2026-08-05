<script setup lang="ts">
  import type {
    ArtilleryPosition,
    RangeFanPolygon,
    ArtilleryPositionDatum,
    ArtilleryLabelDatum,
  } from '~/types/defense-artillery';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    positions: ArtilleryPosition[];
    rangeFans: RangeFanPolygon[];
    selectedPositionId: string | null;
  }>();

  let PolygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getFanPolygon(d: unknown): [number, number][] {
    return (d as RangeFanPolygon).polygon;
  }

  function getFanFillColor(d: unknown): [number, number, number, number] {
    return (d as RangeFanPolygon).color;
  }

  function getFanLineColor(d: unknown): [number, number, number, number] {
    const c = (d as RangeFanPolygon).color;
    return [c[0], c[1], c[2], 180];
  }

  function getPositionFromDatum(d: unknown): [number, number] {
    const datum = d as ArtilleryPositionDatum;
    return [datum.lng, datum.lat];
  }

  function getPositionFillColor(d: unknown): [number, number, number, number] {
    const datum = d as ArtilleryPositionDatum;
    return [datum.color[0], datum.color[1], datum.color[2], 220];
  }

  function getPositionRadius(d: unknown): number {
    return (d as ArtilleryPositionDatum).selected ? 12 : 8;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as ArtilleryLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as ArtilleryLabelDatum).text;
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

  function buildPositionData(): ArtilleryPositionDatum[] {
    return props.positions.map((pos) => {
      const configs: Record<string, [number, number, number]> = {
        howitzer: [255, 100, 0],
        mortar: [0, 200, 255],
        mlrs: [255, 60, 60],
      };
      return {
        lng: pos.position[0],
        lat: pos.position[1],
        positionId: pos.id,
        color: configs[pos.weaponType] ?? [255, 255, 255],
        selected: pos.id === props.selectedPositionId,
      };
    });
  }

  function syncLayers(): void {
    if (!PolygonLayerClass || !ScatterplotLayerClass || !TextLayerClass) return;

    const fanLayer = new PolygonLayerClass({
      id: 'artillery-fans',
      data: props.rangeFans,
      getPolygon: getFanPolygon,
      getFillColor: getFanFillColor,
      getLineColor: getFanLineColor,
      lineWidthMinPixels: 2,
      filled: true,
      stroked: true,
      pickable: false,
      opacity: 1,
    });
    updateLayer('artillery-fans', fanLayer);

    const positionData = buildPositionData();

    const posLayer = new ScatterplotLayerClass({
      id: 'artillery-positions',
      data: positionData,
      getPosition: getPositionFromDatum,
      getFillColor: getPositionFillColor,
      getRadius: getPositionRadius,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 200] as [number, number, number, number],
      lineWidthMinPixels: 2,
      pickable: true,
    });
    updateLayer('artillery-positions', posLayer);

    const labelData: ArtilleryLabelDatum[] = props.positions.map((pos) => ({
      position: pos.position,
      text: pos.label,
    }));

    const labelLayer = new TextLayerClass({
      id: 'artillery-labels',
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
    updateLayer('artillery-labels', labelLayer);
  }

  watch(
    [
      () => props.rangeFans,
      () => props.positions,
      () => props.selectedPositionId,
    ],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('artillery-fans');
    removeLayer('artillery-positions');
    removeLayer('artillery-labels');
  });
</script>

<template>
  <slot></slot>
</template>
