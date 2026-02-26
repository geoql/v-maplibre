import type { DronePosition, DroneFlightPath, DroneTrip } from '~/types/drone';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  return (Math.atan2(y, x) * RAD_TO_DEG + 360) % 360;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

function interpolateArc(
  coordinates: [number, number][],
  numPoints: number,
): [number, number][] {
  if (coordinates.length < 2) return coordinates;

  const distances: number[] = [0];
  let totalDist = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1]!;
    const [lon2, lat2] = coordinates[i]!;
    totalDist += haversineDistance(lat1!, lon1!, lat2!, lon2!);
    distances.push(totalDist);
  }

  const result: [number, number][] = [];
  const step = totalDist / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const targetDist = i * step;
    let segIdx = 0;

    for (let j = 1; j < distances.length; j++) {
      if (distances[j]! >= targetDist) {
        segIdx = j - 1;
        break;
      }
      segIdx = j - 1;
    }

    const segStart = distances[segIdx]!;
    const segEnd = distances[segIdx + 1] ?? segStart;
    const segLen = segEnd - segStart;
    const t = segLen > 0 ? (targetDist - segStart) / segLen : 0;

    const [lon1, lat1] = coordinates[segIdx]!;
    const [lon2, lat2] =
      coordinates[Math.min(segIdx + 1, coordinates.length - 1)]!;

    result.push([lon1! + (lon2! - lon1!) * t, lat1! + (lat2! - lat1!) * t]);
  }

  return result;
}

function calculateTotalDistance(coordinates: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1]!;
    const [lon2, lat2] = coordinates[i]!;
    total += haversineDistance(lat1!, lon1!, lat2!, lon2!);
  }
  return total;
}

function coordinatesToTrip(arcPoints: [number, number][]): DroneTrip {
  const timestamps = arcPoints.map((_, i) => i);
  return { path: arcPoints, timestamps };
}

export function useDroneAnimation() {
  const flightPath = ref<DroneFlightPath | null>(null);
  const arcPoints = ref<[number, number][]>([]);
  const tripData = ref<DroneTrip[]>([]);
  const currentTime = ref(0);
  const currentIndex = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);
  const progress = ref(0);
  const elapsedTime = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const ARC_POINTS = 500;
  const BASE_DURATION_SECONDS = 30;

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  const dronePosition = computed<DronePosition | null>(() => {
    if (arcPoints.value.length < 2) return null;
    const t = currentTime.value;
    const maxIdx = arcPoints.value.length - 1;

    // End-of-path: return last point with final bearing
    if (t >= maxIdx) {
      const lastPoint = arcPoints.value[maxIdx];
      const prevPoint = arcPoints.value[maxIdx - 1] ?? lastPoint;
      if (!lastPoint || !prevPoint) return null;
      const bearing = calculateBearing(
        prevPoint[1],
        prevPoint[0],
        lastPoint[1],
        lastPoint[0],
      );
      return { lng: lastPoint[0], lat: lastPoint[1], bearing };
    }

    // Fractional interpolation between arc points for sub-frame smoothness
    const idx = Math.floor(t);
    const frac = t - idx;
    const point = arcPoints.value[idx];
    const nextPoint = arcPoints.value[idx + 1];
    if (!point || !nextPoint) return null;

    const lng = point[0] + (nextPoint[0] - point[0]) * frac;
    const lat = point[1] + (nextPoint[1] - point[1]) * frac;

    // Look a few points ahead for stable bearing
    const bearingIdx = Math.min(idx + 3, maxIdx);
    const bearingPoint = arcPoints.value[bearingIdx]!;
    const bearing = calculateBearing(
      lat,
      lng,
      bearingPoint[1],
      bearingPoint[0],
    );

    return { lng, lat, bearing };
  });

  const flightStats = computed(() => ({
    totalDistance: flightPath.value?.totalDistance ?? 0,
    currentSpeed: speed.value * 60,
    altitude: 120,
    progress: progress.value,
    elapsedTime: elapsedTime.value,
  }));

  function animate(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying.value && arcPoints.value.length > 0) {
      const increment =
        (delta * speed.value * ARC_POINTS) / BASE_DURATION_SECONDS;
      const newIndex = currentTime.value + increment;

      if (newIndex >= arcPoints.value.length - 1) {
        currentIndex.value = arcPoints.value.length - 1;
        currentTime.value = arcPoints.value.length - 1;
        progress.value = 100;
        isPlaying.value = false;
      } else {
        currentIndex.value = Math.floor(newIndex);
        currentTime.value = newIndex;
        progress.value = (newIndex / (arcPoints.value.length - 1)) * 100;
      }
      elapsedTime.value += delta;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  async function loadGeoJSON(url: string): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await fetch(url);
      const geojson = await response.json();

      const feature = geojson.features?.[0];
      if (!feature?.geometry?.coordinates) {
        throw new Error('Invalid GeoJSON: no LineString coordinates found');
      }

      // Strip optional Z/altitude so deck.gl TripsLayer stays ground-level.
      const rawCoords = feature.geometry.coordinates as number[][];
      const coordinates: [number, number][] = rawCoords.map((c) => [
        c[0]!,
        c[1]!,
      ]);
      processCoordinates(coordinates);
      isLoading.value = false;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load flight path';
      isLoading.value = false;
    }
  }

  function loadFromFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target?.result as string);
        const feature = geojson.features?.[0] ?? geojson;
        const raw = (feature.geometry?.coordinates ??
          feature.coordinates) as number[][];
        const coordinates: [number, number][] = raw.map((c) => [c[0]!, c[1]!]);

        if (!coordinates || coordinates.length < 2) {
          error.value = 'Invalid GeoJSON: need at least 2 coordinates';
          return;
        }

        processCoordinates(coordinates);
      } catch {
        error.value = 'Failed to parse GeoJSON file';
      }
    };
    reader.readAsText(file);
  }

  function processCoordinates(coordinates: [number, number][]): void {
    const totalDistance = calculateTotalDistance(coordinates);
    flightPath.value = { coordinates, totalDistance };

    const interpolated = interpolateArc(coordinates, ARC_POINTS);
    arcPoints.value = interpolated;
    tripData.value = [coordinatesToTrip(interpolated)];

    resetAnimation();
  }

  function play(): void {
    if (progress.value >= 100) {
      resetAnimation();
    }
    isPlaying.value = true;
    lastTimestamp = 0;

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function pause(): void {
    isPlaying.value = false;
  }

  function resetAnimation(): void {
    isPlaying.value = false;
    currentIndex.value = 0;
    currentTime.value = 0;
    progress.value = 0;
    elapsedTime.value = 0;
    lastTimestamp = 0;
  }

  function setSpeed(newSpeed: number): void {
    speed.value = newSpeed;
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  return {
    flightPath,
    arcPoints,
    tripData,
    currentTime,
    currentIndex,
    isPlaying,
    speed,
    progress,
    elapsedTime,
    isLoading,
    error,
    dronePosition,
    flightStats,
    loadGeoJSON,
    loadFromFile,
    play,
    pause,
    resetAnimation,
    setSpeed,
    cleanup,
  };
}
