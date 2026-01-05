<script setup lang="ts">
  import { VLayerDeckglTrips } from '@geoql/v-maplibre';
  import type { TripsLayerProps } from '@deck.gl/geo-layers';

  export interface MapLayerTripsProps extends Partial<TripsLayerProps> {
    id: string;
    data: unknown[] | string;
  }

  const props = defineProps<MapLayerTripsProps>();
</script>

<template>
  <VLayerDeckglTrips v-bind="props"></VLayerDeckglTrips>
</template>
