<script setup lang="ts">
  import type { Map, LngLatLike } from 'maplibre-gl';
  import {
    VMap,
    VLayerMaplibreCluster,
    VControlNavigation,
    VControlScale,
    VPopup,
  } from '@geoql/v-maplibre';

  defineProps<{
    pointsData: GeoJSON.FeatureCollection;
    showPopup: boolean;
    popupCoordinates: LngLatLike;
    popupContent: { id: number } | null;
  }>();

  const emit = defineEmits<{
    loaded: [map: Map];
    clusterClick: [
      event: {
        features: GeoJSON.Feature[];
        coordinates: { lng: number; lat: number };
      },
    ];
    pointClick: [
      event: {
        features: GeoJSON.Feature[];
        coordinates: { lng: number; lat: number };
      },
    ];
    closePopup: [];
  }>();

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `cluster-example-${mapId}`,
    style: mapStyle.value,
    center: [-74.006, 40.7128] as [number, number],
    zoom: 10,
  }));
</script>

<template>
  <div class="h-125 min-w-0 overflow-hidden rounded-lg border border-border">
    <ClientOnly>
      <VMap
        :key="mapStyle"
        :options="mapOptions"
        class="size-full"
        @loaded="emit('loaded', $event)"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <VLayerMaplibreCluster
          source-id="cluster-source"
          base-layer-id="clusters"
          :source="{ type: 'geojson', data: pointsData }"
          :cluster-paint="{
            colors: ['#10b981', '#059669', '#047857'],
            radii: [15, 22, 30],
          }"
          :unclustered-paint="{
            color: '#10b981',
            radius: 5,
          }"
          @cluster-click="emit('clusterClick', $event)"
          @point-click="emit('pointClick', $event)"
        />
        <VPopup
          v-if="showPopup && popupContent"
          :key="`popup-${popupContent.id}`"
          :coordinates="popupCoordinates"
          :options="{ closeButton: false, closeOnClick: false }"
          @close="emit('closePopup')"
        >
          <div
            class="min-w-48 rounded-xl border border-border bg-popover/95 px-4 py-3 shadow-lg backdrop-blur-md"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-full bg-emerald-500/15"
              >
                <div class="size-2.5 rounded-full bg-emerald-500"></div>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-popover-foreground">
                  Point #{{ popupContent.id }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ (popupCoordinates as [number, number])[1].toFixed(4) }}°,
                  {{ (popupCoordinates as [number, number])[0].toFixed(4) }}°
                </p>
              </div>
            </div>
          </div>
        </VPopup>
      </VMap>
    </ClientOnly>
  </div>
</template>

<style>
  .maplibregl-popup-content {
    background: transparent !important;
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .maplibregl-popup-tip {
    display: none !important;
  }

  .maplibregl-popup-close-button {
    display: none !important;
  }
</style>
