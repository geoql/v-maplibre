<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import {
    VMap,
    VMarker,
    VLayerMaplibreRoute,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Routes - mapcn-vue Examples',
    description:
      'Route visualization examples: Delivery tracking and route planning with alternatives.',
  });

  const colorMode = useColorMode();
  const mapId = useId();
  const mapId2 = useId();
  const mapId3 = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const activeTab = ref<'delivery' | 'planning' | 'multiStop'>('planning');

  // ============ DELIVERY TRACKING ============
  const deliveryMapOptions = computed(() => ({
    container: `delivery-map-${mapId}`,
    style: mapStyle.value,
    center: [-0.105, 51.515] as [number, number],
    zoom: 12.5,
  }));

  const store = { coordinates: [-0.14, 51.5154] as [number, number] };
  const home = { coordinates: [-0.05, 51.5134] as [number, number] };

  const deliveryRouteCoordinates = ref<[number, number][]>([]);
  const deliveryRouteInfo = ref<{ distance: number; duration: number } | null>(
    null,
  );
  const deliveryLoading = ref(false);

  const decodePolyline = (
    encoded: string,
    precision: number = 6,
  ): [number, number][] => {
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
  };

  const fetchDeliveryRoute = async () => {
    deliveryLoading.value = true;

    try {
      const params = {
        locations: [
          {
            lat: store.coordinates[1],
            lon: store.coordinates[0],
            type: 'break',
          },
          { lat: home.coordinates[1], lon: home.coordinates[0], type: 'break' },
        ],
        costing: 'auto',
        directions_options: { units: 'kilometers' },
      };

      const url = `/api/valhalla?json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch(url);
      deliveryRouteCoordinates.value = decodePolyline(data.trip.legs[0].shape);
      deliveryRouteInfo.value = {
        distance: data.trip.summary.length,
        duration: data.trip.summary.time,
      };
    } catch (err) {
      console.error('Route fetch error:', err);
    } finally {
      deliveryLoading.value = false;
    }
  };

  const truckPosition = computed(() => {
    if (deliveryRouteCoordinates.value.length < 2) return null;
    const midIndex = Math.floor(deliveryRouteCoordinates.value.length / 2);
    return deliveryRouteCoordinates.value[midIndex];
  });

  // ============ ROUTE PLANNING ============
  interface RouteOption {
    coordinates: [number, number][];
    duration: number;
    distance: number;
  }

  const planningMapOptions = computed(() => ({
    container: `planning-map-${mapId2}`,
    style: mapStyle.value,
    center: [4.5, 52.1] as [number, number],
    zoom: 8,
  }));

  // Rotterdam → Amsterdam
  const rotterdam = { coordinates: [4.4777, 51.9244] as [number, number] };
  const amsterdam = { coordinates: [4.9041, 52.3676] as [number, number] };

  const routeOptions = ref<RouteOption[]>([]);
  const selectedRouteIndex = ref(0);
  const planningLoading = ref(false);

  const fetchRoutePlanning = async () => {
    planningLoading.value = true;

    try {
      const params = {
        locations: [
          {
            lat: rotterdam.coordinates[1],
            lon: rotterdam.coordinates[0],
            type: 'break',
          },
          {
            lat: amsterdam.coordinates[1],
            lon: amsterdam.coordinates[0],
            type: 'break',
          },
        ],
        costing: 'auto',
        alternates: 2,
        directions_options: { units: 'kilometers' },
      };

      const url = `/api/valhalla?json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch(url);

      // Valhalla returns main trip + alternates array
      const routes: RouteOption[] = [];

      // Main route
      if (data.trip?.legs?.[0]?.shape) {
        routes.push({
          coordinates: decodePolyline(data.trip.legs[0].shape),
          duration: data.trip.summary.time,
          distance: data.trip.summary.length * 1000, // km to meters
        });
      }

      // Alternate routes
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

      routeOptions.value = routes;
    } catch (err) {
      console.error('Route planning fetch error:', err);
    } finally {
      planningLoading.value = false;
    }
  };

  const selectRoute = (index: number) => {
    selectedRouteIndex.value = index;
  };

  // Format helpers
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatDistanceKm = (km: number) => {
    return `${km.toFixed(1)} km`;
  };

  // ============ MULTI-STOP OPTIMIZED ROUTE ============
  interface Stop {
    name: string;
    coordinates: [number, number];
    icon: string;
    type: 'start' | 'waypoint' | 'end';
  }

  interface LegInfo {
    distance: number;
    duration: number;
    summary: string;
  }

  const multiStopMapOptions = computed(() => ({
    container: `multistop-map-${mapId3}`,
    style: mapStyle.value,
    center: [-122.42, 37.77] as [number, number],
    zoom: 12,
  }));

  // San Francisco stops - can be reordered by dragging
  const stops = ref<Stop[]>([
    {
      name: 'Ferry Building',
      coordinates: [-122.3936, 37.7956],
      icon: 'lucide:building',
      type: 'start',
    },
    {
      name: 'Chinatown',
      coordinates: [-122.4058, 37.7941],
      icon: 'lucide:utensils',
      type: 'waypoint',
    },
    {
      name: 'Union Square',
      coordinates: [-122.4075, 37.7879],
      icon: 'lucide:shopping-bag',
      type: 'waypoint',
    },
    {
      name: 'Golden Gate Park',
      coordinates: [-122.4862, 37.7694],
      icon: 'lucide:trees',
      type: 'waypoint',
    },
    {
      name: "Fisherman's Wharf",
      coordinates: [-122.4169, 37.808],
      icon: 'lucide:anchor',
      type: 'end',
    },
  ]);

  const multiStopRouteCoordinates = ref<[number, number][]>([]);
  const multiStopLegs = ref<LegInfo[]>([]);
  const multiStopTotalDuration = ref(0);
  const multiStopTotalDistance = ref(0);
  const multiStopLoading = ref(false);
  const optimizedOrder = ref<number[]>([]);

  const fetchMultiStopRoute = async () => {
    multiStopLoading.value = true;

    try {
      const locations = stops.value.map((stop) => ({
        lat: stop.coordinates[1],
        lon: stop.coordinates[0],
      }));

      const params = {
        locations,
        costing: 'auto',
        directions_options: { units: 'kilometers' },
      };

      // Use optimized_route endpoint for TSP optimization
      const url = `/api/valhalla?endpoint=optimized_route&json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch(url);

      // Decode all leg shapes and combine
      const allCoordinates: [number, number][] = [];
      const legs: LegInfo[] = [];

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

      multiStopRouteCoordinates.value = allCoordinates;
      multiStopLegs.value = legs;
      multiStopTotalDuration.value = data.trip?.summary?.time || 0;
      multiStopTotalDistance.value = data.trip?.summary?.length || 0;

      // Store optimized order if returned
      if (data.trip?.locations) {
        optimizedOrder.value = data.trip.locations.map(
          (loc: { original_index: number }) => loc.original_index,
        );
      }
    } catch (err) {
      console.error('Multi-stop route fetch error:', err);
    } finally {
      multiStopLoading.value = false;
    }
  };

  const reverseGeocode = async (coords: [number, number]): Promise<string> => {
    try {
      const data = await $fetch<{ name: string }>(
        `/api/geocode?lat=${coords[1]}&lon=${coords[0]}`,
      );
      return data.name;
    } catch {
      return 'Unknown location';
    }
  };

  const handleStopDrag = async (index: number, newCoords: [number, number]) => {
    stops.value[index].coordinates = newCoords;
    stops.value[index].name = 'Loading...';

    const [name] = await Promise.all([
      reverseGeocode(newCoords),
      fetchMultiStopRoute(),
    ]);

    stops.value[index].name = name;
  };

  // Format time for journey view
  const formatArrivalTime = (totalSeconds: number) => {
    const now = new Date();
    now.setSeconds(now.getSeconds() + totalSeconds);
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get cumulative duration up to a stop
  const getCumulativeDuration = (stopIndex: number) => {
    let total = 0;
    for (let i = 0; i < stopIndex && i < multiStopLegs.value.length; i++) {
      total += multiStopLegs.value[i].duration;
    }
    return total;
  };

  // Load routes when tab changes
  watch(
    activeTab,
    (tab) => {
      if (tab === 'delivery' && deliveryRouteCoordinates.value.length === 0) {
        fetchDeliveryRoute();
      } else if (tab === 'planning' && routeOptions.value.length === 0) {
        fetchRoutePlanning();
      } else if (
        tab === 'multiStop' &&
        multiStopRouteCoordinates.value.length === 0
      ) {
        fetchMultiStopRoute();
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    // Initial load handled by watch
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const deliveryCodeExample = `${SCRIPT_START}
import { VMap, VMarker, VLayerMaplibreRoute } from '@geoql/v-maplibre';

const store = { coordinates: [-0.14, 51.5154] };
const home = { coordinates: [-0.05, 51.5134] };

// Fetch route from Valhalla API
const params = {
  locations: [
    { lat: store.coordinates[1], lon: store.coordinates[0], type: 'break' },
    { lat: home.coordinates[1], lon: home.coordinates[0], type: 'break' },
  ],
  costing: 'auto',
};

const response = await fetch(\`/api/valhalla?json=\${encodeURIComponent(JSON.stringify(params))}\`);
const data = await response.json();
const routeCoordinates = decodePolyline(data.trip.legs[0].shape);
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-[500px] w-full rounded-lg">
    <VLayerMaplibreRoute
      id="delivery-route"
      :coordinates="routeCoordinates"
      color="#3b82f6"
      :width="4"
    />
    <VMarker :coordinates="store.coordinates">
      <div class="marker">Store</div>
    </VMarker>
    <VMarker :coordinates="home.coordinates">
      <div class="marker">Home</div>
    </VMarker>
  </VMap>
</template>`;

  const planningCodeExample = `${SCRIPT_START}
import { VMap, VMarker, VLayerMaplibreRoute } from '@geoql/v-maplibre';

const start = { coordinates: [4.4777, 51.9244] }; // Rotterdam
const end = { coordinates: [4.9041, 52.3676] };   // Amsterdam

// Fetch routes with alternatives from Valhalla API
const params = {
  locations: [
    { lat: start.coordinates[1], lon: start.coordinates[0], type: 'break' },
    { lat: end.coordinates[1], lon: end.coordinates[0], type: 'break' },
  ],
  costing: 'auto',
  alternates: 2,
};
const response = await fetch(\`/api/valhalla?json=\${encodeURIComponent(JSON.stringify(params))}\`);
const data = await response.json();

// Parse main route + alternates
const routes = [data.trip, ...(data.alternates?.map(a => a.trip) || [])].map(trip => ({
  coordinates: decodePolyline(trip.legs[0].shape),
  duration: trip.summary.time,
  distance: trip.summary.length * 1000,
}));

const selectedRoute = ref(0);
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-[500px] w-full rounded-lg">
    <!-- Alternative routes (gray, behind) -->
    <VLayerMaplibreRoute
      v-for="(route, i) in routes"
      :key="i"
      :id="\`route-\${i}\`"
      :coordinates="route.coordinates"
      :color="i === selectedRoute ? '#6366f1' : '#6b7280'"
      :width="i === selectedRoute ? 5 : 4"
      :opacity="i === selectedRoute ? 1 : 0.5"
      @click="selectedRoute = i"
    />
    <VMarker :coordinates="start.coordinates">
      <div class="start-marker" />
    </VMarker>
    <VMarker :coordinates="end.coordinates">
      <div class="end-marker" />
    </VMarker>
  </VMap>
</template>`;

  const multiStopCodeExample = `${SCRIPT_START}
import { ref } from 'vue';
import { VMap, VMarker, VLayerMaplibreRoute } from '@geoql/v-maplibre';

const stops = ref([
  { name: 'Ferry Building', coordinates: [-122.3936, 37.7956] },
  { name: 'Chinatown', coordinates: [-122.4058, 37.7941] },
  { name: 'Union Square', coordinates: [-122.4075, 37.7879] },
  { name: 'Golden Gate Park', coordinates: [-122.4862, 37.7694] },
  { name: 'Fisherman\\'s Wharf', coordinates: [-122.4169, 37.808] },
]);

const routeCoordinates = ref([]);

// Fetch optimized route from Valhalla
const fetchRoute = async () => {
  const locations = stops.value.map(s => ({ lat: s.coordinates[1], lon: s.coordinates[0] }));
  const params = { locations, costing: 'auto' };
  
  // Use optimized_route endpoint for TSP optimization
  const response = await fetch(\`/api/valhalla?endpoint=optimized_route&json=\${encodeURIComponent(JSON.stringify(params))}\`);
  const data = await response.json();
  
  // Combine all leg shapes
  routeCoordinates.value = data.trip.legs.flatMap(leg => decodePolyline(leg.shape));
};

// Handle marker drag
const handleDrag = (index, coords) => {
  stops.value[index].coordinates = coords;
  fetchRoute(); // Recalculate route
};
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-[500px] w-full rounded-lg">
    <VLayerMaplibreRoute
      id="route"
      :coordinates="routeCoordinates"
      color="#6366f1"
      :width="5"
    />
    <VMarker
      v-for="(stop, i) in stops"
      :key="i"
      :coordinates="stop.coordinates"
      :options="{ draggable: true }"
      @update:coordinates="(c) => handleDrag(i, c)"
    >
      <template #markers="{ setRef }">
        <div :ref="setRef" class="marker">{{ i + 1 }}</div>
      </template>
    </VMarker>
  </VMap>
</template>`;
</script>

<template>
  <div class="container max-w-screen-2xl py-10 overflow-x-hidden">
    <div class="mx-auto w-full max-w-300">
      <div class="mb-8">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4"></Icon>
          Back to Examples
        </NuxtLink>
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Routes</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Route visualization with VLayerMaplibreRoute component.
        </p>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-border">
        <div class="flex gap-4">
          <button
            :class="[
              'relative px-1 pb-3 text-sm font-medium transition-colors',
              activeTab === 'planning'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="activeTab = 'planning'"
          >
            Route Planning
            <span
              v-if="activeTab === 'planning'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
            ></span>
          </button>
          <button
            :class="[
              'relative px-1 pb-3 text-sm font-medium transition-colors',
              activeTab === 'delivery'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="activeTab = 'delivery'"
          >
            Delivery Tracking
            <span
              v-if="activeTab === 'delivery'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
            ></span>
          </button>
          <button
            :class="[
              'relative px-1 pb-3 text-sm font-medium transition-colors',
              activeTab === 'multiStop'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="activeTab = 'multiStop'"
          >
            Multi-Stop
            <span
              v-if="activeTab === 'multiStop'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
            ></span>
          </button>
        </div>
      </div>

      <!-- Route Planning Tab -->
      <div v-show="activeTab === 'planning'">
        <p class="mb-6 text-muted-foreground">
          Display multiple route options and let users select between them. This
          example fetches real driving directions from the
          <a
            href="https://valhalla.github.io/valhalla/"
            target="_blank"
            class="underline hover:text-foreground"
            >Valhalla API</a
          >. Click on a route or use the buttons to switch.
        </p>

        <div class="grid gap-8 lg:grid-cols-3">
          <!-- Route selector panel -->
          <div class="space-y-3">
            <div
              v-if="planningLoading"
              class="flex items-center gap-2 text-muted-foreground p-4"
            >
              <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin"></Icon>
              <span>Calculating routes...</span>
            </div>

            <template v-else>
              <button
                v-for="(route, index) in routeOptions"
                :key="index"
                :class="[
                  'w-full rounded-lg border p-4 text-left transition-all',
                  selectedRouteIndex === index
                    ? 'border-indigo-500 bg-card shadow-sm'
                    : 'border-border bg-card/50 hover:bg-card hover:border-border/80',
                ]"
                @click="selectRoute(index)"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    name="lucide:clock"
                    class="h-4 w-4 text-muted-foreground"
                  ></Icon>
                  <span class="font-semibold">{{
                    formatDuration(route.duration)
                  }}</span>
                  <Icon
                    name="lucide:route"
                    class="h-4 w-4 text-muted-foreground ml-2"
                  ></Icon>
                  <span class="text-muted-foreground">{{
                    formatDistance(route.distance)
                  }}</span>
                  <span
                    v-if="index === 0"
                    class="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    Fastest
                  </span>
                </div>
              </button>

              <div
                v-if="routeOptions.length === 0 && !planningLoading"
                class="rounded-lg border border-border bg-card p-4 text-center text-muted-foreground"
              >
                No routes available
              </div>
            </template>

            <!-- Route info -->
            <div
              class="mt-6 rounded-lg border border-border bg-card/50 p-4 space-y-2"
            >
              <div class="flex items-center gap-2 text-sm">
                <div class="h-3 w-3 rounded-full bg-red-500"></div>
                <span class="text-muted-foreground">Rotterdam</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
                <span class="text-muted-foreground">Amsterdam</span>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div
            class="lg:col-span-2 h-125 min-w-0 overflow-hidden rounded-lg border border-border"
          >
            <ClientOnly>
              <VMap
                :key="`planning-${mapStyle}`"
                :options="planningMapOptions"
                class="h-full w-full"
              >
                <VControlNavigation position="top-right"></VControlNavigation>

                <!-- Render ALL routes - non-selected first (gray, behind) -->
                <VLayerMaplibreRoute
                  v-for="(route, index) in routeOptions"
                  :key="`route-alt-${index}`"
                  :id="`planning-route-alt-${index}`"
                  :coordinates="route.coordinates"
                  :color="
                    index === selectedRouteIndex ? 'transparent' : '#6b7280'
                  "
                  :width="4"
                  :opacity="index === selectedRouteIndex ? 0 : 0.5"
                  line-cap="round"
                  line-join="round"
                  @click="selectRoute(index)"
                />

                <!-- Selected route on top (indigo, prominent) -->
                <VLayerMaplibreRoute
                  v-if="routeOptions[selectedRouteIndex]"
                  id="planning-route-selected"
                  :coordinates="
                    routeOptions[selectedRouteIndex]?.coordinates ?? []
                  "
                  color="#6366f1"
                  :width="5"
                  :opacity="1"
                  line-cap="round"
                  line-join="round"
                />

                <!-- Rotterdam marker (red) -->
                <VMarker :coordinates="rotterdam.coordinates">
                  <template #markers="{ setRef }">
                    <div
                      :ref="setRef"
                      class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-lg"
                    >
                      <div class="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                  </template>
                </VMarker>

                <!-- Amsterdam marker (green) -->
                <VMarker :coordinates="amsterdam.coordinates">
                  <template #markers="{ setRef }">
                    <div
                      :ref="setRef"
                      class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg"
                    >
                      <div class="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                  </template>
                </VMarker>
              </VMap>
            </ClientOnly>
          </div>
        </div>

        <div class="mt-8">
          <LazyCodeBlock
            :code="planningCodeExample"
            lang="vue"
            filename="RoutePlanning.vue"
          ></LazyCodeBlock>
        </div>
      </div>

      <!-- Delivery Tracking Tab -->
      <div v-show="activeTab === 'delivery'">
        <p class="mb-6 text-muted-foreground">
          Real-time delivery route visualization using VLayerMaplibreRoute.
        </p>

        <div class="grid gap-8 lg:grid-cols-2">
          <div class="min-w-0 space-y-4">
            <!-- Delivery status card -->
            <div class="rounded-lg border border-border bg-card p-4">
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10"
                >
                  <Icon
                    name="lucide:truck"
                    class="h-5 w-5 text-blue-500"
                  ></Icon>
                </div>
                <div>
                  <div class="font-semibold">Order #12847</div>
                  <div class="text-sm text-muted-foreground">
                    <span class="inline-flex items-center gap-1">
                      <span
                        class="h-2 w-2 rounded-full bg-green-500 animate-pulse"
                      ></span>
                      On the way
                    </span>
                  </div>
                </div>
              </div>

              <div
                v-if="deliveryRouteInfo"
                class="flex items-center justify-between border-t border-border pt-4"
              >
                <div>
                  <div class="text-2xl font-bold">
                    {{ formatDuration(deliveryRouteInfo.duration) }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Estimated arrival
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold">
                    {{ formatDistanceKm(deliveryRouteInfo.distance) }}
                  </div>
                  <div class="text-sm text-muted-foreground">Distance</div>
                </div>
              </div>

              <div
                v-if="deliveryLoading"
                class="flex items-center gap-2 text-muted-foreground"
              >
                <Icon
                  name="lucide:loader-2"
                  class="h-4 w-4 animate-spin"
                ></Icon>
                <span>Calculating route...</span>
              </div>
            </div>

            <!-- Locations -->
            <div class="space-y-3">
              <div
                class="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10"
                >
                  <Icon
                    name="lucide:store"
                    class="h-4 w-4 text-emerald-500"
                  ></Icon>
                </div>
                <div class="flex-1">
                  <div class="font-medium">Store</div>
                  <div class="text-xs text-muted-foreground">
                    Pickup location
                  </div>
                </div>
                <Icon
                  name="lucide:check-circle-2"
                  class="h-5 w-5 text-emerald-500"
                ></Icon>
              </div>

              <div
                class="ml-4 h-6 border-l-2 border-dashed border-border"
              ></div>

              <div
                class="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10"
                >
                  <Icon name="lucide:home" class="h-4 w-4 text-blue-500"></Icon>
                </div>
                <div class="flex-1">
                  <div class="font-medium">Home</div>
                  <div class="text-xs text-muted-foreground">
                    Delivery address
                  </div>
                </div>
                <Icon
                  name="lucide:clock"
                  class="h-5 w-5 text-muted-foreground"
                ></Icon>
              </div>
            </div>
          </div>

          <div
            class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
          >
            <ClientOnly>
              <VMap
                :key="`delivery-${mapStyle}`"
                :options="deliveryMapOptions"
                class="h-full w-full"
              >
                <VControlNavigation position="top-right"></VControlNavigation>

                <!-- Route line -->
                <VLayerMaplibreRoute
                  v-if="deliveryRouteCoordinates.length > 0"
                  id="delivery-route"
                  :coordinates="deliveryRouteCoordinates"
                  color="#3b82f6"
                  :width="4"
                  :opacity="0.9"
                  line-cap="round"
                  line-join="round"
                />

                <!-- Store marker with icon -->
                <VMarker :coordinates="store.coordinates">
                  <template #markers="{ setRef }">
                    <div :ref="setRef" class="relative">
                      <div
                        class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white"
                      >
                        Store
                      </div>
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg"
                      >
                        <Icon
                          name="maki:shop"
                          class="h-4 w-4 text-white"
                        ></Icon>
                      </div>
                    </div>
                  </template>
                </VMarker>

                <!-- Truck marker with ETA tooltip -->
                <VMarker v-if="truckPosition" :coordinates="truckPosition">
                  <template #markers="{ setRef }">
                    <div :ref="setRef" class="relative">
                      <div
                        v-if="deliveryRouteInfo"
                        class="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900/90 px-2 py-1 text-xs font-medium text-white shadow-lg"
                      >
                        <span class="text-emerald-400">{{
                          formatDuration(deliveryRouteInfo.duration)
                        }}</span>
                        away
                      </div>
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg"
                      >
                        <Icon
                          name="lucide:truck"
                          class="h-5 w-5 text-white"
                        ></Icon>
                      </div>
                    </div>
                  </template>
                </VMarker>

                <!-- Home marker with icon -->
                <VMarker :coordinates="home.coordinates">
                  <template #markers="{ setRef }">
                    <div :ref="setRef" class="relative">
                      <div
                        class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white"
                      >
                        Home
                      </div>
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg"
                      >
                        <Icon
                          name="maki:home"
                          class="h-4 w-4 text-white"
                        ></Icon>
                      </div>
                    </div>
                  </template>
                </VMarker>
              </VMap>
            </ClientOnly>
          </div>
        </div>

        <div class="mt-8">
          <LazyCodeBlock
            :code="deliveryCodeExample"
            lang="vue"
            filename="DeliveryTracking.vue"
          ></LazyCodeBlock>
        </div>
      </div>

      <!-- Multi-Stop Optimized Route Tab -->
      <div v-show="activeTab === 'multiStop'">
        <p class="mb-6 text-muted-foreground">
          Optimized multi-stop route using Valhalla's TSP solver.
          <strong>Drag markers</strong> to adjust stops and recalculate the
          route.
        </p>

        <div class="grid gap-8 lg:grid-cols-3">
          <!-- Journey Details Panel (Apple Maps style) -->
          <div class="space-y-4">
            <!-- Summary Card -->
            <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <span
                  class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >Trip Summary</span
                >
                <span
                  v-if="optimizedOrder.length > 0"
                  class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                >
                  Optimized
                </span>
              </div>

              <div
                v-if="multiStopLoading"
                class="flex items-center gap-2 text-muted-foreground py-4"
              >
                <Icon
                  name="lucide:loader-2"
                  class="h-4 w-4 animate-spin"
                ></Icon>
                <span>Optimizing route...</span>
              </div>

              <template v-else-if="multiStopTotalDuration > 0">
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="text-3xl font-bold">{{
                    formatDuration(multiStopTotalDuration)
                  }}</span>
                  <span class="text-muted-foreground">total</span>
                </div>
                <div
                  class="flex items-center gap-4 text-sm text-muted-foreground"
                >
                  <span class="flex items-center gap-1">
                    <Icon name="lucide:route" class="h-3.5 w-3.5"></Icon>
                    {{ formatDistanceKm(multiStopTotalDistance) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon name="lucide:map-pin" class="h-3.5 w-3.5"></Icon>
                    {{ stops.length }} stops
                  </span>
                </div>
              </template>
            </div>

            <!-- Stops Timeline -->
            <div
              class="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-border bg-muted/30">
                <span
                  class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >Journey</span
                >
              </div>

              <div class="divide-y divide-border">
                <div
                  v-for="(stop, index) in stops"
                  :key="index"
                  class="relative"
                >
                  <!-- Timeline connector -->
                  <div
                    v-if="index < stops.length - 1"
                    class="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-border to-border/50"
                  ></div>

                  <div class="flex gap-3 p-4">
                    <!-- Stop Icon -->
                    <div
                      :class="[
                        'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                        stop.type === 'start'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : stop.type === 'end'
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-blue-500 bg-blue-500/10',
                      ]"
                    >
                      <Icon
                        :name="stop.icon"
                        :class="[
                          'h-4 w-4',
                          stop.type === 'start'
                            ? 'text-emerald-500'
                            : stop.type === 'end'
                              ? 'text-red-500'
                              : 'text-blue-500',
                        ]"
                      ></Icon>
                    </div>

                    <!-- Stop Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <span class="font-medium truncate">{{
                          stop.name
                        }}</span>
                        <span
                          v-if="index === 0"
                          class="shrink-0 text-xs text-muted-foreground"
                        >
                          Now
                        </span>
                        <span
                          v-else-if="multiStopLegs.length >= index"
                          class="shrink-0 text-xs font-medium text-foreground"
                        >
                          {{ formatArrivalTime(getCumulativeDuration(index)) }}
                        </span>
                      </div>

                      <!-- Leg info (distance/duration to next stop) -->
                      <div
                        v-if="index < multiStopLegs.length"
                        class="mt-1 flex items-center gap-3 text-xs text-muted-foreground"
                      >
                        <span>{{
                          formatDuration(multiStopLegs[index].duration)
                        }}</span>
                        <span class="text-border">•</span>
                        <span>{{
                          formatDistanceKm(multiStopLegs[index].distance)
                        }}</span>
                      </div>

                      <div
                        v-if="stop.type === 'start'"
                        class="mt-1 text-xs text-emerald-600 dark:text-emerald-400"
                      >
                        Starting point
                      </div>
                      <div
                        v-else-if="stop.type === 'end'"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        Final destination
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Drag hint -->
            <div
              class="flex items-center gap-2 text-xs text-muted-foreground px-1"
            >
              <Icon name="lucide:move" class="h-3.5 w-3.5"></Icon>
              <span>Drag markers on map to adjust stops</span>
            </div>
          </div>

          <!-- Map -->
          <div
            class="lg:col-span-2 h-150 min-w-0 overflow-hidden rounded-lg border border-border"
          >
            <ClientOnly>
              <VMap
                :key="`multistop-${mapStyle}`"
                :options="multiStopMapOptions"
                class="h-full w-full"
              >
                <VControlNavigation position="top-right"></VControlNavigation>

                <!-- Route line -->
                <VLayerMaplibreRoute
                  v-if="multiStopRouteCoordinates.length > 0"
                  id="multistop-route"
                  :coordinates="multiStopRouteCoordinates"
                  color="#6366f1"
                  :width="5"
                  :opacity="0.9"
                  line-cap="round"
                  line-join="round"
                />

                <!-- Stop markers (draggable) -->
                <VMarker
                  v-for="(stop, index) in stops"
                  :key="`stop-${index}`"
                  :coordinates="stop.coordinates"
                  :options="{ draggable: true }"
                  @update:coordinates="
                    (coords: [number, number]) => handleStopDrag(index, coords)
                  "
                >
                  <template #markers="{ setRef }">
                    <div
                      :ref="setRef"
                      class="relative cursor-grab active:cursor-grabbing"
                    >
                      <!-- Stop number badge -->
                      <div
                        class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-900 text-xs font-bold shadow-md border border-border z-10"
                      >
                        {{ index + 1 }}
                      </div>
                      <div
                        :class="[
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110',
                          stop.type === 'start'
                            ? 'bg-emerald-500'
                            : stop.type === 'end'
                              ? 'bg-red-500'
                              : 'bg-blue-500',
                        ]"
                      >
                        <Icon
                          :name="stop.icon"
                          class="h-5 w-5 text-white"
                        ></Icon>
                      </div>
                    </div>
                  </template>
                </VMarker>
              </VMap>
            </ClientOnly>
          </div>
        </div>

        <div class="mt-8">
          <LazyCodeBlock
            :code="multiStopCodeExample"
            lang="vue"
            filename="MultiStopRoute.vue"
          ></LazyCodeBlock>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Custom marker styles - already handled inline */
</style>
