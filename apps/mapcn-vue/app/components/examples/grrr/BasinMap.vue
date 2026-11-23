<script setup lang="ts">
  import {
    VControlLegend,
    VControlNavigation,
    VControlScale,
    VMap,
  } from '@geoql/v-maplibre';
  import { VLayerDeckglScatterplot } from '@geoql/v-maplibre/deck.gl';
  import type { PickingInfo } from '@deck.gl/core';
  import type { CategoryLegendItem } from '@geoql/v-maplibre';
  import type { GrrrBasin } from '~/types/grrr';

  const props = defineProps<{
    basins: GrrrBasin[];
    selected: GrrrBasin | null;
  }>();

  const emit = defineEmits<{ select: [basin: GrrrBasin] }>();

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const mapOptions = computed(() => ({
    container: `grrr-map-${mapId}`,
    style: mapStyle.value,
    center: [30, 22] as [number, number],
    zoom: 1.6,
  }));

  const NO_SELECTION: GrrrBasin[] = [];
  const selectedData = computed(() =>
    props.selected ? [props.selected] : NO_SELECTION,
  );

  const legendItems: CategoryLegendItem[] = GRRR_FLOW_CLASSES.map((c) => ({
    value: c.min,
    label: c.label,
    color: `rgb(${c.rgb.join(' ')})`,
  }));

  function getPosition(d: unknown): [number, number] {
    return (d as GrrrBasin).position;
  }

  function getFillColor(d: unknown): [number, number, number, number] {
    return grrrFlowColor((d as GrrrBasin).rp2);
  }

  function getRadius(d: unknown): number {
    return grrrFlowRadius((d as GrrrBasin).rp2);
  }

  function handleClick(info: PickingInfo): void {
    if (info.object) emit('select', info.object as GrrrBasin);
  }
</script>

<template>
  <ClientOnly>
    <VMap :key="mapStyle" :options="mapOptions" class="size-full">
      <VControlNavigation position="top-right" />
      <VControlScale position="bottom-left" />
      <VControlLegend
        :layer-ids="['grrr-basins']"
        position="bottom-right"
        type="category"
        title="2-year flood"
        :items="legendItems"
        :interactive="false"
      />
      <VLayerDeckglScatterplot
        v-if="basins.length > 0"
        id="grrr-basins"
        :data="basins"
        :get-position="getPosition"
        :get-fill-color="getFillColor"
        :get-radius="getRadius"
        radius-units="pixels"
        :pickable="true"
        :auto-highlight="true"
        :highlight-color="[255, 255, 255, 160]"
        @click="handleClick"
      />
      <VLayerDeckglScatterplot
        id="grrr-selected"
        :data="selectedData"
        :get-position="getPosition"
        :get-radius="9"
        radius-units="pixels"
        :filled="false"
        :stroked="true"
        :get-line-color="[255, 255, 255, 255]"
        :line-width-min-pixels="2"
      />
    </VMap>
    <template #fallback>
      <div class="size-full bg-muted/30" />
    </template>
  </ClientOnly>
</template>
