<script setup lang="ts">
  import type {
    BorderCamera,
    BorderPatrolRoute,
    BorderPatrolPosition,
    IntrusionZone,
    BorderLayerName,
    CameraDatum,
    PatrolVehicleDatum,
  } from '~/types/defense-border';
  import { useDeckLayers } from '@geoql/v-maplibre/deck.gl';

  const props = defineProps<{
    borderLine: [number, number][];
    cameras: BorderCamera[];
    patrols: BorderPatrolRoute[];
    positions: Record<string, BorderPatrolPosition>;
    intrusionZones: IntrusionZone[];
    visibleLayers: Set<BorderLayerName>;
    loopedTime: number;
  }>();

  let PathLayerClass: typeof import('@deck.gl/layers').PathLayer | null = null;
  let PolygonLayerClass: typeof import('@deck.gl/layers').PolygonLayer | null =
    null;
  let ScatterplotLayerClass:
    | typeof import('@deck.gl/layers').ScatterplotLayer
    | null = null;
  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let initialized = false;

  const { updateLayer, removeLayer } = useDeckLayers();

  function getBorderPath(d: unknown): [number, number][] {
    return (d as { path: [number, number][] }).path;
  }

  function getConePolygon(d: unknown): [number, number][] {
    return (d as BorderCamera).coverageCone;
  }

  function getCameraPosition(d: unknown): [number, number] {
    const cam = d as CameraDatum;
    return [cam.lng, cam.lat];
  }

  function getCameraFillColor(d: unknown): [number, number, number, number] {
    const cam = d as CameraDatum;
    return cam.status === 'alert' ? [255, 60, 60, 220] : [0, 180, 255, 220];
  }

  function getPatrolPath(d: unknown): [number, number][] {
    return (d as BorderPatrolRoute).path;
  }

  function getPatrolTimestamps(d: unknown): number[] {
    return (d as BorderPatrolRoute).timestamps;
  }

  function getVehiclePosition(d: unknown): [number, number] {
    const v = d as PatrolVehicleDatum;
    return [v.lng, v.lat];
  }

  function getZonePolygon(d: unknown): [number, number][] {
    return (d as IntrusionZone).polygon;
  }

  function getZoneFillColor(d: unknown): [number, number, number, number] {
    const z = d as IntrusionZone;
    return z.alertLevel === 'high' ? [255, 40, 40, 60] : [255, 160, 0, 50];
  }

  function getZoneLineColor(d: unknown): [number, number, number, number] {
    const z = d as IntrusionZone;
    return z.alertLevel === 'high' ? [255, 40, 40, 180] : [255, 160, 0, 160];
  }

  async function initLayers(): Promise<void> {
    if (initialized) return;
    const [layersModule, geoModule] = await Promise.all([
      import('@deck.gl/layers'),
      import('@deck.gl/geo-layers'),
    ]);
    PathLayerClass = layersModule.PathLayer;
    PolygonLayerClass = layersModule.PolygonLayer;
    ScatterplotLayerClass = layersModule.ScatterplotLayer;
    TripsLayerClass = geoModule.TripsLayer;
    initialized = true;
    syncLayers();
  }

  function syncLayers(): void {
    if (
      !PathLayerClass ||
      !PolygonLayerClass ||
      !ScatterplotLayerClass ||
      !TripsLayerClass
    )
      return;

    const showBorder = props.visibleLayers.has('border');
    const showCameras = props.visibleLayers.has('cameras');
    const showPatrols = props.visibleLayers.has('patrols');
    const showZones = props.visibleLayers.has('zones');

    if (showBorder) {
      const borderLayer = new PathLayerClass({
        id: 'border-lac-line',
        data: [{ path: props.borderLine }],
        getPath: getBorderPath,
        getColor: [0, 200, 100, 200] as [number, number, number, number],
        widthMinPixels: 3,
        getDashArray: [8, 4],
        dashJustified: true,
        extensions: [],
      });
      updateLayer('border-lac-line', borderLayer);
    } else {
      removeLayer('border-lac-line');
    }

    if (showCameras) {
      const coneLayer = new PolygonLayerClass({
        id: 'border-camera-cones',
        data: props.cameras,
        getPolygon: getConePolygon,
        getFillColor: [0, 150, 255, 40] as [number, number, number, number],
        getLineColor: [0, 150, 255, 120] as [number, number, number, number],
        lineWidthMinPixels: 1,
        pickable: false,
      });
      updateLayer('border-camera-cones', coneLayer);

      const camData: CameraDatum[] = props.cameras.map((c) => ({
        lng: c.position[0],
        lat: c.position[1],
        cameraId: c.id,
        status: c.status,
      }));

      const camDots = new ScatterplotLayerClass({
        id: 'border-camera-dots',
        data: camData,
        getPosition: getCameraPosition,
        getFillColor: getCameraFillColor,
        getRadius: 8,
        radiusUnits: 'pixels' as const,
        stroked: true,
        getLineColor: [255, 255, 255, 180] as [number, number, number, number],
        lineWidthMinPixels: 2,
      });
      updateLayer('border-camera-dots', camDots);
    } else {
      removeLayer('border-camera-cones');
      removeLayer('border-camera-dots');
    }

    if (showPatrols) {
      for (const route of props.patrols) {
        const trailLayer = new TripsLayerClass({
          id: `border-trail-${route.id}`,
          data: [route],
          getPath: getPatrolPath,
          getTimestamps: getPatrolTimestamps,
          getColor: route.color as [number, number, number],
          currentTime: props.loopedTime,
          trailLength: 50,
          fadeTrail: true,
          widthMinPixels: 3,
          capRounded: true,
          jointRounded: true,
          opacity: 0.7,
        });
        updateLayer(`border-trail-${route.id}`, trailLayer);
      }

      const vehicleData: PatrolVehicleDatum[] = props.patrols
        .map((r) => {
          const pos = props.positions[r.id];
          if (!pos) return null;
          return { lng: pos.lng, lat: pos.lat, routeId: r.id };
        })
        .filter((d): d is PatrolVehicleDatum => d !== null);

      const vehicleLayer = new ScatterplotLayerClass({
        id: 'border-patrol-vehicles',
        data: vehicleData,
        getPosition: getVehiclePosition,
        getFillColor: [255, 220, 0, 230] as [number, number, number, number],
        getRadius: 10,
        radiusUnits: 'pixels' as const,
        stroked: true,
        getLineColor: [255, 255, 255, 200] as [number, number, number, number],
        lineWidthMinPixels: 2,
      });
      updateLayer('border-patrol-vehicles', vehicleLayer);
    } else {
      for (const route of props.patrols) {
        removeLayer(`border-trail-${route.id}`);
      }
      removeLayer('border-patrol-vehicles');
    }

    if (showZones) {
      const zoneLayer = new PolygonLayerClass({
        id: 'border-intrusion-zones',
        data: props.intrusionZones,
        getPolygon: getZonePolygon,
        getFillColor: getZoneFillColor,
        getLineColor: getZoneLineColor,
        lineWidthMinPixels: 2,
        pickable: false,
      });
      updateLayer('border-intrusion-zones', zoneLayer);
    } else {
      removeLayer('border-intrusion-zones');
    }
  }

  watch(
    [() => props.loopedTime, () => props.positions, () => props.visibleLayers],
    () => syncLayers(),
    { deep: true },
  );

  onMounted(() => {
    initLayers();
  });

  onUnmounted(() => {
    removeLayer('border-lac-line');
    removeLayer('border-camera-cones');
    removeLayer('border-camera-dots');
    for (const route of props.patrols) {
      removeLayer(`border-trail-${route.id}`);
    }
    removeLayer('border-patrol-vehicles');
    removeLayer('border-intrusion-zones');
  });
</script>

<template>
  <slot></slot>
</template>
