import type {
  OverpassElement,
  OverpassResponse,
  Activity,
  DayPlan,
  TripResponse,
  Waypoint,
} from '../../types/trip-planner';

const ACTIVITY_TIMES = ['9:00 AM', '12:00 PM', '3:00 PM', '7:00 PM'] as const;
const HOTEL_PRICES = [
  '$150',
  '$180',
  '$220',
  '$250',
  '$280',
  '$320',
  '$350',
] as const;
const DAILY_FOOD_AND_ACTIVITIES_COST = 100;
const AVG_HOTEL_COST = 220;

/**
 * Overpass' public instances are rate limited and regularly answer 429/502 or
 * queue a single request for 30s+. The route has to answer in seconds, so:
 *   - ONE lookup per waypoint (the three POI categories share a single
 *     union query) keeps the load at one request per stop instead of three,
 *   - every waypoint is looked up in PARALLEL, so the response time is the
 *     slowest lookup instead of the sum of all of them,
 *   - the mirrors are tried in order, so a flaky instance falls through to a
 *     healthy one instead of failing the whole route,
 *   - every lookup has a HARD timeout, so a stalled Overpass degrades to the
 *     generic activity names instead of leaving the page on
 *     "Planning your adventure…" for minutes.
 */
const OVERPASS_ENDPOINTS = [
  { url: 'https://overpass-api.de/api/interpreter', timeoutMs: 20_000 },
  { url: 'https://overpass.kumi.systems/api/interpreter', timeoutMs: 5_000 },
];
const POI_RADIUS_M = 5_000;

const DEFAULT_WAYPOINTS: Waypoint[] = [
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Big Sur', lat: 36.2704, lon: -121.9067 },
  { name: 'Santa Barbara', lat: 34.4208, lon: -119.6982 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
];

type PoiKind = 'attraction' | 'restaurant' | 'hotel';

interface PoiBuckets {
  attractions: OverpassElement[];
  restaurants: OverpassElement[];
  hotels: OverpassElement[];
}

function emptyPoiBuckets(): PoiBuckets {
  return { attractions: [], restaurants: [], hotels: [] };
}

function buildPoiQuery(lat: number, lon: number, radius: number): string {
  return `
      [out:json][timeout:20];
      (
        node["tourism"="attraction"](around:${radius},${lat},${lon});
        node["tourism"="museum"](around:${radius},${lat},${lon});
        node["tourism"="viewpoint"](around:${radius},${lat},${lon});
        node["historic"](around:${radius},${lat},${lon});
        way["tourism"="attraction"](around:${radius},${lat},${lon});
        way["tourism"="museum"](around:${radius},${lat},${lon});
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["amenity"="cafe"](around:${radius},${lat},${lon});
        node["tourism"="hotel"](around:${radius},${lat},${lon});
        way["tourism"="hotel"](around:${radius},${lat},${lon});
      );
      out center 200;
    `;
}

function classifyPoi(element: OverpassElement): PoiKind | null {
  const tags = element.tags;
  if (!tags) return null;
  if (tags.tourism === 'hotel') return 'hotel';
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe') {
    return 'restaurant';
  }
  if (
    tags.tourism === 'attraction' ||
    tags.tourism === 'museum' ||
    tags.tourism === 'viewpoint' ||
    tags.historic !== undefined
  ) {
    return 'attraction';
  }
  return null;
}

async function fetchPOIs(
  lat: number,
  lon: number,
  radius: number,
): Promise<PoiBuckets> {
  const buckets = emptyPoiBuckets();
  const query = buildPoiQuery(lat, lon, radius);

  let response: OverpassResponse | null = null;
  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const result = await $fetch<OverpassResponse>(endpoint.url, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'mapcn-vue/1.0 (https://mapcn-vue.geoql.in)',
        },
        timeout: endpoint.timeoutMs,
      });
      if (!Array.isArray(result?.elements)) {
        // Overpass answers 200 with a remark/error body when the query could
        // not be executed — that is a failed lookup, not an empty result.
        lastError = new Error('Overpass returned no elements');
        continue;
      }
      response = result;
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!response) throw lastError ?? new Error('Overpass lookup failed');

  for (const element of response.elements) {
    if (!element.tags?.name) continue;
    const kind = classifyPoi(element);
    if (kind === 'attraction') buckets.attractions.push(element);
    else if (kind === 'restaurant') buckets.restaurants.push(element);
    else if (kind === 'hotel') buckets.hotels.push(element);
  }

  return buckets;
}

function getCoordinates(el: OverpassElement): [number, number] {
  if (el.lat && el.lon) return [el.lon, el.lat];
  if (el.center) return [el.center.lon, el.center.lat];
  return [0, 0];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = current;
  }
  return shuffled;
}

function createMorningActivity(
  attraction: OverpassElement | undefined,
  waypoint: Waypoint,
): Activity {
  if (attraction) {
    return {
      name: `Visit ${attraction.tags?.name}`,
      type: 'Attraction',
      time: ACTIVITY_TIMES[0],
      coordinates: getCoordinates(attraction),
    };
  }
  return {
    name: `Explore ${waypoint.name}`,
    type: 'Attraction',
    time: ACTIVITY_TIMES[0],
    coordinates: [waypoint.lon, waypoint.lat],
  };
}

