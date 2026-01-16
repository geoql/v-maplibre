<script setup lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl';
  import type { ComponentPublicInstance } from 'vue';
  import {
    VMap,
    VMarker,
    VLayerMaplibreRoute,
    VControlNavigation,
    VControlScale,
  } from '@geoql/v-maplibre';
  import type { RouteOption, ValhallaResponse } from '~/types/route';
  import {
    useRouteUtils,
    decodePolyline,
    formatDuration,
    formatDistance,
    fitMapToBounds,
  } from '~/composables/use-route-utils';

  type MarkerRefSetter = (el: Element | null) => void;

  function wrapMarkerRef(
    setRef: MarkerRefSetter,
  ): (el: Element | ComponentPublicInstance | null) => void {
    return (el) => {
      if (el instanceof Element) {
        setRef(el);
      }
    };
  }

  const { mapStyle } = useRouteUtils();
  const mapId = useId();

  const rotterdam = { coordinates: [4.4777, 51.9244] as [number, number] };
  const amsterdam = { coordinates: [4.9041, 52.3676] as [number, number] };

  const planningMapOptions = computed(() => ({
    container: `planning-map-${mapId}`,
    style: mapStyle.value,
    center: [4.5, 52.1] as [number, number],
    zoom: 8,
  }));

  const routeOptions = ref<RouteOption[]>([]);
  const selectedRouteIndex = ref(0);
  const planningLoading = ref(false);

  function onMapLoaded(map: MaplibreMap) {
    fitMapToBounds(
      map,
      [rotterdam.coordinates, amsterdam.coordinates],
      { top: 60, bottom: 60, left: 60, right: 60 },
      12,
    );
  }

  async function fetchRoutePlanning() {
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
      const data = await $fetch<ValhallaResponse>(url);

      const routes: RouteOption[] = [];

      if (data.trip?.legs?.[0]?.shape) {
        routes.push({
          coordinates: decodePolyline(data.trip.legs[0].shape),
          duration: data.trip.summary.time,
          distance: data.trip.summary.length * 1000,
        });
      }

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
  }

  function selectRoute(index: number) {
    selectedRouteIndex.value = index;
  }

  function getRouteColor(index: number): string {
    return index === selectedRouteIndex.value ? 'transparent' : '#6b7280';
  }

  function getRouteOpacity(index: number): number {
    return index === selectedRouteIndex.value ? 0 : 0.5;
  }

  tryOnMounted(() => {
    fetchRoutePlanning();
  });

  const SCRIPT_END = '</' + 'script>';
  const SCRIPT_START = '<' + 'script setup lang="ts">';

  const codeExample = `${SCRIPT_START}
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
</script>

<template>
  <div>
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
      <div class="space-y-3">
        <div
          v-if="planningLoading"
          class="flex items-center gap-2 text-muted-foreground p-4"
        >
          <Icon name="lucide:loader-2" class="size-4 animate-spin" />
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
              <Icon name="lucide:clock" class="size-4 text-muted-foreground" />
              <span class="font-semibold">{{
                formatDuration(route.duration)
              }}</span>
              <Icon
                name="lucide:route"
                class="size-4 text-muted-foreground ml-2"
              />
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

        <div
          class="mt-6 rounded-lg border border-border bg-card/50 p-4 space-y-2"
        >
          <div class="flex items-center gap-2 text-sm">
            <div class="size-3 rounded-full bg-red-500" />
            <span class="text-muted-foreground">Rotterdam</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <div class="size-3 rounded-full bg-emerald-500" />
            <span class="text-muted-foreground">Amsterdam</span>
          </div>
        </div>
      </div>

      <div
        class="lg:col-span-2 h-125 min-w-0 overflow-hidden rounded-lg border border-border"
      >
        <ClientOnly>
          <VMap
            :key="`planning-${mapStyle}`"
            :options="planningMapOptions"
            class="h-full w-full"
            @loaded="onMapLoaded"
          >
            <VControlNavigation position="top-right" />
            <VControlScale position="bottom-left" />

            <VLayerMaplibreRoute
              v-for="(route, index) in routeOptions"
              :key="`route-alt-${index}`"
              :id="`planning-route-alt-${index}`"
              :coordinates="route.coordinates"
              :color="getRouteColor(index)"
              :width="4"
              :opacity="getRouteOpacity(index)"
              line-cap="round"
              line-join="round"
              @click="selectRoute(index)"
            />

            <VLayerMaplibreRoute
              v-if="routeOptions[selectedRouteIndex]"
              id="planning-route-selected"
              :coordinates="routeOptions[selectedRouteIndex]?.coordinates ?? []"
              color="#6366f1"
              :width="5"
              :opacity="1"
              line-cap="round"
              line-join="round"
            />

            <VMarker :coordinates="rotterdam.coordinates">
              <template #markers="{ setRef }">
                <div
                  :ref="wrapMarkerRef(setRef)"
                  class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-lg"
                >
                  <div class="size-2 rounded-full bg-white" />
                </div>
              </template>
            </VMarker>

            <VMarker :coordinates="amsterdam.coordinates">
              <template #markers="{ setRef }">
                <div
                  :ref="wrapMarkerRef(setRef)"
                  class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg"
                >
                  <div class="size-2 rounded-full bg-white" />
                </div>
              </template>
            </VMarker>
          </VMap>
        </ClientOnly>
      </div>
    </div>

    <div class="mt-8">
      <LazyCodeBlock
        :code="codeExample"
        lang="vue"
        filename="RoutePlanning.vue"
      />
    </div>
  </div>
</template>
