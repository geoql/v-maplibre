<script setup lang="ts">
  import type {
    CoveragePolygon,
    SweepLineDatum,
    SiteDatum,
    SiteLabelDatum,
  } from '~/types/defense-air-defense';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    coveragePolygons: CoveragePolygon[];
    sweepLines: SweepLineDatum[];
    siteData: SiteDatum[];
    labelData: SiteLabelDatum[];
    sweepAngle: number;
  }>();

  let PolygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let LineLayerClass: typeof import('@deck.gl/layers').LineLayer | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getCoveragePolygon(d: unknown): [number, number][] {
    return (d as CoveragePolygon).polygon;
  }

  function getCoverageFillColor(d: unknown): [number, number, number, number] {
    return (d as CoveragePolygon).color;
  }

  function getCoverageLineColor(d: unknown): [number, number, number, number] {
    const c = (d as CoveragePolygon).color;
    return [c[0], c[1], c[2], 120];
  }

  function getSitePosition(d: unknown): [number, number] {
    const datum = d as SiteDatum;
    return [datum.lng, datum.lat];
  }

  function getSiteFillColor(d: unknown): [number, number, number, number] {
    const datum = d as SiteDatum;
    return [datum.color[0], datum.color[1], datum.color[2], 240];
  }

  function getSiteRadius(): number {
    return 8;
  }

  function getSweepSourcePosition(d: unknown): [number, number] {
    return (d as SweepLineDatum).sourcePosition;
  }

  function getSweepTargetPosition(d: unknown): [number, number] {
    return (d as SweepLineDatum).targetPosition;
  }

  function getSweepColor(d: unknown): [number, number, number, number] {
    return (d as SweepLineDatum).color;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as SiteLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as SiteLabelDatum).text;
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const layersModule = await import('@deck.gl/layers');
    PolygonLayerClass = layersModule.PolygonLayer;
    ScatterplotLayerClass = layersModule.ScatterplotLayer;
    LineLayerClass = layersModule.LineLayer;
    TextLayerClass = layersModule.TextLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (
      !PolygonLayerClass ||
      !ScatterplotLayerClass ||
      !LineLayerClass ||
      !TextLayerClass
    )
      return;

    updateLayer(
      'air-defense-coverage',
      new PolygonLayerClass({
        id: 'air-defense-coverage',
        data: props.coveragePolygons,
        getPolygon: getCoveragePolygon,
        getFillColor: getCoverageFillColor,
        getLineColor: getCoverageLineColor,
        lineWidthMinPixels: 1,
        filled: true,
        stroked: true,
        pickable: false,
        opacity: 1,
      }),
    );

    updateLayer(
      'air-defense-sweep',
      new LineLayerClass({
        id: 'air-defense-sweep',
        data: props.sweepLines,
        getSourcePosition: getSweepSourcePosition,
        getTargetPosition: getSweepTargetPosition,
        getColor: getSweepColor,
        getWidth: 2,
        widthUnits: 'pixels' as const,
        pickable: false,
        updateTriggers: {
          getSourcePosition: [props.sweepAngle],
          getTargetPosition: [props.sweepAngle],
        },
      }),
    );

    updateLayer(
      'air-defense-sites',
      new ScatterplotLayerClass({
        id: 'air-defense-sites',
        data: props.siteData,
        getPosition: getSitePosition,
        getFillColor: getSiteFillColor,
        getRadius: getSiteRadius,
        radiusUnits: 'pixels' as const,
        stroked: true,
        getLineColor: [255, 255, 255, 200] as [number, number, number, number],
        lineWidthMinPixels: 2,
        pickable: false,
      }),
    );

    updateLayer(
      'air-defense-labels',
      new TextLayerClass({
        id: 'air-defense-labels',
        data: props.labelData,
        getPosition: getLabelPosition,
        getText: getLabelText,
        getColor: [255, 255, 255, 230] as [number, number, number, number],
        getSize: 12,
        getPixelOffset: [0, -18] as [number, number],
        fontFamily: 'monospace',
        fontWeight: 700,
        outlineWidth: 3,
        outlineColor: [0, 0, 0, 200] as [number, number, number, number],
        billboard: true,
      }),
    );
  }

  watch(
    [
      () => props.coveragePolygons,
      () => props.sweepLines,
      () => props.siteData,
      () => props.labelData,
      () => props.sweepAngle,
    ],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('air-defense-coverage');
    removeLayer('air-defense-sweep');
    removeLayer('air-defense-sites');
    removeLayer('air-defense-labels');
  });
</script>

<template>
  <slot />
</template>
