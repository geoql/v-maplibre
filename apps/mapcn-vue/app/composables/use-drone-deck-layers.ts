import type { DronePosition, DroneTrip, DroneIconSpec } from '~/types/drone';
import type { Map as MaplibreMap } from 'maplibre-gl';

// Inline SVG arrow pointing north — no external asset required, always works
const DRONE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><polygon points="64,6 90,122 64,104 38,122" fill="white"/></svg>`;
const DRONE_ICON_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DRONE_SVG)}`;
const DRONE_ICON_SPEC: DroneIconSpec = {
  url: DRONE_ICON_URL,
  width: 128,
  height: 128,
  anchorX: 64,
  anchorY: 64,
  mask: true,
};

interface DroneDeckLayersOptions {
  map: Ref<MaplibreMap | null>;
  tripData: Ref<DroneTrip[]>;
  currentTime: Ref<number>;
  dronePosition: Ref<DronePosition | null>;
}

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

function getDroneAngle(d: unknown): number {
  return (d as DronePosition).bearing;
}

function getDroneIcon(): DroneIconSpec {
  return DRONE_ICON_SPEC;
}

function getDroneColor(): [number, number, number, number] {
  return [140, 120, 255, 255];
}

export function useDroneDeckLayers(options: DroneDeckLayersOptions) {
  const { map, tripData, currentTime, dronePosition } = options;

  let overlay: InstanceType<
    typeof import('@deck.gl/mapbox').MapboxOverlay
  > | null = null;
  let TripsLayerClass: typeof import('@deck.gl/geo-layers').TripsLayer | null =
    null;
  let IconLayerClass: typeof import('@deck.gl/layers').IconLayer | null = null;

  async function initOverlay(mapInstance: MaplibreMap): Promise<void> {
    const [mapboxModule, geoModule, layersModule] = await Promise.all([
      import('@deck.gl/mapbox'),
      import('@deck.gl/geo-layers'),
      import('@deck.gl/layers'),
    ]);
    TripsLayerClass = geoModule.TripsLayer;
    IconLayerClass = layersModule.IconLayer;

    overlay = new mapboxModule.MapboxOverlay({
      interleaved: false,
      layers: [],
    });

    mapInstance.addControl(overlay);
    syncLayers();
  }

  function buildLayers(): unknown[] {
    if (!TripsLayerClass || !IconLayerClass) return [];

    const layers: unknown[] = [];

    if (tripData.value.length > 0) {
      layers.push(
        new TripsLayerClass({
          id: 'drone-shadow',
          data: tripData.value,
          getPath,
          getTimestamps,
          getColor: getShadowColor,
          currentTime: currentTime.value,
          trailLength: 120,
          fadeTrail: true,
          widthMinPixels: 10,
          capRounded: true,
          jointRounded: true,
          opacity: 0.3,
        }),
      );
    }

    if (tripData.value.length > 0) {
      layers.push(
        new TripsLayerClass({
          id: 'drone-trail',
          data: tripData.value,
          getPath,
          getTimestamps,
          getColor: getTripColor,
          currentTime: currentTime.value,
          trailLength: 80,
          fadeTrail: true,
          widthMinPixels: 4,
          capRounded: true,
          jointRounded: true,
          opacity: 0.8,
        }),
      );
    }

    const pos = dronePosition.value;
    if (pos) {
      layers.push(
        new IconLayerClass({
          id: 'drone-icon',
          data: [pos],
          getPosition: getDronePosition,
          getAngle: getDroneAngle,
          getIcon: getDroneIcon,
          getColor: getDroneColor,
          getSize: 48,
          sizeUnits: 'pixels' as const,
          billboard: true,
          pickable: false,
          alphaCutoff: 0.05,
        }),
      );
    }

    return layers;
  }

  function syncLayers(): void {
    if (!overlay) return;
    const builtLayers = buildLayers();
    overlay.setProps({ layers: builtLayers as never });
  }

  watch([tripData, currentTime, dronePosition], () => syncLayers(), {
    deep: true,
  });

  watch(
    map,
    (mapInstance) => {
      if (!mapInstance || overlay) return;

      if (mapInstance.isStyleLoaded()) {
        initOverlay(mapInstance);
      } else {
        mapInstance.once('style.load', () => {
          initOverlay(mapInstance);
        });
      }
    },
    { immediate: true },
  );

  function cleanup(): void {
    if (overlay && map.value) {
      try {
        map.value.removeControl(overlay);
        overlay.finalize();
      } catch {
        /* noop */
      }
    }
    overlay = null;
  }

  onUnmounted(cleanup);

  return { cleanup };
}
