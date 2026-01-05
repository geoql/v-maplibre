<script setup lang="ts">
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface Props {
    layer: unknown;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const getLayerId = (layer: unknown): string => {
    return (layer as { id: string }).id;
  };

  const initializeLayer = () => {
    addLayer(props.layer);
  };

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', initializeLayer);
    }
  });

  watch(
    () => props.layer,
    (newLayer, oldLayer) => {
      const oldId = oldLayer ? getLayerId(oldLayer) : null;
      const newId = getLayerId(newLayer);

      if (oldId && oldId !== newId) {
        removeLayer(oldId);
        addLayer(newLayer);
      } else {
        updateLayer(newId, newLayer);
      }
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(getLayerId(props.layer));
  });
</script>

<template>
  <slot></slot>
</template>
