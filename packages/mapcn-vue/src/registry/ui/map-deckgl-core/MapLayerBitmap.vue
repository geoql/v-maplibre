<script setup lang="ts">
  import { VLayerDeckglBitmap } from '@geoql/v-maplibre';
  import type { BitmapLayerProps } from '@deck.gl/layers';

  export interface MapLayerBitmapProps extends Partial<BitmapLayerProps> {
    id: string;
  }

  const props = defineProps<MapLayerBitmapProps>();
</script>

<template>
  <VLayerDeckglBitmap v-bind="props"></VLayerDeckglBitmap>
</template>
