<script setup lang="ts">
  import type { CommNode, CommLink } from '~/types/defense-comms';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    nodes: CommNode[];
    links: CommLink[];
  }>();

  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let LineLayerClass: typeof import('@deck.gl/layers').LineLayer | null = null;
  let TextLayerClass: typeof import('@deck.gl/layers').TextLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getNodePosition(d: unknown): [number, number] {
    return (d as CommNode).position;
  }

  function getCoverageRadius(d: unknown): number {
    return (d as CommNode).range * 1000;
  }

  function getCoverageFill(d: unknown): [number, number, number, number] {
    const n = d as CommNode;
    return [n.color[0], n.color[1], n.color[2], 30];
  }

  function getCoverageStroke(d: unknown): [number, number, number, number] {
    const n = d as CommNode;
    return [n.color[0], n.color[1], n.color[2], 80];
  }

  function getDotRadius(d: unknown): number {
    const n = d as CommNode;
    if (n.type === 'hq') return 10;
    if (n.type === 'relay') return 7;
    return 5;
  }

  function getDotColor(d: unknown): [number, number, number, number] {
    const n = d as CommNode;
    return [n.color[0], n.color[1], n.color[2], 255];
  }

  function getNodeLabel(d: unknown): string {
    return (d as CommNode).label;
  }

  interface LinkWithCoords {
    link: CommLink;
    sourcePos: [number, number];
    targetPos: [number, number];
  }

  function getLinkSourcePos(d: unknown): [number, number] {
    return (d as LinkWithCoords).sourcePos;
  }

  function getLinkTargetPos(d: unknown): [number, number] {
    return (d as LinkWithCoords).targetPos;
  }

  function getLinkColor(d: unknown): [number, number, number, number] {
    const lc = d as LinkWithCoords;
    switch (lc.link.status) {
      case 'strong':
        return [0, 200, 100, 200];
      case 'degraded':
        return [255, 200, 0, 180];
      case 'weak':
        return [255, 130, 0, 160];
      case 'down':
        return [255, 50, 50, 80];
    }
  }

  function getLinkWidth(d: unknown): number {
    const lc = d as LinkWithCoords;
    switch (lc.link.status) {
      case 'strong':
        return 3;
      case 'degraded':
        return 2;
      case 'weak':
        return 1.5;
      case 'down':
        return 1;
    }
  }

  function buildLinkData(): LinkWithCoords[] {
    const nodeMap = new Map(props.nodes.map((n) => [n.id, n.position]));
    return props.links
      .filter((l) => nodeMap.has(l.source) && nodeMap.has(l.target))
      .map((l) => ({
        link: l,
        sourcePos: nodeMap.get(l.source)!,
        targetPos: nodeMap.get(l.target)!,
      }));
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const mod = await import('@deck.gl/layers');
    ScatterplotLayerClass = mod.ScatterplotLayer;
    LineLayerClass = mod.LineLayer;
    TextLayerClass = mod.TextLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (!ScatterplotLayerClass || !LineLayerClass || !TextLayerClass) return;

    const linkData = buildLinkData();

    updateLayer(
      'comms-coverage',
      new ScatterplotLayerClass({
        id: 'comms-coverage',
        data: props.nodes,
        getPosition: getNodePosition,
        getRadius: getCoverageRadius,
        getFillColor: getCoverageFill,
        getLineColor: getCoverageStroke,
        lineWidthMinPixels: 1,
        stroked: true,
        filled: true,
        radiusUnits: 'meters' as const,
        pickable: false,
      }),
    );

    updateLayer(
      'comms-links',
      new LineLayerClass({
        id: 'comms-links',
        data: linkData,
        getSourcePosition: getLinkSourcePos,
        getTargetPosition: getLinkTargetPos,
        getColor: getLinkColor,
        getWidth: getLinkWidth,
        widthUnits: 'pixels' as const,
        pickable: false,
        updateTriggers: {
          getColor: [props.links],
          getWidth: [props.links],
        },
      }),
    );

    updateLayer(
      'comms-dots',
      new ScatterplotLayerClass({
        id: 'comms-dots',
        data: props.nodes,
        getPosition: getNodePosition,
        getRadius: getDotRadius,
        getFillColor: getDotColor,
        radiusUnits: 'pixels' as const,
        filled: true,
        stroked: true,
        getLineColor: [255, 255, 255, 200] as [number, number, number, number],
        lineWidthMinPixels: 1,
        pickable: false,
      }),
    );

    updateLayer(
      'comms-labels',
      new TextLayerClass({
        id: 'comms-labels',
        data: props.nodes,
        getPosition: getNodePosition,
        getText: getNodeLabel,
        getSize: 11,
        getColor: [30, 30, 30, 240] as [number, number, number, number],
        getTextAnchor: 'middle' as const,
        getAlignmentBaseline: 'top' as const,
        getPixelOffset: [0, 14] as [number, number],
        fontFamily: 'monospace',
        fontWeight: 'bold',
        outlineWidth: 2,
        outlineColor: [255, 255, 255, 220] as [number, number, number, number],
        pickable: false,
      }),
    );
  }

  watch([() => props.nodes, () => props.links], () => syncLayers(), {
    deep: true,
  });

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('comms-coverage');
    removeLayer('comms-links');
    removeLayer('comms-dots');
    removeLayer('comms-labels');
  });
</script>

<template>
  <slot />
</template>
