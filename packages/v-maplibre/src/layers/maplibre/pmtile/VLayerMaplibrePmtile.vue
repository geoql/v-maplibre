<script setup lang="ts">
  import { PMTiles } from 'pmtiles';
  import { inject, onMounted, ref } from 'vue';
  import type {
    RasterLayerSpecification,
    RasterSourceSpecification,
  } from 'maplibre-gl';
  import VLayerMaplibreRaster from '../raster/VLayerMaplibreRaster.vue';
  import { PMTileProtocolKey } from '../../../utils/symbols';

  interface Props {
    sourceId?: string;
    layerId?: string;
    url: string;
    layer?: RasterLayerSpecification;
    before?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    sourceId: 'maplibre.gl-pmtile-source',
    layerId: 'maplibre.gl-pmtile-layer',
    layer: () => ({}) as RasterLayerSpecification,
    before: '',
  });

  const protocol = inject(PMTileProtocolKey);
  if (!protocol) {
    throw new Error('Protocol not provided');
  }

  const source = ref<RasterSourceSpecification>({
    type: 'raster',
    url: `pmtiles://${props.url}`,
    tileSize: 512,
    volatile: true,
  });
  onMounted(async () => {
    const p = new PMTiles(props.url);
    protocol.add(p);
    // Optional: You could fetch the header here if you need metadata
    // const header = await p.getHeader();
  });
</script>

<template>
  <VLayerMaplibreRaster
    :source-id="sourceId"
    :layer-id="layerId"
    :source="source"
    :layer="{
      ...layer,
      type: 'raster',
    }"
    :before="before"
  ></VLayerMaplibreRaster>
</template>
