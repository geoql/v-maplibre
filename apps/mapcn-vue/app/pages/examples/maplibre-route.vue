<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import {
    VMap,
    VMarker,
    VLayerMaplibreRoute,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Route Planning - mapcn-vue Examples',
    description:
      'Route planning with Valhalla routing engine and optimized routes.',
  });

  const colorMode = useColorMode();
  const mapId = useId();

  const lightStyle =
    'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
  const darkStyle =
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const mapStyle = computed(() =>
    colorMode.value === 'dark' ? darkStyle : lightStyle,
  );

  const mapOptions = computed(() => ({
    container: `route-example-${mapId}`,
    style: mapStyle.value,
    center: [-73.98, 40.75] as [number, number],
    zoom: 12,
  }));

  // NYC landmarks as waypoints
  interface Waypoint {
    name: string;
    coordinates: [number, number];
    icon: string;
  }

  const waypoints = ref<Waypoint[]>([
    {
      name: 'Times Square',
      coordinates: [-73.9855, 40.758],
      icon: 'lucide:star',
    },
    {
      name: 'Empire State Building',
      coordinates: [-73.9857, 40.7484],
      icon: 'lucide:building-2',
    },
    {
      name: 'Grand Central Terminal',
      coordinates: [-73.9772, 40.7527],
      icon: 'lucide:train-front',
    },
    {
      name: 'Bryant Park',
      coordinates: [-73.9832, 40.7536],
      icon: 'lucide:trees',
    },
  ]);

  interface RouteOption {
    coordinates: [number, number][];
    distance: number;
    duration: number;
    mode: string;
  }

  const routes = ref<RouteOption[]>([]);
  const selectedRouteIndex = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Costing modes for Valhalla
  const costingModes = [
    { id: 'auto', label: 'Driving', icon: 'lucide:car' },
    { id: 'bicycle', label: 'Cycling', icon: 'lucide:bike' },
    { id: 'pedestrian', label: 'Walking', icon: 'lucide:footprints' },
  ];

  const selectedMode = ref('auto');

  // Decode Valhalla's encoded polyline (uses precision 6)
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

  const fetchRoutes = async () => {
    isLoading.value = true;
    error.value = null;
    routes.value = [];

    try {
      const locations = waypoints.value.map((wp) => ({
        lat: wp.coordinates[1],
        lon: wp.coordinates[0],
        type: 'break' as const,
      }));

      const routePromises = costingModes.map(async (mode) => {
        const params = {
          locations,
          costing: mode.id,
          directions_options: {
            units: 'kilometers',
          },
        };

        const url = `https://valhalla1.openstreetmap.de/optimized_route?json=${encodeURIComponent(JSON.stringify(params))}`;

        const response = await fetch(url, {
          headers: {
            Accept: '*/*',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${mode.label} route`);
        }

        const data = await response.json();

        // Decode the shape from Valhalla response
        const coordinates = decodePolyline(data.trip.legs[0].shape);

        return {
          coordinates,
          distance: data.trip.summary.length, // in km
          duration: data.trip.summary.time, // in seconds
          mode: mode.id,
        };
      });

      const results = await Promise.allSettled(routePromises);
      routes.value = results
        .filter(
          (r): r is PromiseFulfilledResult<RouteOption> =>
            r.status === 'fulfilled',
        )
        .map((r) => r.value);

      // Select the route matching the current mode
      const modeIndex = routes.value.findIndex(
        (r) => r.mode === selectedMode.value,
      );
      if (modeIndex >= 0) {
        selectedRouteIndex.value = modeIndex;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch routes';
      console.error('Route fetch error:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const selectRoute = (index: number) => {
    selectedRouteIndex.value = index;
    selectedMode.value = routes.value[index]?.mode || 'auto';
  };

  const formatDistance = (km: number) => {
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const getRouteColor = (mode: string, isSelected: boolean) => {
    if (!isSelected) return '#94a3b8';
    switch (mode) {
      case 'auto':
        return '#3b82f6';
      case 'bicycle':
        return '#22c55e';
      case 'pedestrian':
        return '#f59e0b';
      default:
        return '#6366f1';
    }
  };

  onMounted(() => {
    fetchRoutes();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
import { VMap, VMarker, VLayerMaplibreRoute, VControlNavigation } from '@geoql/v-maplibre';

const mapOptions = {
  style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  center: [-73.98, 40.75],
  zoom: 12,
};

const waypoints = [
  { name: 'Times Square', coordinates: [-73.9855, 40.758] },
  { name: 'Empire State Building', coordinates: [-73.9857, 40.7484] },
  { name: 'Grand Central Terminal', coordinates: [-73.9772, 40.7527] },
];

// Fetch optimized route from Valhalla
const params = {
  locations: waypoints.map(wp => ({ lat: wp.coordinates[1], lon: wp.coordinates[0], type: 'break' })),
  costing: 'auto',
};
const response = await fetch(\`https://valhalla1.openstreetmap.de/optimized_route?json=\${encodeURIComponent(JSON.stringify(params))}\`);
const data = await response.json();
const routeCoordinates = decodePolyline(data.trip.legs[0].shape);
${SCRIPT_END}

<template>
  <VMap :options="mapOptions" class="h-125 w-full rounded-lg">
    <VControlNavigation position="top-right" />
    <VLayerMaplibreRoute
      id="route"
      :coordinates="routeCoordinates"
      color="#3b82f6"
      :width="5"
      :opacity="0.9"
    />
    <VMarker v-for="wp in waypoints" :key="wp.name" :lng-lat="wp.coordinates">
      <div class="marker">{{ wp.name }}</div>
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">Route Planning</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Multi-modal route planning using the Valhalla routing engine. Compare
          driving, cycling, and walking routes between NYC landmarks.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="min-w-0">
          <!-- Route selector buttons -->
          <div class="mb-4 flex flex-wrap gap-2">
            <button
              v-for="(route, index) in routes"
              :key="route.mode"
              class="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all"
              :class="
                selectedRouteIndex === index
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              "
              @click="selectRoute(index)"
            >
              <Icon
                :name="
                  costingModes.find((m) => m.id === route.mode)?.icon ||
                  'lucide:route'
                "
                class="h-4 w-4"
              ></Icon>
              <span>{{
                costingModes.find((m) => m.id === route.mode)?.label
              }}</span>
              <span
                v-if="route.duration"
                class="rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                {{ formatDuration(route.duration) }}
              </span>
            </button>
          </div>

          <!-- Route info card -->
          <div
            v-if="routes[selectedRouteIndex]"
            class="mb-4 rounded-lg border border-border bg-card/50 p-4"
          >
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="text-2xl font-bold">
                  {{ formatDuration(routes[selectedRouteIndex].duration) }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ formatDistance(routes[selectedRouteIndex].distance) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-muted-foreground">
                  via
                  {{
                    costingModes.find(
                      (m) => m.id === routes[selectedRouteIndex].mode,
                    )?.label
                  }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ waypoints.length }} stops
                </div>
              </div>
            </div>
          </div>

          <!-- Waypoints list -->
          <div class="mb-4 space-y-2">
            <div
              v-for="(wp, index) in waypoints"
              :key="wp.name"
              class="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
              >
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ wp.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ wp.coordinates[1].toFixed(4) }},
                  {{ wp.coordinates[0].toFixed(4) }}
                </div>
              </div>
              <Icon
                :name="wp.icon"
                class="h-5 w-5 text-muted-foreground"
              ></Icon>
            </div>
          </div>

          <!-- Loading/Error states -->
          <div
            v-if="isLoading"
            class="flex items-center gap-2 text-muted-foreground"
          >
            <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin"></Icon>
            <span>Fetching routes...</span>
          </div>
          <div v-if="error" class="text-sm text-red-500">
            {{ error }}
          </div>
        </div>

        <div
          class="h-125 min-w-0 overflow-hidden rounded-lg border border-border"
        >
          <ClientOnly>
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>

              <!-- Render all routes (unselected ones first, selected on top) -->
              <template v-for="(route, index) in routes" :key="route.mode">
                <VLayerMaplibreRoute
                  v-if="index !== selectedRouteIndex"
                  :id="`route-${route.mode}`"
                  :coordinates="route.coordinates"
                  :color="getRouteColor(route.mode, false)"
                  :width="3"
                  :opacity="0.4"
                  :interactive="true"
                  @click="selectRoute(index)"
                />
              </template>

              <!-- Selected route on top -->
              <VLayerMaplibreRoute
                v-if="routes[selectedRouteIndex]"
                :id="`route-${routes[selectedRouteIndex].mode}-selected`"
                :coordinates="routes[selectedRouteIndex].coordinates"
                :color="getRouteColor(routes[selectedRouteIndex].mode, true)"
                :width="5"
                :opacity="0.9"
                line-cap="round"
                line-join="round"
              />

              <!-- Waypoint markers -->
              <VMarker
                v-for="(wp, index) in waypoints"
                :key="wp.name"
                :lng-lat="wp.coordinates"
              >
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-sm font-bold text-white shadow-lg"
                >
                  {{ index + 1 }}
                </div>
              </VMarker>
            </VMap>
          </ClientOnly>
        </div>
      </div>

      <div class="mt-8">
        <CodeBlock
          :code="codeExample"
          lang="vue"
          filename="RoutePlanning.vue"
        ></CodeBlock>
      </div>
    </div>
  </div>
</template>
