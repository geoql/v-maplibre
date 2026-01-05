<script setup lang="ts">
  import { VLayerDeckglTerrain } from '@geoql/v-maplibre';
  import type { TerrainLayerProps } from '@deck.gl/geo-layers';

  export interface MapLayerTerrainProps extends Partial<TerrainLayerProps> {
    id: string;
  }

  const props = defineProps<MapLayerTerrainProps>();
</script>

<template>
  <VLayerDeckglTerrain v-bind="props"></VLayerDeckglTerrain>
</template>
