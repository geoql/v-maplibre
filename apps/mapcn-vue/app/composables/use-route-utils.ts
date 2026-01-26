import type { Map as MaplibreMap } from 'maplibre-gl';
import type {
  TripActivityType,
  ActivityBadgeStyle,
  ValhallaResponse,
  RouteOption,
  RouteLegInfo,
} from '~/types/route';

export function useRouteUtils() {
  const { mapStyle } = useMapStyle();

  return {
    mapStyle,
  };
}

export function decodePolyline(
  encoded: string,
  precision: number = 6,
): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const factor = Math.pow(10, precision);

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
}

export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function formatDistanceKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatArrivalTime(totalSeconds: number): string {
  const now = new Date();
  now.setSeconds(now.getSeconds() + totalSeconds);
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getCumulativeDuration(
  stopIndex: number,
  legs: RouteLegInfo[],
): number {
  let total = 0;
  for (let i = 0; i < stopIndex && i < legs.length; i++) {
    const leg = legs[i];
    if (leg) {
      total += leg.duration;
    }
  }
  return total;
}

export async function reverseGeocode(
  coords: [number, number],
): Promise<string> {
  try {
    const data = await $fetch<{ name: string }>(
      `/api/geocode?lat=${coords[1]}&lon=${coords[0]}`,
    );
    return data.name;
  } catch {
    return 'Unknown location';
  }
}

export function getActivityBadge(type: TripActivityType): ActivityBadgeStyle {
  if (type === 'Attraction') {
    return {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      icon: 'lucide:landmark',
    };
  }
  return {
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-600 dark:text-zinc-400',
    icon: 'lucide:utensils',
  };
}

export function parseValhallaRoutes(data: ValhallaResponse): RouteOption[] {
  const routes: RouteOption[] = [];

  if (data.trip?.legs?.[0]?.shape) {
    routes.push({
      coordinates: decodePolyline(data.trip.legs[0].shape),
      duration: data.trip.summary.time,
      distance: data.trip.summary.length * 1000,
    });
  }

  if (data.alternates) {
    for (const alt of data.alternates) {
      if (alt.trip?.legs?.[0]?.shape) {
        routes.push({
          coordinates: decodePolyline(alt.trip.legs[0].shape),
          duration: alt.trip.summary.time,
          distance: alt.trip.summary.length * 1000,
        });
      }
    }
  }

  return routes;
}

export function parseValhallaMultiStopRoute(data: ValhallaResponse): {
  coordinates: [number, number][];
  legs: RouteLegInfo[];
  totalDuration: number;
  totalDistance: number;
  optimizedOrder: number[];
} {
  const allCoordinates: [number, number][] = [];
  const legs: RouteLegInfo[] = [];

  if (data.trip?.legs) {
    for (const leg of data.trip.legs) {
      const legCoords = decodePolyline(leg.shape);
      allCoordinates.push(...legCoords);
      legs.push({
        distance: leg.summary.length,
        duration: leg.summary.time,
        summary: leg.summary.name || 'Via local roads',
      });
    }
  }

  const optimizedOrder = data.trip?.locations
    ? data.trip.locations.map((loc) => loc.original_index)
    : [];

  return {
    coordinates: allCoordinates,
    legs,
    totalDuration: data.trip?.summary?.time || 0,
    totalDistance: data.trip?.summary?.length || 0,
    optimizedOrder,
  };
}

export function fitMapToBounds(
  map: MaplibreMap,
  coordinates: [number, number][],
  padding = { top: 60, bottom: 60, left: 60, right: 60 },
  maxZoom = 14,
) {
  const lngs = coordinates.map((c) => c[0]);
  const lats = coordinates.map((c) => c[1]);

  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];

  map.fitBounds(bounds, { padding, maxZoom });
}
