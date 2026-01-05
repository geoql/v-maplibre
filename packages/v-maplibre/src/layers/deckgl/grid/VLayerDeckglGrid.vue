<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { GridLayer } from '@deck.gl/aggregation-layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getColorWeight?: Accessor<D, number>;
    getElevationWeight?: Accessor<D, number>;
    cellSize?: number;
    colorRange?: Color[];
    coverage?: number;
    elevationDomain?: [number, number];
    elevationRange?: [number, number];
    elevationScale?: number;
    extruded?: boolean;
    upperPercentile?: number;
    lowerPercentile?: number;
    elevationUpperPercentile?: number;
    elevationLowerPercentile?: number;
    colorScaleType?: 'quantize' | 'linear' | 'quantile' | 'ordinal';
    colorAggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
    elevationAggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
    gpuAggregation?: boolean;
    material?: boolean | object;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    cellSize: 1000,
    coverage: 1,
    elevationScale: 1,
    extruded: false,
    upperPercentile: 100,
    lowerPercentile: 0,
    elevationUpperPercentile: 100,
    elevationLowerPercentile: 0,
    colorScaleType: 'quantize',
    colorAggregation: 'SUM',
    elevationAggregation: 'SUM',
    gpuAggregation: false,
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
    return new GridLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getColorWeight: props.getColorWeight ?? 1,
      getElevationWeight: props.getElevationWeight ?? 1,
      cellSize: props.cellSize,
      colorRange: props.colorRange,
      coverage: props.coverage,
      elevationDomain: props.elevationDomain,
      elevationRange: props.elevationRange,
      elevationScale: props.elevationScale,
      extruded: props.extruded,
      upperPercentile: props.upperPercentile,
      lowerPercentile: props.lowerPercentile,
      elevationUpperPercentile: props.elevationUpperPercentile,
      elevationLowerPercentile: props.elevationLowerPercentile,
      colorScaleType: props.colorScaleType,
      colorAggregation: props.colorAggregation,
      elevationAggregation: props.elevationAggregation,
      gpuAggregation: props.gpuAggregation,
      material: props.material,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as unknown as ConstructorParameters<typeof GridLayer>[0]);
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
      props.cellSize,
      props.colorRange,
      props.elevationScale,
      props.extruded,
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
