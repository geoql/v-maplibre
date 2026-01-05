<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { MVTLayer } from '@deck.gl/geo-layers';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  type Accessor<In, Out> = Out | ((object: In) => Out);

  interface Props<D = unknown> {
    id: string;
    data: string | string[];
    minZoom?: number;
    maxZoom?: number;
    uniqueIdProperty?: string;
    highlightedFeatureId?: string | number;
    binary?: boolean;
    loadOptions?: object;
    // Sublayer props
    getFillColor?: Accessor<D, Color>;
    getLineColor?: Accessor<D, Color>;
    getLineWidth?: Accessor<D, number>;
    getPointRadius?: Accessor<D, number>;
    getElevation?: Accessor<D, number>;
    lineWidthUnits?: 'meters' | 'common' | 'pixels';
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    pointRadiusUnits?: 'meters' | 'common' | 'pixels';
    pointRadiusScale?: number;
    pointRadiusMinPixels?: number;
    pointRadiusMaxPixels?: number;
    stroked?: boolean;
    filled?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    elevationScale?: number;
    pointType?: string;
    opacity?: number;
    visible?: boolean;
    pickable?: boolean;
    autoHighlight?: boolean;
    highlightColor?: Color;
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    minZoom: 0,
    maxZoom: 23,
    binary: true,
    lineWidthUnits: 'meters',
    lineWidthScale: 1,
    lineWidthMinPixels: 0,
    lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
    pointRadiusUnits: 'meters',
    pointRadiusScale: 1,
    pointRadiusMinPixels: 0,
    pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER,
    stroked: true,
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
    tileLoad: [tile: unknown];
    tileError: [error: Error, tile: unknown];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const createLayer = () => {
    return new MVTLayer({
      id: props.id,
      data: props.data,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
      uniqueIdProperty: props.uniqueIdProperty,
      highlightedFeatureId: props.highlightedFeatureId,
      binary: props.binary,
      loadOptions: props.loadOptions,
      getFillColor: props.getFillColor ?? [255, 0, 0, 255],
      getLineColor: props.getLineColor ?? [0, 0, 0, 255],
      getLineWidth: props.getLineWidth ?? 1,
      getPointRadius: props.getPointRadius ?? 1,
      getElevation: props.getElevation ?? 1000,
      lineWidthUnits: props.lineWidthUnits,
      lineWidthScale: props.lineWidthScale,
      lineWidthMinPixels: props.lineWidthMinPixels,
      lineWidthMaxPixels: props.lineWidthMaxPixels,
      pointRadiusUnits: props.pointRadiusUnits,
      pointRadiusScale: props.pointRadiusScale,
      pointRadiusMinPixels: props.pointRadiusMinPixels,
      pointRadiusMaxPixels: props.pointRadiusMaxPixels,
      stroked: props.stroked,
      filled: props.filled,
      extruded: props.extruded,
      wireframe: props.wireframe,
      elevationScale: props.elevationScale,
      pointType: props.pointType,
      opacity: props.opacity,
      visible: props.visible,
      pickable: props.pickable,
      autoHighlight: props.autoHighlight,
      highlightColor: props.highlightColor,
      beforeId: props.beforeId,
      onClick: (info: PickingInfo) => emit('click', info),
      onHover: (info: PickingInfo) => emit('hover', info),
      onTileLoad: (tile: unknown) => emit('tileLoad', tile),
      onTileError: (error: Error, tile: unknown) =>
        emit('tileError', error, tile),
    } as unknown as ConstructorParameters<typeof MVTLayer>[0]);
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
      props.highlightedFeatureId,
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
