import type {
  ValhallaLocation,
  ConvoyDef,
  ConvoyRouteResult,
} from '../../types/convoy';

const CONVOYS: ConvoyDef[] = [
  {
    id: 'supply-1',
    start: [73.02, 26.29],
    end: [71.38, 25.75],
    checkpointLabels: [
      'Jodhpur Depot',
      'Phalodi Fwd',
      'Balotra Jn',
      'Barmer HQ',
    ],
  },
  {
    id: 'supply-2',
    start: [73.02, 26.29],
    end: [70.91, 26.91],
    checkpointLabels: [
      'Jodhpur Depot',
      'Osian Pass',
      'Pokaran Range',
      'Jaisalmer Fort',
    ],
  },
  {
    id: 'medevac-1',
    start: [71.38, 25.75],
    end: [70.91, 26.91],
    checkpointLabels: ['Barmer Aid Stn', 'Sanchor Cross', 'Jaisalmer Hosp'],
  },
];

function decodePolyline(encoded: string, precision = 6): [number, number][] {
  const coords: [number, number][] = [];
  let idx = 0;
  let lat = 0;
  let lng = 0;
  const factor = Math.pow(10, precision);

  while (idx < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(idx++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(idx++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lng / factor, lat / factor]);
  }
  return coords;
}

async function fetchValhallaRoute(
  start: [number, number],
  end: [number, number],
): Promise<{
  path: [number, number][];
  distanceKm: number;
  durationSeconds: number;
}> {
  const locations: ValhallaLocation[] = [
    { lat: start[1], lon: start[0], type: 'break' },
    { lat: end[1], lon: end[0], type: 'break' },
  ];
  const params = {
    locations,
    costing: 'auto',
    directions_options: { units: 'kilometers' },
  };
  const url = `https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(JSON.stringify(params))}`;
  const data = await $fetch<Record<string, unknown>>(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'mapcn-vue/1.0' },
  });

  const trip = data.trip as Record<string, unknown> | undefined;
  const legs = trip?.legs as Record<string, unknown>[] | undefined;
  const shape = legs?.[0]?.shape as string | undefined;
  const summary = trip?.summary as Record<string, number> | undefined;

  if (!shape) return { path: [], distanceKm: 0, durationSeconds: 0 };

  return {
    path: decodePolyline(shape),
    distanceKm: summary?.length ?? 0,
    durationSeconds: summary?.time ?? 0,
  };
}

function buildCheckpoints(
  path: [number, number][],
  labels: string[],
): ConvoyRouteResult['checkpoints'] {
  return labels.map((label, i) => {
    const pathIndex = Math.round((i / (labels.length - 1)) * (path.length - 1));
    return {
      label,
      position: path[pathIndex] ?? path[0]!,
      pathIndex,
    };
  });
}

export default defineEdgeCachedHandler(
  async () => {
    const results = await Promise.all(
      CONVOYS.map(async (convoy): Promise<ConvoyRouteResult> => {
        const { path, distanceKm, durationSeconds } = await fetchValhallaRoute(
          convoy.start,
          convoy.end,
        );
        return {
          convoyId: convoy.id,
          path,
          timestamps: path.map((_, i) => i),
          distanceKm,
          durationSeconds,
          checkpoints: buildCheckpoints(path, convoy.checkpointLabels),
        };
      }),
    );
    return results;
  },
  {
    maxAge: 60 * 60 * 24,
  },
);
