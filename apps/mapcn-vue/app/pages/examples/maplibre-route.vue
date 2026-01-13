<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import {
    VMap,
    VMarker,
    VLayerMaplibreRoute,
    VControlNavigation,
  } from '@geoql/v-maplibre';

  useSeoMeta({
    title: 'Delivery Tracking - mapcn-vue Examples',
    description: 'Real-time delivery tracking with route visualization.',
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
    center: [-0.105, 51.515] as [number, number],
    zoom: 12.5,
  }));

  // Simple delivery scenario: Store → Home
  const store = { coordinates: [-0.14, 51.5154] as [number, number] };
  const home = { coordinates: [-0.05, 51.5134] as [number, number] };

  const routeCoordinates = ref<[number, number][]>([]);
  const routeInfo = ref<{ distance: number; duration: number } | null>(null);
  const isLoading = ref(false);

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

  const fetchRoute = async () => {
    isLoading.value = true;

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
      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to fetch route');

      const data = await response.json();
      routeCoordinates.value = decodePolyline(data.trip.legs[0].shape);
      routeInfo.value = {
        distance: data.trip.summary.length,
        duration: data.trip.summary.time,
      };
    } catch (err) {
      console.error('Route fetch error:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  };

  const formatDistance = (km: number) => {
    return `${km.toFixed(1)} km`;
  };

  // Calculate midpoint for truck icon
  const truckPosition = computed(() => {
    if (routeCoordinates.value.length < 2) return null;
    const midIndex = Math.floor(routeCoordinates.value.length / 2);
    return routeCoordinates.value[midIndex];
  });

  onMounted(() => {
    fetchRoute();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
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
        <h1 class="mt-4 text-3xl font-bold tracking-tight">
          Delivery Tracking
        </h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Real-time delivery route visualization using VLayerMaplibreRoute.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="min-w-0 space-y-4">
          <!-- Delivery status card -->
          <div class="rounded-lg border border-border bg-card p-4">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10"
              >
                <Icon name="lucide:truck" class="h-5 w-5 text-blue-500"></Icon>
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
              v-if="routeInfo"
              class="flex items-center justify-between border-t border-border pt-4"
            >
              <div>
                <div class="text-2xl font-bold">
                  {{ formatDuration(routeInfo.duration) }}
                </div>
                <div class="text-sm text-muted-foreground">
                  Estimated arrival
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold">
                  {{ formatDistance(routeInfo.distance) }}
                </div>
                <div class="text-sm text-muted-foreground">Distance</div>
              </div>
            </div>

            <div
              v-if="isLoading"
              class="flex items-center gap-2 text-muted-foreground"
            >
              <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin"></Icon>
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
                <div class="text-xs text-muted-foreground">Pickup location</div>
              </div>
              <Icon
                name="lucide:check-circle-2"
                class="h-5 w-5 text-emerald-500"
              ></Icon>
            </div>

            <div class="ml-4 h-6 border-l-2 border-dashed border-border"></div>

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
            <VMap :key="mapStyle" :options="mapOptions" class="h-full w-full">
              <VControlNavigation position="top-right"></VControlNavigation>

              <!-- Route line -->
              <VLayerMaplibreRoute
                v-if="routeCoordinates.length > 0"
                id="delivery-route"
                :coordinates="routeCoordinates"
                color="#3b82f6"
                :width="4"
                :opacity="0.9"
                line-cap="round"
                line-join="round"
              />

              <!-- Store marker -->
              <VMarker :coordinates="store.coordinates">
                <div class="relative">
                  <div
                    class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-foreground"
                  >
                    Store
                  </div>
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg"
                  >
                    <div class="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                </div>
              </VMarker>

              <!-- Truck marker (midpoint) -->
              <VMarker v-if="truckPosition" :coordinates="truckPosition">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg"
                >
                  <Icon name="lucide:truck" class="h-5 w-5 text-white"></Icon>
                </div>
              </VMarker>

              <!-- Home marker -->
              <VMarker :coordinates="home.coordinates">
                <div class="relative">
                  <div
                    class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-foreground"
                  >
                    Home
                  </div>
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg"
                  >
                    <div class="h-2 w-2 rounded-full bg-white"></div>
                  </div>
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
          filename="DeliveryTracking.vue"
        ></CodeBlock>
      </div>
    </div>
  </div>
</template>
