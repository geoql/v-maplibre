import type {
  NYCBorough,
  SnowPriority,
  DSNYStreetRecord,
  SnowStreetFeature,
  SnowStreetCollection,
} from '~/types/nyc-snow';
import { PLOW_COLOR_STOPS, BOROUGH_MAP } from '~/types/nyc-snow';

const DSNY_API_BASE = 'https://data.cityofnewyork.us/resource/sh4i-rsb8.json';
const STREET_LIMIT = 3000;
const BUFFER_WIDTH = 8e-5;

const PLOW_HOURS_BY_PRIORITY: Record<SnowPriority, [number, number]> = {
  C: [0, 4],
  S: [2, 8],
  H: [4, 12],
  V: [8, 24],
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getPlowColor(hours: number): string {
  for (let i = PLOW_COLOR_STOPS.length - 1; i >= 0; i--) {
    const stop = PLOW_COLOR_STOPS[i];
    if (stop && hours >= stop.hours) {
      return stop.color;
    }
  }
  return PLOW_COLOR_STOPS[0]?.color ?? '#00b894';
}

function lineToPolygon(
  coords: [number, number][],
  width: number,
): [number, number][][] {
  if (coords.length < 2) return [];

  const left: [number, number][] = [];
  const right: [number, number][] = [];

  for (let i = 0; i < coords.length; i++) {
    const current = coords[i]!;
    const x = current[0];
    const y = current[1];
    let dx: number, dy: number;

    if (i < coords.length - 1) {
      const next = coords[i + 1]!;
      dx = next[0] - x;
      dy = next[1] - y;
    } else {
      const prev = coords[i - 1]!;
      dx = x - prev[0];
      dy = y - prev[1];
    }

    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = (-dy / len) * width;
    const ny = (dx / len) * width;

    left.push([x + nx, y + ny]);
    right.push([x - nx, y - ny]);
  }

  const firstLeft = left[0];
  if (!firstLeft) return [];

  const ring: [number, number][] = [
    ...left,
    ...right.reverse(),
    firstLeft,
  ];

  return [ring];
}

function simulatePlowHours(priority: SnowPriority, seed: number): number {
  const [min, max] = PLOW_HOURS_BY_PRIORITY[priority];
  return min + seededRandom(seed) * (max - min);
}

function calcSnowDepth(hoursSincePlowed: number, snowfallRate: number): number {
  if (snowfallRate === 0) return 0;
  return Math.min(Math.max(0, hoursSincePlowed * snowfallRate), 24);
}

function buildSnowFeature(
  record: DSNYStreetRecord,
  snowfallRate: number,
  index: number,
): SnowStreetFeature | null {
  if (!record.line?.coordinates || record.line.coordinates.length < 2) {
    return null;
  }

  const polygon = lineToPolygon(record.line.coordinates, BUFFER_WIDTH);
  if (polygon.length === 0) return null;

  const priority = (['C', 'S', 'H', 'V'].includes(record.snowpriority)
    ? record.snowpriority
    : 'V') as SnowPriority;

  const hoursSincePlowed = simulatePlowHours(
    priority,
    index + Number.parseInt(record.physicalid, 10),
  );
  const snowDepth = calcSnowDepth(hoursSincePlowed, snowfallRate);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: polygon,
    },
    properties: {
      physicalid: record.physicalid,
      streetname: record.streetname,
      snowPriority: priority,
      hoursSincePlowed,
      snowDepth,
      plowColor: getPlowColor(hoursSincePlowed),
    },
  };
}

export function useNYCSnow() {
  const borough = ref<NYCBorough>('1');
  const snowfallRate = ref(1.5);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const rawStreets = ref<DSNYStreetRecord[]>([]);

  const boroughInfo = computed(() => BOROUGH_MAP[borough.value]);

  const snowGeoJson = computed<SnowStreetCollection>(() => {
    const features: SnowStreetFeature[] = [];
    const streets = rawStreets.value;

    for (let i = 0; i < streets.length; i++) {
      const record = streets[i];
      if (!record) continue;
      const feature = buildSnowFeature(record, snowfallRate.value, i);
      if (feature) features.push(feature);
    }

    return { type: 'FeatureCollection', features };
  });

  const streetCount = computed(() => snowGeoJson.value.features.length);

  const totalSnow24h = computed(() => {
    const rate = snowfallRate.value;
    return (rate * 24).toFixed(1);
  });

  async function fetchStreets(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        $limit: String(STREET_LIMIT),
        $where: `borough='${borough.value}'`,
        $select:
          'physicalid,streetname,snowpriority,borough,segmentlength,line',
      });

      const response = await fetch(`${DSNY_API_BASE}?${params}`);

      if (!response.ok) {
        throw new Error(`NYC Open Data: ${response.status}`);
      }

      const data = (await response.json()) as DSNYStreetRecord[];
      rawStreets.value = data.filter(
        (r) => r.line?.coordinates?.length >= 2,
      );
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Failed to fetch street data';
    } finally {
      loading.value = false;
    }
  }

  function changeBorough(newBorough: NYCBorough): void {
    borough.value = newBorough;
    fetchStreets();
  }

  onMounted(() => {
    fetchStreets();
  });

  return {
    borough,
    snowfallRate,
    loading,
    error,
    boroughInfo,
    snowGeoJson,
    streetCount,
    totalSnow24h,
    changeBorough,
    fetchStreets,
  };
}
