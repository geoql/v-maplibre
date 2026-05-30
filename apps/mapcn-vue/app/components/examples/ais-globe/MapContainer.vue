<script setup lang="ts">
  import type { Vessel, VesselPosition, TripDatum } from '~/types/maritime-ais';
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import { VMap, VControlNavigation, VControlScale } from '@geoql/v-maplibre';

  defineProps<{
    vessels: Vessel[];
    positions: Record<string, VesselPosition>;
    tripData: TripDatum[];
    loopedTime: number;
  }>();

  const mapId = useId();
  const { mapStyle } = useMapStyle();

  const mapInstance = shallowRef<MaplibreMap | null>(null);

  // The point facing the camera on the globe = the viewport centre. Tracked so
  // the layers can cull vessels on the far hemisphere (see Layers.vue): the
  // depthCompare:'always' globe fix disables depth occlusion, so without this
  // cull, dots on the back of the globe show through the sphere.
  const cameraLng = ref(30);
  const cameraLat = ref(25);

  function handleLoaded(map: MaplibreMap): void {
    mapInstance.value = map;
    const sync = () => {
      const c = map.getCenter();
      cameraLng.value = c.lng;
      cameraLat.value = c.lat;
    };
    sync();
    map.on('move', sync);
  }

  const mapOptions = computed(() => ({
    container: `ais-globe-${mapId}`,
    style: mapStyle.value,
    center: [30, 25] as [number, number],
    zoom: 2,
    pitch: 0,
    bearing: 0,
    // deck.gl billboard layers tear/detach when a MapLibre globe is tilted or
    // rotated (unresolved upstream bug). Lock pitch AND bearing so the globe
    // stays pan/zoom only and never enters the janky tilted-or-rotated state.
    maxPitch: 0,
    minPitch: 0,
    dragRotate: false,
    pitchWithRotate: false,
    rotate: false,
    touchPitch: false,
  }));
</script>

<template>
  <div class="relative size-full min-w-0 overflow-hidden">
    <ClientOnly>
      <VMap
        :key="mapStyle"
        :options="mapOptions"
        projection="globe"
        class="size-full"
        @loaded="handleLoaded"
      >
        <VControlNavigation position="top-right" />
        <VControlScale position="bottom-left" />
        <ExamplesAisGlobeMapEnhancer :map="mapInstance" />
        <ExamplesAisGlobeLayers
          :vessels="vessels"
          :positions="positions"
          :trip-data="tripData"
          :looped-time="loopedTime"
          :camera-lng="cameraLng"
          :camera-lat="cameraLat"
        />
      </VMap>
      <template #fallback>
        <div class="size-full bg-muted animate-pulse"></div>
      </template>
    </ClientOnly>
  </div>
</template>
