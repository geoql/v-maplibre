<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { GridCellLayer } from '@deck.gl/layers';
  import type { GridCellLayerProps } from '@deck.gl/layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPosition: Accessor<D, Position>;
    getFillColor?: Accessor<D, Color>;
    getElevation?: Accessor<D, number>;
    cellSize?: number;
    coverage?: number;
    elevationScale?: number;
    extruded?: boolean;
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
    extruded: true,
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
    return new GridCellLayer({
      id: props.id,
      data: props.data,
      getPosition: props.getPosition,
      getFillColor: props.getFillColor ?? [255, 0, 0, 255],
      getElevation: props.getElevation ?? 1000,
      cellSize: props.cellSize,
      coverage: props.coverage,
      elevationScale: props.elevationScale,
      extruded: props.extruded,
      material: props.material,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as GridCellLayerProps);
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
      props.cellSize,
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
