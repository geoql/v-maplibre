<script setup lang="ts">
  import type {
    TroopWaypoint,
    TroopWaypointDatum,
    TroopLabelDatum,
  } from '~/types/defense-troop-nav';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    waypoints: TroopWaypoint[];
    routeCoords: [number, number][];
  }>();

  let PathLayerClass: typeof import('@deck.gl/layers').PathLayer | null = null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getRoutePath(d: unknown): [number, number][] {
    return (d as { path: [number, number][] }).path;
  }

  function getWaypointPosition(d: unknown): [number, number] {
    return (d as TroopWaypointDatum).position;
  }

  function getWaypointRadius(d: unknown): number {
    return (d as TroopWaypointDatum).index === 0 ? 10 : 7;
  }

  function getLabelPosition(d: unknown): [number, number] {
    return (d as TroopLabelDatum).position;
  }

  function getLabelText(d: unknown): string {
    return (d as TroopLabelDatum).text;
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const layersModule = await import('@deck.gl/layers');
    PathLayerClass = layersModule.PathLayer;
    ScatterplotLayerClass = layersModule.ScatterplotLayer;
    TextLayerClass = layersModule.TextLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (!PathLayerClass || !ScatterplotLayerClass || !TextLayerClass) return;

    if (props.routeCoords.length > 1) {
      const pathLayer = new PathLayerClass({
        id: 'troop-route',
        data: [{ path: props.routeCoords }],
        getPath: getRoutePath,
        getColor: [0, 200, 100, 200] as [number, number, number, number],
        getWidth: 4,
        widthUnits: 'pixels' as const,
        capRounded: true,
        jointRounded: true,
      });
      updateLayer('troop-route', pathLayer);
    } else {
      removeLayer('troop-route');
    }

    const wpData: TroopWaypointDatum[] = props.waypoints.map((wp, i) => ({
      position: wp.position,
      label: wp.label,
      index: i,
    }));

    const wpLayer = new ScatterplotLayerClass({
      id: 'troop-waypoints',
      data: wpData,
      getPosition: getWaypointPosition,
      getFillColor: [30, 100, 220, 220] as [number, number, number, number],
      getRadius: getWaypointRadius,
      radiusUnits: 'pixels' as const,
      stroked: true,
      getLineColor: [255, 255, 255, 200] as [number, number, number, number],
      lineWidthMinPixels: 2,
    });
    updateLayer('troop-waypoints', wpLayer);

    const labelData: TroopLabelDatum[] = wpData.map((d) => ({
      position: d.position,
      text: d.label,
    }));

    const labelLayer = new TextLayerClass({
      id: 'troop-labels',
      data: labelData,
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
    });
    updateLayer('troop-labels', labelLayer);
  }

  watch([() => props.routeCoords, () => props.waypoints], () => syncLayers(), {
    deep: true,
  });

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('troop-route');
    removeLayer('troop-waypoints');
    removeLayer('troop-labels');
  });
</script>

<template>
  <slot></slot>
</template>