function createLunchActivity(
  restaurant: OverpassElement | undefined,
  waypoint: Waypoint,
): Activity {
  if (restaurant) {
    return {
      name: `Lunch at ${restaurant.tags?.name}`,
      type: 'Dining',
      time: ACTIVITY_TIMES[1],
      coordinates: getCoordinates(restaurant),
    };
  }
  return {
    name: `Lunch in ${waypoint.name}`,
    type: 'Dining',
    time: ACTIVITY_TIMES[1],
    coordinates: [waypoint.lon, waypoint.lat],
  };
}

function createAfternoonActivity(
  attraction: OverpassElement | undefined,
  waypoint: Waypoint,
): Activity {
  if (attraction) {
    return {
      name: `Explore ${attraction.tags?.name}`,
      type: 'Attraction',
      time: ACTIVITY_TIMES[2],
      coordinates: getCoordinates(attraction),
    };
  }
  return {
    name: `Walk around ${waypoint.name}`,
    type: 'Attraction',
    time: ACTIVITY_TIMES[2],
    coordinates: [waypoint.lon, waypoint.lat],
  };
}

function createDinnerActivity(
  restaurant: OverpassElement | undefined,
  waypoint: Waypoint,
): Activity {
  if (restaurant) {
    return {
      name: `Dinner at ${restaurant.tags?.name}`,
      type: 'Dining',
      time: ACTIVITY_TIMES[3],
      coordinates: getCoordinates(restaurant),
    };
  }
  return {
    name: `Dinner in ${waypoint.name}`,
    type: 'Dining',
    time: ACTIVITY_TIMES[3],
    coordinates: [waypoint.lon, waypoint.lat],
  };
}

function createStay(
  hotel: OverpassElement | undefined,
  waypoint: Waypoint,
): DayPlan['stay'] {
  const price = HOTEL_PRICES[Math.floor(Math.random() * HOTEL_PRICES.length)]!;
  if (hotel) {
    return {
      name: hotel.tags?.name || `Hotel in ${waypoint.name}`,
      price,
      coordinates: getCoordinates(hotel),
    };
  }
  return {
    name: `Hotel in ${waypoint.name}`,
    price,
    coordinates: [waypoint.lon, waypoint.lat],
  };
}

function getDayTitle(
  currentWaypoint: Waypoint,
  previousWaypoint: Waypoint | undefined,
): string {
  if (previousWaypoint) {
    return `${previousWaypoint.name} to ${currentWaypoint.name}`;
  }
  return `${currentWaypoint.name} Exploration`;
}

function calculateBudget(daysCount: number): string {
  const totalNights = daysCount - 1;
  const estimatedBudget =
    totalNights * AVG_HOTEL_COST + daysCount * DAILY_FOOD_AND_ACTIVITIES_COST;
  return `$${Math.round(estimatedBudget / 100) * 100}`;
}

export default defineEdgeCachedHandler(
  async (event) => {
    const query = getQuery(event);
    const waypointsParam = query.waypoints as string | undefined;

    const waypoints: Waypoint[] = waypointsParam
      ? JSON.parse(waypointsParam)
      : DEFAULT_WAYPOINTS;

    const days: DayPlan[] = [];
    const routeWaypoints: [number, number][] = [];

    // One lookup per waypoint, all waypoints in parallel: the route answers
    // as soon as the slowest lookup does, not after the sum of all of them.
    const poiBuckets = await Promise.all(
      waypoints.map((wp) =>
        fetchPOIs(wp.lat, wp.lon, POI_RADIUS_M).catch(() => emptyPoiBuckets()),
      ),
    );

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i]!;
      routeWaypoints.push([wp.lon, wp.lat]);

      const { attractions, restaurants, hotels } = poiBuckets[i]!;

      const shuffledAttractions = shuffleArray(attractions);
      const shuffledRestaurants = shuffleArray(restaurants);
      const shuffledHotels = shuffleArray(hotels);

      const activities: Activity[] = [
        createMorningActivity(shuffledAttractions[0], wp),
        createLunchActivity(shuffledRestaurants[0], wp),
        createAfternoonActivity(shuffledAttractions[1], wp),
        createDinnerActivity(shuffledRestaurants[1], wp),
      ];

      days.push({
        day: i + 1,
        title: getDayTitle(wp, waypoints[i - 1]),
        activities,
        stay: createStay(shuffledHotels[0], wp),
      });
    }

    const response: TripResponse = {
      title: 'Pacific Coast Highway Adventure',
      duration: `${days.length} days`,
      budget: calculateBudget(days.length),
      highlights: waypoints.map((wp) => ({
        name: wp.name,
        coordinates: [wp.lon, wp.lat],
      })),
      days,
      routeWaypoints,
    };

    return response;
  },
  {
    maxAge: 60 * 30,
  },
);
