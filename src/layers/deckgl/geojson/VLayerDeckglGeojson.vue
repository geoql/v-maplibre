<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { GeoJsonLayer } from '@deck.gl/layers';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';
  import type { Color } from '../_shared/types';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: D | string | Promise<D>;
    getFillColor?: Accessor<D, Color>;
    getLineColor?: Accessor<D, Color>;
    getLineWidth?: Accessor<D, number>;
    getPointRadius?: Accessor<D, number>;
    getElevation?: Accessor<D, number>;
    getText?: Accessor<D, string>;
    filled?: boolean;
    stroked?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    pointType?: string;
    lineWidthUnits?: 'meters' | 'common' | 'pixels';
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    lineJointRounded?: boolean;
    lineCapRounded?: boolean;
    lineMiterLimit?: number;
    pointRadiusUnits?: 'meters' | 'common' | 'pixels';
    pointRadiusScale?: number;
    pointRadiusMinPixels?: number;
    pointRadiusMaxPixels?: number;
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
    stroked: true,
    extruded: false,
    wireframe: false,
    pointType: 'circle',
    lineWidthUnits: 'meters',
    lineWidthScale: 1,
    lineWidthMinPixels: 0,
    lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
    lineJointRounded: false,
    lineCapRounded: false,
    lineMiterLimit: 4,
    pointRadiusUnits: 'meters',
    pointRadiusScale: 1,
    pointRadiusMinPixels: 0,
    pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER,
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
    return new GeoJsonLayer({
      id: props.id,
      data: props.data,
      getFillColor: props.getFillColor ?? [200, 200, 200, 200],
      getLineColor: props.getLineColor ?? [0, 0, 0, 255],
      getLineWidth: props.getLineWidth ?? 1,
      getPointRadius: props.getPointRadius ?? 1,
      getElevation: props.getElevation ?? 1000,
      getText: props.getText,
      filled: props.filled,
      stroked: props.stroked,
      extruded: props.extruded,
      wireframe: props.wireframe,
      pointType: props.pointType,
      lineWidthUnits: props.lineWidthUnits,
      lineWidthScale: props.lineWidthScale,
      lineWidthMinPixels: props.lineWidthMinPixels,
      lineWidthMaxPixels: props.lineWidthMaxPixels,
      lineJointRounded: props.lineJointRounded,
      lineCapRounded: props.lineCapRounded,
      lineMiterLimit: props.lineMiterLimit,
      pointRadiusUnits: props.pointRadiusUnits,
      pointRadiusScale: props.pointRadiusScale,
      pointRadiusMinPixels: props.pointRadiusMinPixels,
      pointRadiusMaxPixels: props.pointRadiusMaxPixels,
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
    } as unknown as ConstructorParameters<typeof GeoJsonLayer>[0]);
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
      props.getFillColor,
      props.getLineColor,
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
