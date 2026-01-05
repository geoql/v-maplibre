<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { ColumnLayer } from '@deck.gl/layers';
  import type { ColumnLayerProps } from '@deck.gl/layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getFillColor?: Accessor<D, Color>;
    getLineColor?: Accessor<D, Color>;
    getElevation?: Accessor<D, number>;
    diskResolution?: number;
    radius?: number;
    angle?: number;
    vertices?: Position[];
    offset?: [number, number];
    coverage?: number;
    elevationScale?: number;
    filled?: boolean;
    stroked?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    flatShading?: boolean;
    radiusUnits?: 'meters' | 'common' | 'pixels';
    lineWidthUnits?: 'meters' | 'common' | 'pixels';
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    material?: boolean | object;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    diskResolution: 20,
    radius: 1000,
    angle: 0,
    coverage: 1,
    elevationScale: 1,
    filled: true,
    stroked: false,
    extruded: true,
    wireframe: false,
    flatShading: false,
    radiusUnits: 'meters',
    lineWidthUnits: 'meters',
    lineWidthScale: 1,
    lineWidthMinPixels: 0,
    lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
    opacity: 1,
    visible: true,
    pickable: true,
    autoHighlight: false,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const createLayer = () => {
    return new ColumnLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getFillColor: props.getFillColor ?? [255, 0, 0, 255],
      getLineColor: props.getLineColor ?? [0, 0, 0, 255],
      getElevation: props.getElevation ?? 1000,
      diskResolution: props.diskResolution,
      radius: props.radius,
      angle: props.angle,
      vertices: props.vertices,
      offset: props.offset,
      coverage: props.coverage,
      elevationScale: props.elevationScale,
      filled: props.filled,
      stroked: props.stroked,
      extruded: props.extruded,
      wireframe: props.wireframe,
      flatShading: props.flatShading,
      radiusUnits: props.radiusUnits,
      lineWidthUnits: props.lineWidthUnits,
      lineWidthScale: props.lineWidthScale,
      lineWidthMinPixels: props.lineWidthMinPixels,
      lineWidthMaxPixels: props.lineWidthMaxPixels,
      material: props.material,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as ColumnLayerProps);
  };

  const initializeLayer = () => {
    addLayer(createLayer());
  };

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', initializeLayer);
    }
  });

  watch(
    () => [
      props.data,
      props.getPosition,
      props.getFillColor,
      props.getElevation,
      props.radius,
      props.elevationScale,
      props.opacity,
      props.visible,
    ],
    () => updateLayer(props.id, createLayer()),
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
