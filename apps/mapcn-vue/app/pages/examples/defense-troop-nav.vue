<script setup lang="ts">
  useSeoMeta({
    title: 'Ground Troop Navigation - mapcn-vue Examples',
    description:
      'Multi-waypoint route planning for infantry patrols in Ladakh with real Valhalla pedestrian routing and elevation profile.',
  });

  defineOgImage('MapcnDoc', {
    title: 'Ground Troop Navigation',
    description:
      'Multi-waypoint infantry patrol route planning with elevation profile.',
    category: 'Examples',
  });

  const {
    waypoints,
    routeCoords,
    elevationProfile,
    routeStats,
    isLoading,
    addWaypoint,
    removeWaypoint,
    clearRoute,
  } = useTroopNav();
  function handleMapClick(position: [number, number]): void {
    addWaypoint(position);
  }

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
  import { VMap, VControlNavigation } from '@geoql/v-maplibre';

  const colorMode = useColorMode();
  const mapStyle = computed(() =>
    colorMode.value === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  );
  ${SCRIPT_END}

  <template>
    <VMap :options="{ style: mapStyle, center: [77.6, 34.15], zoom: 12 }">
      <VControlNavigation position="top-right" />
    </VMap>
  </template>`;
</script>

<template>
  <ComponentDemo
    title="Ground Troop Navigation"
    description="Multi-waypoint route planning for infantry patrols in Ladakh, India. Click the map to add up to 8 waypoints — routes are fetched via Valhalla pedestrian routing with simulated elevation data for high-altitude terrain."
    :code="codeExample"
    full-width
    class="h-full"
  >
    <div class="relative size-full min-w-0 overflow-hidden">
      <ExamplesTroopNavMapContainer
        :waypoints="waypoints"
        :route-coords="routeCoords"
        :is-loading="isLoading"
        class="size-full"
        @map-click="handleMapClick"
      />

      <MapPanel title="Troop Nav">
        <ExamplesTroopNavControlPanel
          :waypoints="waypoints"
          :route-stats="routeStats"
          :elevation-profile="elevationProfile"
          @remove-waypoint="removeWaypoint"
          @clear-route="clearRoute"
        />
      </MapPanel>
    </div>
  </ComponentDemo>
</template>
