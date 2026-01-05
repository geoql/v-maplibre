<script setup lang="ts">
  import { VLayerDeckglTile } from '@geoql/v-maplibre';
  import type { TileLayerProps } from '@deck.gl/geo-layers';

  export interface MapLayerTileProps extends Partial<TileLayerProps> {
    id: string;
    data: string | string[];
  }

  const props = defineProps<MapLayerTileProps>();
</script>

<template>
  <VLayerDeckglTile v-bind="props"></VLayerDeckglTile>
</template>
