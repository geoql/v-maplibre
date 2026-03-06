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
    title: 'EPT Streaming - LiDAR Examples - mapcn-vue',
    description:
      'Entwine Point Tile (EPT) streaming for large point cloud datasets with viewport-based loading.',
  });

  defineOgImage('MapcnDoc', {
    title: 'EPT Streaming',
    description:
      'Entwine Point Tile (EPT) streaming for large point cloud datasets with viewport-based loading.',
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
    container: `lidar-ept-example-${mapId}`,
    style: mapStyle.value,
    center: [-6.26, 53.34] as [number, number],
    zoom: 14,
    pitch: 60,
    maxPitch: 85,
  }));

  // Dublin, Ireland EPT dataset from Entwine
  const eptUrl = 'https://na-c.entwine.io/dublin/ept.json';

  const handleLoad = (info: unknown) => {
    console.log('EPT point cloud loaded:', info);
  };

  const handleError = (error: unknown) => {
    console.error('Failed to load EPT point cloud:', error);
  };

  const handleStreamingProgress = (progress: unknown) => {
    console.log('Streaming progress:', progress);
  };

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
                    import { VMap, VControlLidar, VControlNavigation } from '@geoql/v-maplibre';
                    import 'maplibre-gl-lidar/style.css';

                    const mapOptions = {
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [-6.26, 53.34], // Dublin, Ireland
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
                    streamingPointBudget: 5_000_000, // 5 million points max
                    };

                    // Dublin EPT dataset from Entwine
                    const eptUrl = 'https://na-c.entwine.io/dublin/ept.json';
                  ${SCRIPT_END}

                  <template>
                    <VMap :options="mapOptions" class="h-125 w-full">
                      <VControlNavigation position="top-right" />
                      <VControlLidar
                        position="top-right"
                        :options="lidarOptions"
                        :default-url="eptUrl"
                        @load="(info) => console.log('Loaded:', info)"
                        @streamingprogress="(p) => console.log('Progress:', p)"
                      />
                    </VMap>
                  </template>`;
</script>

<template>
  <ComponentDemo
    title="EPT Streaming"
    description="Entwine Point Tile (EPT) is a directory-based format for serving large point clouds over HTTP. Points stream dynamically based on your viewport, enabling visualization of datasets with billions of points."
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
              streamingPointBudget: 5_000_000,
            }"
            :default-url="eptUrl"
            @load="handleLoad"
            @loaderror="handleError"
            @streamingprogress="handleStreamingProgress"
          />
        </VMap>
      </ClientOnly>
    </div>
  </ComponentDemo>
</template>
