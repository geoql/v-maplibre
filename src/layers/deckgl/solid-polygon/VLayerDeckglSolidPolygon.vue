<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { SolidPolygonLayer } from '@deck.gl/layers';
  import type { SolidPolygonLayerProps } from '@deck.gl/layers';
  import type { Color, PickingInfo, Position } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getPolygon: Accessor<D, Position[] | Position[][]>;
    getFillColor?: Accessor<D, Color>;
    getLineColor?: Accessor<D, Color>;
    getElevation?: Accessor<D, number>;
    filled?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    elevationScale?: number;
    material?: boolean | object;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    filled: true,
    extruded: false,
    wireframe: false,
    elevationScale: 1,
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
    return new SolidPolygonLayer({
      id: props.id,
      data: props.data,
      getPolygon: props.getPolygon,
      getFillColor: props.getFillColor ?? [0, 0, 0, 255],
      getLineColor: props.getLineColor ?? [0, 0, 0, 255],
      getElevation: props.getElevation ?? 1000,
      filled: props.filled,
      extruded: props.extruded,
      wireframe: props.wireframe,
      elevationScale: props.elevationScale,
      material: props.material,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
    } as SolidPolygonLayerProps);
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
      props.getPolygon,
      props.getFillColor,
      props.getElevation,
      props.extruded,
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
