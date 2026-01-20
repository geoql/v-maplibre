import { ref, computed, onMounted, onUnmounted } from 'vue';
import type {
  ACTransitBusData,
  ACTransitRouteStopPrediction,
  BusFeature,
  BusTrail,
  StopFeature,
  TripAverageSpeeds,
  ActiveStopFilter,
} from '~/types/actransit';

const API_BASE = 'https://actransit.val.run';
const REFRESH_INTERVAL_MS = 30000;
const MAX_MINUTES_AGO = 8;

function isValidCoordinate(lng: number, lat: number): boolean {
  return (
    !isNaN(lng) &&
    !isNaN(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

function convertBusDataToFeatures(busData: ACTransitBusData[]): BusFeature[] {
  return busData
    .filter((item) => item.vehicle?.trip)
    .map((item) => {
      const { vehicle } = item;
      const lng = vehicle.position.longitude;
      const lat = vehicle.position.latitude;

      return {
        tripId: vehicle.trip!.tripId,
        routeId: vehicle.trip!.routeId,
        coordinates: [lng, lat] as [number, number],
        bearing: vehicle.position.bearing ?? 0,
        speed: vehicle.position.speed ?? 0,
        timestamp: vehicle.timestamp,
      };
    })
    .filter((feature) =>
      isValidCoordinate(feature.coordinates[0], feature.coordinates[1]),
    );
}

function buildTrailsFromHistory(
  historyData: ACTransitBusData[][],
  currentBuses: BusFeature[],
): BusTrail[] {
  const currentTime = Date.now() / 1000;
  const maxMinutesAgo = currentTime - MAX_MINUTES_AGO * 60;

  const tripGroups: Record<
    string,
    { coordinates: [number, number][]; timestamps: number[]; routeId: string }
  > = {};

  historyData.forEach((snapshot) => {
    const features = convertBusDataToFeatures(snapshot);
    features.forEach((feature) => {
      if (feature.timestamp < maxMinutesAgo) return;

      if (!tripGroups[feature.tripId]) {
        tripGroups[feature.tripId] = {
          coordinates: [],
          timestamps: [],
          routeId: feature.routeId,
        };
      }
      const tripGroup = tripGroups[feature.tripId]!;
      tripGroup.coordinates.push(feature.coordinates);
      tripGroup.timestamps.push(feature.timestamp);
    });
  });

  const currentBusMap = new Map<string, BusFeature>();
  currentBuses.forEach((bus) => currentBusMap.set(bus.tripId, bus));

  return Object.entries(tripGroups)
    .filter(([_, group]) => group.coordinates.length > 1)
    .map(([tripId, group]): BusTrail => {
      const sorted = group.coordinates
        .map((coord, i) => ({ coord, ts: group.timestamps[i] as number }))
        .sort((a, b) => a.ts - b.ts);

      const path: [number, number][] = sorted.map((s) => s.coord);
      const timestamps: number[] = sorted.map((s) => s.ts);

      const currentBus = currentBusMap.get(tripId);
      if (currentBus) {
        path.push(currentBus.coordinates);
        timestamps.push(currentBus.timestamp);
      }

      return {
        tripId,
        routeId: group.routeId,
        path,
        timestamps,
      };
    });
}

function calculateTripAverageSpeeds(
  historyData: ACTransitBusData[][],
): TripAverageSpeeds {
  const tripSpeeds: Record<string, number[]> = {};

  historyData.forEach((snapshot) => {
    snapshot.forEach((item) => {
      const tripId = item.vehicle?.trip?.tripId;
      const speed = item.vehicle?.position?.speed;

      if (tripId && speed !== undefined) {
        if (!tripSpeeds[tripId]) {
          tripSpeeds[tripId] = [];
        }
        tripSpeeds[tripId].push(speed);
      }
    });
  });

  const averages: TripAverageSpeeds = {};
  Object.entries(tripSpeeds).forEach(([tripId, speeds]) => {
    averages[tripId] = Math.round(
      speeds.reduce((sum, s) => sum + s, 0) / speeds.length,
    );
  });

  return averages;
}

function extractUniqueStops(
  predictions: ACTransitRouteStopPrediction[],
): StopFeature[] {
  const stopMap = new Map<string, StopFeature>();

  predictions.forEach((route) => {
    const stops = route.processedStops?.['bustime-response']?.stops;
    if (!stops) return;

    stops.forEach((stop) => {
      if (!stop.stpid || !stop.lat || !stop.lon) return;

      if (!stopMap.has(stop.stpid)) {
        stopMap.set(stop.stpid, {
          stpid: stop.stpid,
          name: stop.stpnm,
          coordinates: [stop.lon, stop.lat],
          routeNames: [],
        });
      }

      const existing = stopMap.get(stop.stpid)!;
      if (!existing.routeNames.includes(route.routeName)) {
        existing.routeNames.push(route.routeName);
      }
    });
  });

  return Array.from(stopMap.values());
}

export function useActransitData() {
  const buses = ref<BusFeature[]>([]);
  const trails = ref<BusTrail[]>([]);
  const stops = ref<StopFeature[]>([]);
  const tripAverageSpeeds = ref<TripAverageSpeeds>({});

  const loading = ref(false);
  const error = ref<string | null>(null);
  const routeFilter = ref('');
  const activeStopFilter = ref<ActiveStopFilter | null>(null);
  const selectedTripId = ref<string | null>(null);

  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  const filteredBuses = computed(() => {
    let result = buses.value;

    if (routeFilter.value.trim()) {
      result = result.filter((bus) =>
        bus.routeId.includes(routeFilter.value.trim()),
      );
    }

    if (activeStopFilter.value?.routeNames.length) {
      result = result.filter((bus) =>
        activeStopFilter.value!.routeNames.includes(bus.routeId),
      );
    }

    return result;
  });

  const filteredTrails = computed(() => {
    let result = trails.value;

    if (routeFilter.value.trim()) {
      result = result.filter((trail) =>
        trail.routeId.includes(routeFilter.value.trim()),
      );
    }

    if (activeStopFilter.value?.routeNames.length) {
      result = result.filter((trail) =>
        activeStopFilter.value!.routeNames.includes(trail.routeId),
      );
    }

    return result;
  });

  const filteredStops = computed(() => {
    let result = stops.value;

    if (routeFilter.value.trim()) {
      result = result.filter((stop) =>
        stop.routeNames.some((name) => name.includes(routeFilter.value.trim())),
      );
    }

    if (activeStopFilter.value?.routeNames.length) {
      result = result.filter((stop) =>
        stop.routeNames.some((name) =>
          activeStopFilter.value!.routeNames.includes(name),
        ),
      );
    }

    return result;
  });

  const selectedTrail = computed(() => {
    if (!selectedTripId.value) return null;
    return (
      filteredTrails.value.find((t) => t.tripId === selectedTripId.value) ??
      null
    );
  });

  async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
      const [busResponse, historyResponse, stopsResponse] = await Promise.all([
        fetch(`${API_BASE}/bus_locations`),
        fetch(`${API_BASE}/bus_locations_history`),
        fetch(`${API_BASE}/route_stop_predictions`),
      ]);

      if (!busResponse.ok) throw new Error('Failed to fetch bus locations');
      if (!historyResponse.ok) throw new Error('Failed to fetch bus history');
      if (!stopsResponse.ok) throw new Error('Failed to fetch stops');

      const busData: ACTransitBusData[] = await busResponse.json();
      const historyData: ACTransitBusData[][] = await historyResponse.json();
      const stopsData: ACTransitRouteStopPrediction[] =
        await stopsResponse.json();

      buses.value = convertBusDataToFeatures(busData);
      trails.value = buildTrailsFromHistory(historyData, buses.value);
      stops.value = extractUniqueStops(stopsData);
      tripAverageSpeeds.value = calculateTripAverageSpeeds(historyData);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      console.error('ACTransit data fetch error:', e);
    } finally {
      loading.value = false;
    }
  }

  function selectTrip(tripId: string | null) {
    selectedTripId.value = tripId;
  }

  function selectStop(stop: StopFeature | null) {
    if (stop) {
      activeStopFilter.value = {
        stpid: stop.stpid,
        routeNames: stop.routeNames,
      };
    } else {
      activeStopFilter.value = null;
    }
  }

  function clearFilters() {
    routeFilter.value = '';
    activeStopFilter.value = null;
    selectedTripId.value = null;
  }

  function startAutoRefresh() {
    if (refreshInterval) return;
    refreshInterval = setInterval(fetchData, REFRESH_INTERVAL_MS);
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterFromUrl = urlParams.get('route');
    if (filterFromUrl) {
      routeFilter.value = filterFromUrl;
    }

    fetchData();
    startAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  watch(routeFilter, (newFilter) => {
    const url = new URL(window.location.href);
    if (newFilter.trim()) {
      url.searchParams.set('route', newFilter.trim());
    } else {
      url.searchParams.delete('route');
    }
    window.history.replaceState({}, '', url);
  });

  return {
    buses: filteredBuses,
    trails: filteredTrails,
    stops: filteredStops,
    selectedTrail,
    tripAverageSpeeds,

    totalBuses: computed(() => buses.value.length),
    loading,
    error,

    routeFilter,
    activeStopFilter,
    selectedTripId,

    fetchData,
    selectTrip,
    selectStop,
    clearFilters,
  };
}
