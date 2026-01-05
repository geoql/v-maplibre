<script setup lang="ts">
  import { PMTiles } from 'pmtiles';
  import { inject, onMounted, ref } from 'vue';
  import type { PropType } from 'vue';
  import type {
    RasterLayerSpecification,
    RasterSourceSpecification,
  } from 'maplibre-gl';
  import VLayerMaplibreRaster from '../raster/VLayerMaplibreRaster.vue';
  import { PMTileProtocolKey } from '../../../utils/symbols';

  const props = defineProps({
    sourceId: {
      type: String,
      default: 'maplibre.gl-pmtile-source',
      required: true,
    },
    layerId: {
      type: String,
      default: 'maplibre.gl-pmtile-layer',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    layer: {
      type: Object as PropType<RasterLayerSpecification>,
      default: () => ({}),
      required: true,
    },
    before: {
      type: String,
      default: '',
      required: false,
    },
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
