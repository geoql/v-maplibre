<script setup lang="ts">
  import type { DronePosition, DroneTrip } from '~/types/drone';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    tripData: DroneTrip[];
    currentTime: number;
    dronePosition: DronePosition | null;
    mapBearing: number;
  }>();

  // Public quadcopter SVG (X arms, 4 motor rings, center hub, forward arrow).
  // White fill — visible against the dark 3D basemap without masking.
  const DRONE_ICON_URL = '/drone-icon.svg';

  function getPath(d: unknown): [number, number][] {
    return (d as DroneTrip).path;
  }

  function getTimestamps(d: unknown): number[] {
    return (d as DroneTrip).timestamps;
  }

  function getTripColor(): [number, number, number] {
    return [0, 200, 255];
  }

  function getShadowColor(): [number, number, number] {
    return [0, 60, 130];
  }

  function getDronePosition(d: unknown): [number, number] {
    const p = d as DronePosition;
    return [p.lng, p.lat];
  }

  // With billboard:true, getAngle is clockwise degrees from screen-up.
  // MapContainer.jumpTo({ bearing: pos.bearing }) keeps map.bearing ≈ drone.bearing,
  // so the drone moves screen-upward. Correct angle = drone.bearing - map.bearing ≈ 0,
  // but we use the actual values for accuracy when map hasn't caught up yet.
  function getDroneAngle(d: unknown): number {
    const bearing = (d as DronePosition).bearing;
    return bearing - props.mapBearing;
  }

  function getDroneIcon() {
    return {
      url: DRONE_ICON_URL,
      width: 128,
      height: 128,
      anchorX: 64,
      anchorY: 64,
      mask: false, // use SVG colours directly (white drone)
    };
  }

  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let IconLayerClass: typeof import('@deck.gl/layers').IconLayer | null = null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const [geoModule, layersModule] = await Promise.all([
      import('@deck.gl/geo-layers'),
      import('@deck.gl/layers'),
    ]);
    TripsLayerClass = geoModule.TripsLayer;
    IconLayerClass = layersModule.IconLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (!TripsLayerClass || !IconLayerClass) return;

    const shadowLayer = new TripsLayerClass({
      id: 'drone-shadow',
      data: props.tripData,
      getPath,
      getTimestamps,
      getColor: getShadowColor,
      currentTime: props.currentTime,
      trailLength: 120,
      fadeTrail: true,
      widthMinPixels: 10,
      capRounded: true,
      jointRounded: true,
      opacity: 0.3,
    });

    const trailLayer = new TripsLayerClass({
      id: 'drone-trail',
      data: props.tripData,
      getPath,
      getTimestamps,
      getColor: getTripColor,
      currentTime: props.currentTime,
      trailLength: 80,
      fadeTrail: true,
      widthMinPixels: 4,
      capRounded: true,
      jointRounded: true,
      opacity: 0.8,
    });

    updateLayer('drone-shadow', shadowLayer);
    updateLayer('drone-trail', trailLayer);

    const pos = props.dronePosition;
    if (pos) {
      const iconLayer = new IconLayerClass({
        id: 'drone-icon',
        data: [pos],
        getIcon: getDroneIcon,
        getPosition: getDronePosition,
        getAngle: getDroneAngle,
        getSize: 96,
        sizeUnits: 'pixels' as const,
        billboard: true, // always face the camera — visible at any pitch
        pickable: false,
      });
      updateLayer('drone-icon', iconLayer);
    } else {
      removeLayer('drone-icon');
    }
  }

  watch(
    [
      () => props.tripData,
      () => props.currentTime,
      () => props.dronePosition,
      () => props.mapBearing,
    ],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('drone-shadow');
    removeLayer('drone-trail');
    removeLayer('drone-icon');
  });
</script>

<template>
  <slot></slot>
</template>
