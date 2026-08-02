<script setup lang="ts">
  import type {
    Observer,
    ViewshedPolygon,
    ObserverDatum,
    ObserverLabelDatum,
  } from '~/types/defense-viewshed';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    observers: Observer[];
    viewshedPolygons: ViewshedPolygon[];
  }>();

  let PolygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getViewshedPolygon(d: unknown): [number, number][] {
    return (d as ViewshedPolygon).polygon;
  }

  function getViewshedFillColor(_d: unknown): [number, number, number, number] {
    return [0, 200, 100, 60];
  }

  function getViewshedLineColor(_d: unknown): [number, number, number, number] {
    return [0, 200, 100, 140];
  }

  function getObserverPosition(d: unknown): [number, number] {
    const datum = d as ObserverDatum;
    return [datum.lng, datum.lat];
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as ObserverLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as ObserverLabelDatum).text;
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

  function buildObserverData(): ObserverDatum[] {
    return props.observers.map((obs) => ({
      lng: obs.position[0],
      lat: obs.position[1],
      observerId: obs.id,
    }));
  }

  function syncLayers(): void {
    if (!PolygonLayerClass || !ScatterplotLayerClass || !TextLayerClass) return;

    const viewshedLayer = new PolygonLayerClass({
      id: 'viewshed-areas',
      data: props.viewshedPolygons,
      getPolygon: getViewshedPolygon,
      getFillColor: getViewshedFillColor,
      getLineColor: getViewshedLineColor,
      lineWidthMinPixels: 2,
      filled: true,
      stroked: true,
      pickable: false,
      opacity: 1,
    });
    updateLayer('viewshed-areas', viewshedLayer);

    const observerData = buildObserverData();

    const observerLayer = new ScatterplotLayerClass({
      id: 'viewshed-observers',
      data: observerData,
      getPosition: getObserverPosition,
      getFillColor: [255, 220, 50, 230] as [number, number, number, number],
      getRadius: 10,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [0, 0, 0, 200] as [number, number, number, number],
      lineWidthMinPixels: 2,
      pickable: true,
    });
    updateLayer('viewshed-observers', observerLayer);

    const labelData: ObserverLabelDatum[] = props.observers.map((obs) => ({
      position: obs.position,
      text: `${obs.label} (${obs.heightM}m)`,
    }));

    const labelLayer = new TextLayerClass({
      id: 'viewshed-labels',
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
    updateLayer('viewshed-labels', labelLayer);
  }

  watch(
    [() => props.viewshedPolygons, () => props.observers],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('viewshed-areas');
    removeLayer('viewshed-observers');
    removeLayer('viewshed-labels');
  });
</script>

<template>
  <slot></slot>
</template>
