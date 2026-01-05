<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { H3ClusterLayer } from '@deck.gl/geo-layers';
  import type { H3ClusterLayerProps } from '@deck.gl/geo-layers';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D[] | string | Promise<D[]>;
    getHexagons: Accessor<D, string[]>;
    getFillColor?: Accessor<D, Color>;
    getLineColor?: Accessor<D, Color>;
    getElevation?: Accessor<D, number>;
    filled?: boolean;
    stroked?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    elevationScale?: number;
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
    filled: true,
    stroked: true,
    extruded: false,
    wireframe: false,
    elevationScale: 1,
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
    return new H3ClusterLayer({
      id: props.id,
      data: props.data,
      getHexagons: props.getHexagons,
      getFillColor: props.getFillColor ?? [255, 0, 0, 255],
      getLineColor: props.getLineColor ?? [0, 0, 0, 255],
      getElevation: props.getElevation ?? 1000,
      filled: props.filled,
      stroked: props.stroked,
      extruded: props.extruded,
      wireframe: props.wireframe,
      elevationScale: props.elevationScale,
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
    } as H3ClusterLayerProps);
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
      props.getHexagons,
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
