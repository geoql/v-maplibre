interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    tourism?: string;
    amenity?: string;
    cuisine?: string;
    stars?: string;
    opening_hours?: string;
    website?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface Activity {
  name: string;
  type: 'Attraction' | 'Dining';
  time: string;
  coordinates: [number, number];
}

interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  stay: { name: string; price: string; coordinates: [number, number] };
}

interface TripResponse {
  title: string;
  duration: string;
  budget: string;
  highlights: { name: string; coordinates: [number, number] }[];
  days: DayPlan[];
  routeWaypoints: [number, number][];
}

interface Waypoint {
  name: string;
  lat: number;
  lon: number;
}

const ACTIVITY_TIMES = ['9:00 AM', '12:00 PM', '3:00 PM', '7:00 PM'];
const HOTEL_PRICES = ['$150', '$180', '$220', '$250', '$280', '$320', '$350'];
const DAILY_FOOD_AND_ACTIVITIES_COST = 100;
const AVG_HOTEL_COST = 220;

const DEFAULT_WAYPOINTS: Waypoint[] = [
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Big Sur', lat: 36.2704, lon: -121.9067 },
  { name: 'Santa Barbara', lat: 34.4208, lon: -119.6982 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
];

async function fetchPOIs(
  lat: number,
  lon: number,
  radius: number,
  type: 'attraction' | 'restaurant' | 'hotel',
): Promise<OverpassElement[]> {
  const queries: Record<string, string> = {
    attraction: `
      [out:json][timeout:25];
      (
        node["tourism"="attraction"](around:${radius},${lat},${lon});
        node["tourism"="museum"](around:${radius},${lat},${lon});
        node["tourism"="viewpoint"](around:${radius},${lat},${lon});
        node["historic"](around:${radius},${lat},${lon});
        way["tourism"="attraction"](around:${radius},${lat},${lon});
        way["tourism"="museum"](around:${radius},${lat},${lon});
      );
      out center 20;
    `,
    restaurant: `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["amenity"="cafe"](around:${radius},${lat},${lon});
      );
      out 15;
    `,
    hotel: `
      [out:json][timeout:25];
      (
        node["tourism"="hotel"](around:${radius},${lat},${lon});
        way["tourism"="hotel"](around:${radius},${lat},${lon});
      );
      out center 10;
    `,
  };

  const response = await $fetch<OverpassResponse>(
    'https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      body: queries[type],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'mapcn-vue/1.0 (https://mapcn-vue.geoql.in)',
      },
    },
  );

  return response.elements.filter((el) => el.tags?.name);
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
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
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
  const price = HOTEL_PRICES[Math.floor(Math.random() * HOTEL_PRICES.length)];
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

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const waypointsParam = query.waypoints as string | undefined;

    const waypoints: Waypoint[] = waypointsParam
      ? JSON.parse(waypointsParam)
      : DEFAULT_WAYPOINTS;

    const days: DayPlan[] = [];
    const routeWaypoints: [number, number][] = [];

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      routeWaypoints.push([wp.lon, wp.lat]);

      const [attractions, restaurants, hotels] = await Promise.all([
        fetchPOIs(wp.lat, wp.lon, 5000, 'attraction').catch(() => []),
        fetchPOIs(wp.lat, wp.lon, 3000, 'restaurant').catch(() => []),
        fetchPOIs(wp.lat, wp.lon, 5000, 'hotel').catch(() => []),
      ]);

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
    getKey: (event) => {
      const query = getQuery(event);
      const seed = query.seed || 'default';
      return `trip-planner:${query.waypoints || 'pch'}:${seed}`;
    },
  },
);
