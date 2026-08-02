<script setup lang="ts">
  import type {
    Sensor,
    ThreatEvent,
    CoverageZone,
  } from '~/types/defense-sensor';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    sensors: Sensor[];
    threats: ThreatEvent[];
    coverageZones: CoverageZone[];
    radiusMultiplier: number;
    pulseTime: number;
  }>();

  const emit = defineEmits<{
    threatClick: [threat: ThreatEvent];
  }>();

  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let PolygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getSensorPosition(d: unknown): [number, number] {
    return (d as Sensor).position;
  }

  function getSensorRadius(d: unknown): number {
    const s = d as Sensor;
    const pulse = 1 + 0.15 * Math.sin(props.pulseTime * 2);
    return s.detectionRadius * 1000 * props.radiusMultiplier * pulse;
  }

  function getSensorFillColor(d: unknown): [number, number, number, number] {
    const s = d as Sensor;
    return [s.color[0], s.color[1], s.color[2], 40];
  }

  function getSensorLineColor(d: unknown): [number, number, number, number] {
    const s = d as Sensor;
    return [s.color[0], s.color[1], s.color[2], 120];
  }

  function getSensorDotColor(d: unknown): [number, number, number, number] {
    const s = d as Sensor;
    if (s.status === 'alert') return [255, 200, 0, 255];
    if (s.status === 'maintenance') return [120, 120, 120, 255];
    return [s.color[0], s.color[1], s.color[2], 255];
  }

  function getSensorLabel(d: unknown): string {
    return (d as Sensor).id;
  }

  function getThreatPosition(d: unknown): [number, number] {
    return (d as ThreatEvent).position;
  }

  function getThreatColor(d: unknown): [number, number, number, number] {
    const t = d as ThreatEvent;
    const age = (Date.now() - t.timestamp) / 1000;
    const opacity = Math.max(60, 255 - age * 8);
    if (t.level === 'critical') return [255, 0, 0, opacity];
    if (t.level === 'high') return [255, 100, 0, opacity];
    if (t.level === 'medium') return [255, 180, 0, opacity];
    return [255, 220, 100, opacity];
  }

  function getZonePolygon(d: unknown): [number, number][] {
    return (d as CoverageZone).polygon;
  }

  function getZoneFillColor(d: unknown): [number, number, number, number] {
    return (d as CoverageZone).color;
  }

  function getZoneLineColor(d: unknown): [number, number, number, number] {
    const z = d as CoverageZone;
    return [z.color[0], z.color[1], z.color[2], 140];
  }

  function handleThreatClick(info: Record<string, unknown>): void {
    const threat = info.object as ThreatEvent | undefined;
    if (threat) {
      emit('threatClick', threat);
    }
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const layersModule = await import('@deck.gl/layers');
    ScatterplotLayerClass = layersModule.ScatterplotLayer;
    PolygonLayerClass = layersModule.PolygonLayer;
    TextLayerClass = layersModule.TextLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (!ScatterplotLayerClass || !PolygonLayerClass || !TextLayerClass) return;

    updateLayer(
      'sensor-zones',
      new PolygonLayerClass({
        id: 'sensor-zones',
        data: props.coverageZones,
        getPolygon: getZonePolygon,
        getFillColor: getZoneFillColor,
        getLineColor: getZoneLineColor,
        getLineWidth: 2,
        lineWidthUnits: 'pixels' as const,
        filled: true,
        stroked: true,
        pickable: false,
      }),
    );

    updateLayer(
      'sensor-detection',
      new ScatterplotLayerClass({
        id: 'sensor-detection',
        data: props.sensors,
        getPosition: getSensorPosition,
        getRadius: getSensorRadius,
        getFillColor: getSensorFillColor,
        getLineColor: getSensorLineColor,
        lineWidthMinPixels: 1,
        stroked: true,
        filled: true,
        radiusUnits: 'meters' as const,
        pickable: false,
        updateTriggers: {
          getRadius: [props.radiusMultiplier, props.pulseTime],
        },
      }),
    );

    updateLayer(
      'sensor-dots',
      new ScatterplotLayerClass({
        id: 'sensor-dots',
        data: props.sensors,
        getPosition: getSensorPosition,
        getRadius: 6,
        getFillColor: getSensorDotColor,
        radiusUnits: 'pixels' as const,
        filled: true,
        stroked: true,
        getLineColor: [255, 255, 255, 200] as [number, number, number, number],
        lineWidthMinPixels: 1,
        pickable: false,
      }),
    );

    updateLayer(
      'sensor-labels',
      new TextLayerClass({
        id: 'sensor-labels',
        data: props.sensors,
        getPosition: getSensorPosition,
        getText: getSensorLabel,
        getSize: 12,
        getColor: [30, 30, 30, 240] as [number, number, number, number],
        getTextAnchor: 'middle' as const,
        getAlignmentBaseline: 'top' as const,
        getPixelOffset: [0, 12] as [number, number],
        fontFamily: 'monospace',
        fontWeight: 'bold',
        outlineWidth: 2,
        outlineColor: [255, 255, 255, 220] as [number, number, number, number],
        pickable: false,
      }),
    );

    updateLayer(
      'sensor-threats',
      new ScatterplotLayerClass({
        id: 'sensor-threats',
        data: props.threats,
        getPosition: getThreatPosition,
        getRadius: 500,
        getFillColor: getThreatColor,
        radiusUnits: 'meters' as const,
        filled: true,
        stroked: true,
        getLineColor: [255, 80, 80, 200] as [number, number, number, number],
        lineWidthMinPixels: 2,
        pickable: true,
        onClick: handleThreatClick,
      }),
    );
  }

  watch(
    [
      () => props.sensors,
      () => props.threats,
      () => props.coverageZones,
      () => props.radiusMultiplier,
      () => props.pulseTime,
    ],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('sensor-zones');
    removeLayer('sensor-detection');
    removeLayer('sensor-dots');
    removeLayer('sensor-labels');
    removeLayer('sensor-threats');
  });
</script>

<template>
  <slot />
</template>
