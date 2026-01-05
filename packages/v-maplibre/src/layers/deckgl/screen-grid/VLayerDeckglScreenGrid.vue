<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { ScreenGridLayer } from '@deck.gl/aggregation-layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getWeight?: Accessor<D, number>;
    cellSizePixels?: number;
    cellMarginPixels?: number;
    colorRange?: Color[];
    colorDomain?: [number, number];
    gpuAggregation?: boolean;
    aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    cellSizePixels: 100,
    cellMarginPixels: 2,
    gpuAggregation: false,
    aggregation: 'SUM',
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
    return new ScreenGridLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getWeight: props.getWeight ?? 1,
      cellSizePixels: props.cellSizePixels,
      cellMarginPixels: props.cellMarginPixels,
      colorRange: props.colorRange,
      colorDomain: props.colorDomain,
      gpuAggregation: props.gpuAggregation,
      aggregation: props.aggregation,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as unknown as ConstructorParameters<typeof ScreenGridLayer>[0]);
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
      props.cellSizePixels,
      props.colorRange,
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
