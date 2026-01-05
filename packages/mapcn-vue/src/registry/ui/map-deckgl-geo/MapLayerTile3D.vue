<script setup lang="ts">
  import { VLayerDeckglTile3D } from '@geoql/v-maplibre';
  import type { Tile3DLayerProps } from '@deck.gl/geo-layers';

  export interface MapLayerTile3DProps extends Partial<Tile3DLayerProps> {
    id: string;
    data: string;
  }

  const props = defineProps<MapLayerTile3DProps>();
</script>

<template>
  <VLayerDeckglTile3D v-bind="props"></VLayerDeckglTile3D>
</template>
