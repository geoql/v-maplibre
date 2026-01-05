<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { HexagonLayer } from '@deck.gl/aggregation-layers';
  import type { PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import type { Color } from '../_shared/types';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getColorWeight?: Accessor<D, number>;
    getElevationWeight?: Accessor<D, number>;
    gpuAggregation?: boolean;
    radius?: number;
    elevationScale?: number;
    elevationRange?: [number, number];
    colorRange?: Color[];
    colorDomain?: [number, number];
    coverage?: number;
    extruded?: boolean;
    upperPercentile?: number;
    lowerPercentile?: number;
    elevationUpperPercentile?: number;
    elevationLowerPercentile?: number;
    colorScaleType?: 'quantize' | 'linear' | 'quantile' | 'ordinal';
    material?: boolean | object;
    colorAggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX' | 'COUNT';
    elevationAggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX' | 'COUNT';
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    gpuAggregation: false,
    radius: 1000,
    elevationScale: 1,
    coverage: 1,
    extruded: false,
    upperPercentile: 100,
    lowerPercentile: 0,
    elevationUpperPercentile: 100,
    elevationLowerPercentile: 0,
    colorScaleType: 'quantize',
    colorAggregation: 'SUM',
    elevationAggregation: 'SUM',
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
    return new HexagonLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getColorWeight: props.getColorWeight,
      getElevationWeight: props.getElevationWeight,
      gpuAggregation: props.gpuAggregation,
      radius: props.radius,
      elevationScale: props.elevationScale,
      elevationRange: props.elevationRange,
      colorRange: props.colorRange,
      colorDomain: props.colorDomain,
      coverage: props.coverage,
      extruded: props.extruded,
      upperPercentile: props.upperPercentile,
      lowerPercentile: props.lowerPercentile,
      elevationUpperPercentile: props.elevationUpperPercentile,
      elevationLowerPercentile: props.elevationLowerPercentile,
      colorScaleType: props.colorScaleType,
      material: props.material,
      colorAggregation: props.colorAggregation,
      elevationAggregation: props.elevationAggregation,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as unknown as ConstructorParameters<typeof HexagonLayer>[0]);
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
      props.radius,
      props.elevationScale,
      props.opacity,
      props.visible,
      props.extruded,
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
