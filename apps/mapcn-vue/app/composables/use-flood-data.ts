import type {
  FloodPoint,
  FloodSeverity,
  GroundsourceResponse,
  ReverseGeocodeResult,
  SelectedFloodPoint,
} from '~/types/flood';

const AREA_MAJOR = 500;
const AREA_SIGNIFICANT = 100;
const AREA_MODERATE = 10;

const MIN_YEAR = 2000;
const MAX_YEAR = 2026;

function getSeverity(areaKm2: number): FloodSeverity {
  if (areaKm2 > AREA_MAJOR) return 'major';
  if (areaKm2 > AREA_SIGNIFICANT) return 'significant';
  if (areaKm2 > AREA_MODERATE) return 'moderate';
  return 'localized';
}

function getAreaColor(areaKm2: number): [number, number, number, number] {
  if (areaKm2 > AREA_MAJOR) return [220, 38, 38, 255];
  if (areaKm2 > AREA_SIGNIFICANT) return [249, 115, 22, 230];
  if (areaKm2 > AREA_MODERATE) return [59, 130, 246, 200];
  return [56, 189, 248, 160];
}

function getAreaRadius(areaKm2: number): number {
  if (areaKm2 > AREA_MAJOR) return 25000;
  if (areaKm2 > AREA_SIGNIFICANT) return 18000;
  if (areaKm2 > AREA_MODERATE) return 12000;
  return 8000;
}

export function useFloodData() {
  const floodPoints = shallowRef<FloodPoint[]>([]);
  const loading = ref(true);
  const progress = ref(0);
  const total = ref(0);
  const loaded = ref(0);
  const error = ref<string | null>(null);
  const selectedPoint = ref<SelectedFloodPoint | null>(null);
  const currentYear = new Date().getFullYear();
  const defaultEnd = Math.min(currentYear, MAX_YEAR);
  const defaultStart = Math.max(defaultEnd - 2, MIN_YEAR);
  const yearRange = ref<[number, number]>([defaultStart, defaultEnd]);

  // Year-bucketed index: O(1) range lookups instead of O(2.6M) filter scans
  const yearBuckets = new Map<number, FloodPoint[]>();

  // Throttled range: slider UI updates instantly, deck.gl re-renders at most every 100ms
  const throttledYearRange = refThrottled(yearRange, 100);

  const yearCounts = computed(() => {
    if (floodPoints.value.length === 0) return [];
    const counts: number[] = [];
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
      counts.push(yearBuckets.get(y)?.length ?? 0);
    }
    return counts;
  });

  const filteredPoints = computed(() => {
    const points = floodPoints.value;
    const [minY, maxY] = throttledYearRange.value;
    if (minY <= MIN_YEAR && maxY >= MAX_YEAR) return points;

    let result: FloodPoint[] = [];
    for (let y = minY; y <= maxY; y++) {
      const bucket = yearBuckets.get(y);
      if (bucket) result = result.concat(bucket);
    }
    return markRaw(result);
  });

  async function fetchAllPages() {
    loading.value = true;
    error.value = null;
    progress.value = 0;
    loaded.value = 0;

    try {
      let cursor = 0;
      let hasMore = true;
      let allPoints: FloodPoint[] = [];

      while (hasMore) {
        const response = await $fetch<GroundsourceResponse>(
          `/api/groundsource?cursor=${cursor}&limit=500000`,
        );

        if (total.value === 0) {
          total.value = response.total;
        }

        for (const point of response.data) {
          const year = point[3];
          let bucket = yearBuckets.get(year);
          if (!bucket) {
            bucket = [];
            yearBuckets.set(year, bucket);
          }
          bucket.push(point);
        }

        allPoints = allPoints.concat(response.data);
        loaded.value = allPoints.length;
        progress.value =
          total.value > 0 ? Math.round((loaded.value / total.value) * 100) : 0;

        floodPoints.value = markRaw(allPoints);

        if (response.nextCursor !== null) {
          cursor = response.nextCursor;
        } else {
          hasMore = false;
        }
      }
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Failed to fetch flood data';
    } finally {
      loading.value = false;
    }
  }

  async function selectPoint(point: FloodPoint) {
    const coords: [number, number] = [point[0], point[1]];
    selectedPoint.value = {
      coordinates: coords,
      areaKm2: point[2],
      severity: getSeverity(point[2]),
      year: point[3],
      locationName: null,
      locationLoading: true,
    };

    const isSamePoint = () =>
      selectedPoint.value?.coordinates[0] === coords[0] &&
      selectedPoint.value?.coordinates[1] === coords[1];

    try {
      const geo = await $fetch<ReverseGeocodeResult>('/api/geocode', {
        query: { lat: point[1], lon: point[0] },
      });
      const current = selectedPoint.value;
      if (current && isSamePoint()) {
        const parts = geo.displayName?.split(', ') ?? [];
        current.locationName =
          parts.length > 2 ? parts.slice(0, 3).join(', ') : geo.name;
        current.locationLoading = false;
      }
    } catch {
      const current = selectedPoint.value;
      if (current && isSamePoint()) {
        current.locationName = null;
        current.locationLoading = false;
      }
    }
  }

  function clearSelection() {
    selectedPoint.value = null;
  }

  onMounted(() => {
    fetchAllPages();
  });

  return {
    floodPoints,
    filteredPoints,
    loading,
    progress,
    total,
    loaded,
    error,
    selectedPoint,
    yearRange,
    yearCounts,
    selectPoint,
    clearSelection,
    getAreaColor,
    getAreaRadius,
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
  };
}
