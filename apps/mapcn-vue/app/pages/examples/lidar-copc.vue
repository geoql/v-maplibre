<script setup lang="ts">
  import type { GradientLegendItem } from '@geoql/v-maplibre';
  import {
    VMap,
    VControlLidar,
    VControlNavigation,
    VControlScale,
    VControlLegend,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'COPC Streaming - LiDAR Examples - mapcn-vue',
    description:
      'Cloud-Optimized Point Cloud with dynamic viewport-based loading for large LiDAR datasets.',
  });

  defineOgImage('MapcnDoc', {
    title: 'COPC Streaming',
    description:
      'Cloud-Optimized Point Cloud with dynamic viewport-based loading for large LiDAR datasets.',
    category: 'LiDAR',
  });

  const { mapStyle } = useMapStyle();
  const mapId = useId();

  const legendItems: GradientLegendItem[] = [
    {
      min: 0,
      max: 500,
      minLabel: 'Low',
      maxLabel: 'High',
      colors: ['#440154', '#31688e', '#35b779', '#fde725'],
    },
  ];

  const mapOptions = computed(() => ({
    container: `lidar-example-${mapId}`,
    style: mapStyle.value,
    center: [-123.075, 44.05] as [number, number],
    zoom: 14,
    pitch: 60,
    maxPitch: 85,
  }));

  const sampleCopcUrl =
    'https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz';

  const handleLoad = (info: unknown) => {
    console.log('Point cloud loaded:', info);
  };

  const handleError = (error: unknown) => {
    console.error('Failed to load point cloud:', error);
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VControlLidar, VControlNavigation } from '@geoql/v-maplibre';
                    import 'maplibre-gl-lidar/style.css';

                    const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [-123.075, 44.05],
                    zoom: 14,
                    pitch: 60,
                    maxPitch: 85,
                    };

                    const lidarOptions = {
                    collapsed: false,
                    pointSize: 2,
                    colorScheme: 'elevation',
                    pickable: true,
                    autoZoom: true,
                    };

                    const copcUrl = 'https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz';
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VControlLidar
                        position="top-right"
                        :options="lidarOptions"
                        :default-url="copcUrl"
                        @load="(info) => console.log('Loaded:', info)"
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="COPC Streaming"
    description="Cloud-Optimized Point Cloud (COPC) with dynamic viewport-based loading. Only points visible in the current view are loaded, dramatically reducing memory usage for large datasets."
    :code="codeExample"
    registry="map-control-lidar"
    full-width
    class="h-full"
  >
    <div class="size-full min-w-0 overflow-hidden">
      <ClientOnly>
        <VMap :key="mapStyle" :options="mapOptions" class="size-full">
          <VControlNavigation position="top-right" />
          <VControlScale position="bottom-left" />
          <VControlLegend
            :layer-ids="['lidar-points']"
            position="bottom-left"
            type="gradient"
            title="Elevation"
            :items="legendItems"
            :interactive="false"
          />
          <VControlLidar
            position="top-right"
            :options="{
              collapsed: false,
              pointSize: 2,
              colorScheme: 'elevation',
              pickable: true,
              autoZoom: true,
            }"
            :default-url="sampleCopcUrl"
            @load="handleLoad"
            @loaderror="handleError"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
